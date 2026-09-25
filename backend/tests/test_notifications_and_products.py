import pytest
import uuid
from app.models.profile import Profile, UserRole
from app.models.product import Category, Product, ProductStatus
from app.core.security import create_access_token


@pytest.fixture
def test_user(db_session):
    u = Profile(
        id=uuid.uuid4(),
        first_name="Notif",
        last_name="User",
        email=f"notif_{uuid.uuid4().hex[:6]}@example.com",
        role=UserRole.CUSTOMER
    )
    db_session.add(u)
    db_session.commit()
    db_session.refresh(u)
    return u


@pytest.fixture
def auth_headers(test_user):
    token = create_access_token({"sub": str(test_user.id)})
    return {"Authorization": f"Bearer {token}"}


def test_product_pagination_and_sorting(client, db_session):
    cat = Category(name="Monitors", slug=f"monitors-{uuid.uuid4().hex[:6]}")
    db_session.add(cat)
    db_session.commit()

    for i in range(5):
        p = Product(
            name=f"4K Gaming Monitor {i}",
            slug=f"4k-gaming-monitor-{i}-{uuid.uuid4().hex[:6]}",
            price=299.99 + (i * 50),
            sku=f"MON-{i}-{uuid.uuid4().hex[:6]}",
            status=ProductStatus.PUBLISHED,
            category_id=cat.id
        )
        db_session.add(p)
    db_session.commit()

    # Test pagination parameters (skip=0, limit=2)
    res = client.get("/api/v1/products?limit=2&skip=0&sort_by=price_asc")
    assert res.status_code == 200
    data = res.json()
    assert len(data["products"]) == 2

    # Test sorting desc
    res_desc = client.get("/api/v1/products?sort_by=price_desc")
    assert res_desc.status_code == 200


def test_get_nonexistent_product(client):
    fake_slug = f"nonexistent-slug-{uuid.uuid4().hex[:6]}"
    res = client.get(f"/api/v1/products/{fake_slug}")
    assert res.status_code == 404


def test_get_notifications(client, auth_headers):
    res = client.get("/api/v1/notifications", headers=auth_headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)
