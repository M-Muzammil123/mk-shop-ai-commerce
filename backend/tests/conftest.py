import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os
from urllib.parse import urlparse, urlunparse

# Adjust PYTHONPATH to include backend root
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings

# Override DATABASE_URL to use dedicated ecommerce_test database or current DB
db_url = settings.DATABASE_URL
parsed = urlparse(db_url)
test_parsed = parsed._replace(path="/ecommerce_test")
test_db_url = urlunparse(test_parsed)

try:
    engine = create_engine(test_db_url)
    connection = engine.connect()
    connection.close()
    settings.DATABASE_URL = test_db_url
except Exception:
    engine = create_engine(settings.DATABASE_URL)

from app.main import app
from app.database.session import Base, get_db

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    # Clean and recreate tables for test run
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield

@pytest.fixture(scope="function")
def db_session():
    """
    Creates a new database session for a test, wrapping it in a transaction
    which is rolled back after the test completes.
    """
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def client(db_session):
    """
    FastAPI TestClient fixture that overrides the get_db dependency.
    """
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
            
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
