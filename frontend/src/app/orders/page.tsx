'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api/orders';
import { useAuthStore } from '@/store/auth-store';
import { useCountryStore } from '@/store/country-store';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Package,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

function OrdersContent() {
  const { user, token } = useAuthStore();
  const { formatPrice } = useCountryStore();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersApi.getOrders,
    enabled: !!token,
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'success';
      case 'processing':
      case 'shipped':
        return 'ai';
      case 'pending':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="pb-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Order History
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {user?.role === 'admin'
              ? 'Administrator Overview: All platform orders'
              : 'Review your past orders, delivery status, and invoices.'}
          </p>
        </div>

        <Link href="/shop">
          <Button variant="outline" size="sm" className="text-xs">
            Continue Shopping
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-3xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 space-y-4">
          <Package className="h-12 w-12 text-zinc-300 mx-auto" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            No orders found
          </h2>
          <p className="text-sm text-zinc-500 max-w-sm mx-auto">
            You haven&apos;t placed any orders yet. Start exploring our catalog to make your first purchase.
          </p>
          <div className="pt-2">
            <Link href="/shop">
              <Button variant="primary" size="md">
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const dateStr = new Date(order.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={order.id}
                className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                    <Badge variant={getStatusBadgeVariant(order.status)}>
                      {order.status.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-zinc-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {dateStr}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-500">
                    {order.items?.length || 1} item{order.items && order.items.length === 1 ? '' : 's'} • Payment via {order.payment?.provider.toUpperCase() || 'MOCK GATEWAY'}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-zinc-100 dark:border-zinc-800">
                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-zinc-400 block">Total Amount</span>
                    <span className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">
                      {formatPrice(order.total_amount)}
                    </span>
                  </div>

                  <Link href={`/orders/${order.id}`}>
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                      View Details <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <OrdersContent />
    </ProtectedRoute>
  );
}
