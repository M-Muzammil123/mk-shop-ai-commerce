'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '@/lib/api/cart';
import { aiApi } from '@/lib/api/ai';
import { useAuthStore } from '@/store/auth-store';
import { useCountryStore } from '@/store/country-store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

function CartContent() {
  const { token } = useAuthStore();
  const { formatPrice, currentCountry } = useCountryStore();
  const queryClient = useQueryClient();

  const [targetBudget, setTargetBudget] = useState<number | undefined>(undefined);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);

  // Fetch real cart
  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.getCart,
    enabled: !!token,
  });

  const updateMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      cartApi.updateCartItem(productId, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const removeMutation = useMutation({
    mutationFn: (productId: string) => cartApi.removeCartItem(productId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const clearMutation = useMutation({
    mutationFn: cartApi.clearCart,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  // AI Cart Assistant Mutation
  const cartAssistantMutation = useMutation({
    mutationFn: () => aiApi.getCartAssistant(undefined, targetBudget),
  });

  if (!token) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <ShoppingBag className="h-16 w-16 text-zinc-300 mx-auto" />
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Sign In to Access Your Cart
        </h1>
        <p className="text-sm text-zinc-500 max-w-sm mx-auto">
          Your shopping cart is securely attached to your account for cross-device synchronization.
        </p>
        <Link href="/auth/login">
          <Button variant="primary" size="lg" className="rounded-2xl">
            Sign In to Continue
          </Button>
        </Link>
      </div>
    );
  }

  const items = cart?.items || [];
  const subtotal = typeof cart?.subtotal === 'string' ? parseFloat(cart.subtotal) : (cart?.subtotal || 0);
  const shipping = subtotal > 10000 || subtotal === 0 ? 0 : 250;
  const estimatedTax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + estimatedTax;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Review your selected items and configure delivery before checkout.
          </p>
        </div>

        {items.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => clearMutation.mutate()}
            isLoading={clearMutation.isPending}
            className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
          >
            Clear Cart
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 space-y-4">
          <ShoppingBag className="h-12 w-12 text-zinc-300 mx-auto" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Your cart is empty
          </h2>
          <p className="text-sm text-zinc-500 max-w-sm mx-auto">
            Discover great items in our catalog or ask our AI Shopping Copilot for personalized recommendations.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link href="/shop">
              <Button variant="outline" size="sm">
                Browse Shop
              </Button>
            </Link>
            <Link href="/ai">
              <Button variant="ai" size="sm" className="gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> AI Shopping Copilot
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => {
              const itemPrice = item.product?.price
                ? typeof item.product.price === 'string'
                  ? parseFloat(item.product.price)
                  : item.product.price
                : 0;

              return (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    {item.product?.images?.[0] ? (
                      <img
                        src={item.product.images[0].image_url}
                        alt={item.product.name}
                        className="h-20 w-20 object-cover rounded-2xl border border-zinc-200 dark:border-zinc-800 shrink-0"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-400">
                        <ShoppingBag className="h-8 w-8" />
                      </div>
                    )}

                    <div className="space-y-1">
                      <Link href={`/products/${item.product?.slug || ''}`}>
                        <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-2">
                          {item.product?.name || 'Product'}
                        </h3>
                      </Link>
                      <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        {formatPrice(itemPrice)} each
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-zinc-100 dark:border-zinc-800">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
                      <button
                        onClick={() => {
                          if (item.quantity > 1) {
                            updateMutation.mutate({
                              productId: item.product_id,
                              quantity: item.quantity - 1,
                            });
                          } else {
                            removeMutation.mutate(item.product_id);
                          }
                        }}
                        className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateMutation.mutate({
                            productId: item.product_id,
                            quantity: item.quantity + 1,
                          })
                        }
                        className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Line Total */}
                    <span className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 min-w-[80px] text-right">
                      {formatPrice(itemPrice * item.quantity)}
                    </span>

                    {/* Delete button */}
                    <button
                      onClick={() => removeMutation.mutate(item.product_id)}
                      className="p-2 text-zinc-400 hover:text-rose-500 rounded-lg transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* AI Cart Assistant Accordion Box */}
            <div className="rounded-3xl border border-indigo-100 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600 animate-pulse" />
                  <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                    AI Cart Assistant & Budget Optimizer
                  </h4>
                </div>
                <button
                  onClick={() => setAiAssistantOpen(!aiAssistantOpen)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  {aiAssistantOpen ? 'Hide' : 'Optimize Budget'}
                </button>
              </div>

              {aiAssistantOpen && (
                <div className="space-y-3 pt-2">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Let AI analyze your cart to recommend bundle savings or keep you under a strict budget cap.
                  </p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Target budget (e.g. 50000) or goal..."
                      value={targetBudget ?? ''}
                      onChange={(e) =>
                        setTargetBudget(e.target.value ? parseFloat(e.target.value) : undefined)
                      }
                      className="text-xs"
                    />
                    <Button
                      variant="ai"
                      size="sm"
                      onClick={() => cartAssistantMutation.mutate()}
                      isLoading={cartAssistantMutation.isPending}
                      className="text-xs shrink-0"
                    >
                      Analyze
                    </Button>
                  </div>

                  {cartAssistantMutation.data && (
                    <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-indigo-200 dark:border-indigo-800 text-xs space-y-2 mt-2">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {cartAssistantMutation.data.message}
                      </p>
                      {cartAssistantMutation.data.recommendations?.length > 0 && (
                        <div className="space-y-1">
                          <span className="font-bold text-[11px] text-zinc-500">Suggestions:</span>
                          {cartAssistantMutation.data.recommendations.map((rec, i) => (
                            <p key={i} className="text-zinc-600 dark:text-zinc-300">
                              • {rec.name} ({formatPrice(rec.price)}): {rec.reason}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Checkout Card */}
          <div className="lg:col-span-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-5 shadow-sm">
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Order Summary
            </h3>

            <div className="space-y-3 text-xs border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Subtotal ({cart?.total_items || 0} items)</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Estimated Shipping ({currentCountry.name})</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                </span>
              </div>

              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Estimated Regional Tax (5%)</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {formatPrice(estimatedTax)}
                </span>
              </div>
            </div>

            <div className="flex justify-between text-sm items-baseline">
              <span className="font-bold text-zinc-900 dark:text-zinc-100">Total</span>
              <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                {formatPrice(total)}
              </span>
            </div>

            <div className="pt-2 space-y-3">
              <Link href="/checkout" className="block w-full">
                <Button variant="primary" size="lg" className="w-full gap-2 rounded-2xl shadow-md">
                  Proceed to Checkout <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/shop" className="block w-full text-center">
                <span className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  Continue Shopping
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CartPage() {
  return (
    <ProtectedRoute>
      <CartContent />
    </ProtectedRoute>
  );
}
