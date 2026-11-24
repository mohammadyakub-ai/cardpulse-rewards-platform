"""Idempotent demo data so the portal is useful on first boot."""

from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Account, Offer, Transaction

STARTING_BALANCE = 7250.00
STARTING_POINTS = 640

OFFERS = [
    {
        "merchant_name": "Saffron Table",
        "category": "Dining",
        "title": "Table for two, points for you",
        "description": "Earn 3x points on every dine-in or takeaway order at Saffron Table.",
        "reward_multiplier": 3.0,
        "bonus_points": 100,
        "icon": "utensils",
        "accent": "#B45309",
        "valid_in_days": 32,
    },
    {
        "merchant_name": "Meridian Air",
        "category": "Travel",
        "title": "Go further on every flight",
        "description": "5x points on flight bookings and seat upgrades paid with your CardPulse card.",
        "reward_multiplier": 5.0,
        "bonus_points": 500,
        "icon": "plane",
        "accent": "#0F766E",
        "valid_in_days": 58,
    },
    {
        "merchant_name": "North & Oak",
        "category": "Retail",
        "title": "Wardrobe refresh, rewarded",
        "description": "2x points across new-season apparel, outerwear and accessories at North & Oak.",
        "reward_multiplier": 2.0,
        "bonus_points": 150,
        "icon": "shopping-bag",
        "accent": "#B03A5B",
        "valid_in_days": 21,
    },
    {
        "merchant_name": "FreshCart Market",
        "category": "Groceries",
        "title": "Stock up, rack up",
        "description": "4x points on weekly grocery runs, fresh produce and pantry staples included.",
        "reward_multiplier": 4.0,
        "bonus_points": 200,
        "icon": "leaf",
        "accent": "#4D7C0F",
        "valid_in_days": 14,
    },
    {
        "merchant_name": "Volt Audio",
        "category": "Electronics",
        "title": "Sound advice, smarter points",
        "description": "2x points on headphones, speakers and home audio gear at Volt Audio.",
        "reward_multiplier": 2.0,
        "bonus_points": 250,
        "icon": "headphones",
        "accent": "#3B5BDB",
        "valid_in_days": 45,
    },
]

SAMPLE_TRANSACTIONS = [
    ("FreshCart Market", "Groceries", 86.40, 4),
    ("Saffron Table", "Dining", 64.25, 22),
    ("North & Oak", "Retail", 142.00, 52),
    ("Meridian Air", "Travel", 318.60, 96),
]


def seed_database(db: Session) -> bool:
    """Populate demo data only when the offers table is empty.

    Returns ``True`` when data was inserted, ``False`` when seeding was skipped.
    """
    if db.scalar(select(func.count(Offer.id))):
        return False

    now = datetime.now(timezone.utc)

    account = Account(
        holder_name="Alex Morgan",
        card_last4="4291",
        balance=STARTING_BALANCE,
        points=STARTING_POINTS,
    )
    db.add(account)

    offers = [
        Offer(
            merchant_name=item["merchant_name"],
            category=item["category"],
            title=item["title"],
            description=item["description"],
            reward_multiplier=item["reward_multiplier"],
            bonus_points=item["bonus_points"],
            icon=item["icon"],
            accent=item["accent"],
            is_active=False,
            valid_until=now + timedelta(days=item["valid_in_days"]),
        )
        for item in OFFERS
    ]
    db.add_all(offers)
    db.flush()

    for merchant_name, category, amount, hours_ago in SAMPLE_TRANSACTIONS:
        points = int(round(amount))
        account.balance = round(account.balance - amount, 2)
        account.points += points
        db.add(
            Transaction(
                merchant_name=merchant_name,
                category=category,
                amount=amount,
                points_earned=points,
                multiplier_applied=1.0,
                created_at=now - timedelta(hours=hours_ago),
            )
        )

    db.commit()
    return True
