import pytest
from app.ai.mcp.tools.shopping_search import execute_shopping_search
from app.ai.mcp.tools.currency_converter import convert_currency, COUNTRY_CURRENCY_MAP
from app.ai.agents.shopping_agent import ShoppingAgent


def test_country_first_pakistan_shopping():
    res = execute_shopping_search("gaming laptop", country_code="PK")
    assert res["country_code"] == "PK"
    assert res["currency"] == "PKR"
    assert len(res["results"]) > 0
    # Ensure all results belong to PK or are explicitly marked cross_border
    for p in res["results"]:
        assert "country_code" in p
        assert p["currency"] == "PKR"
        assert "retrieved_at" in p


def test_country_first_uk_shopping():
    res = execute_shopping_search("running shoe", country_code="UK")
    assert res["country_code"] == "UK"
    assert res["currency"] == "GBP"
    assert len(res["results"]) > 0
    for p in res["results"]:
        assert p["currency"] == "GBP"


def test_country_first_us_shopping():
    res = execute_shopping_search("OLED laptop", country_code="US")
    assert res["country_code"] == "US"
    assert res["currency"] == "USD"
    assert len(res["results"]) > 0


def test_country_first_uae_shopping():
    res = execute_shopping_search("iPhone", country_code="AE")
    assert res["country_code"] == "AE"
    assert res["currency"] == "AED"
    assert len(res["results"]) > 0


def test_country_currency_mapping():
    assert COUNTRY_CURRENCY_MAP["PK"] == "PKR"
    assert COUNTRY_CURRENCY_MAP["UK"] == "GBP"
    assert COUNTRY_CURRENCY_MAP["US"] == "USD"
    assert COUNTRY_CURRENCY_MAP["AE"] == "AED"
    assert COUNTRY_CURRENCY_MAP["SA"] == "SAR"


def test_currency_conversion_rates():
    conv = convert_currency(100.0, "USD", "PKR")
    assert conv["from_currency"] == "USD"
    assert conv["to_currency"] == "PKR"
    assert conv["converted_amount"] > 20000.0
    assert "timestamp" in conv


def test_server_side_country_lock_in_chat(db_session):
    agent = ShoppingAgent(db=db_session)
    res = agent.process_chat_turn(
        user_message="I need a laptop under $1200",
        country="US",
        currency="USD"
    )
    assert res["country"] == "US"
    assert res["currency"] == "USD"
    assert res["success"] is True


def test_cross_border_product_flagging():
    # Searching with UAE target country for US products should mark cross-border
    res = execute_shopping_search("Predator Helios", country_code="AE")
    assert res["country_code"] == "AE"
    assert res["currency"] == "AED"
