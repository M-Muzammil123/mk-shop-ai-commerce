'use client';

import React, { useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api/orders';
import { useAuthStore } from '@/store/auth-store';
import { useCountryStore } from '@/store/country-store';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import {
  Package,
  CheckCircle2,
  Truck,
  CreditCard,
  MapPin,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

function OrderDetailsContent() {
  const params = useParams();
  const orderId = params?.id as string;

  const { user, token } = useAuthStore();
  const { formatPrice } = useCountryStore();
  const queryClient = useQueryClient();

  const [adminStatusInput, setAdminStatusInput] = useState('processing');

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersApi.getOrderById(orderId),
    enabled: !!orderId && !!token,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (newStatus: string) => ordersApi.updateOrderStatus(orderId, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  if (!token) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <Package className="h-16 w-16 text-zinc-300 mx-auto" />
        <h1 className="text-2xl font-bold">Sign In to View Order Details</h1>
        <Link href="/auth/login">
          <Button variant="primary">Sign In</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-48 w-full rounded-3xl" />
        <Skeleton className="h-48 w-full rounded-3xl" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Order Not Found</h2>
        <p className="text-xs text-zinc-500">
          We could not find the requested order or access was denied.
        </p>
        <Link href="/orders">
          <Button variant="primary">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  const items = order.items || [];
  const statusSteps = ['pending', 'processing', 'shipped', 'delivered'];
  const currentStepIndex = statusSteps.indexOf(order.status.toLowerCase());

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800 gap-4">
        <div className="space-y-1">
          <Link
            href="/orders"
            className="text-xs text-zinc-400 hover:text-zinc-700 flex items-center gap-1 font-medium mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Orders
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <Badge variant="ai">{order.status.toUpperCase()}</Badge>
          </div>
          <p className="text-xs text-zinc-400">
            Placed on{' '}
            {new Date(order.created_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        {/* Admin status changer if admin */}
        {user?.role === 'admin' && (
          <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/40 p-2.5 rounded-2xl border border-indigo-200 dark:border-indigo-800">
            <label htmlFor="adminStatusSelect" className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">
              Admin Status:
            </label>
            <select
              id="adminStatusSelect"
              value={adminStatusInput}
              onChange={(e) => setAdminStatusInput(e.target.value)}
              className="text-xs p-1 rounded-lg border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-zinc-900"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Button
              variant="primary"
              size="sm"
              onClick={() => updateStatusMutation.mutate(adminStatusInput)}
              isLoading={updateStatusMutation.isPending}
              className="text-xs"
            >
              Update
            </Button>
          </div>
        )}
      </div>

      {/* Tracking Progress Timeline */}
      <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4 shadow-xs">
        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Truck className="h-4 w-4 text-indigo-600" />
          Fulfillment Timeline
        </h3>

        <div className="grid grid-cols-4 gap-2 pt-2">
          {statusSteps.map((stepName, idx) => {
            const isPassed = currentStepIndex >= idx;
            const isCurrent = currentStepIndex === idx;

            return (
              <div key={stepName} className="flex flex-col items-center text-center space-y-2">
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isPassed
                      ? 'bg-indigo-600 text-white shadow-sm ring-4 ring-indigo-100 dark:ring-indigo-950/60'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {isPassed ? <CheckCircle2 className="h-5 w-5" /> : idx + 1}
                </div>
                <span
                  className={`text-xs capitalize font-medium ${
                    isCurrent ? 'font-bold text-zinc-900 dark:text-zinc-100' : 'text-zinc-500'
                  }`}
                >
                  {stepName}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Two Columns: Items + Order Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Items List */}
        <div className="lg:col-span-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-5 shadow-xs">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
            Ordered Items ({items.length})
          </h3>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {items.map((item) => (
              <div key={item.id} className="py-3.5 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                    {item.product?.name || `Product ID: ${item.product_id?.slice(0, 8) || 'Catalog'}`}
                  </span>
                  <span className="text-zinc-500">
                    Quantity: <strong>{item.quantity}</strong> @ {formatPrice(item.price)}
                  </span>
                </div>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                  {formatPrice(parseFloat(String(item.price)) * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2 text-xs">
            <div className="flex justify-between text-zinc-500">
              <span>Subtotal</span>
              <span>{formatPrice(order.total_amount)}</span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span>Shipping</span>
              <span>{formatPrice(order.shipping_amount)}</span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span>Tax</span>
              <span>{formatPrice(order.tax_amount)}</span>
            </div>
            {parseFloat(String(order.discount_amount)) > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount</span>
                <span>-{formatPrice(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-extrabold text-zinc-900 dark:text-zinc-100 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <span>Total Paid</span>
              <span>{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-6">
          {/* Shipping Address */}
          <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3 shadow-xs">
            <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> Shipping Address
            </h4>
            {order.shipping_address ? (
              <div className="text-xs text-zinc-700 dark:text-zinc-300 space-y-0.5">
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {order.shipping_address.address_line1} {order.shipping_address.address_line2}
                </p>
                <p>
                  {order.shipping_address.city}, {order.shipping_address.state_province} {order.shipping_address.postal_code}
                </p>
                <p className="font-medium text-zinc-500">{order.shipping_address.country}</p>
              </div>
            ) : (
              <p className="text-xs text-zinc-500">
                Standard Verified Regional Delivery
              </p>
            )}
          </div>

          {/* Payment Details */}
          <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3 shadow-xs">
            <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5" /> Payment Method
            </h4>
            <div className="text-xs text-zinc-700 dark:text-zinc-300 space-y-1">
              <p className="font-semibold text-zinc-900 dark:text-zinc-100 capitalize">
                {order.payment?.provider || 'Mock Sandbox Gateway'}
              </p>
              <p className="text-emerald-600 font-medium">
                Status: {order.payment?.status.toUpperCase() || 'PAID'}
              </p>
              {order.payment?.transaction_id && (
                <p className="font-mono text-[11px] text-zinc-400">
                  Tx: {order.payment.transaction_id}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailsPage() {
  return (
    <ProtectedRoute>
      <Suspense
        fallback={
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        }
      >
        <OrderDetailsContent />
      </Suspense>
    </ProtectedRoute>
  );
}
