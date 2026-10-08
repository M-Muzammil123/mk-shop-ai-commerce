'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/store/auth-store';
import { useCountryStore } from '@/store/country-store';
import { useCompareStore } from '@/store/compare-store';
import { productsApi } from '@/lib/api/products';
import { ordersApi } from '@/lib/api/orders';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Sparkles,
  Search,
  Bot,
  Layers,
  Package,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';

export default function AuthenticatedAppPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { currentCountry, formatPrice } = useCountryStore();
  const { items: compareItems } = useCompareStore();

  const [searchQuery, setSearchQuery] = useState('');

  // 1. Fetch live recommended products from backend
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['app-recommended-products'],
    queryFn: () => productsApi.getProducts({ limit: 6, sort_by: 'rating' }),
  });

  // 2. Fetch live recent orders from backend
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['app-recent-orders'],
    queryFn: ordersApi.getOrders,
  });

  const products = productsData?.products || [];
  const recentOrders = orders.slice(0, 3);

  const aiShortcuts = [
    { label: 'Find the best laptop for coding', query: 'Find the best laptop for programming under $1500' },
    { label: 'Compare flagship smartphones', query: 'Compare top flagship smartphones with high camera ratings' },
    { label: 'Find a budget 4K monitor', query: 'Best budget 4K monitors for productivity' },
    { label: 'Wireless noise-canceling headphones', query: 'Best noise-canceling headphones under $250' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleAskAI = (promptText?: string) => {
    const q = promptText || searchQuery;
    if (q.trim()) {
      router.push(`/ai?q=${encodeURIComponent(q.trim())}`);
    } else {
      router.push('/ai');
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 pb-16">
        {/* Workspace Greeting & Search Banner */}
        <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200/80 dark:border-zinc-800/80 py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-2">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
                  <span>AI Copilot Active for {currentCountry.name} ({currentCountry.currency})</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                  Good to see you again, {user?.first_name || 'Shopper'}.
                </h1>
                <p className="text-sm text-zinc-500 mt-1">
                  What are you shopping for today? Ask your AI copilot to discover, compare, and verify items.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link href="/ai">
                  <Button variant="ai" size="md" className="gap-2 shadow-sm font-bold rounded-xl">
                    <Bot className="h-4 w-4" /> Open AI Workspace
                  </Button>
                </Link>
                <Link href="/shop">
                  <Button variant="outline" size="md" className="gap-2 rounded-xl">
                    <ShoppingBag className="h-4 w-4" /> Browse Catalog
                  </Button>
                </Link>
              </div>
            </div>

            {/* Smart Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="relative max-w-3xl flex items-center shadow-lg shadow-zinc-200/50 dark:shadow-none rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-1.5 focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all"
            >
              <div className="pl-3.5 pr-2 text-zinc-400">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                placeholder="What are you looking for? (e.g. running shoes, OLED laptop, mechanical keyboard)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 h-11 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none px-2"
              />
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ai"
                  size="sm"
                  onClick={() => handleAskAI()}
                  className="rounded-xl font-bold gap-1.5 text-xs h-10 px-4"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Ask AI to Find
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="rounded-xl font-semibold text-xs h-10 px-4"
                >
                  Search
                </Button>
              </div>
            </form>

            {/* AI Shopping Shortcuts */}
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-wider font-bold text-zinc-400 block">
                Popular AI Research Prompts
              </span>
              <div className="flex flex-wrap gap-2">
                {aiShortcuts.map((sc, i) => (
                  <button
                    key={i}
                    onClick={() => handleAskAI(sc.query)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800"
                  >
                    <Bot className="h-3.5 w-3.5 text-indigo-500" />
                    <span>{sc.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Workspace Body */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
          {/* Quick Metrics / Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Active AI Agent */}
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center gap-4 shadow-sm">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-zinc-400 tracking-wider">
                  AI Shopping Agent
                </p>
                <p className="text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                  Ready & Online
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </p>
                <Link
                  href="/ai"
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline inline-flex items-center gap-1 mt-0.5"
                >
                  Start new session <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Saved Comparisons */}
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center gap-4 shadow-sm">
              <div className="h-12 w-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Layers className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-zinc-400 tracking-wider">
                  Compare Tray
                </p>
                <p className="text-base font-extrabold text-zinc-900 dark:text-white">
                  {compareItems.length} Products Selected
                </p>
                <Link
                  href="/compare"
                  className="text-xs text-purple-600 dark:text-purple-400 font-semibold hover:underline inline-flex items-center gap-1 mt-0.5"
                >
                  View comparison table <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Total Orders */}
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center gap-4 shadow-sm">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-zinc-400 tracking-wider">
                  Orders History
                </p>
                <p className="text-base font-extrabold text-zinc-900 dark:text-white">
                  {orders.length} Completed Orders
                </p>
                <Link
                  href="/orders"
                  className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline inline-flex items-center gap-1 mt-0.5"
                >
                  Track all orders <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Orders Section (Only if user has actual orders) */}
          {recentOrders.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                    Recent Orders
                  </h2>
                  <p className="text-xs text-zinc-500">Track shipments and view past receipts</p>
                </div>
                <Link href="/orders">
                  <Button variant="ghost" size="sm" className="text-xs font-semibold gap-1">
                    View All <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {ordersLoading ? (
                  [1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-3"
                    >
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                  ))
                ) : recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        ORD-#{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <Badge
                        variant={
                          order.status === 'delivered'
                            ? 'success'
                            : order.status === 'shipped'
                            ? 'info'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {order.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="text-xs text-zinc-500 space-y-1">
                      <p>
                        Items: <strong>{order.items?.length || 0}</strong>
                      </p>
                      <p>
                        Total:{' '}
                        <strong className="text-zinc-900 dark:text-white font-mono">
                          {formatPrice(order.total_amount)}
                        </strong>
                      </p>
                      <p className="text-[11px] text-zinc-400">
                        Placed on {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <Link href={`/orders/${order.id}`} className="block w-full pt-1">
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        View Tracking
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Products for You */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  Recommended For You
                </h2>
                <p className="text-xs text-zinc-500">
                  Top-rated verified products available in {currentCountry.name}
                </p>
              </div>
              <Link href="/shop">
                <Button variant="ghost" size="sm" className="text-xs font-semibold gap-1">
                  Explore Full Catalog <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            {productsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-80 rounded-2xl" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <p className="text-sm text-zinc-500">No products available at this moment.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
