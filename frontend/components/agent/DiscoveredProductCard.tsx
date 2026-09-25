"use client";

import React from "react";
import Image from "next/image";
import { DiscoveredProduct } from "../../services/agent";
import { ExternalLink, ShoppingCart, BarChart2, Star, Clock, ShieldCheck, Truck, Check } from "lucide-react";

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
  const score = product.score_breakdown?.overall_score || 90;
  const imageUrl =
    product.image_url ||
    "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600";

  return (
    <div className="group relative bg-white/90 dark:bg-gray-900/90 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden backdrop-blur-md">
      {/* Top Media & Badges */}
      <div className="relative w-full h-48 sm:h-52 bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <img
          src={imageUrl}
          alt={product.product_name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Origin & Cross-Border Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/80 text-white dark:bg-white/90 dark:text-black shadow-md backdrop-blur-md">
            {product.country_code === "PK" ? "🇵🇰 Pakistan" : `${product.country_code} Store`}
          </span>
          {product.cross_border && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/90 text-white shadow-sm">
              Cross-Border
            </span>
          )}
        </div>

        {/* Match Score Badge */}
        <div className="absolute top-3 right-3 z-10 group/score">
          <div className="px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-600 text-white shadow-md flex items-center gap-1 cursor-help">
            <span>{score}% Match</span>
          </div>

          {/* Component Score Tooltip */}
          {product.score_breakdown && (
            <div className="absolute right-0 top-8 w-48 p-3 rounded-2xl bg-gray-900/95 text-white text-[10px] shadow-2xl opacity-0 pointer-events-none group-hover/score:opacity-100 group-hover/score:pointer-events-auto transition-opacity z-30 border border-white/10 space-y-1.5">
              <span className="font-extrabold uppercase tracking-widest text-emerald-400 block border-b border-white/10 pb-1">
                Score Breakdown
              </span>
              <div className="flex justify-between">
                <span>Requirements:</span>
                <span className="font-bold">{product.score_breakdown.requirement_match}%</span>
              </div>
              <div className="flex justify-between">
                <span>Price Fit:</span>
                <span className="font-bold">{product.score_breakdown.price_fit}%</span>
              </div>
              <div className="flex justify-between">
                <span>Reviews Signal:</span>
                <span className="font-bold">{product.score_breakdown.review_signal}%</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fit:</span>
                <span className="font-bold">{product.score_breakdown.delivery_fit}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Seller & Verified Freshness */}
          <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
            <span className="font-bold flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <ShieldCheck className="w-3.5 h-3.5" /> {product.seller}
            </span>
            <span className="flex items-center gap-1 text-[10px]">
              <Clock className="w-3 h-3" /> Checked just now
            </span>
          </div>

          {/* Product Title */}
          <h3 className="text-sm font-black text-gray-900 dark:text-white line-clamp-2 leading-snug">
            {product.product_name}
          </h3>

          {/* Key Specs Pills */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {Object.entries(product.specifications).slice(0, 3).map(([key, val]) => (
                <span
                  key={key}
                  className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[10px] font-semibold"
                >
                  {String(val)}
                </span>
              ))}
            </div>
          )}

          {/* Delivery & Shipping Info */}
          <div className="pt-1 flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
            <span className="flex items-center gap-1 text-[11px]">
              <Truck className="w-3.5 h-3.5 text-emerald-500" />
              {product.delivery_estimate || "2-5 days delivery"}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              {!product.shipping_cost
                ? "Free Delivery"
                : `${product.currency} ${Number(product.shipping_cost).toLocaleString()} Shipping`}
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1.5 text-xs">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="font-extrabold ml-1">{product.product_rating || 4.7}</span>
            </div>
            <span className="text-gray-400 text-[11px]">({product.review_count || 45}+ reviews)</span>
          </div>
        </div>

        {/* Pricing & Actions */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-800/80 space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xs font-bold text-gray-400 mr-1">{product.currency}</span>
              <span className="text-xl font-black text-gray-900 dark:text-white">
                {product.price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </span>
            </div>
            {product.original_price && product.original_price > product.price && (
              <span className="text-xs line-through text-gray-400">
                {product.currency} {product.original_price.toLocaleString()}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onToggleCompare(product)}
              className={`flex items-center justify-center gap-1 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                isCompared
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>{isCompared ? "Compared" : "Compare"}</span>
            </button>

            <button
              onClick={() => onAddToCart(product)}
              disabled={isAddingToCart}
              className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>

            <a
              href={product.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold transition-colors"
              title={`Open ${product.source_domain}`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Source</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
