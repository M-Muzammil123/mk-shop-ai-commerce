from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.repositories.base import BaseRepository
from app.models.order import Order, OrderItem, Payment, Coupon, OrderStatus, PaymentStatus, PaymentProvider
from app.models.product import Inventory
from app.schemas.order import OrderCreate, CouponCreate
from uuid import UUID
from decimal import Decimal


class CouponRepository(BaseRepository[Coupon, CouponCreate, CouponCreate]):
    def __init__(self, db: Session):
        super().__init__(Coupon, db)

    def get_by_code(self, code: str) -> Optional[Coupon]:
        return (
            self.db.query(Coupon)
            .filter(Coupon.code == code, Coupon.is_active == True)
            .first()
        )


class OrderRepository(BaseRepository[Order, OrderCreate, OrderCreate]):
    def __init__(self, db: Session):
        super().__init__(Order, db)

    def get_user_orders(self, profile_id: UUID) -> List[Order]:
        return (
            self.db.query(Order)
            .filter(Order.profile_id == profile_id)
            .order_by(Order.created_at.desc())
            .all()
        )

    def create_order_with_items(
        self,
        *,
        profile_id: UUID,
        items: List[Tuple[UUID, int, Decimal]], # List of (product_id, quantity, unit_price)
        shipping_address_id: UUID,
        billing_address_id: UUID,
        coupon: Optional[Coupon] = None,
        tax_rate: Decimal = Decimal("0.08"), # 8% mock tax
        shipping_cost: Decimal = Decimal("10.00"),
    ) -> Order:
        """
        Calculates calculations and creates a complete Order record.
        Decrements inventory for purchased quantities.
        """
        # Calculate subtotal
        subtotal = sum(price * qty for _, qty, price in items)
        
        # Calculate discount
        discount = Decimal("0.00")
        if coupon:
            if coupon.discount_type == "percentage":
                discount = (subtotal * coupon.discount_value) / Decimal("100.00")
            elif coupon.discount_type == "fixed":
                discount = coupon.discount_value
            
            # Cap discount at subtotal
            discount = min(discount, subtotal)
            
            # Increment coupon usage
            coupon.used_count += 1
            self.db.add(coupon)
            
        taxable_amount = subtotal - discount
        tax = taxable_amount * tax_rate
        total = taxable_amount + tax + shipping_cost

        # 1. Create order core
        order_obj = Order(
            profile_id=profile_id,
            status=OrderStatus.PENDING.value,
            total_amount=total,
            tax_amount=tax,
            shipping_amount=shipping_cost,
            discount_amount=discount,
            coupon_id=coupon.id if coupon else None,
            shipping_address_id=shipping_address_id,
            billing_address_id=billing_address_id
        )
        self.db.add(order_obj)
        self.db.flush() # Populate order_obj.id

        # 2. Add items and update inventory
        for product_id, qty, price in items:
            order_item = OrderItem(
                order_id=order_obj.id,
                product_id=product_id,
                quantity=qty,
                price=price
            )
            self.db.add(order_item)

            # Deduct inventory count
            inventory = self.db.query(Inventory).filter(Inventory.product_id == product_id).first()
            if inventory:
                if inventory.quantity < qty:
                    # In real app, raise custom HTTP exception, let's raise ValueError
                    raise ValueError(f"Insufficient stock for product ID {product_id}")
                inventory.quantity -= qty
                self.db.add(inventory)

        self.db.commit()
        self.db.refresh(order_obj)
        return order_obj

    def update_order_status(self, order_id: UUID, status: OrderStatus) -> Optional[Order]:
        order = self.get(order_id)
        if order:
            order.status = status.value
            self.db.add(order)
            self.db.commit()
            self.db.refresh(order)
        return order


class PaymentRepository(BaseRepository[Payment, Payment, Payment]):
    def __init__(self, db: Session):
        super().__init__(Payment, db)

    def create_payment(
        self,
        *,
        order_id: UUID,
        provider: PaymentProvider,
        amount: Decimal,
        transaction_id: str,
        status: PaymentStatus = PaymentStatus.PAID
    ) -> Payment:
        payment = Payment(
            order_id=order_id,
            provider=provider.value,
            amount=amount,
            transaction_id=transaction_id,
            status=status.value
        )
        self.db.add(payment)
        
        # If payment succeeded, update order status to processing
        if status == PaymentStatus.PAID:
            order = self.db.query(Order).filter(Order.id == order_id).first()
            if order:
                order.status = OrderStatus.PROCESSING.value
                self.db.add(order)
                
        self.db.commit()
        self.db.refresh(payment)
        return payment
