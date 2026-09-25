import pytest
from app.models.profile import Profile, UserRole
from app.models.product import Category, Product, ProductStatus
from app.core.security import create_access_token
import uuid

@pytest.fixture
def test_user(db_session):
    user = Profile(
        id=uuid.uuid4(),
        first_name="Test",
        last_name="User",
        email=f"testcart_{uuid.uuid4().hex[:6]}@example.com",
        role=UserRole.CUSTOMER
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def auth_headers(test_user):
    token = create_access_token({"sub": str(test_user.id)})
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def test_product(db_session):
    category = Category(name="Electronics", slug=f"electronics-{uuid.uuid4().hex[:6]}")
    db_session.add(category)
    db_session.commit()

    product = Product(
        name="Test Wireless Headphones",
        slug=f"test-wireless-headphones-{uuid.uuid4().hex[:6]}",
        price=149.99,
        sku=f"SKU-{uuid.uuid4().hex[:6]}",
        status=ProductStatus.PUBLISHED,
        category_id=category.id
    )
    db_session.add(product)
    db_session.commit()
    db_session.refresh(product)
    return product


def test_get_empty_cart(client, auth_headers):
    response = client.get("/api/v1/cart", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) == 0


def test_add_item_to_cart(client, auth_headers, test_product):
    payload = {
        "product_id": str(test_product.id),
        "quantity": 2
    }
    response = client.post("/api/v1/cart/items", json=payload, headers=auth_headers)
    assert response.status_code in [200, 201]
    data = response.json()
    assert data["quantity"] == 2


def test_update_cart_item_quantity(client, auth_headers, test_product):
    # First add item
    client.post("/api/v1/cart/items", json={"product_id": str(test_product.id), "quantity": 1}, headers=auth_headers)
    
    # Update quantity
    update_payload = {"product_id": str(test_product.id), "quantity": 5}
    response = client.put(f"/api/v1/cart/items/{test_product.id}", json=update_payload, headers=auth_headers)
    assert response.status_code in [200, 204]


def test_remove_item_from_cart(client, auth_headers, test_product):
    # Add item
    client.post("/api/v1/cart/items", json={"product_id": str(test_product.id), "quantity": 1}, headers=auth_headers)
    
    # Remove item
    response = client.delete(f"/api/v1/cart/items/{test_product.id}", headers=auth_headers)
    assert response.status_code in [200, 204]


def test_wishlist_toggle(client, auth_headers, test_product):
    payload = {"product_id": str(test_product.id)}
    response = client.post("/api/v1/cart/wishlist", json=payload, headers=auth_headers)
    assert response.status_code in [200, 201]
