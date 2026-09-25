import pytest
from uuid import uuid4

def test_get_categories_empty(client):
    response = client.get("/api/v1/products/categories")
    assert response.status_code == 200
    assert response.json() == []

def test_get_products_catalog(client, db_session):
    from app.models.product import Category, Product, ProductImage, Inventory
    
    # 1. Create a category
    cat = Category(name="Electronics", slug="electronics", description="Tech gear")
    db_session.add(cat)
    db_session.commit()
    db_session.refresh(cat)

    # 2. Create products
    prod_id1 = uuid4()
    p1 = Product(
        id=prod_id1,
        name="Aura Chrono Watch",
        slug="aura-chrono",
        description="Premium Smart Watch",
        price=299.00,
        sku="SKU-CHRONO-TEST",
        status="published",
        is_featured=True,
        category_id=cat.id
    )
    
    prod_id2 = uuid4()
    p2 = Product(
        id=prod_id2,
        name="Nomad Leather Bag",
        slug="nomad-bag",
        description="Luxury carry backpack",
        price=189.00,
        sku="SKU-BAG-TEST",
        status="published",
        is_featured=False,
        category_id=cat.id
    )
    
    db_session.add_all([p1, p2])
    db_session.commit()

    # 3. Add inventory for watch
    inv = Inventory(product_id=prod_id1, quantity=10, low_stock_threshold=2)
    db_session.add(inv)
    db_session.commit()

    # Verify GET /products
    response = client.get("/api/v1/products")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert len(data["products"]) == 2
    
    # Verify Search Filter
    res_search = client.get("/api/v1/products?search=Chrono")
    assert res_search.status_code == 200
    assert res_search.json()["total"] == 1
    assert res_search.json()["products"][0]["slug"] == "aura-chrono"

    # Verify In-Stock Filter
    res_stock = client.get("/api/v1/products?in_stock=true")
    assert res_stock.status_code == 200
    # Only Aura Chrono Watch has inventory entry with quantity > 0
    assert res_stock.json()["total"] == 1
    assert res_stock.json()["products"][0]["slug"] == "aura-chrono"

    # Verify GET /products/{slug}
    res_detail = client.get("/api/v1/products/aura-chrono")
    assert res_detail.status_code == 200
    assert res_detail.json()["name"] == "Aura Chrono Watch"
    assert res_detail.json()["sku"] == "SKU-CHRONO-TEST"
