import pytest
from unittest.mock import patch, MagicMock
from uuid import uuid4

@pytest.fixture
def mock_supabase():
    with patch("app.api.v1.endpoints.auth.supabase_client") as mock_client:
        # Mock registration response
        mock_user = MagicMock()
        mock_user.id = str(uuid4())
        mock_user.email = "test@example.com"
        mock_user.phone = "+1234567890"
        
        mock_signup_res = MagicMock()
        mock_signup_res.user = mock_user
        mock_client.auth.sign_up.return_value = mock_signup_res
        
        # Mock login response
        mock_session = MagicMock()
        mock_session.access_token = "mocked_access_token_jwt"
        
        mock_login_res = MagicMock()
        mock_login_res.user = mock_user
        mock_login_res.session = mock_session
        mock_client.auth.sign_in_with_password.return_value = mock_login_res
        
        yield mock_client

def test_register_user(client, mock_supabase):
    payload = {
        "email": "test@example.com",
        "password": "testpassword123",
        "first_name": "Test",
        "last_name": "User",
        "phone": "+1234567890",
        "role": "customer"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["first_name"] == "Test"
    assert data["last_name"] == "User"

def test_login_user(client, mock_supabase, db_session):
    # Setup profile in the transaction database
    from app.models.profile import Profile
    user_id = str(uuid4())
    profile = Profile(
        id=user_id,
        email="login_test@example.com",
        first_name="Login",
        last_name="Test",
        role="customer"
    )
    db_session.add(profile)
    db_session.commit()

    # Configure login mock to return this specific user id
    mock_supabase.auth.sign_in_with_password.return_value.user.id = user_id
    mock_supabase.auth.sign_in_with_password.return_value.user.email = "login_test@example.com"

    payload = {
        "email": "login_test@example.com",
        "password": "testpassword123"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["profile"]["email"] == "login_test@example.com"

def test_me_endpoint_requires_auth(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 403  # HTTPBearer returns 403 or 401 when no auth header is present

def test_address_endpoints(client, db_session):
    # Setup profile & auth token mocking
    from app.models.profile import Profile
    user_id = str(uuid4())
    profile = Profile(
        id=user_id,
        email="address_test@example.com",
        first_name="Addr",
        last_name="Test",
        role="customer"
    )
    db_session.add(profile)
    db_session.commit()

    # Generate mock jwt payload
    payload = {
        "sub": user_id,
        "email": "address_test@example.com",
        "role": "customer"
    }
    
    with patch("app.dependencies.auth.decode_token", return_value=payload):
        headers = {"Authorization": "Bearer mock_token"}
        
        # Test 1: POST /addresses
        addr_payload = {
            "title": "Home",
            "address_line1": "123 Main St",
            "city": "San Francisco",
            "state": "CA",
            "postal_code": "94103",
            "country": "USA",
            "is_default": True
        }
        res_post = client.post("/api/v1/auth/addresses", json=addr_payload, headers=headers)
        assert res_post.status_code == 201
        post_data = res_post.json()
        assert post_data["title"] == "Home"
        assert post_data["city"] == "San Francisco"
        address_id = post_data["id"]

        # Test 2: GET /addresses
        res_get = client.get("/api/v1/auth/addresses", headers=headers)
        assert res_get.status_code == 200
        get_data = res_get.json()
        assert len(get_data) == 1
        assert get_data[0]["id"] == address_id

        # Test 3: DELETE /addresses/{id}
        res_del = client.delete(f"/api/v1/auth/addresses/{address_id}", headers=headers)
        assert res_del.status_code == 200
        assert res_del.json()["success"] is True

        # Test 4: GET /addresses (should be empty now)
        res_get_empty = client.get("/api/v1/auth/addresses", headers=headers)
        assert len(res_get_empty.json()) == 0


def test_google_login_endpoint(client, db_session):
    # Test Google Login with mock/testing token
    payload = {
        "id_token": "mock_google_token_123",
        "role": "customer"
    }
    response = client.post("/api/v1/auth/google", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["profile"]["email"] == "google.user@example.com"
    assert data["profile"]["first_name"] == "Google"


def test_apple_login_endpoint(client, db_session):
    # Test Apple Login with mock/testing token
    payload = {
        "id_token": "mock_apple_token_123",
        "role": "customer"
    }
    response = client.post("/api/v1/auth/apple", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["profile"]["email"] == "apple.user@example.com"
    assert data["profile"]["first_name"] == "Apple"

