import uuid
from decimal import Decimal
from typing import Dict, Any, Optional
from uuid import UUID
from app.services.payment.base import BasePaymentProvider
from app.core.config import settings


class StripePaymentProvider(BasePaymentProvider):
    """
    Stripe Payment Gateway adapter (Phase 2 Live API stub).
    """
    def create_payment_intent(
        self,
        order_id: UUID,
        amount: Decimal,
        currency: str = "USD",
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        intent_id = f"pi_stripe_{uuid.uuid4().hex}"
        client_secret = f"{intent_id}_secret_{uuid.uuid4().hex[:10]}"
        return {
            "success": True,
            "provider": "stripe",
            "order_id": str(order_id),
            "amount": float(amount),
            "currency": currency,
            "client_secret": client_secret,
            "transaction_id": intent_id,
            "status": "requires_payment_method"
        }

    def confirm_payment(self, order_id: UUID, confirmation_token: str) -> Dict[str, Any]:
        return {
            "success": True,
            "provider": "stripe",
            "status": "paid",
            "order_id": str(order_id),
            "transaction_id": f"ch_stripe_{uuid.uuid4().hex[:12]}"
        }


class PayPalPaymentProvider(BasePaymentProvider):
    """
    PayPal Gateway adapter (Phase 2 Live API stub).
    """
    def create_payment_intent(
        self,
        order_id: UUID,
        amount: Decimal,
        currency: str = "USD",
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        paypal_id = f"PAYID_{uuid.uuid4().hex[:12].upper()}"
        return {
            "success": True,
            "provider": "paypal",
            "order_id": str(order_id),
            "amount": float(amount),
            "currency": currency,
            "approval_url": f"https://www.sandbox.paypal.com/checkoutnow?token={paypal_id}",
            "transaction_id": paypal_id,
            "status": "created"
        }

    def confirm_payment(self, order_id: UUID, confirmation_token: str) -> Dict[str, Any]:
        return {
            "success": True,
            "provider": "paypal",
            "status": "paid",
            "order_id": str(order_id),
            "transaction_id": f"PAYPAL_CAPTURE_{uuid.uuid4().hex[:10]}"
        }


class RazorpayPaymentProvider(BasePaymentProvider):
    """
    Razorpay Gateway adapter (Phase 2 Live API stub).
    """
    def create_payment_intent(
        self,
        order_id: UUID,
        amount: Decimal,
        currency: str = "INR",
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        rzp_id = f"order_rzp_{uuid.uuid4().hex[:12]}"
        return {
            "success": True,
            "provider": "razorpay",
            "order_id": str(order_id),
            "amount": float(amount),
            "currency": currency,
            "razorpay_order_id": rzp_id,
            "transaction_id": rzp_id,
            "status": "created"
        }

    def confirm_payment(self, order_id: UUID, confirmation_token: str) -> Dict[str, Any]:
        return {
            "success": True,
            "provider": "razorpay",
            "status": "paid",
            "order_id": str(order_id),
            "transaction_id": f"pay_rzp_{uuid.uuid4().hex[:10]}"
        }
