from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Account, Offer, Transaction
from app.schemas import TransactionCreate, TransactionOut

router = APIRouter(tags=["transactions"])


def _match_active_offer(db: Session, category: str) -> Offer | None:
    """Return the best active offer for a category (highest multiplier wins)."""
    return db.scalars(
        select(Offer)
        .where(Offer.is_active.is_(True), Offer.category.ilike(category))
        .order_by(Offer.reward_multiplier.desc())
    ).first()


@router.get("/transactions", response_model=list[TransactionOut], summary="List card transactions")
def list_transactions(db: Session = Depends(get_db)) -> list[Transaction]:
    stmt = select(Transaction).order_by(Transaction.created_at.desc(), Transaction.id.desc())
    return list(db.scalars(stmt).all())


@router.post(
    "/transactions",
    response_model=TransactionOut,
    status_code=201,
    summary="Simulate a card swipe and calculate reward points",
)
def create_transaction(payload: TransactionCreate, db: Session = Depends(get_db)) -> Transaction:
    account = db.get(Account, 1)
    if account is None:
        raise HTTPException(status_code=404, detail="Account not initialised")
    if payload.amount > account.balance:
        raise HTTPException(status_code=400, detail="Insufficient card balance for this transaction")

    offer = _match_active_offer(db, payload.category)
    multiplier = offer.reward_multiplier if offer else 1.0
    points = int(round(payload.amount * multiplier))

    account.balance = round(account.balance - payload.amount, 2)
    account.points += points

    transaction = Transaction(
        merchant_name=payload.merchant_name,
        category=payload.category,
        amount=payload.amount,
        points_earned=points,
        multiplier_applied=multiplier,
        offer_id=offer.id if offer else None,
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    return transaction
