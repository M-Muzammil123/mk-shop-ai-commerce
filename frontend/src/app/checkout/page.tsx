'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '@/lib/api/cart';
import { authApi } from '@/lib/api/auth';
import { ordersApi } from '@/lib/api/orders';
import { agentApi } from '@/lib/api/agent';
import { useAuthStore } from '@/store/auth-store';
import { useCountryStore } from '@/store/country-store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  CheckCircle2,
  ShoppingBag,
  ArrowRight,
  ChevronRight,
  AlertCircle,
  Tag,
} from 'lucide-react';
import Link from 'next/link';

function CheckoutContent() {
  const { token } = useAuthStore();
  const { formatPrice, currentCountry } = useCountryStore();
  const queryClient = useQueryClient();

  // Multi-step: 1 = Shipping, 2 = Payment & Review, 3 = Confirmation Success
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Address inputs
  const [addressLine1, setAddressLine1] = useState('123 Commercial Plaza, Main Boulevard');
  const [addressLine2, setAddressLine2] = useState('Suite 402');
  const [city, setCity] = useState('Lahore');
  const [stateProvince, setStateProvince] = useState('Punjab');
  const [postalCode, setPostalCode] = useState('54000');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Payment method
  const [paymentProvider, setPaymentProvider] = useState<'mock' | 'stripe' | 'cod' | 'paypal'>('mock');

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount_value: number; discount_type: string } | null>(null);
  const [couponError, setCouponError] = useState('');

  // Confirmation result
  const [orderResult, setOrderResult] = useState<{
    orderId: string;
    totalAmount: number;
    transactionId?: string;
    isSimulation?: boolean;
  } | null>(null);

  // 1. Fetch Cart
  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.getCart,
    enabled: !!token,
  });

  // 2. Fetch User Addresses
  const { data: savedAddresses = [] } = useQuery({
    queryKey: ['user-addresses'],
    queryFn: authApi.getAddresses,
    enabled: !!token,
  });

  // Verify Coupon Mutation
  const verifyCouponMutation = useMutation({
    mutationFn: (code: string) => ordersApi.getCouponByCode(code),
    onSuccess: (data) => {
      setAppliedCoupon({
        code: data.code,
        discount_value: parseFloat(String(data.discount_value)),
        discount_type: data.discount_type,
      });
      setCouponError('');
    },
    onError: (err) => {
      setCouponError(err instanceof Error ? err.message : 'Invalid or expired coupon code');
      setAppliedCoupon(null);
    },
  });

  // Execute Agent Checkout & Payment Mutation
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      // Step A: Prepare & Confirm checkout
      const confirmRes = await agentApi.checkoutConfirm({
        payment_provider: paymentProvider,
        coupon_code: appliedCoupon?.code,
        shipping_address: {
          line1: addressLine1,
          line2: addressLine2,
          city,
          state: stateProvince,
          postal_code: postalCode,
          country: currentCountry.code,
        },
      });

      // Step B: Finalize payment authorization
      const paymentRes = await agentApi.paymentConfirm({
        order_id: confirmRes.order_id,
        confirmation_token: confirmRes.confirmation_token,
        provider: paymentProvider,
      });

      return {
        orderId: confirmRes.order_id,
        totalAmount: confirmRes.total_amount,
        transactionId: paymentRes.transaction_id,
        isSimulation: confirmRes.is_simulation,
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setOrderResult(data);
      setStep(3);
    },
  });

  if (!token) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <ShieldCheck className="h-16 w-16 text-zinc-300 mx-auto" />
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Sign In to Checkout
        </h1>
        <p className="text-sm text-zinc-500">
          Please log in to your account so we can link your order and secure your payment.
        </p>
        <Link href="/auth/login?redirect=/checkout">
          <Button variant="primary" size="lg">
            Sign In to Continue
          </Button>
        </Link>
      </div>
    );
  }

  const items = cart?.items || [];
  const subtotal = typeof cart?.subtotal === 'string' ? parseFloat(cart.subtotal) : (cart?.subtotal || 0);

  if (items.length === 0 && step !== 3) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <ShoppingBag className="h-16 w-16 text-zinc-300 mx-auto" />
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Your Cart is Empty
        </h2>
        <p className="text-sm text-zinc-500">
          Add items to your cart before proceeding to checkout.
        </p>
        <Link href="/shop">
          <Button variant="primary">Return to Shop</Button>
        </Link>
      </div>
    );
  }

  const shipping = subtotal > 10000 || subtotal === 0 ? 0 : 250;
  const estimatedTax = Math.round(subtotal * 0.05);
  const discount = appliedCoupon ? (appliedCoupon.discount_type === 'percentage' ? (subtotal * appliedCoupon.discount_value) / 100 : appliedCoupon.discount_value) : 0;
  const total = Math.max(0, subtotal + shipping + estimatedTax - discount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Checkout Step Header */}
      <div className="pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          <span className={step >= 1 ? 'text-indigo-600 font-bold' : ''}>1. Shipping</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className={step >= 2 ? 'text-indigo-600 font-bold' : ''}>2. Payment & Review</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className={step === 3 ? 'text-emerald-600 font-bold' : ''}>3. Confirmed</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight mt-2">
          {step === 3 ? 'Order Confirmed!' : 'Secure Checkout'}
        </h1>
      </div>

      {/* STEP 3: SUCCESS CONFIRMATION */}
      {step === 3 && orderResult ? (
        <div className="max-w-2xl mx-auto rounded-3xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/20 p-8 text-center space-y-6 shadow-sm">
          <div className="h-16 w-16 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="h-9 w-9" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
              Thank You for Your Order!
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Your order has been authorized and queued for regional fulfillment.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-zinc-500">Order Reference:</span>
              <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                {orderResult.orderId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Total Charged:</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                {formatPrice(orderResult.totalAmount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Payment Status:</span>
              <span className="text-emerald-600 font-semibold">Simulated Paid (Demo Mode)</span>
            </div>
            {orderResult.transactionId && (
              <div className="flex justify-between">
                <span className="text-zinc-500">Transaction ID:</span>
                <span className="font-mono text-zinc-600 dark:text-zinc-400">
                  {orderResult.transactionId}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href={`/orders/${orderResult.orderId}`} className="w-full sm:w-auto">
              <Button variant="primary" size="md" className="w-full">
                View Order Details
              </Button>
            </Link>
            <Link href="/shop" className="w-full sm:w-auto">
              <Button variant="outline" size="md" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Checkout Steps Form */}
          <div className="lg:col-span-7 space-y-8">
            {/* STEP 1: SHIPPING INFORMATION */}
            {step === 1 && (
              <div className="space-y-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs">
                <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                  <Truck className="h-5 w-5 text-indigo-600" />
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    Shipping Address
                  </h2>
                </div>

                {savedAddresses.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                      Use a Saved Address:
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {savedAddresses.map((addr) => (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => {
                            setSelectedAddressId(addr.id);
                            setAddressLine1(addr.address_line1);
                            setAddressLine2(addr.address_line2 || '');
                            setCity(addr.city);
                            setStateProvince(addr.state_province || '');
                            setPostalCode(addr.postal_code);
                          }}
                          className={`p-3 rounded-xl border text-left text-xs transition-all ${
                            selectedAddressId === addr.id
                              ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30'
                              : 'border-zinc-200 dark:border-zinc-800'
                          }`}
                        >
                          <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {addr.address_line1} {addr.address_line2}
                          </p>
                          <p className="text-zinc-500">
                            {addr.city}, {addr.state_province} {addr.postal_code}, {addr.country}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Street Address
                    </label>
                    <Input
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      placeholder="123 Street Name"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Apartment / Suite (Optional)
                    </label>
                    <Input
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      placeholder="Suite, unit, floor"
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        City
                      </label>
                      <Input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        State / Province
                      </label>
                      <Input
                        value={stateProvince}
                        onChange={(e) => setStateProvince(e.target.value)}
                        placeholder="State / Province"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Postal Code
                      </label>
                      <Input
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="Postal code"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Country
                      </label>
                      <Input
                        value={`${currentCountry.name} (${currentCountry.code})`}
                        disabled
                        className="mt-1 bg-zinc-100 dark:bg-zinc-800 opacity-80"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setStep(2)}
                  disabled={!addressLine1 || !city || !postalCode}
                  className="w-full gap-2 rounded-2xl"
                >
                  Continue to Payment <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* STEP 2: PAYMENT METHOD & CONFIRMATION */}
            {step === 2 && (
              <div className="space-y-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs">
                <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                  <CreditCard className="h-5 w-5 text-indigo-600" />
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    Payment Method
                  </h2>
                </div>

                {/* Explicit Simulation Notice per prompt requirement */}
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-300 space-y-1">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <span>Development & Demonstration Mode Notice:</span>
                  </div>
                  <p className="leading-relaxed">
                    This platform uses the backend&apos;s simulated payment gateway adapter. No real money will be charged to your card.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <label
                    onClick={() => setPaymentProvider('mock')}
                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentProvider === 'mock'
                        ? 'border-indigo-600 bg-indigo-50/30 dark:bg-indigo-950/20 shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked={paymentProvider === 'mock'}
                        onChange={() => setPaymentProvider('mock')}
                        className="text-indigo-600"
                      />
                      <div>
                        <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 block">
                          Instant Demo Simulation (Recommended)
                        </span>
                        <span className="text-[11px] text-zinc-500">
                          Generates valid transaction ID & updates stock with zero charge.
                        </span>
                      </div>
                    </div>
                    <Badge variant="ai">Fast Test</Badge>
                  </label>

                  <label
                    onClick={() => setPaymentProvider('cod')}
                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentProvider === 'cod'
                        ? 'border-indigo-600 bg-indigo-50/30 dark:bg-indigo-950/20 shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked={paymentProvider === 'cod'}
                        onChange={() => setPaymentProvider('cod')}
                        className="text-indigo-600"
                      />
                      <div>
                        <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 block">
                          Cash on Delivery (COD)
                        </span>
                        <span className="text-[11px] text-zinc-500">
                          Pay upon parcel delivery at your doorstep in {currentCountry.name}.
                        </span>
                      </div>
                    </div>
                  </label>

                  <label
                    onClick={() => setPaymentProvider('stripe')}
                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentProvider === 'stripe'
                        ? 'border-indigo-600 bg-indigo-50/30 dark:bg-indigo-950/20 shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked={paymentProvider === 'stripe'}
                        onChange={() => setPaymentProvider('stripe')}
                        className="text-indigo-600"
                      />
                      <div>
                        <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 block">
                          Stripe Sandbox Card Payment
                        </span>
                        <span className="text-[11px] text-zinc-500">
                          Standard mock credit/debit test authorization.
                        </span>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setStep(1)}
                    className="w-1/3 rounded-2xl"
                  >
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => checkoutMutation.mutate()}
                    isLoading={checkoutMutation.isPending}
                    className="w-2/3 gap-2 rounded-2xl shadow-md"
                  >
                    Authorize & Complete Order
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right Summary Sidebar */}
          <div className="lg:col-span-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-6 shadow-sm">
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Review Cart ({items.length} items)
            </h3>

            {/* Items mini list */}
            <div className="max-h-60 overflow-y-auto space-y-3 divide-y divide-zinc-100 dark:divide-zinc-800">
              {items.map((item) => (
                <div key={item.id} className="pt-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 truncate max-w-[200px]">
                    <span className="font-bold text-zinc-400">{item.quantity}x</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {item.product?.name || 'Item'}
                    </span>
                  </div>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {formatPrice((item.product?.price ? parseFloat(String(item.product.price)) : 0) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Code Input */}
            <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Discount Coupon
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter coupon code..."
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="text-xs uppercase font-mono"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => verifyCouponMutation.mutate(couponCode)}
                  isLoading={verifyCouponMutation.isPending}
                  disabled={!couponCode}
                  className="text-xs shrink-0"
                >
                  Apply
                </Button>
              </div>
              {appliedCoupon && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                  <Tag className="h-3.5 w-3.5" /> Coupon &apos;{appliedCoupon.code}&apos; applied (-{appliedCoupon.discount_value}{appliedCoupon.discount_type === 'percentage' ? '%' : ''})
                </div>
              )}
              {couponError && (
                <p className="text-xs text-rose-500 font-medium">{couponError}</p>
              )}
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-2 text-xs border-t border-zinc-100 dark:border-zinc-800 pt-4">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Regional Shipping</span>
                <span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Estimated Tax (5%)</span>
                <span>{formatPrice(estimatedTax)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-zinc-900 dark:text-zinc-100 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <span>Total Due</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutContent />
    </ProtectedRoute>
  );
}
