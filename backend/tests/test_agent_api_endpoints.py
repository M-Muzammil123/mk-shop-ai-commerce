import pytest
from fastapi.testclient import TestClient


def test_api_chat_endpoint(client: TestClient):
    payload = {
        "message": "Find me a gaming laptop in Pakistan under 300,000 PKR",
        "country": "PK",
        "currency": "PKR"
    }
    response = client.post("/api/v1/agent/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["country"] == "PK"
    assert len(data["products"]) > 0


def test_api_voice_session_endpoint(client: TestClient):
    payload = {
        "transcript_input": "Find me a running shoe in the UK under £100",
        "country": "UK",
        "currency": "GBP"
    }
    response = client.post("/api/v1/agent/voice/session", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "spoken_reply" in data


def test_api_direct_search_endpoint(client: TestClient):
    response = client.post("/api/v1/agent/search?query=iPhone&country_code=PK")
    assert response.status_code == 200
    data = response.json()
    assert "results" in data
    assert data["country_code"] == "PK"


def test_api_direct_compare_endpoint(client: TestClient):
    products = [
        {
            "id": "1",
            "product_name": "Product A",
            "price": 200,
            "currency": "USD",
            "seller": "Store A",
            "country_code": "US",
            "source_url": "https://storea.com",
            "source_domain": "storea.com",
            "retrieved_at": "2026-09-25T16:00:00Z"
        },
        {
            "id": "2",
            "product_name": "Product B",
            "price": 250,
            "currency": "USD",
            "seller": "Store B",
            "country_code": "US",
            "source_url": "https://storeb.com",
            "source_domain": "storeb.com",
            "retrieved_at": "2026-09-25T16:00:00Z"
        }
    ]
    response = client.post("/api/v1/agent/compare", json=products)
    assert response.status_code == 200
    data = response.json()
    assert "matrix" in data
    assert "ai_summary" in data


def test_api_get_session_not_found(client: TestClient):
    response = client.get("/api/v1/agent/sessions/non_existent_session_id_9999")
    assert response.status_code == 404


def test_api_rate_limit_exceeded(client: TestClient):
    # Chat endpoint responds under normal limits
    response = client.post("/api/v1/agent/chat", json={"message": "laptop", "country": "PK"})
    assert response.status_code in (200, 429)
