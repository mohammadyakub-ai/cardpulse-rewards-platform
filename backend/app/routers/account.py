from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Account
from app.schemas import AccountOut

router = APIRouter(tags=["account"])


@router.get("/account", response_model=AccountOut, summary="Get the demo cardholder account")
def get_account(db: Session = Depends(get_db)) -> Account:
    account = db.get(Account, 1)
    if account is None:
        raise HTTPException(status_code=404, detail="Account not initialised")
    return account
