"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useCartStore } from "../../store/useCartStore";
import Link from "next/link";
import { Trash2, ShoppingBag, Percent, ArrowRight, Sparkles, RefreshCw, CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import api from "../../services/api";
import { SlideUp } from "../../components/motion/SlideUp";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { isAuthenticated } = useAuthStore();
  const {
    items,
    loading,
    coupon,
    couponError,
    fetchCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    getCartTotals,
  } = useCartStore();

  const [couponCode, setCouponCode] = useState("");
  const [aiAssistantData, setAiAssistantData] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchCart(isAuthenticated);
  }, [isAuthenticated, fetchCart]);

  const handleQtyChange = (productId: string, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;
    updateQuantity(productId, newQty, isAuthenticated);
    toast.success("Quantity updated");
  };

  const handleRemove = (productId: string) => {
    removeFromCart(productId, isAuthenticated);
    toast.success("Item removed from cart");
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    applyCoupon(couponCode.trim());
  };

  const handleRunAiAssistant = async (targetBudget?: number) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to use AI Cart Assistant");
      return;
    }
    setAiLoading(true);
    try {
      const res = await api.post("/ai/cart/assistant", {
        target_budget: targetBudget || 1000,
      });
      if (res.data.success) {
        setAiAssistantData(res.data);
      }
    } catch (err) {
      console.error("AI Cart Assistant error:", err);
      toast.error("AI Cart Assistant was unable to process current items.");
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (coupon) {
      toast.success(`Coupon "${coupon.code}" applied!`);
      setCouponCode("");
    }
  }, [coupon]);

  useEffect(() => {
    if (couponError) {
      toast.error(couponError);
    }
  }, [couponError]);

  const { subtotal, discount, tax, shipping, total } = getCartTotals();

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto text-gray-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Your shopping bag is empty</h1>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            Looks like you haven&apos;t added items yet. Try asking our AI Assistant to build a complete bundle setup!
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={() => handleRunAiAssistant(1500)}
            disabled={aiLoading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-xs font-bold flex items-center justify-center gap-2 mx-auto shadow-lg hover:opacity-90 transition-all"
          >
            <Sparkles className="w-4 h-4" /> Build Home Office Setup under $1500
          </button>
        </div>

        {aiAssistantData && (
          <SlideUp className="p-6 rounded-3xl glass-premium text-left space-y-3 border border-blue-200 dark:border-blue-900 mt-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> AI Bundle Recommendation
            </h4>
            <p className="text-xs text-gray-700 dark:text-gray-300">{aiAssistantData.ai_advice}</p>
            <Link
              href="/shop"
              className="inline-block px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-bold"
            >
              Browse Catalog Bundles
            </Link>
          </SlideUp>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Shopping Bag</h1>
          <p className="text-xs text-gray-500 mt-1">Review your cart items and test AI budget optimization.</p>
        </div>

        <button
          onClick={() => handleRunAiAssistant(total * 0.9)}
          disabled={aiLoading}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-xs flex items-center gap-2 shadow-md hover:opacity-90 transition-all"
        >
          <Sparkles className="w-4 h-4" /> {aiLoading ? "Analyzing Cart..." : "AI Budget Optimizer"}
        </button>
      </div>

      {/* AI Assistant Output Banner */}
      {aiAssistantData && (
        <SlideUp className="p-6 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 border border-indigo-200 dark:border-indigo-900/50 space-y-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
              <Sparkles className="w-4 h-4 text-indigo-500" /> AI Cart Assistant Suggestion
            </span>
            {aiAssistantData.potential_savings > 0 && (
              <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-600 text-white">
                Potential Savings: ${formatPrice(aiAssistantData.potential_savings)}
              </span>
            )}
          </div>

          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-relaxed">{aiAssistantData.ai_advice}</p>

          {aiAssistantData.suggested_changes && aiAssistantData.suggested_changes.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-indigo-100 dark:border-indigo-900/40">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Suggested Action (User Confirmation Required)</h5>
              {aiAssistantData.suggested_changes.map((change: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-white/80 dark:bg-gray-900/80 text-xs">
                  <div>
                    <span className="font-bold text-gray-900 dark:text-white">{change.reason}</span>
                  </div>
                  <button
                    onClick={() => toast.info("Item swap requested! (Requires explicit user confirmation)")}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-xl font-bold text-[10px] hover:bg-blue-700 transition-colors"
                  >
                    Confirm Swap
                  </button>
                </div>
              ))}
            </div>
          )}
        </SlideUp>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="glass p-6 rounded-3xl flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center border border-gray-200/60 dark:border-gray-800"
            >
              {/* Product Thumbnail & Details */}
              <div className="flex gap-4 items-center">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-900 flex-shrink-0">
                  <img
                    src={item.product.images?.[0]?.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"}
                    alt={item.product.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="space-y-1">
                  <Link href={`/product/${item.product.slug}`} className="font-bold text-base hover:text-blue-500 transition-colors line-clamp-1">
                    {item.product.name}
                  </Link>
                  <p className="text-xs font-bold text-gray-400">${formatPrice(item.product.price)} each</p>
                </div>
              </div>

              {/* Quantity Controls & Total */}
              <div className="flex items-center gap-6 w-full sm:w-auto justify-between">
                <div className="flex items-center border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                  <button
                    onClick={() => handleQtyChange(item.product.id, item.quantity, -1)}
                    className="px-3 py-1 text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-xs font-bold">{item.quantity}</span>
                  <button
                    onClick={() => handleQtyChange(item.product.id, item.quantity, 1)}
                    className="px-3 py-1 text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    +
                  </button>
                </div>

                <span className="text-base font-black text-gray-950 dark:text-white">${formatPrice(Number(item.product.price) * item.quantity)}</span>

                <button
                  onClick={() => handleRemove(item.product.id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="flex justify-between pt-4">
            <button
              onClick={() => clearCart()}
              className="text-xs font-bold text-red-500 hover:underline"
            >
              Clear Entire Bag
            </button>
            <Link href="/shop" className="text-xs font-bold text-blue-600 hover:underline">
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-6">
          <div className="glass p-6 rounded-3xl space-y-6 border border-gray-200/60 dark:border-gray-800">
            <h2 className="text-xl font-bold">Order Summary</h2>

            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <label className="text-xs font-bold text-gray-400 block">Promo Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code (e.g. WELCOME10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black/40 focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black text-xs font-bold rounded-xl hover:opacity-85"
                >
                  Apply
                </button>
              </div>
            </form>

            {coupon && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <Percent className="w-4 h-4" /> {coupon.code} Applied
                </span>
                <button onClick={removeCoupon} className="text-red-500 hover:underline text-[10px]">
                  Remove
                </button>
              </div>
            )}

            {/* Price Calculations */}
            <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-900 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="font-bold text-gray-900 dark:text-white">${formatPrice(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount</span>
                  <span>-${formatPrice(discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-500">
                <span>Estimated Tax</span>
                <span className="font-bold text-gray-900 dark:text-white">${formatPrice(tax)}</span>
              </div>

              <div className="flex justify-between text-gray-500">
                <span>Shipping</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {shipping === 0 ? "Free" : `$${formatPrice(shipping)}`}
                </span>
              </div>

              <div className="flex justify-between text-base font-black text-gray-950 dark:text-white pt-3 border-t border-gray-100 dark:border-gray-900">
                <span>Total</span>
                <span>${formatPrice(total)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold flex items-center justify-center gap-2 text-sm shadow-xl transition-all block text-center"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
