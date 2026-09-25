"""
Smoke tests for the FastAPI health-check endpoint.

These tests use FastAPI's TestClient and do NOT require a running database,
because the health-check route (`GET /`) has no database dependency.

The database engine/session are patched at import time to prevent
connection attempts when PostgreSQL is unavailable.
"""
import sys
from unittest.mock import MagicMock, patch

# Patch database session module BEFORE importing app.main so that
# SQLAlchemy never tries to connect to PostgreSQL during test collection.
mock_session_module = MagicMock()
mock_session_module.get_db = MagicMock()
mock_session_module.Base = MagicMock()
mock_session_module.SessionLocal = MagicMock()
mock_session_module.engine = MagicMock()

sys.modules.setdefault("app.database.session", mock_session_module)

# Also patch the supabase client so it doesn't fail on missing credentials
mock_supabase_module = MagicMock()
sys.modules.setdefault("app.utils.supabase", mock_supabase_module)

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check_returns_200():
    """The root endpoint should return HTTP 200 with success=True."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["status"] == "online"


def test_health_check_contains_version():
    """The root endpoint should include a version string."""
    response = client.get("/")
    data = response.json()
    assert "version" in data
    assert data["version"] == "1.0.0"


def test_health_check_contains_project_name():
    """The root endpoint should include the project name."""
    response = client.get("/")
    data = response.json()
    assert "message" in data
    assert "AI E-Commerce Platform" in data["message"]
