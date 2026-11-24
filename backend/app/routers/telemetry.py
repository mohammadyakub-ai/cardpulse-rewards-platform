from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AnalyticsEvent, Offer
from app.schemas import InsightsOut, TelemetryCreate, TelemetryOut

router = APIRouter(tags=["telemetry"])

EVENT_TYPES = ("offer_click", "offer_activated", "swipe_simulated", "page_view", "insights_view")


@router.post(
    "/telemetry",
    response_model=TelemetryOut,
    status_code=201,
    summary="Log a product analytics event",
)
def log_event(payload: TelemetryCreate, db: Session = Depends(get_db)) -> AnalyticsEvent:
    if payload.offer_id is not None and db.get(Offer, payload.offer_id) is None:
        raise HTTPException(status_code=404, detail="Offer not found")

    event = AnalyticsEvent(
        event_type=payload.event_type,
        offer_id=payload.offer_id,
        payload=payload.payload or {},
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.get(
    "/telemetry/insights",
    response_model=InsightsOut,
    summary="Aggregate engagement counts and the latest events",
)
def get_insights(db: Session = Depends(get_db)) -> InsightsOut:
    rows = db.execute(
        select(AnalyticsEvent.event_type, func.count(AnalyticsEvent.id)).group_by(AnalyticsEvent.event_type)
    ).all()

    counts = {event_type: 0 for event_type in EVENT_TYPES}
    for event_type, count in rows:
        counts[event_type] = count

    recent = list(
        db.scalars(
            select(AnalyticsEvent)
            .order_by(AnalyticsEvent.created_at.desc(), AnalyticsEvent.id.desc())
            .limit(8)
        ).all()
    )

    return InsightsOut(
        total_events=sum(counts.values()),
        counts=counts,
        recent=[TelemetryOut.model_validate(event) for event in recent],
    )
