import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_ai_search_endpoint():
    response = client.post(
        "/api/v1/ai/search",
        json={"query": "Find a gaming laptop under $1200 with 16GB RAM"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "laptop" in data["summary"].lower() or "products" in data["summary"].lower()
    assert data["parsed_intent"]["use_case"] == "gaming"
    assert data["parsed_intent"]["max_price"] == 1200.0


def test_conversational_search_endpoint():
    response = client.post(
        "/api/v1/ai/conversational-search",
        json={
            "session_id": "test-session-123",
            "message": "Show me black running shoes under $100"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "reply" in data
    assert len(data["history"]) >= 2


def test_shopping_agent_endpoint():
    response = client.post(
        "/api/v1/ai/agent",
        json={"user_prompt": "Find me the best phone under $700 with excellent camera and battery"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["reasoning_steps"]) >= 4
    assert "final_recommendation" in data
