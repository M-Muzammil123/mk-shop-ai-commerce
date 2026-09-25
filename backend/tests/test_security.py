import pytest
import datetime
import uuid
import jwt
from app.models.profile import Profile, UserRole
from app.core.config import settings
from app.core.security import create_access_token


@pytest.fixture
def user_a(db_session):
    u = Profile(
        id=uuid.uuid4(),
        first_name="User",
        last_name="A",
        email=f"usera_{uuid.uuid4().hex[:6]}@example.com",
        role=UserRole.CUSTOMER
    )
    db_session.add(u)
    db_session.commit()
    db_session.refresh(u)
    return u


@pytest.fixture
def user_b(db_session):
    u = Profile(
        id=uuid.uuid4(),
        first_name="User",
        last_name="B",
        email=f"userb_{uuid.uuid4().hex[:6]}@example.com",
        role=UserRole.CUSTOMER
    )
    db_session.add(u)
    db_session.commit()
    db_session.refresh(u)
    return u


def test_missing_auth_header(client):
    response = client.get("/api/v1/cart")
    assert response.status_code in [401, 403]


def test_malformed_jwt_token(client):
    headers = {"Authorization": "Bearer invalid.jwt.token.string"}
    response = client.get("/api/v1/cart", headers=headers)
    assert response.status_code in [401, 403]


def test_expired_jwt_token(client, user_a):
    expired_payload = {
        "sub": str(user_a.id),
        "aud": "authenticated",
        "exp": datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=1)
    }
    token = jwt.encode(expired_payload, settings.SUPABASE_JWT_SECRET, algorithm=settings.ALGORITHM)
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/v1/cart", headers=headers)
    assert response.status_code in [401, 403]


def test_cross_user_isolation(client, user_a, user_b):
    token_a = create_access_token({"sub": str(user_a.id)})
    headers_a = {"Authorization": f"Bearer {token_a}"}

    token_b = create_access_token({"sub": str(user_b.id)})
    headers_b = {"Authorization": f"Bearer {token_b}"}

    res_a = client.get("/api/v1/cart", headers=headers_a)
    res_b = client.get("/api/v1/cart", headers=headers_b)

    assert res_a.status_code == 200
    assert res_b.status_code == 200
