"use client";

import React from "react";
import { ProductComparisonResult, DiscoveredProduct } from "../../services/agent";
import { Award, DollarSign, Zap, CheckCircle, XCircle, ShoppingCart, ExternalLink } from "lucide-react";

interface AgentComparisonMatrixProps {
  comparison: ProductComparisonResult | null;
  onAddToCart: (product: DiscoveredProduct) => void;
  onClose?: () => void;
}

export const AgentComparisonMatrix: React.FC<AgentComparisonMatrixProps> = ({
  comparison,
  onAddToCart,
  onClose,
}) => {
  if (!comparison || !comparison.products || comparison.products.length === 0) {
    return (
      <div className="p-6 text-center text-gray-400 text-xs font-semibold bg-white/50 dark:bg-gray-900/50 rounded-3xl border border-gray-200 dark:border-gray-800">
        Select 2 or more products to inspect the side-by-side spec comparison matrix.
      </div>
    );
  }

  const { products, matrix, best_overall_index, best_value_index, best_delivery_index, ai_summary } = comparison;

  return (
    <div className="space-y-6 bg-white/95 dark:bg-gray-900/95 p-5 sm:p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl backdrop-blur-xl">
      {/* Header & Badges */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Side-by-Side Intelligence Matrix
          </span>
          {onClose && (
            <button onClick={onClose} className="text-xs text-gray-400 hover:text-gray-900 dark:hover:text-white">
              ✕
            </button>
          )}
        </div>
        <h3 className="text-base font-black text-gray-900 dark:text-white">Product Spec Comparison</h3>
        {ai_summary && (
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed bg-blue-500/10 dark:bg-blue-900/20 p-3 rounded-2xl border border-blue-200 dark:border-blue-900/50">
            {ai_summary}
          </p>
        )}
      </div>

      {/* Comparison Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="grid" style={{ gridTemplateColumns: `160px repeat(${products.length}, minmax(200px, 1fr))` }}>
          {/* Header Row: Products */}
          <div className="p-3 font-bold text-xs text-gray-400 border-b border-gray-200 dark:border-gray-800 flex items-end pb-4">
            Specification
          </div>
          {products.map((p, idx) => {
            const isBestOverall = idx === best_overall_index;
            const isBestValue = idx === best_value_index;
            const isBestDelivery = idx === best_delivery_index;

            return (
              <div
                key={p.id || idx}
                className="p-3 border-b border-gray-200 dark:border-gray-800 space-y-2 relative"
              >
                {/* AI Winner Badge */}
                {isBestOverall && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500 text-white shadow-sm">
                    <Award className="w-3 h-3" /> Best Overall
                  </span>
                )}
                {isBestValue && !isBestOverall && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-600 text-white shadow-sm">
                    <DollarSign className="w-3 h-3" /> Best Value
                  </span>
                )}
                {isBestDelivery && !isBestOverall && !isBestValue && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-600 text-white shadow-sm">
                    <Zap className="w-3 h-3" /> Fastest Delivery
                  </span>
                )}

                <h4 className="text-xs font-black line-clamp-2 text-gray-900 dark:text-white">
                  {p.product_name}
                </h4>
                <div className="text-sm font-black text-blue-600 dark:text-blue-400">
                  {p.currency} {p.price.toLocaleString()}
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => onAddToCart(p)}
                    className="flex-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-xl flex items-center justify-center gap-1 shadow-sm"
                  >
                    <ShoppingCart className="w-3 h-3" /> Add to Cart
                  </button>
                  <a
                    href={p.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 rounded-xl"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}

          {/* Matrix Rows */}
          {matrix &&
            matrix.map((row, rIdx) => (
              <React.Fragment key={rIdx}>
                <div className="p-3 text-xs font-bold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800/60 bg-gray-50/50 dark:bg-gray-800/30 flex items-center">
                  {row.feature}
                </div>
                {products.map((p, pIdx) => {
                  const pid = p.id || String(pIdx);
                  const val = row.values[pid] || "-";
                  return (
                    <div
                      key={pIdx}
                      className="p-3 text-xs font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800/60 flex items-center"
                    >
                      {val}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
        </div>
      </div>

      {/* Pros & Cons Section */}
      <div className="pt-2 space-y-3">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 block">
          AI Pros & Cons Summary
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((p, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 space-y-2">
              <h5 className="text-xs font-black text-gray-900 dark:text-white line-clamp-1">{p.product_name}</h5>
              {p.pros && p.pros.length > 0 && (
                <div className="space-y-1">
                  {p.pros.map((pro, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400">
                      <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>{pro}</span>
                    </div>
                  ))}
                </div>
              )}
              {p.cons && p.cons.length > 0 && (
                <div className="space-y-1">
                  {p.cons.map((con, cIdx) => (
                    <div key={cIdx} className="flex items-start gap-1.5 text-[11px] text-amber-600 dark:text-amber-400">
                      <XCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>{con}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
