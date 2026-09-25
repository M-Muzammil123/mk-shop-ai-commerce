import pytest
import uuid
from app.services.payment.mock_provider import MockPaymentProvider
from app.services.payment.manager import payment_manager


def test_mock_payment_provider_lifecycle():
    provider = MockPaymentProvider()
    order_id = uuid.uuid4()

    # 1. Intent Creation
    intent = provider.create_payment_intent(order_id=order_id, amount=250000.0, currency="PKR")
    assert intent["success"] is True
    assert intent["is_simulation"] is True
    assert intent["status"] == "requires_confirmation"
    token = intent["confirmation_token"]
    assert token.startswith("sim_token_")

    # 2. Rejection of invalid token
    invalid_res = provider.confirm_payment(order_id=order_id, confirmation_token="bogus_token")
    assert invalid_res["success"] is False
    assert invalid_res["status"] == "failed"

    # 3. Successful Simulated Payment
    valid_res = provider.confirm_payment(order_id=order_id, confirmation_token=token)
    assert valid_res["success"] is True
    assert valid_res["status"] == "simulated_paid"
    assert valid_res["is_simulation"] is True
    assert valid_res["transaction_id"].startswith("SIM_TXN_")


def test_payment_manager_mode_switching():
    mock_prov = payment_manager.get_provider("mock")
    assert isinstance(mock_prov, MockPaymentProvider)

    stripe_prov = payment_manager.get_provider("stripe")
    assert stripe_prov is not None
