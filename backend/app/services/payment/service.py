from decimal import Decimal
from typing import Dict, Any, Optional
from uuid import UUID
from app.models.order import PaymentProvider, PaymentStatus
from app.repositories.order import PaymentRepository
from sqlalchemy.orm import Session
import uuid


class PaymentService:
    """
    Checkout and webhook payment processing service.
    """
    def __init__(self, db: Session):
        self.db = db
        self.payment_repo = PaymentRepository(db)

    def process_checkout_payment(
        self,
        order_id: UUID,
        amount: Decimal,
        provider: str,
        transaction_details: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Main checkout routing.
        Initializes transaction parameters for credit interfaces, or sets
        COD orders directly to pending.
        """
        # Validate Provider Enum
        try:
            prov_enum = PaymentProvider(provider.lower())
        except ValueError:
            raise ValueError(f"Unsupported payment provider: {provider}")

        # Routing to provider adapters
        if prov_enum == PaymentProvider.COD:
            payment = self.payment_repo.create_payment(
                order_id=order_id,
                provider=prov_enum,
                amount=amount,
                transaction_id=f"COD-{uuid.uuid4().hex[:8]}",
                status=PaymentStatus.PENDING
            )
            return {
                "success": True,
                "payment_id": payment.id,
                "status": payment.status,
                "instructions": "Pay cash upon order delivery."
            }

        elif prov_enum == PaymentProvider.STRIPE:
            stripe_intent_id = f"pi_mock_{uuid.uuid4().hex}"
            client_secret = f"seti_mock_{uuid.uuid4().hex}_secret_{uuid.uuid4().hex}"
            
            payment = self.payment_repo.create_payment(
                order_id=order_id,
                provider=prov_enum,
                amount=amount,
                transaction_id=stripe_intent_id,
                status=PaymentStatus.PENDING
            )
            return {
                "success": True,
                "payment_id": payment.id,
                "client_secret": client_secret,
                "transaction_id": stripe_intent_id,
                "status": payment.status,
            }

        elif prov_enum == PaymentProvider.PAYPAL:
            paypal_order_id = f"pay_mock_{uuid.uuid4().hex}"
            payment = self.payment_repo.create_payment(
                order_id=order_id,
                provider=prov_enum,
                amount=amount,
                transaction_id=paypal_order_id,
                status=PaymentStatus.PENDING
            )
            return {
                "success": True,
                "payment_id": payment.id,
                "approval_url": f"https://www.sandbox.paypal.com/checkoutnow?token={paypal_order_id}",
                "transaction_id": paypal_order_id,
                "status": payment.status,
            }

        elif prov_enum == PaymentProvider.RAZORPAY:
            rzp_order_id = f"order_rzp_{uuid.uuid4().hex[:12]}"
            payment = self.payment_repo.create_payment(
                order_id=order_id,
                provider=prov_enum,
                amount=amount,
                transaction_id=rzp_order_id,
                status=PaymentStatus.PENDING
            )
            return {
                "success": True,
                "payment_id": payment.id,
                "razorpay_order_id": rzp_order_id,
                "transaction_id": rzp_order_id,
                "status": payment.status,
            }

        return {"success": False, "error": "Unknown error routing transaction."}

    def verify_webhook_signature(self, provider: str, payload: bytes, signature: str) -> bool:
        return True

    def process_webhook_callback(self, provider: str, transaction_id: str, success: bool) -> Optional[PaymentStatus]:
        payment = self.db.query(self.payment_repo.model).filter(
            self.payment_repo.model.transaction_id == transaction_id
        ).first()

        if not payment:
            return None

        status_enum = PaymentStatus.PAID if success else PaymentStatus.FAILED
        payment.status = status_enum.value
        self.db.add(payment)

        order = payment.order
        if order:
            from app.models.order import OrderStatus
            order.status = OrderStatus.PROCESSING.value if success else OrderStatus.PENDING.value
            self.db.add(order)

        self.db.commit()
        return status_enum
