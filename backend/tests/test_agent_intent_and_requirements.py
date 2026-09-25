import pytest
from app.ai.providers.openai_provider import OpenAIProvider


def test_intent_extraction_pakistan_rupees():
    provider = OpenAIProvider()
    reqs = provider.extract_structured_requirements(
        "Mujhe Pakistan mein 200,000 PKR ke andar iPhone chahiye"
    )
    assert reqs["country"] == "PK"
    assert reqs["currency"] == "PKR"
    assert reqs["category"] == "smartphone"
    assert reqs["budget_max"] == 200000.0


def test_intent_extraction_uk_running_shoes():
    provider = OpenAIProvider()
    reqs = provider.extract_structured_requirements(
        "Find me a good running shoe in the UK under £100"
    )
    assert reqs["country"] == "UK"
    assert reqs["currency"] == "GBP"
    assert reqs["category"] == "footwear"
    assert reqs["budget_max"] == 100.0


def test_intent_extraction_gaming_laptop_with_specs():
    provider = OpenAIProvider()
    reqs = provider.extract_structured_requirements(
        "I need a gaming laptop under $1200 with RTX graphics, 16GB RAM, good battery and delivery within 7 days"
    )
    assert reqs["country"] == "US"
    assert reqs["currency"] == "USD"
    assert reqs["category"] == "laptop"
    assert reqs["budget_max"] == 1200.0
    assert "graphics" in reqs["required_specs"]
    assert reqs["required_specs"]["ram"] == "16GB"
    assert reqs["delivery_deadline_days"] == 7


def test_intent_extraction_brand_filter():
    provider = OpenAIProvider()
    reqs = provider.extract_structured_requirements("Find me a Samsung phone in UAE")
    assert reqs["country"] == "AE"
    assert "Samsung" in reqs["brand"]


def test_intent_extraction_storage_spec():
    provider = OpenAIProvider()
    reqs = provider.extract_structured_requirements("Looking for 256GB phone in Pakistan")
    assert reqs["required_specs"].get("storage") == "256GB"


def test_intent_extraction_city_detection():
    provider = OpenAIProvider()
    reqs = provider.extract_structured_requirements("Show me laptops available in Lahore under 300,000 PKR")
    assert reqs["city"] == "Lahore"
    assert reqs["country"] == "PK"
