import pytest
import uuid
from app.models.profile import Profile
from app.models.interaction import Cart
from app.models.product import Product
from app.api.v1.endpoints.agent import (
    add_discovered_product_to_cart,
    prepare_and_confirm_checkout,
    execute_payment_confirmation
)
from app.schemas.shopping_agent import (
    AddToCartAgentRequest,
    CheckoutConfirmRequest,
    PaymentConfirmRequest,
    DiscoveredProduct
)


@pytest.fixture
def test_user(db_session):
    user = Profile(
        id=uuid.uuid4(),
        email="shopper@example.com",
        first_name="Smart",
        last_name="Shopper",
        role="customer"
    )
    db_session.add(user)
    db_session.commit()
    return user


def test_add_external_product_to_cart(db_session, test_user):
    ext_product = DiscoveredProduct(
        product_name="Lenovo Legion 5 Gaming Laptop",
        brand="Lenovo",
        model="Legion 5",
        price=289000.0,
        currency="PKR",
        seller="Paklap Official",
        country_code="PK",
        source_url="https://paklap.pk/lenovo-legion-5.html",
        source_domain="paklap.pk",
        retrieved_at="2026-09-25T16:00:00Z"
    )
    req = AddToCartAgentRequest(product=ext_product, quantity=1)
    res = add_discovered_product_to_cart(req=req, user=test_user, db=db_session)
    assert res["success"] is True
    assert "product_id" in res


def test_checkout_preparation_and_confirmation_token(db_session, test_user):
    # Add product to cart first
    ext_product = DiscoveredProduct(
        product_name="Apple iPhone 15",
        price=245000.0,
        currency="PKR",
        seller="PriceOye",
        country_code="PK",
        source_url="https://priceoye.pk/iphone15",
        source_domain="priceoye.pk",
        retrieved_at="2026-09-25T16:00:00Z"
    )
    add_discovered_product_to_cart(req=AddToCartAgentRequest(product=ext_product), user=test_user, db=db_session)

    # Prepare checkout
    checkout_req = CheckoutConfirmRequest(payment_provider="mock")
    checkout_res = prepare_and_confirm_checkout(req=checkout_req, user=test_user, db=db_session)

    assert checkout_res.success is True
    assert checkout_res.is_simulation is True
    assert checkout_res.confirmation_token.startswith("sim_token_")
    assert checkout_res.total_amount > 0


def test_simulated_payment_confirmation(db_session, test_user):
    # Setup Cart & Checkout
    ext_product = DiscoveredProduct(
        product_name="Nike Air Zoom",
        price=95.0,
        currency="GBP",
        seller="Sports Direct UK",
        country_code="UK",
        source_url="https://sportsdirect.com/nike",
        source_domain="sportsdirect.com",
        retrieved_at="2026-09-25T16:00:00Z"
    )
    add_discovered_product_to_cart(req=AddToCartAgentRequest(product=ext_product), user=test_user, db=db_session)
    checkout_res = prepare_and_confirm_checkout(req=CheckoutConfirmRequest(), user=test_user, db=db_session)

    # Confirm Simulated Payment
    pay_req = PaymentConfirmRequest(
        order_id=checkout_res.order_id,
        confirmation_token=checkout_res.confirmation_token,
        provider="mock"
    )
    pay_res = execute_payment_confirmation(req=pay_req, user=test_user, db=db_session)
    assert pay_res.success is True
    assert pay_res.status == "simulated_paid"
    assert pay_res.is_simulation is True
    assert "SIM_TXN_" in pay_res.transaction_id
