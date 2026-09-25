from abc import ABC, abstractmethod
from decimal import Decimal
from typing import Dict, Any, Optional
from uuid import UUID


class BasePaymentProvider(ABC):
    """
    Abstract Payment Provider Base Class.
    """
    @abstractmethod
    def create_payment_intent(
        self,
        order_id: UUID,
        amount: Decimal,
        currency: str = "PKR",
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        pass

    @abstractmethod
    def confirm_payment(
        self,
        order_id: UUID,
        confirmation_token: str
    ) -> Dict[str, Any]:
        pass
