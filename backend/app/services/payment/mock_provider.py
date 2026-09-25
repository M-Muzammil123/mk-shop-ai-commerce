import uuid
from decimal import Decimal
from typing import Dict, Any, Optional
from uuid import UUID
from app.services.payment.base import BasePaymentProvider


class MockPaymentProvider(BasePaymentProvider):
    """
    Simulated Mock Payment Provider for Phase 1 Demo & Testing Mode.
    Never charges real money; clearly labels transactions as simulated.
    """
    def create_payment_intent(
        self,
        order_id: UUID,
        amount: Decimal,
        currency: str = "PKR",
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        confirmation_token = f"sim_token_{uuid.uuid4().hex}"
        return {
            "success": True,
            "is_simulation": True,
            "provider": "mock",
            "order_id": str(order_id),
            "amount": float(amount),
            "currency": currency,
            "status": "requires_confirmation",
            "confirmation_token": confirmation_token,
            "message": "Demo Payment Mode: Review order breakdown and confirm to complete simulated checkout."
        }

    def confirm_payment(
        self,
        order_id: UUID,
        confirmation_token: str
    ) -> Dict[str, Any]:
        if not confirmation_token or not confirmation_token.startswith("sim_token_"):
            return {
                "success": False,
                "status": "failed",
                "message": "Invalid confirmation token."
            }

        sim_txn_id = f"SIM_TXN_{uuid.uuid4().hex[:12].upper()}"
        return {
            "success": True,
            "is_simulation": True,
            "status": "simulated_paid",
            "order_id": str(order_id),
            "transaction_id": sim_txn_id,
            "message": "Simulated payment successfully processed. No real money was charged."
        }
