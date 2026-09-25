import pytest
from app.ai.providers.openai_provider import OpenAIProvider
from app.ai.providers.gemini_provider import GeminiProvider
from app.ai.providers.provider_router import ProviderRouter


def test_openai_provider_offline_chat():
    prov = OpenAIProvider()
    res = prov.generate_chat_response([{"role": "user", "content": "I need an iPhone"}])
    assert res["success"] is True
    assert "tool_calls" in res or "content" in res


def test_gemini_provider_offline_chat():
    prov = GeminiProvider()
    res = prov.generate_chat_response([{"role": "user", "content": "Analyze product specs"}])
    assert res["success"] is True
    assert "content" in res


def test_provider_router_chat_fallback():
    router = ProviderRouter()
    res = router.execute_chat_with_fallback([{"role": "user", "content": "Find me shoes in UK"}])
    assert res["success"] is True


def test_provider_router_research_fallback():
    router = ProviderRouter()
    products = [
        {"id": "1", "product_name": "Product A", "price": 100, "currency": "USD"},
        {"id": "2", "product_name": "Product B", "price": 120, "currency": "USD"}
    ]
    res = router.execute_research_with_fallback(products, {"budget_max": 150})
    assert "products" in res
    assert "matrix" in res
