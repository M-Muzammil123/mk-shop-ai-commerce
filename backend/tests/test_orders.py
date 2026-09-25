import pytest
import uuid
from app.models.profile import Profile, UserRole
from app.models.product import Category, Product, ProductStatus
from app.models.interaction import Cart, CartItem
from app.core.security import create_access_token


@pytest.fixture
def order_user(db_session):
    user = Profile(
        id=uuid.uuid4(),
        first_name="Order",
        last_name="Tester",
        email=f"order_{uuid.uuid4().hex[:6]}@example.com",
        role=UserRole.CUSTOMER
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def auth_headers(order_user):
    token = create_access_token({"sub": str(order_user.id)})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def sample_product(db_session):
    category = Category(name="Gear", slug=f"gear-{uuid.uuid4().hex[:6]}")
    db_session.add(category)
    db_session.commit()

    product = Product(
        name="Pro Gaming Keyboard",
        slug=f"pro-gaming-keyboard-{uuid.uuid4().hex[:6]}",
        price=129.99,
        sku=f"KB-{uuid.uuid4().hex[:6]}",
        status=ProductStatus.PUBLISHED,
        category_id=category.id
    )
    db_session.add(product)
    db_session.commit()
    db_session.refresh(product)
    return product


def test_create_order_empty_cart(client, auth_headers):
    payload = {
        "payment_provider": "stripe"
    }
    response = client.post("/api/v1/orders", json=payload, headers=auth_headers)
    assert response.status_code in [400, 422]


def test_create_order_with_cart_items(client, auth_headers, order_user, sample_product, db_session):
    # Ensure cart exists for order_user
    cart = db_session.query(Cart).filter(Cart.id == order_user.id).first()
    if not cart:
        cart = Cart(id=order_user.id)
        db_session.add(cart)
        db_session.commit()

    cart_item = CartItem(cart_id=cart.id, product_id=sample_product.id, quantity=2)
    db_session.add(cart_item)
    db_session.commit()

    payload = {
        "payment_provider": "stripe"
    }
    response = client.post("/api/v1/orders", json=payload, headers=auth_headers)
    assert response.status_code in [200, 201]
    data = response.json()
    assert "id" in data
    assert float(data["total_amount"]) > 0


def test_get_user_orders(client, auth_headers):
    response = client.get("/api/v1/orders", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_order_by_invalid_id(client, auth_headers):
    random_id = str(uuid.uuid4())
    response = client.get(f"/api/v1/orders/{random_id}", headers=auth_headers)
    assert response.status_code == 404


def test_apply_invalid_coupon(client):
    response = client.get("/api/v1/orders/coupons/NONEXISTENT_CODE")
    assert response.status_code == 404
