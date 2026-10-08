'use client';

import React, { useState } from 'react';
import { DiscoveredProduct } from '@/types';
import { useCountryStore } from '@/store/country-store';
import { useCompareStore } from '@/store/compare-store';
import { useCartUIStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { agentApi } from '@/lib/api/agent';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RatingStars } from '@/components/ui/RatingStars';
import { Button } from '@/components/ui/Button';
import {
  ShoppingBag,
  ExternalLink,
  Truck,
  Check,
  Layers,
  Sparkles,
  Store,
} from 'lucide-react';

export function DiscoveredProductCard({
  product,
  sessionId,
}: {
  product: DiscoveredProduct;
  sessionId?: string;
}) {
  const { formatPrice } = useCountryStore();
  const { isInCompare, addItem, removeItem } = useCompareStore();
  const { openCart } = useCartUIStore();
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  const [added, setAdded] = useState(false);

  const isCompared = isInCompare(product.id || product.product_name);

  const addAgentCartMutation = useMutation({
    mutationFn: () =>
      agentApi.addToCart({
        session_id: sessionId,
        product,
        quantity: 1,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
      openCart();
    },
  });

  const handleToggleCompare = () => {
    const id = product.id || product.product_name;
    if (isCompared) {
      removeItem(id);
    } else {
      addItem({
        id,
        name: product.product_name,
        price: product.price,
        image: product.image_url || undefined,
        brand: product.brand || undefined,
        rating: product.product_rating || undefined,
        isExternal: !product.is_internal,
        raw: product,
      });
    }
  };

  const handleAddToCart = () => {
    if (!token) {
      openCart();
      return;
    }
    addAgentCartMutation.mutate();
  };

  const overallScore = product.score_breakdown?.overall_score ?? 88;

  return (
    <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-lg transition-all duration-300 p-4 flex flex-col justify-between space-y-3 relative group">
      {/* Top Header: Score & Seller */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
          <Store className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[140px]">
            {product.seller}
          </span>
          {product.country_code && (
            <span className="px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-mono">
              {product.country_code}
            </span>
          )}
        </div>

        {/* AI Match Score Badge */}
        <div className="flex items-center gap-1 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full text-xs font-bold border border-indigo-200/60 dark:border-indigo-800/40">
          <Sparkles className="h-3 w-3" />
          {overallScore}% Match
        </div>
      </div>

      {/* Image and Title */}
      <div className="flex gap-3">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.product_name}
            className="h-20 w-20 object-cover rounded-xl border border-zinc-200 dark:border-zinc-800 shrink-0 bg-zinc-50 dark:bg-zinc-800"
          />
        ) : (
          <div className="h-20 w-20 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-400">
            <ShoppingBag className="h-7 w-7" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug">
            {product.product_name}
          </h4>

          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {formatPrice(product.price, product.currency)}
            </span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-xs text-zinc-400 line-through">
                {formatPrice(product.original_price, product.currency)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <RatingStars rating={product.product_rating || 4.5} count={product.review_count || 12} size="xs" />
          </div>
        </div>
      </div>

      {/* Match Reasons & Delivery Details */}
      <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-xs">
        {product.delivery_estimate && (
          <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
            <Truck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>Delivery: <strong className="text-zinc-800 dark:text-zinc-200">{product.delivery_estimate}</strong></span>
          </div>
        )}

        {product.match_reasons && product.match_reasons.length > 0 && (
          <p className="text-indigo-700 dark:text-indigo-400 font-medium text-[11px] line-clamp-2">
            ✓ {product.match_reasons[0]}
          </p>
        )}
      </div>

      {/* Score Breakdown Bars if provided */}
      {product.score_breakdown && (
        <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px] text-zinc-500">
          <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/60 p-1 rounded-md">
            <span>Price Fit:</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              {product.score_breakdown.price_fit}%
            </span>
          </div>
          <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/60 p-1 rounded-md">
            <span>Review Signal:</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              {product.score_breakdown.review_signal}%
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
        <Button
          variant={isCompared ? 'ai' : 'outline'}
          size="sm"
          onClick={handleToggleCompare}
          className="w-full text-xs gap-1"
        >
          <Layers className="h-3.5 w-3.5" />
          {isCompared ? 'Compared' : 'Compare'}
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={handleAddToCart}
          isLoading={addAgentCartMutation.isPending}
          className={`w-full text-xs gap-1 ${added ? 'bg-emerald-600' : ''}`}
        >
          {added ? (
            <>
              <Check className="h-3.5 w-3.5" /> Added
            </>
          ) : (
            <>
              <ShoppingBag className="h-3.5 w-3.5" /> Add to Cart
            </>
          )}
        </Button>
      </div>

      {product.source_url && (
        <a
          href={product.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-zinc-400 hover:text-indigo-600 flex items-center justify-center gap-1 mt-0.5"
        >
          <span>View on {product.source_domain || 'Merchant'}</span>
          <ExternalLink className="h-2.5 w-2.5" />
        </a>
      )}
    </div>
  );
}
