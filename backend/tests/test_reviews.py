import pytest
import uuid
from app.models.profile import Profile, UserRole
from app.models.product import Category, Product, ProductStatus
from app.core.security import create_access_token


@pytest.fixture
def review_user(db_session):
    user = Profile(
        id=uuid.uuid4(),
        first_name="Reviewer",
        last_name="One",
        email=f"reviewer_{uuid.uuid4().hex[:6]}@example.com",
        role=UserRole.CUSTOMER
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def auth_headers(review_user):
    token = create_access_token({"sub": str(review_user.id)})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def product_for_review(db_session):
    category = Category(name="Gadgets", slug=f"gadgets-{uuid.uuid4().hex[:6]}")
    db_session.add(category)
    db_session.commit()

    product = Product(
        name="Smart AI Speaker",
        slug=f"smart-ai-speaker-{uuid.uuid4().hex[:6]}",
        price=89.99,
        sku=f"SPK-{uuid.uuid4().hex[:6]}",
        status=ProductStatus.PUBLISHED,
        category_id=category.id
    )
    db_session.add(product)
    db_session.commit()
    db_session.refresh(product)
    return product


def test_create_product_review(client, auth_headers, product_for_review):
    payload = {
        "product_id": str(product_for_review.id),
        "rating": 5,
        "title": "Amazing Sound Quality!",
        "comment": "The bass is phenomenal and the AI assistant works seamlessly."
    }
    response = client.post("/api/v1/reviews", json=payload, headers=auth_headers)
    assert response.status_code in [200, 201]
    data = response.json()
    assert data["rating"] == 5
    assert data["title"] == "Amazing Sound Quality!"


def test_get_product_reviews(client, product_for_review):
    response = client.get(f"/api/v1/reviews/product/{product_for_review.id}")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_get_review_sentiment_intelligence(client, product_for_review):
    response = client.get(f"/api/v1/ai/products/{product_for_review.id}/review-intelligence")
    assert response.status_code == 200
    data = response.json()
    assert "overall_sentiment" in data
    assert "positive_percentage" in data
