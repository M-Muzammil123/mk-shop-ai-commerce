import pytest
from app.ai.mcp.tools.compare_products import execute_compare_products, compute_component_scores


def test_component_score_breakdown():
    product = {
        "price": 289000.0,
        "product_rating": 4.8,
        "review_count": 84,
        "specifications": {"graphics": "RTX 4060", "ram": "16GB"},
        "delivery_estimate": "2-4 business days",
        "cross_border": False
    }
    scores = compute_component_scores(
        product,
        budget_max=300000.0,
        required_specs={"graphics": "RTX", "ram": "16GB"}
    )
    assert 0 <= scores["requirement_match"] <= 100
    assert 0 <= scores["price_fit"] <= 100
    assert 0 <= scores["review_signal"] <= 100
    assert 0 <= scores["delivery_fit"] <= 100
    assert 0 <= scores["overall_score"] <= 100


def test_side_by_side_comparison_matrix():
    products = [
        {
            "id": "prod_1",
            "product_name": "Lenovo Legion 5",
            "price": 289000.0,
            "currency": "PKR",
            "seller": "Paklap",
            "product_rating": 4.8,
            "review_count": 84,
            "specifications": {"processor": "AMD Ryzen 7", "ram": "16GB", "storage": "512GB"},
            "delivery_estimate": "2-4 business days",
            "cross_border": False
        },
        {
            "id": "prod_2",
            "product_name": "ASUS TUF A15",
            "price": 265000.0,
            "currency": "PKR",
            "seller": "Telemart",
            "product_rating": 4.6,
            "review_count": 62,
            "specifications": {"processor": "AMD Ryzen 7", "ram": "16GB", "storage": "512GB"},
            "delivery_estimate": "3-5 business days",
            "cross_border": False
        }
    ]
    comparison = execute_compare_products(products, requirements={"budget_max": 300000.0})
    assert len(comparison["products"]) == 2
    assert len(comparison["matrix"]) > 5
    assert "best_overall_index" in comparison
    assert "best_value_index" in comparison
    assert "ai_summary" in comparison
    assert "pros_and_cons" in comparison
