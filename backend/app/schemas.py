"""Pydantic request/response models for the public API."""

from datetime import datetime, timezone
from typing import Annotated, Any, Literal

from pydantic import BaseModel, ConfigDict, Field, PlainSerializer

UtcDatetime = Annotated[
    datetime,
    PlainSerializer(
        lambda value: (value if value.tzinfo else value.replace(tzinfo=timezone.utc)).isoformat(),
        return_type=str,
    ),
]

EventType = Literal[
    "offer_click",
    "offer_activated",
    "swipe_simulated",
    "page_view",
    "insights_view",
]


class OfferOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    merchant_name: str
    category: str
    title: str
    description: str
    reward_multiplier: float
    bonus_points: int
    is_active: bool
    icon: str
    accent: str
    valid_until: UtcDatetime
    created_at: UtcDatetime


class ActivationResult(BaseModel):
    offer: OfferOut
    awarded_points: int
    already_active: bool


class AccountOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    holder_name: str
    card_last4: str
    balance: float
    points: int


class TransactionCreate(BaseModel):
    merchant_name: str = Field(min_length=1, max_length=120)
    category: str = Field(min_length=1, max_length=50)
    amount: float = Field(gt=0, le=100_000, description="Transaction amount in USD")


class TransactionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    merchant_name: str
    category: str
    amount: float
    points_earned: int
    multiplier_applied: float
    offer_id: int | None
    offer_title: str | None
    created_at: UtcDatetime


class TelemetryCreate(BaseModel):
    event_type: EventType
    offer_id: int | None = None
    payload: dict[str, Any] | None = None


class TelemetryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    event_type: str
    offer_id: int | None
    payload: dict[str, Any]
    created_at: UtcDatetime


class InsightsOut(BaseModel):
    total_events: int
    counts: dict[str, int]
    recent: list[TelemetryOut]
