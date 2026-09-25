import pytest
from app.ai.mcp.server import mcp_gateway
from app.ai.mcp.client import mcp_client
from app.ai.mcp.tools import (
    execute_shopping_search,
    execute_web_search,
    execute_fetch_page,
    execute_extract_product,
    execute_get_shipping,
    execute_get_reviews,
    convert_currency,
    execute_compare_products,
    execute_check_availability,
)


def test_mcp_shopping_search_tool():
    res = mcp_client.invoke_tool("shopping_search", {"query": "laptop", "country_code": "PK"})
    assert res["success"] is True
    assert "results" in res["result"]
    assert res["result"]["country_code"] == "PK"


def test_mcp_web_search_tool():
    res = mcp_client.invoke_tool("web_search", {"query": "iPhone 15", "country_code": "PK"})
    assert res["success"] is True
    assert len(res["result"]) > 0
    assert "url" in res["result"][0]
    assert "domain" in res["result"][0]


def test_mcp_fetch_page_security_validation():
    # Attempting to fetch internal or private IP should fail SSRF check
    res = mcp_client.invoke_tool("fetch_page", {"url": "http://127.0.0.1:8000/secret"})
    assert res["result"]["success"] is False
    assert "Security validation failed" in res["result"]["error"]


def test_mcp_extract_product_tool():
    raw_data = {
        "name": "Sony WH-1000XM5",
        "price": 399.0,
        "seller": "Sony Official Store",
        "specifications": {"anc": "Active Noise Cancelling", "battery": "30 hours"}
    }
    extracted = execute_extract_product(raw_data, source_url="https://sony.com/product", country_code="US", currency="USD")
    assert extracted["product_name"] == "Sony WH-1000XM5"
    assert extracted["price"] == 399.0
    assert extracted["currency"] == "USD"
    assert extracted["country_code"] == "US"
    assert "retrieved_at" in extracted


def test_mcp_get_shipping_tool():
    shipping_pk = execute_get_shipping("https://www.daraz.pk/product-123", country_code="PK", city="Lahore")
    assert shipping_pk["shipping_available"] is True
    assert shipping_pk["currency"] == "PKR"
    assert "business days" in shipping_pk["delivery_estimate"]


def test_mcp_get_reviews_tool():
    reviews = execute_get_reviews("Gaming Laptop RTX 4060")
    assert reviews["rating"] >= 4.0
    assert len(reviews["positive_themes"]) > 0
    assert len(reviews["negative_themes"]) > 0


def test_mcp_currency_converter_tool():
    res = convert_currency(100.0, "GBP", "USD")
    assert res["from_currency"] == "GBP"
    assert res["to_currency"] == "USD"
    assert res["converted_amount"] > 100.0


def test_mcp_availability_tool():
    avail = execute_check_availability("https://store.com/item")
    assert avail["availability"] == "in_stock"
    assert avail["can_purchase_now"] is True


def test_mcp_guardrails_blocks_unauthorized_tools():
    res = mcp_gateway.execute_tool("dangerous_arbitrary_shell_command", {})
    assert res["success"] is False
    assert "disallowed" in res["error"].lower() or "unknown" in res["error"].lower()
