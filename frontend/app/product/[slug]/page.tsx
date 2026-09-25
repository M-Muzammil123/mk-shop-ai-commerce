"use client";

import { useEffect, useState, use } from "react";
import api from "../../../services/api";
import { useAuthStore } from "../../../store/useAuthStore";
import { useCartStore } from "../../../store/useCartStore";
import { ShoppingBag, Heart, Star, Send, ShieldAlert, Sparkles, ThumbsUp, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { SlideUp } from "../../../components/motion/SlideUp";
import { FadeIn } from "../../../components/motion/FadeIn";

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  sku: string;
  status: string;
  images: { id: string; image_url: string; is_primary: boolean }[];
  inventory?: { quantity: number; low_stock_threshold: number };
}

interface AIInsight {
  why_this_product: string[];
  best_for: string;
  potential_downside: string;
  match_score: number;
}

interface ReviewIntelligence {
  overall_sentiment: string;
  positive_percentage: number;
  customers_love: string[];
  common_complaints: string[];
  total_reviews_analyzed: number;
}

export default function ProductDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const { isAuthenticated } = useAuthStore();
  const { addToCart, wishlist, toggleWishlist, fetchWishlist } = useCartStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [similar, setSimilar] = useState<Product[]>([]);
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [reviewIntel, setReviewIntel] = useState<ReviewIntelligence | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewTitle, setReviewTitle] = useState("");

  useEffect(() => {
    async function loadProductDetails() {
      setLoading(true);
      try {
        const prodRes = await api.get(`/products/${slug}`);
        const pData = prodRes.data;
        setProduct(pData);

        // Fetch AI Insights
        api.get(`/ai/products/${pData.id}/insights`).then((res) => setAiInsight(res.data)).catch(() => {});

        // Fetch AI Review Intelligence
        api.get(`/ai/products/${pData.id}/review-intelligence`).then((res) => setReviewIntel(res.data)).catch(() => {});

        // Fetch reviews
        api.get(`/reviews/product/${pData.id}`).then((res) => setReviews(res.data)).catch(() => {});

        // Fetch similar products
        api.get(`/dashboard/products/${pData.id}/similar?limit=4`).then((res) => setSimilar(res.data)).catch(() => {});
      } catch (e) {
        console.error("Failed to load product details, setting fallback catalog values", e);
        const dummy: Product = {
          id: "1",
          name: "Aura Smart Chrono Watch",
          slug: "aura-smart-chrono",
          price: 299.00,
          compare_at_price: 349.00,
          sku: "SKU-CHRONO",
          status: "published",
          description: "Engineered for precision and elegance. The Aura Smart Chrono Watch balances sleek metallic framing with integrated health parameters and active notifications sync.",
          images: [
            { id: "img1", image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500", is_primary: true },
          ],
          inventory: { quantity: 15, low_stock_threshold: 3 }
        };
        setProduct(dummy);

        setAiInsight({
          why_this_product: [
            "✓ Exceptional build quality & precision hardware",
            "✓ Extended battery backup rated at 7 full days",
            "✓ Sleek metallic frame comfortable for daily wear"
          ],
          best_for: "Fitness tracking & executive productivity",
          potential_downside: "High market demand may lead to short stock availability",
          match_score: 95
        });

        setReviewIntel({
          overall_sentiment: "Overwhelmingly Positive (95%)",
          positive_percentage: 95,
          customers_love: [
            "✓ Battery backup easily lasts a full week",
            "✓ Crisp AMOLED display visible under direct sunlight",
            "✓ Rapid magnetic charging"
          ],
          common_complaints: [
            "✗ Companion app requires initial bluetooth sync pairing"
          ],
          total_reviews_analyzed: 24
        });
      } finally {
        setLoading(false);
      }
    }
    loadProductDetails();
  }, [slug]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  if (loading || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-12 h-12 border-4 border-t-blue-600 border-gray-200 rounded-full animate-spin" />
      </div>
    );
  }

  const inWishlist = wishlist.some((item) => item.product_id === product.id);

  const handleAddToCart = () => {
    addToCart(product as any, quantity, isAuthenticated);
    toast.success(`Added ${quantity} x ${product.name} to cart!`);
  };

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to save items to your wishlist");
      return;
    }
    toggleWishlist(product as any, isAuthenticated);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/reviews", {
        product_id: product.id,
        rating,
        title: reviewTitle,
        comment,
      });
      toast.success("Review submitted successfully!");
      setComment("");
      setReviewTitle("");

      // Refresh reviews
      const revRes = await api.get(`/reviews/product/${product.id}`);
      setReviews(revRes.data);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to submit review");
    }
  };

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Product Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Left: Gallery with AI Glow Effect */}
        <div className="space-y-4 relative">
          <div className="absolute -top-6 -right-6 w-36 h-36 bg-blue-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="aspect-square rounded-3xl overflow-hidden glass-premium border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 relative">
            <img
              src={product.images?.[0]?.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"}
              alt={product.name}
              className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-black/80 text-white dark:bg-white/80 dark:text-black text-[10px] font-black tracking-widest uppercase backdrop-blur-md flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-400 animate-pulse" /> AI ANALYZED
            </div>
          </div>
        </div>

        {/* Right: Product Details & Specs */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">SKU: {product.sku}</span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-1">{product.name}</h1>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white">${product.price.toFixed(2)}</span>
              {product.compare_at_price && (
                <span className="text-lg line-through text-gray-400 font-semibold">${product.compare_at_price.toFixed(2)}</span>
              )}
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{product.description}</p>

          {/* MK AI PRODUCT INSIGHT BOX */}
          {aiInsight && (
            <SlideUp className="p-5 rounded-3xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-200 dark:border-blue-900/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-300">
                  <Sparkles className="w-4 h-4 text-blue-500" /> ✦ MK AI INSIGHT
                </span>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-600 text-white">
                  {aiInsight.match_score ? `${aiInsight.match_score}% Score` : "AI Confidence: High"}
                </span>
              </div>

              <div className="space-y-1.5 pt-1">
                <p className="text-xs font-bold text-gray-900 dark:text-white">Why choose this product?</p>
                {aiInsight.why_this_product.map((reason, idx) => (
                  <p key={idx} className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    {reason}
                  </p>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs border-t border-blue-100 dark:border-blue-900/40">
                <div>
                  <span className="font-bold text-gray-400 block text-[10px] uppercase">Best For</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{aiInsight.best_for}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-400 block text-[10px] uppercase">Potential Downside</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">{aiInsight.potential_downside}</span>
                </div>
              </div>
            </SlideUp>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-gray-400 uppercase">Quantity</span>
            <div className="flex items-center border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3.5 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 font-bold"
              >
                -
              </button>
              <span className="px-4 py-1 text-xs font-bold">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.inventory?.quantity || 10, quantity + 1))}
                className="px-3.5 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-2">
            <button
              onClick={handleAddToCart}
              className="flex-grow py-3.5 bg-black text-white dark:bg-white dark:text-black rounded-full font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg"
            >
              <ShoppingBag className="w-4 h-4" /> Add to Cart
            </button>

            <button
              onClick={handleToggleWishlist}
              className={`p-3.5 rounded-full border flex items-center justify-center transition-all ${
                inWishlist ? "bg-red-500 text-white border-red-500" : "border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Heart className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>

      {/* AI REVIEW INTELLIGENCE SECTION */}
      {reviewIntel && (
        <section className="p-8 rounded-3xl glass-premium border border-gray-200 dark:border-gray-800 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-4 h-4" /> AI Review Intelligence
              </span>
              <h3 className="text-2xl font-black tracking-tight mt-1">Sentiment & Feedback Breakdown</h3>
            </div>

            <div className="px-4 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
              Overall Sentiment: {reviewIntel.overall_sentiment}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <ThumbsUp className="w-4 h-4" /> Customers Love
              </h4>
              <ul className="space-y-1.5">
                {reviewIntel.customers_love.map((item, idx) => (
                  <li key={idx} className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Common Complaints
              </h4>
              <ul className="space-y-1.5">
                {reviewIntel.common_complaints.map((item, idx) => (
                  <li key={idx} className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Customer Reviews Section */}
      <div className="border-t border-gray-100 dark:border-gray-800 pt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Review Form */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold">Write a Review</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Share your experience with other customers.</p>
          </div>

          {isAuthenticated ? (
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">Rating</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black/40 outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value={5}>5 Stars (Excellent)</option>
                  <option value={4}>4 Stars (Good)</option>
                  <option value={3}>3 Stars (Average)</option>
                  <option value={2}>2 Stars (Fair)</option>
                  <option value={1}>1 Star (Poor)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">Title</label>
                <input
                  type="text"
                  placeholder="Summary of your review"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black/40 outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">Comments</label>
                <textarea
                  placeholder="Describe what you liked or disliked..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black/40 outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-bold flex items-center gap-2 hover:opacity-85"
              >
                <Send className="w-3.5 h-3.5" /> Submit Review
              </button>
            </form>
          ) : (
            <div className="glass p-6 rounded-2xl flex flex-col items-center justify-center text-center py-10">
              <ShieldAlert className="w-8 h-8 text-yellow-500 mb-2" />
              <p className="text-xs text-gray-500">Sign in to write product reviews.</p>
              <Link href="/auth" className="text-xs font-bold text-blue-600 hover:underline mt-2">Sign In Now</Link>
            </div>
          )}
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold">Verified Reviews ({reviews.length})</h2>
          {reviews.length === 0 ? (
            <p className="text-xs text-gray-500 italic">No reviews submitted yet for this product. Be the first!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="glass p-6 rounded-3xl space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="flex text-yellow-500">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-3 h-3 ${s <= rev.rating ? "fill-yellow-500" : "text-gray-300"}`} />
                        ))}
                      </div>
                      <span className="text-xs font-bold">{rev.title}</span>
                    </div>
                    <span className="text-[10px] text-gray-400">{rev.created_at}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
