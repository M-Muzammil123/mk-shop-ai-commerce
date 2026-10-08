'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import { useCountryStore } from '@/store/country-store';
import { useCompareStore } from '@/store/compare-store';
import { useCartUIStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { cartApi } from '@/lib/api/cart';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RatingStars } from '@/components/ui/RatingStars';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  ShoppingBag,
  Sparkles,
  Layers,
  Check,
} from 'lucide-react';

export function ProductCard({
  product,
}: {
  product: Product;
}) {
  const router = useRouter();
  const { formatPrice } = useCountryStore();
  const { isInCompare, addItem, removeItem } = useCompareStore();
  const { openCart } = useCartUIStore();
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  const [addedAnimation, setAddedAnimation] = useState(false);

  const isCompared = isInCompare(product.id);
  const primaryImage =
    product.images && product.images.length > 0
      ? product.images.find((img) => img.is_primary)?.image_url || product.images[0].image_url
      : null;

  const inStock =
    product.inventory?.quantity !== undefined ? product.inventory.quantity > 0 : true;

  const numPrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const numComparePrice = product.compare_at_price
    ? typeof product.compare_at_price === 'string'
      ? parseFloat(product.compare_at_price)
      : product.compare_at_price
    : null;

  const hasDiscount = numComparePrice && numComparePrice > numPrice;
  const discountPercent = hasDiscount
    ? Math.round(((numComparePrice - numPrice) / numComparePrice) * 100)
    : null;

  const addToCartMutation = useMutation({
    mutationFn: () => cartApi.addToCart(product.id, 1),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      setAddedAnimation(true);
      setTimeout(() => setAddedAnimation(false), 2000);
      openCart();
    },
  });

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCompared) {
      removeItem(product.id);
    } else {
      addItem({
        id: product.id,
        name: product.name,
        price: numPrice,
        image: primaryImage || undefined,
        raw: product,
      });
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) {
      router.push(`/auth/login?next=${encodeURIComponent(`/products/${product.slug}`)}`);
      return;
    }
    addToCartMutation.mutate();
  };

  return (
    <div className="group relative rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      {/* Top Image area */}
      <div className="relative aspect-square w-full overflow-hidden bg-zinc-50 dark:bg-zinc-800/50">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={product.name}
              className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-zinc-300 dark:text-zinc-600">
              <ShoppingBag className="h-12 w-12" />
            </div>
          )}
        </Link>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.is_featured && (
            <Badge variant="ai">
              <Sparkles className="h-3 w-3" /> Featured
            </Badge>
          )}
          {hasDiscount && (
            <Badge variant="success">
              -{discountPercent}% OFF
            </Badge>
          )}
        </div>

        {/* Compare Quick Action */}
        <button
          onClick={handleToggleCompare}
          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all shadow-sm z-10 ${
            isCompared
              ? 'bg-indigo-600 text-white font-semibold ring-2 ring-indigo-400'
              : 'bg-white/90 dark:bg-zinc-900/90 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
          }`}
          title={isCompared ? 'Remove from comparison' : 'Add to comparison'}
        >
          <Layers className="h-4 w-4" />
        </button>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {product.category && (
            <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">
              {product.category.name}
            </span>
          )}

          <Link href={`/products/${product.slug}`}>
            <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Rating and Availability */}
        <div className="flex items-center justify-between text-xs">
          <RatingStars rating={4.8} count={16} size="xs" />
          <span
            className={`font-medium text-[11px] ${
              inStock ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
            }`}
          >
            {inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>

        {/* Price Row */}
        <div className="flex items-baseline gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
          <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            {formatPrice(numPrice)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-zinc-400 line-through">
              {formatPrice(numComparePrice)}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Link href={`/products/${product.slug}`} className="w-full">
            <Button variant="outline" size="sm" className="w-full text-xs gap-1">
              <Sparkles className="h-3 w-3 text-indigo-500" />
              AI Details
            </Button>
          </Link>

          <Button
            variant="primary"
            size="sm"
            onClick={handleAddToCart}
            isLoading={addToCartMutation.isPending}
            disabled={!inStock}
            className={`w-full text-xs gap-1.5 ${
              addedAnimation ? 'bg-emerald-600 dark:bg-emerald-600' : ''
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="h-3.5 w-3.5" /> Added
              </>
            ) : (
              <>
                <ShoppingBag className="h-3.5 w-3.5" /> Add
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
