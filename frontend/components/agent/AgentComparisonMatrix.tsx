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
    <div className="space-y-6 bg-white/95 dark:bg-gray-900/95 p-5 sm:p-7 rounded-3xl border border-gray-200/80 dark:border-gray-800/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-xl">
      {/* Header & Badges */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-[11px] font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400">
              Side-by-Side Intelligence Matrix
            </span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
        <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">AI Multi-Product Analysis</h3>
        {ai_summary && (
          <div className="text-xs text-blue-950 dark:text-blue-200 leading-relaxed bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-purple-950/40 p-4 rounded-2xl border border-blue-200/80 dark:border-blue-800/60 shadow-inner">
            <span className="font-bold mr-1 text-blue-600 dark:text-blue-400">✨ AI Verdict:</span>
            {ai_summary}
          </div>
        )}
      </div>

      {/* Comparison Grid */}
      <div className="overflow-x-auto pb-3 rounded-2xl border border-gray-100 dark:border-gray-800/80">
        <div className="grid" style={{ gridTemplateColumns: `160px repeat(${products.length}, minmax(220px, 1fr))` }}>
          {/* Header Row: Products */}
          <div className="p-4 font-bold text-xs text-gray-400 border-b border-gray-200 dark:border-gray-800 flex items-end pb-4 bg-gray-50/50 dark:bg-gray-900/50">
            Specification
          </div>
          {products.map((p, idx) => {
            const isBestOverall = idx === best_overall_index;
            const isBestValue = idx === best_value_index;
            const isBestDelivery = idx === best_delivery_index;

            return (
              <div
                key={p.id || idx}
                className={`p-4 border-b border-gray-200 dark:border-gray-800 space-y-2.5 relative transition-all ${
                  isBestOverall
                    ? "bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent border-t-2 border-t-amber-500 dark:border-t-amber-400 shadow-[inset_0_1px_12px_rgba(245,158,11,0.08)]"
                    : "bg-white/40 dark:bg-gray-900/40"
                }`}
              >
                {/* AI Winner Badge */}
                {isBestOverall && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-sm tracking-wide">
                    <Award className="w-3.5 h-3.5" /> Best Overall
                  </span>
                )}
                {isBestValue && !isBestOverall && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-sm tracking-wide">
                    <DollarSign className="w-3.5 h-3.5" /> Best Value
                  </span>
                )}
                {isBestDelivery && !isBestOverall && !isBestValue && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-gradient-to-r from-blue-600 to-indigo-500 text-white shadow-sm tracking-wide">
                    <Zap className="w-3.5 h-3.5" /> Fastest Delivery
                  </span>
                )}

                <h4 className="text-xs font-black line-clamp-2 text-gray-900 dark:text-white leading-snug">
                  {p.product_name}
                </h4>
                <div className="text-base font-black text-blue-600 dark:text-blue-400 tracking-tight">
                  {p.currency} {p.price.toLocaleString()}
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => onAddToCart(p)}
                    className="flex-1 py-2 px-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-[11px] font-black rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                  </button>
                  <a
                    href={p.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-colors flex items-center justify-center"
                    title="View Source"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}

          {/* Matrix Rows */}
          {matrix &&
            matrix.map((row, rIdx) => (
              <React.Fragment key={rIdx}>
                <div className="p-3.5 text-xs font-bold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800/60 bg-gray-50/70 dark:bg-gray-800/30 flex items-center">
                  {row.feature}
                </div>
                {products.map((p, pIdx) => {
                  const pid = p.id || String(pIdx);
                  const val = row.values[pid] || "-";
                  const isBestCol = pIdx === best_overall_index;
                  return (
                    <div
                      key={pIdx}
                      className={`p-3.5 text-xs font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800/60 flex items-center ${
                        isBestCol ? "bg-amber-500/5 dark:bg-amber-500/5 font-bold" : ""
                      }`}
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
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400 block">
          AI Pros & Cons Summary
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((p, idx) => {
            const isBest = idx === best_overall_index;
            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all ${
                  isBest
                    ? "bg-gradient-to-br from-amber-500/10 to-transparent border-amber-300 dark:border-amber-800/60 shadow-sm"
                    : "bg-gray-50/80 dark:bg-gray-800/40 border-gray-200/80 dark:border-gray-800"
                } space-y-2.5`}
              >
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-black text-gray-900 dark:text-white line-clamp-1">{p.product_name}</h5>
                  {isBest && (
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-400/30">
                      ★ Top Pick
                    </span>
                  )}
                </div>
                {p.pros && p.pros.length > 0 && (
                  <div className="space-y-1.5">
                    {p.pros.map((pro, pIdx) => (
                      <div key={pIdx} className="flex items-start gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 leading-tight">
                        <CheckCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        <span>{pro}</span>
                      </div>
                    ))}
                  </div>
                )}
                {p.cons && p.cons.length > 0 && (
                  <div className="space-y-1.5">
                    {p.cons.map((con, cIdx) => (
                      <div key={cIdx} className="flex items-start gap-1.5 text-[11px] text-amber-700 dark:text-amber-400 leading-tight">
                        <XCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        <span>{con}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
