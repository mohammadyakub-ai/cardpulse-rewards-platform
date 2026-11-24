from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Account, Offer
from app.schemas import ActivationResult, OfferOut

router = APIRouter(tags=["offers"])


@router.get("/offers", response_model=list[OfferOut], summary="List merchant offers")
def list_offers(
    category: str | None = Query(default=None, description="Optional category filter"),
    db: Session = Depends(get_db),
) -> list[Offer]:
    stmt = select(Offer).order_by(Offer.id)
    if category:
        stmt = stmt.where(Offer.category.ilike(category))
    return list(db.scalars(stmt).all())


@router.post(
    "/offers/{offer_id}/activate",
    response_model=ActivationResult,
    summary="Activate an offer and award its welcome bonus",
)
def activate_offer(offer_id: int, db: Session = Depends(get_db)) -> ActivationResult:
    offer = db.get(Offer, offer_id)
    if offer is None:
        raise HTTPException(status_code=404, detail="Offer not found")

    if offer.is_active:
        return ActivationResult(offer=OfferOut.model_validate(offer), awarded_points=0, already_active=True)

    offer.is_active = True
    account = db.get(Account, 1)
    if account is not None:
        account.points += offer.bonus_points

    db.commit()
    db.refresh(offer)

    return ActivationResult(
        offer=OfferOut.model_validate(offer),
        awarded_points=offer.bonus_points,
        already_active=False,
    )
