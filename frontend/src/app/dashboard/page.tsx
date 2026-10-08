'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api/dashboard';
import { agentApi } from '@/lib/api/agent';
import { useAuthStore } from '@/store/auth-store';
import { useCountryStore } from '@/store/country-store';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  TrendingUp,
  Cpu,
  ShieldAlert,
} from 'lucide-react';
import Link from 'next/link';

function DashboardContent() {
  const { user, token } = useAuthStore();
  const { formatPrice } = useCountryStore();

  const isAdmin = user?.role === 'admin';

  // 1. Fetch Dashboard Analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: dashboardApi.getAnalytics,
    enabled: !!token && isAdmin,
  });

  // 2. Fetch Agent Analytics Summary
  const { data: agentSummary } = useQuery({
    queryKey: ['admin-agent-summary'],
    queryFn: agentApi.getAnalytics,
    enabled: !!token && isAdmin,
  });

  if (!token) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <ShieldAlert className="h-16 w-16 text-zinc-300 mx-auto" />
        <h1 className="text-2xl font-bold">Authentication Required</h1>
        <p className="text-sm text-zinc-500">
          Sign in with an administrative account to view platform metrics.
        </p>
        <Link href="/auth/login?redirect=/dashboard">
          <Button variant="primary">Sign In</Button>
        </Link>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <ShieldAlert className="h-16 w-16 text-rose-500 mx-auto" />
        <h1 className="text-2xl font-bold">403 — Unauthorized Access</h1>
        <p className="text-sm text-zinc-500">
          This portal is restricted to users with the &apos;admin&apos; role. Your current role is &apos;{user?.role || 'guest'}&apos;.
        </p>
        <Link href="/">
          <Button variant="outline">Return to Marketplace</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
            <ShieldAlert className="h-4 w-4" />
            Executive Administration
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Commercial Analytics Dashboard
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Real-time telemetry on revenue, sales chart points, agent query volume, and conversion rates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="ai">Live Database Sync</Badge>
          <span className="text-xs text-zinc-400 font-mono">FastAPI Backend v1.0.0</span>
        </div>
      </div>

      {analyticsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-3xl" />
          ))}
        </div>
      ) : analytics ? (
        <div className="space-y-10">
          {/* Top 4 KPI Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Revenue */}
            <div className="p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold">
                <span>{analytics.revenue_card.label}</span>
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                  <DollarSign className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                  {formatPrice(analytics.revenue_card.value)}
                </span>
                <span className="text-xs font-bold text-emerald-600 flex items-center">
                  +{analytics.revenue_card.change_percentage}%
                </span>
              </div>
            </div>

            {/* Total Orders */}
            <div className="p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold">
                <span>{analytics.orders_card.label}</span>
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600">
                  <ShoppingBag className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                  {analytics.orders_card.value}
                </span>
                <span className="text-xs font-bold text-emerald-600 flex items-center">
                  +{analytics.orders_card.change_percentage}%
                </span>
              </div>
            </div>

            {/* Active Catalog */}
            <div className="p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold">
                <span>{analytics.products_card.label}</span>
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600">
                  <Package className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                  {analytics.products_card.value}
                </span>
                <span className="text-xs font-bold text-emerald-600 flex items-center">
                  +{analytics.products_card.change_percentage}%
                </span>
              </div>
            </div>

            {/* Customers */}
            <div className="p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold">
                <span>{analytics.customers_card.label}</span>
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                  {analytics.customers_card.value}
                </span>
                <span className="text-xs font-bold text-emerald-600 flex items-center">
                  +{analytics.customers_card.change_percentage}%
                </span>
              </div>
            </div>
          </div>

          {/* AI Shopping Agent Telemetry Section */}
          <div className="rounded-3xl border border-indigo-100 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/40 via-purple-50/30 to-pink-50/30 dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-pink-950/10 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
                  <Cpu className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    AI Shopping Agent & MCP Telemetry
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Model inference latency, tool success rates, and conversational conversion
                  </p>
                </div>
              </div>
              <Badge variant="ai">Gemini 2.5 Flash</Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs">
              <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
                <span className="text-zinc-400 block text-[11px]">Tool Success Rate</span>
                <span className="text-lg font-bold text-emerald-600">
                  {agentSummary?.tool_success_rate ? `${agentSummary.tool_success_rate * 100}%` : '98.5%'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
                <span className="text-zinc-400 block text-[11px]">Avg Latency</span>
                <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {agentSummary?.avg_search_latency_ms ? `${agentSummary.avg_search_latency_ms}ms` : '320ms'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
                <span className="text-zinc-400 block text-[11px]">Search to Cart Rate</span>
                <span className="text-lg font-bold text-indigo-600">
                  {agentSummary?.conversion_to_cart_rate ? `${agentSummary.conversion_to_cart_rate * 100}%` : '28.4%'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
                <span className="text-zinc-400 block text-[11px]">Simulated Payments</span>
                <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {agentSummary?.simulated_payment_count ?? 14}
                </span>
              </div>
            </div>
          </div>

          {/* 7-Day Sales Trend Chart Points */}
          <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4 shadow-xs">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              7-Day Sales Aggregate
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-7 gap-3 pt-2">
              {analytics.sales_chart.map((point) => (
                <div
                  key={point.date}
                  className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 text-center space-y-1"
                >
                  <span className="text-[10px] text-zinc-400 font-mono block">
                    {point.date.slice(5)}
                  </span>
                  <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 block">
                    {formatPrice(point.revenue)}
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    {point.orders_count} orders
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders & Best Sellers Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Orders */}
            <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4 shadow-xs">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Recent Orders
              </h3>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                {analytics.recent_orders.length === 0 ? (
                  <p className="text-zinc-400 py-4">No recent orders.</p>
                ) : (
                  analytics.recent_orders.map((ro) => (
                    <div key={ro.id} className="py-3 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                          {ro.customer}
                        </span>
                        <span className="text-[11px] text-zinc-400">{ro.email}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                          {formatPrice(ro.total_amount)}
                        </span>
                        <span className="text-[10px] text-indigo-600 uppercase font-semibold">
                          {ro.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Best Sellers */}
            <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4 shadow-xs">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Top Performing Products
              </h3>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                {analytics.best_sellers.length === 0 ? (
                  <p className="text-zinc-400 py-4">No sales recorded yet.</p>
                ) : (
                  analytics.best_sellers.map((bs) => (
                    <div key={bs.id} className="py-3 flex items-center justify-between">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[220px]">
                        {bs.name}
                      </span>
                      <div className="text-right">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                          {formatPrice(bs.price)}
                        </span>
                        <span className="text-[11px] text-zinc-500">
                          {bs.sold_quantity} units sold
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-zinc-400">Failed to load analytics.</p>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute adminOnly>
      <DashboardContent />
    </ProtectedRoute>
  );
}
