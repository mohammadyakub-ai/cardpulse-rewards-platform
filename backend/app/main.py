"""CardPulse API entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import SessionLocal, init_db
from app.routers import account, offers, telemetry, transactions
from app.seed import seed_database

DESCRIPTION = """
**CardPulse** is a smart merchant offers and rewards portal.

* Browse merchant offers and activate them to unlock multipliers.
* Simulate card swipes and watch reward points calculate dynamically.
* Stream engagement events into the telemetry API and read live insights.
"""


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    with SessionLocal() as db:
        seed_database(db)
    yield


app = FastAPI(
    title="CardPulse API",
    version="1.0.0",
    description=DESCRIPTION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    contact={"name": "CardPulse Engineering", "email": "engineering@cardpulse.dev"},
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(account.router, prefix="/api/v1")
app.include_router(offers.router, prefix="/api/v1")
app.include_router(transactions.router, prefix="/api/v1")
app.include_router(telemetry.router, prefix="/api/v1")


@app.get("/api/v1/health", tags=["system"], summary="Service health check")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "cardpulse-api", "version": app.version}


@app.get("/", include_in_schema=False)
def root() -> dict[str, str]:
    return {
        "name": "CardPulse API",
        "version": app.version,
        "docs": "/docs",
        "openapi": "/openapi.json",
    }
