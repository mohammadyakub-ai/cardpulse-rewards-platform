"""Sprint tests for the CardPulse API."""

CATEGORIES = {"Dining", "Travel", "Retail", "Groceries", "Electronics"}


def get_offer(client, category: str) -> dict:
    offers = client.get("/api/v1/offers").json()
    return next(offer for offer in offers if offer["category"] == category)


def test_seeded_offers_and_account(client):
    response = client.get("/api/v1/offers")
    assert response.status_code == 200
    offers = response.json()
    assert len(offers) == 5
    assert {offer["category"] for offer in offers} == CATEGORIES
    assert all(offer["is_active"] is False for offer in offers)

    account = client.get("/api/v1/account")
    assert account.status_code == 200
    assert account.json()["card_last4"] == "4291"
    assert account.json()["balance"] > 0


def test_offer_activation_awards_bonus_once(client):
    offer = get_offer(client, "Dining")
    points_before = client.get("/api/v1/account").json()["points"]

    first = client.post(f"/api/v1/offers/{offer['id']}/activate")
    assert first.status_code == 200
    body = first.json()
    assert body["offer"]["is_active"] is True
    assert body["awarded_points"] == offer["bonus_points"]
    assert body["already_active"] is False
    assert client.get("/api/v1/account").json()["points"] == points_before + offer["bonus_points"]

    second = client.post(f"/api/v1/offers/{offer['id']}/activate")
    assert second.status_code == 200
    assert second.json()["already_active"] is True
    assert second.json()["awarded_points"] == 0
    assert client.get("/api/v1/account").json()["points"] == points_before + offer["bonus_points"]


def test_activation_returns_404_for_unknown_offer(client):
    assert client.post("/api/v1/offers/9999/activate").status_code == 404


def test_base_points_when_no_offer_is_active(client):
    response = client.post(
        "/api/v1/transactions",
        json={"merchant_name": "Meridian Air", "category": "Travel", "amount": 100.0},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["points_earned"] == 100
    assert body["multiplier_applied"] == 1.0
    assert body["offer_id"] is None


def test_active_offer_multiplier_is_applied(client):
    offer = get_offer(client, "Dining")
    client.post(f"/api/v1/offers/{offer['id']}/activate")

    response = client.post(
        "/api/v1/transactions",
        json={"merchant_name": "Saffron Table", "category": "Dining", "amount": 50.0},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["points_earned"] == 150
    assert body["multiplier_applied"] == 3.0
    assert body["offer_id"] == offer["id"]
    assert body["offer_title"] == offer["title"]


def test_transaction_updates_account_and_is_listed(client):
    before = client.get("/api/v1/account").json()
    created = client.post(
        "/api/v1/transactions",
        json={"merchant_name": "Volt Audio", "category": "Electronics", "amount": 40.0},
    )
    assert created.status_code == 201

    after = client.get("/api/v1/account").json()
    assert after["balance"] == round(before["balance"] - 40.0, 2)
    assert after["points"] == before["points"] + 40

    transactions = client.get("/api/v1/transactions").json()
    assert transactions[0]["id"] == created.json()["id"]


def test_transaction_rejects_insufficient_balance(client):
    response = client.post(
        "/api/v1/transactions",
        json={"merchant_name": "Meridian Air", "category": "Travel", "amount": 99999.0},
    )
    assert response.status_code == 400


def test_telemetry_logging_and_insights(client):
    offer = get_offer(client, "Retail")

    click = client.post(
        "/api/v1/telemetry",
        json={"event_type": "offer_click", "offer_id": offer["id"], "payload": {"source": "test"}},
    )
    assert click.status_code == 201
    assert click.json()["event_type"] == "offer_click"

    activation = client.post(
        "/api/v1/telemetry",
        json={"event_type": "offer_activated", "offer_id": offer["id"]},
    )
    assert activation.status_code == 201

    insights = client.get("/api/v1/telemetry/insights")
    assert insights.status_code == 200
    body = insights.json()
    assert body["total_events"] == 2
    assert body["counts"]["offer_click"] == 1
    assert body["counts"]["offer_activated"] == 1
    assert len(body["recent"]) == 2


def test_telemetry_rejects_unknown_event_type(client):
    response = client.post("/api/v1/telemetry", json={"event_type": "not_a_real_event"})
    assert response.status_code == 422


def test_telemetry_rejects_unknown_offer(client):
    response = client.post("/api/v1/telemetry", json={"event_type": "offer_click", "offer_id": 9999})
    assert response.status_code == 404


def test_health(client):
    assert client.get("/api/v1/health").json()["status"] == "ok"
