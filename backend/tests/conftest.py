"""Test configuration.

The database URL is set before the app is imported so the test suite never
touches the development SQLite file.
"""

import os
import tempfile

TEST_DB_PATH = os.path.join(tempfile.gettempdir(), "cardpulse_test.db")
if os.path.exists(TEST_DB_PATH):
    os.remove(TEST_DB_PATH)

os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB_PATH}"

import pytest
from fastapi.testclient import TestClient

from app.database import Base, SessionLocal, engine
from app.main import app
from app.seed import seed_database


@pytest.fixture()
def client():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_database(db)

    with TestClient(app) as test_client:
        yield test_client
