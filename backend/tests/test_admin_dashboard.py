import pytest
import uuid
from app.models.profile import Profile, UserRole
from app.core.security import create_access_token


@pytest.fixture
def admin_user(db_session):
    admin = Profile(
        id=uuid.uuid4(),
        first_name="Admin",
        last_name="Boss",
        email=f"admin_{uuid.uuid4().hex[:6]}@example.com",
        role=UserRole.ADMIN
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    return admin


@pytest.fixture
def customer_user(db_session):
    customer = Profile(
        id=uuid.uuid4(),
        first_name="Regular",
        last_name="Customer",
        email=f"customer_{uuid.uuid4().hex[:6]}@example.com",
        role=UserRole.CUSTOMER
    )
    db_session.add(customer)
    db_session.commit()
    db_session.refresh(customer)
    return customer


@pytest.fixture
def admin_auth_headers(admin_user):
    token = create_access_token({"sub": str(admin_user.id)})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def customer_auth_headers(customer_user):
    token = create_access_token({"sub": str(customer_user.id)})
    return {"Authorization": f"Bearer {token}"}


def test_admin_access_dashboard_analytics(client, admin_auth_headers):
    response = client.get("/api/v1/dashboard/analytics", headers=admin_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "revenue_card" in data
    assert "orders_card" in data
    assert "products_card" in data
    assert "customers_card" in data


def test_customer_access_dashboard_analytics_forbidden(client, customer_auth_headers):
    response = client.get("/api/v1/dashboard/analytics", headers=customer_auth_headers)
    assert response.status_code == 403


def test_admin_access_ai_search_analytics(client, admin_auth_headers):
    response = client.get("/api/v1/dashboard/ai-search-analytics", headers=admin_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_searches" in data
    assert "avg_latency_ms" in data
    assert "click_through_rate" in data


def test_customer_access_ai_search_analytics_forbidden(client, customer_auth_headers):
    response = client.get("/api/v1/dashboard/ai-search-analytics", headers=customer_auth_headers)
    assert response.status_code == 403
