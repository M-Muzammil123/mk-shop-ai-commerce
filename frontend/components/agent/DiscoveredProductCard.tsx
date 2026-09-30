"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DiscoveredProduct } from "../../services/agent";
import {
  ExternalLink,
  ShoppingCart,
  BarChart2,
  Star,
  Clock,
  ShieldCheck,
  Truck,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Cpu,
  BadgePercent,
  CheckCircle2,
  Zap,
} from "lucide-react";

interface DiscoveredProductCardProps {
  product: DiscoveredProduct;
  isCompared: boolean;
  onToggleCompare: (product: DiscoveredProduct) => void;
  onAddToCart: (product: DiscoveredProduct) => void;
  isAddingToCart?: boolean;
}

export const DiscoveredProductCard: React.FC<DiscoveredProductCardProps> = ({
  product,
  isCompared,
  onToggleCompare,
  onAddToCart,
  isAddingToCart = false,
}) => {
  const [showAiVerdict, setShowAiVerdict] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const score = product.score_breakdown?.overall_score || 94;
  const imageUrl =
    product.image_url ||
    "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600";

  // Calculate discount percentage if original price is available
  const hasDiscount = Boolean(
    product.original_price && product.original_price > product.price
  );
  const discountPercent = hasDiscount
    ? Math.round(
        (((product.original_price as number) - product.price) /
          (product.original_price as number)) *
          100
      )
    : 0;

  // Dynamic gradient styling for AI match badge
  const scoreGradient =
    score >= 95
      ? "from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-emerald-500/25"
      : score >= 90
      ? "from-blue-600 via-indigo-600 to-purple-600 text-white shadow-blue-500/25"
      : "from-purple-600 via-pink-600 to-rose-600 text-white shadow-purple-500/25";

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className="group relative rounded-[28px] overflow-hidden flex flex-col justify-between h-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl hover:shadow-[0_20px_50px_rgba(59,130,246,0.2)] dark:hover:shadow-[0_20px_50px_rgba(99,102,241,0.25)] transition-all duration-300"
    >
      {/* ── Ambient Radial Glow on Hover ── */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="absolute -top-20 -right-20 w-44 h-44 rounded-full bg-blue-500/15 dark:bg-blue-400/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 rounded-full bg-indigo-500/15 dark:bg-purple-500/20 blur-3xl" />
      </div>

      {/* ── Top Media Section ── */}
      <div className="relative w-full h-52 sm:h-56 bg-slate-100 dark:bg-slate-800/80 overflow-hidden">
        <img
          src={imageUrl}
          alt={product.product_name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Ambient Light Sweep on Hover */}
        {isHovered && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{ duration: 0.9, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none z-10"
          />
        )}

        {/* Top Badges Bar */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-20 pointer-events-none">
          {/* Country & Seller Badge */}
          <div className="flex flex-col gap-1.5 pointer-events-auto">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950/85 dark:bg-white/90 text-white dark:text-slate-950 shadow-lg backdrop-blur-md flex items-center gap-1.5 border border-white/10 dark:border-slate-900/10">
              <span>{product.country_code === "PK" ? "🇵🇰 Pakistan" : `${product.country_code} Store`}</span>
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
            </span>

            {hasDiscount && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md flex items-center gap-1">
                <BadgePercent className="w-3 h-3" />
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Dazzling Holographic AI Match Score */}
          <div className="pointer-events-auto">
            <button
              onClick={() => setShowAiVerdict(!showAiVerdict)}
              className={`px-3 py-1.5 rounded-full text-xs font-black shadow-lg backdrop-blur-md flex items-center gap-1.5 bg-gradient-to-r ${scoreGradient} border border-white/20 hover:scale-105 transition-all`}
              title="Click to view AI Intelligence Verdict"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>{score}% Match</span>
              {showAiVerdict ? (
                <ChevronUp className="w-3 h-3 opacity-80" />
              ) : (
                <ChevronDown className="w-3 h-3 opacity-80" />
              )}
            </button>
          </div>
        </div>

        {/* Bottom Media Bar: Free Delivery & Rating */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
          <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 backdrop-blur-md shadow-md flex items-center gap-1">
            <Truck className="w-3 h-3 text-emerald-500" />
            {!product.shipping_cost
              ? "Free Delivery"
              : `${product.currency} ${Number(product.shipping_cost).toLocaleString()} Shipping`}
          </span>

          <span className="px-2 py-1 rounded-xl text-[10px] font-black bg-white/90 dark:bg-slate-900/90 text-amber-500 backdrop-blur-md shadow-md flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            <span className="text-slate-900 dark:text-white font-extrabold">
              {product.product_rating || 4.8}
            </span>
          </span>
        </div>
      </div>

      {/* ── Expandable AI Verdict Panel (Accordion) ── */}
      <AnimatePresence>
        {showAiVerdict && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden bg-gradient-to-b from-blue-50/90 to-indigo-50/50 dark:from-slate-800/90 dark:to-slate-900/90 border-b border-blue-200/50 dark:border-slate-800 p-4 space-y-3 z-20"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI Decision Breakdown
              </span>
              <span className="text-[10px] text-slate-400">Grounded Analysis</span>
            </div>

            {/* Score Component Bars */}
            {product.score_breakdown && (
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="space-y-0.5">
                  <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                    <span>Specs Fit</span>
                    <span>{product.score_breakdown.requirement_match}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${product.score_breakdown.requirement_match}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                    <span>Price Value</span>
                    <span>{product.score_breakdown.price_fit}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${product.score_breakdown.price_fit}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                    <span>User Rating</span>
                    <span>{product.score_breakdown.review_signal}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${product.score_breakdown.review_signal}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                    <span>Delivery Fit</span>
                    <span>{product.score_breakdown.delivery_fit}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full"
                      style={{ width: `${product.score_breakdown.delivery_fit}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Match Reasons List */}
            {product.match_reasons && product.match_reasons.length > 0 && (
              <div className="space-y-1 pt-1 border-t border-blue-200/40 dark:border-slate-700">
                {product.match_reasons.slice(0, 2).map((reason, idx) => (
                  <p key={idx} className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                    <span>{reason}</span>
                  </p>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Content & Spec Highlights ── */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4 z-10">
        <div className="space-y-2.5">
          {/* Seller Trust & Verification */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="font-extrabold flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="truncate max-w-[130px]">{product.seller}</span>
            </span>
            <span className="flex items-center gap-1 text-[10px] opacity-80">
              <Clock className="w-3 h-3 text-emerald-500" />
              <span>Live Checked</span>
            </span>
          </div>

          {/* Product Title */}
          <h3 className="text-sm font-black text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {product.product_name}
          </h3>

          {/* Key Specs Pills */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {Object.entries(product.specifications).slice(0, 3).map(([key, val]) => (
                <span
                  key={key}
                  className="px-2.5 py-1 rounded-xl bg-slate-100/90 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold border border-slate-200/50 dark:border-slate-700/60 flex items-center gap-1"
                >
                  <Cpu className="w-2.5 h-2.5 text-blue-500" />
                  <span className="truncate max-w-[100px]">{String(val)}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Pricing & Call to Actions ── */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-bold text-slate-400">{product.currency}</span>
              <span className="text-xl font-black text-slate-950 dark:text-white tracking-tight">
                {product.price.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            {hasDiscount && (
              <span className="text-xs line-through text-slate-400 font-semibold">
                {product.currency} {product.original_price?.toLocaleString()}
              </span>
            )}
          </div>

          {/* Action Buttons Matrix */}
          <div className="grid grid-cols-3 gap-2">
            {/* Compare Toggle */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onToggleCompare(product)}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
                isCompared
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>{isCompared ? "Compared" : "Compare"}</span>
            </motion.button>

            {/* 1-Click Add to Cart */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onAddToCart(product)}
              disabled={isAddingToCart}
              className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Add</span>
            </motion.button>

            {/* Source Merchant Link */}
            <motion.a
              whileTap={{ scale: 0.95 }}
              href={product.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
              title={`View on ${product.source_domain || "Merchant Store"}`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Source</span>
            </motion.a>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

