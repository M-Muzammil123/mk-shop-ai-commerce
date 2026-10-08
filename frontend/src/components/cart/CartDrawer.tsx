'use client';

import React from 'react';
import { useCartUIStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { useCountryStore } from '@/store/country-store';
import { cartApi } from '@/lib/api/cart';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function CartDrawer() {
  const { isOpen, closeCart } = useCartUIStore();
  const { token } = useAuthStore();
  const { formatPrice } = useCountryStore();
  const queryClient = useQueryClient();

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

  if (!isOpen) return null;

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Your Shopping Cart
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 font-medium">
                {cart?.total_items || 0}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {!token ? (
              <div className="text-center py-12 space-y-4">
                <ShoppingBag className="h-12 w-12 text-zinc-300 mx-auto" />
                <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                  Sign in to view your cart
                </h3>
                <p className="text-sm text-zinc-500 max-w-xs mx-auto">
                  Log in to access your saved cart items, synced across your devices.
                </p>
                <Link href="/auth/login" onClick={closeCart}>
                  <Button variant="primary" className="mt-2">
                    Sign In
                  </Button>
                </Link>
              </div>
            ) : isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-xl" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <ShoppingBag className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Your cart is empty
                </h3>
                <p className="text-xs text-zinc-500">
                  Discover products with our AI assistant or browse catalog items.
                </p>
                <Link href="/shop" onClick={closeCart}>
                  <Button variant="outline" size="sm" className="mt-2">
                    Explore Shop
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3.5 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-800/40"
                  >
                    {item.product?.images?.[0] ? (
                      <img
                        src={item.product.images[0].image_url}
                        alt={item.product.name}
                        className="h-18 w-18 object-cover rounded-lg shrink-0 border border-zinc-200 dark:border-zinc-700"
                      />
                    ) : (
                      <div className="h-18 w-18 bg-zinc-200 dark:bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
                        <ShoppingBag className="h-6 w-6 text-zinc-400" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {item.product?.name || 'Product'}
                        </h4>
                        <p className="text-xs font-medium text-zinc-900 dark:text-zinc-200 mt-0.5">
                          {formatPrice(item.product?.price || 0)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden bg-white dark:bg-zinc-900">
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
                            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2 text-xs font-medium">{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateMutation.mutate({
                                productId: item.product_id,
                                quantity: item.quantity + 1,
                              })
                            }
                            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeMutation.mutate(item.product_id)}
                          className="text-zinc-400 hover:text-rose-500 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {token && items.length > 0 && (
            <div className="p-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Subtotal</span>
                <span className="font-semibold text-base text-zinc-900 dark:text-zinc-100">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Taxes and shipping calculated at checkout.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link href="/cart" onClick={closeCart} className="w-full">
                  <Button variant="outline" className="w-full text-xs">
                    View Full Cart
                  </Button>
                </Link>
                <Link href="/checkout" onClick={closeCart} className="w-full">
                  <Button variant="primary" className="w-full text-xs gap-1.5">
                    Checkout <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
