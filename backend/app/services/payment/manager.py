from typing import Dict, Any
from app.core.config import settings
from app.services.payment.base import BasePaymentProvider
from app.services.payment.mock_provider import MockPaymentProvider
from app.services.payment.external_providers import (
    StripePaymentProvider,
    PayPalPaymentProvider,
    RazorpayPaymentProvider
)


class PaymentManager:
    """
    Gateway manager dispatching payment intents to configured provider (Mock, Stripe, PayPal, Razorpay).
    """
    def __init__(self):
        self.providers: Dict[str, BasePaymentProvider] = {
            "mock": MockPaymentProvider(),
            "stripe": StripePaymentProvider(),
            "paypal": PayPalPaymentProvider(),
            "razorpay": RazorpayPaymentProvider(),
        }

    def get_provider(self, mode: str = None) -> BasePaymentProvider:
        selected_mode = (mode or settings.PAYMENT_MODE).lower()
        return self.providers.get(selected_mode, self.providers["mock"])


payment_manager = PaymentManager()
