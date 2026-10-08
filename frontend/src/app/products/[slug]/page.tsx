'use client';

import React, { useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@/lib/api/products';
import { aiApi } from '@/lib/api/ai';
import { reviewsApi } from '@/lib/api/reviews';
import { dashboardApi } from '@/lib/api/dashboard';
import { cartApi } from '@/lib/api/cart';
import { useCountryStore } from '@/store/country-store';
import { useAuthStore } from '@/store/auth-store';
import { useCartUIStore } from '@/store/cart-store';
import { useCompareStore } from '@/store/compare-store';
import { RatingStars } from '@/components/ui/RatingStars';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { ProductCard } from '@/components/product/ProductCard';
import {
  ShoppingBag,
  Sparkles,
  Layers,
  Truck,
  ShieldCheck,
  Check,
  Plus,
  Minus,
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

function ProductDetailsContent() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();

  const { formatPrice, currentCountry } = useCountryStore();
  const { token } = useAuthStore();
  const { openCart } = useCartUIStore();
  const { isInCompare, addItem, removeItem } = useCompareStore();
  const queryClient = useQueryClient();

  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // 1. Fetch Product
  const { data: product, isLoading: productLoading, error: productError } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsApi.getProduct(slug),
    enabled: !!slug,
  });

  const productId = product?.id;

  // 2. Fetch AI Insights
  const { data: aiInsights, isLoading: insightsLoading } = useQuery({
    queryKey: ['product-insights', productId],
    queryFn: () => aiApi.getProductInsights(productId!),
    enabled: !!productId,
  });

  // 3. Fetch AI Review Intelligence
  const { data: reviewIntel, isLoading: intelLoading } = useQuery({
    queryKey: ['review-intel', productId],
    queryFn: () => aiApi.getReviewIntelligence(productId!),
    enabled: !!productId,
  });

  // 4. Fetch Reviews
  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => reviewsApi.getProductReviews(productId!),
    enabled: !!productId,
  });

  // 5. Fetch Similar Products
  const { data: similarProducts = [] } = useQuery({
    queryKey: ['similar-products', productId],
    queryFn: () => dashboardApi.getSimilarProducts(productId!, 4),
    enabled: !!productId,
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: () => cartApi.addToCart(productId!, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      openCart();
    },
  });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: () =>
      reviewsApi.createReview({
        product_id: productId!,
        rating: reviewRating,
        title: reviewTitle || undefined,
        comment: reviewComment || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      setReviewTitle('');
      setReviewComment('');
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 4000);
    },
  });

  if (productLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Product Not Found
        </h2>
        <p className="text-zinc-500">
          The requested product may have been removed or is temporarily unavailable.
        </p>
        <Link href="/shop">
          <Button variant="primary">Return to Shop</Button>
        </Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [];
  const currentImage = images[selectedImageIndex]?.image_url || null;
  const numPrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const inStock =
    product.inventory?.quantity !== undefined ? product.inventory.quantity > 0 : true;
  const isCompared = isInCompare(product.id);

  const handleAddToCart = () => {
    if (!token) {
      router.push(`/auth/login?next=${encodeURIComponent(`/products/${slug}`)}`);
      return;
    }
    addToCartMutation.mutate();
  };

  const handleBuyNow = () => {
    if (!token) {
      router.push(`/auth/login?next=${encodeURIComponent('/checkout')}`);
      return;
    }
    addToCartMutation.mutate(undefined, {
      onSuccess: () => {
        router.push('/checkout');
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* 1. TOP HERO: PRODUCT GALLERY & PURCHASE DETAILS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left: Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 overflow-hidden shadow-sm">
            {currentImage ? (
              <img
                src={currentImage}
                alt={product.name}
                className="h-full w-full object-cover object-center"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-zinc-300">
                <ShoppingBag className="h-20 w-20" />
              </div>
            )}

            {product.is_featured && (
              <div className="absolute top-4 left-4">
                <Badge variant="ai">
                  <Sparkles className="h-3.5 w-3.5" /> Featured Flagship
                </Badge>
              </div>
            )}
          </div>

          {/* Thumbnail list */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`h-20 w-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImageIndex === idx
                      ? 'border-indigo-600 ring-2 ring-indigo-200'
                      : 'border-zinc-200 dark:border-zinc-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.image_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Purchase Details */}
        <div className="space-y-6">
          <div>
            {product.category && (
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2 block">
                {product.category.name}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight">
              {product.name}
            </h1>
            {product.sku && (
              <span className="text-xs text-zinc-400 font-mono mt-1 block">
                SKU: {product.sku}
              </span>
            )}
          </div>

          {/* Rating & Availability */}
          <div className="flex items-center gap-4 text-sm pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <RatingStars rating={4.8} count={reviews.length || 18} size="sm" />
            <span className="text-zinc-300 dark:text-zinc-700">|</span>
            <span
              className={`font-semibold text-xs flex items-center gap-1 ${
                inStock ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
              }`}
            >
              {inStock ? (
                <>
                  <Check className="h-3.5 w-3.5" /> In Stock ({product.inventory?.quantity ?? 'Available'})
                </>
              ) : (
                'Out of Stock'
              )}
            </span>
          </div>

          {/* Price */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                {formatPrice(numPrice)}
              </span>
              {product.compare_at_price && (
                <span className="text-base text-zinc-400 line-through">
                  {formatPrice(product.compare_at_price)}
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500">
              Prices displayed in {currentCountry.name} ({currentCountry.currency}). Standard regional delivery applied.
            </p>
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Quantity and Actions */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Quantity
              </label>
              <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 text-sm font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Compare toggle */}
              <Button
                variant={isCompared ? 'ai' : 'outline'}
                size="md"
                onClick={() => {
                  if (isCompared) {
                    removeItem(product.id);
                  } else {
                    addItem({
                      id: product.id,
                      name: product.name,
                      price: numPrice,
                      image: currentImage || undefined,
                      raw: product,
                    });
                  }
                }}
                className="text-xs gap-1.5"
              >
                <Layers className="h-4 w-4" />
                {isCompared ? 'Compared' : 'Add to Compare'}
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Button
                variant="outline"
                size="lg"
                onClick={handleAddToCart}
                isLoading={addToCartMutation.isPending}
                disabled={!inStock}
                className="w-full gap-2 rounded-2xl"
              >
                <ShoppingBag className="h-4 w-4" />
                Add to Cart
              </Button>

              <Button
                variant="primary"
                size="lg"
                onClick={handleBuyNow}
                disabled={!inStock}
                className="w-full gap-2 rounded-2xl shadow-md"
              >
                Buy Now
              </Button>
            </div>
          </div>

          {/* Shipping and Authenticity Highlights */}
          <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-4 space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/40">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                Standard Shipping to {currentCountry.name}:{' '}
                <strong>{currentCountry.standardDeliveryDays}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-indigo-600 shrink-0" />
              <span>100% Guaranteed Authentic with official manufacturer warranty.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. AI PRODUCT INSIGHTS & REVIEW INTELLIGENCE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t border-zinc-200 dark:border-zinc-800">
        {/* AI Product Insights */}
        <div className="rounded-3xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-950/20 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm">
                <Sparkles className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                AI Product Insights
              </h3>
            </div>

            {aiInsights?.match_score && (
              <Badge variant="ai">
                {aiInsights.match_score}% Quality Score
              </Badge>
            )}
          </div>

          {insightsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : aiInsights ? (
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-200 mb-1.5 flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  Why Buy This Product:
                </h4>
                <ul className="space-y-1 text-zinc-600 dark:text-zinc-400 pl-4 list-disc">
                  {aiInsights.why_this_product.map((reason, i) => (
                    <li key={i}>{reason}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-200 mb-1">
                  Best Suited For:
                </h4>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {aiInsights.best_for}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Potential Considerations:
                </h4>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {aiInsights.potential_downside}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-zinc-400">No AI insights generated yet.</p>
          )}
        </div>

        {/* AI Review Intelligence */}
        <div className="rounded-3xl border border-purple-100 dark:border-purple-900/50 bg-purple-50/30 dark:bg-purple-950/20 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-600 text-white shadow-sm">
                <MessageSquare className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                AI Review Intelligence
              </h3>
            </div>

            {reviewIntel?.overall_sentiment && (
              <Badge variant="success">
                {reviewIntel.overall_sentiment}
              </Badge>
            )}
          </div>

          {intelLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : reviewIntel ? (
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-semibold text-emerald-700 dark:text-emerald-400 mb-1.5 flex items-center gap-1.5">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  What Customers Love:
                </h4>
                <ul className="space-y-1 text-zinc-600 dark:text-zinc-400 pl-4 list-disc">
                  {reviewIntel.customers_love.map((pro, i) => (
                    <li key={i}>{pro}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-rose-700 dark:text-rose-400 mb-1.5 flex items-center gap-1.5">
                  <ThumbsDown className="h-3.5 w-3.5" />
                  Common Complaints:
                </h4>
                <ul className="space-y-1 text-zinc-600 dark:text-zinc-400 pl-4 list-disc">
                  {reviewIntel.common_complaints.map((con, i) => (
                    <li key={i}>{con}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 text-[11px] text-zinc-400">
                Analyzed {reviewIntel.total_reviews_analyzed} customer reviews & ratings.
              </div>
            </div>
          ) : (
            <p className="text-xs text-zinc-400">Analyzing customer sentiment...</p>
          )}
        </div>
      </div>

      {/* 3. REVIEWS & SUBMISSION */}
      <div className="space-y-6 pt-8 border-t border-zinc-200 dark:border-zinc-800">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Customer Reviews ({reviews.length})
        </h3>

        {/* Submit Review Section */}
        {token ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitReviewMutation.mutate();
            }}
            className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4 bg-zinc-50/50 dark:bg-zinc-900/50 max-w-xl"
          >
            <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              Leave a Review
            </h4>

            {reviewSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-700">
                Thank you! Your review has been submitted successfully.
              </div>
            )}

            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-zinc-600">Rating:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`h-5 w-5 ${
                        star <= reviewRating ? 'fill-amber-400' : 'text-zinc-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <Input
              placeholder="Title (e.g. Great performance!)"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
            />

            <textarea
              placeholder="Share your experience with this product..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />

            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={submitReviewMutation.isPending}
            >
              Submit Review
            </Button>
          </form>
        ) : (
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 text-xs text-zinc-600 flex items-center justify-between">
            <span>Sign in to write a verified customer review.</span>
            <Link href="/auth/login">
              <Button variant="outline" size="sm" className="text-xs">
                Sign In
              </Button>
            </Link>
          </div>
        )}

        {/* Existing Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-xs text-zinc-400">
              No written reviews yet. Be the first to review this product!
            </p>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RatingStars rating={rev.rating} size="xs" />
                    {rev.title && (
                      <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                        {rev.title}
                      </span>
                    )}
                  </div>
                  {rev.is_verified_purchase && (
                    <Badge variant="success">Verified Purchase</Badge>
                  )}
                </div>
                {rev.comment && (
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    {rev.comment}
                  </p>
                )}
                <div className="text-[10px] text-zinc-400">
                  {rev.profile?.first_name || 'Customer'} •{' '}
                  {new Date(rev.created_at).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. SIMILAR / RECOMMENDED PRODUCTS */}
      {similarProducts.length > 0 && (
        <div className="space-y-6 pt-8 border-t border-zinc-200 dark:border-zinc-800">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Similar Recommendations
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {similarProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* MOBILE STICKY PURCHASE BAR */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/95 dark:bg-zinc-900/95 border-t border-zinc-200 dark:border-zinc-800 backdrop-blur-md lg:hidden z-30 flex items-center justify-between gap-3 shadow-lg">
        <div>
          <span className="text-xs text-zinc-400 block">Total</span>
          <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            {formatPrice(numPrice * quantity)}
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddToCart}
            isLoading={addToCartMutation.isPending}
            disabled={!inStock}
          >
            Add
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleBuyNow}
            disabled={!inStock}
          >
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Skeleton className="h-96 rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-1/2" />
            </div>
          </div>
        </div>
      }
    >
      <ProductDetailsContent />
    </Suspense>
  );
}
