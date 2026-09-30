"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  Award,
  DollarSign,
  Zap,
  CheckCircle,
  XCircle,
  ShoppingCart,
  ExternalLink,
  MessageSquare,
  ArrowRight,
  TrendingDown,
  Info,
} from "lucide-react";
import { ProductComparisonResult, DiscoveredProduct } from "../../services/agent";

interface SmartComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  comparison: ProductComparisonResult | null;
  onAddToCart: (product: DiscoveredProduct) => void;
  onAskAgent?: (query: string) => void;
}

export const SmartComparisonModal: React.FC<SmartComparisonModalProps> = ({
  isOpen,
  onClose,
  comparison,
  onAddToCart,
  onAskAgent,
}) => {
  const [activeTab, setActiveTab] = useState<"matrix" | "insights" | "proscons">("matrix");
  const [customQuestion, setCustomQuestion] = useState("");

  if (!isOpen || !comparison || !comparison.products || comparison.products.length === 0) {
    return null;
  }

  const { products, matrix, best_overall_index, best_value_index, best_delivery_index, ai_summary } = comparison;

  // Calculate price differences relative to lowest
  const lowestPrice = Math.min(...products.map((p) => p.price));

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (customQuestion.trim() && onAskAgent) {
      onAskAgent(customQuestion.trim());
      setCustomQuestion("");
      onClose();
    }
  };

  const quickQuestions = [
    `Which product has better battery life and build quality?`,
    `Is the price difference between them worth the upgrade?`,
    `Which one is best for heavy gaming & multitasking?`,
    `Which seller has the most reliable warranty & returns?`,
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-[0_30px_90px_rgba(0,0,0,0.4)] overflow-hidden z-10"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    AI Deep Spec Intelligence Matrix
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    {products.length} Products Compared
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Side-by-side spec differences, component scoring, and AI evaluation
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* AI Summary Banner */}
          {ai_summary && (
            <div className="mx-6 mt-4 p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-purple-950/40 border border-blue-200/80 dark:border-blue-900/60 shadow-inner flex items-start gap-3">
              <div className="p-1.5 rounded-xl bg-blue-600 text-white mt-0.5 flex-shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-black text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                  AI Verdict & Recommendation
                </span>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                  {ai_summary}
                </p>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-100 dark:border-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab("matrix")}
              className={`pb-3 border-b-2 transition-all ${
                activeTab === "matrix"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400 font-black"
                  : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              Side-by-Side Specs Matrix
            </button>
            <button
              onClick={() => setActiveTab("proscons")}
              className={`pb-3 border-b-2 transition-all ${
                activeTab === "proscons"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400 font-black"
                  : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              AI Pros & Cons
            </button>
            <button
              onClick={() => setActiveTab("insights")}
              className={`pb-3 border-b-2 transition-all ${
                activeTab === "insights"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400 font-black"
                  : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              Ask AI About Differences
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === "matrix" && (
              <div className="space-y-6">
                {/* Product Comparison Columns */}
                <div
                  className="grid gap-4 overflow-x-auto pb-2"
                  style={{ gridTemplateColumns: `repeat(${products.length}, minmax(250px, 1fr))` }}
                >
                  {products.map((p, idx) => {
                    const isBestOverall = idx === best_overall_index;
                    const isBestValue = idx === best_value_index;
                    const isBestDelivery = idx === best_delivery_index;
                    const priceDiff = p.price - lowestPrice;
                    const pctDiff = lowestPrice > 0 ? Math.round((priceDiff / lowestPrice) * 100) : 0;

                    return (
                      <div
                        key={p.id || idx}
                        className={`relative flex flex-col justify-between p-5 rounded-3xl border transition-all ${
                          isBestOverall
                            ? "bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent border-amber-400 dark:border-amber-500/80 shadow-[0_10px_30px_rgba(245,158,11,0.15)] ring-1 ring-amber-400/30"
                            : "bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800"
                        }`}
                      >
                        {/* Winner Badges */}
                        <div className="flex items-center gap-1.5 flex-wrap mb-2">
                          {isBestOverall && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-sm">
                              <Award className="w-3.5 h-3.5" /> Best Overall
                            </span>
                          )}
                          {isBestValue && !isBestOverall && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-sm">
                              <DollarSign className="w-3.5 h-3.5" /> Best Value
                            </span>
                          )}
                          {isBestDelivery && !isBestOverall && !isBestValue && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-gradient-to-r from-blue-600 to-indigo-500 text-white shadow-sm">
                              <Zap className="w-3.5 h-3.5" /> Fastest Delivery
                            </span>
                          )}
                          {p.score_breakdown && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                              ★ {Math.round(p.score_breakdown.overall_score * 100)}% Match
                            </span>
                          )}
                        </div>

                        {/* Product Image & Title */}
                        <div className="space-y-3">
                          <div className="w-full h-36 relative rounded-2xl bg-white dark:bg-slate-900 overflow-hidden border border-slate-100 dark:border-slate-800">
                            {p.image_url ? (
                              <Image
                                src={p.image_url}
                                alt={p.product_name}
                                fill
                                className="object-contain p-2"
                                sizes="250px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-black text-slate-300 dark:text-slate-700">
                                NO IMAGE
                              </div>
                            )}
                          </div>

                          <h4 className="text-sm font-black text-slate-900 dark:text-white line-clamp-2 leading-snug">
                            {p.product_name}
                          </h4>

                          <div className="space-y-1">
                            <div className="text-xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
                              {p.currency} {p.price.toLocaleString()}
                            </div>
                            {priceDiff > 0 ? (
                              <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                <span>+{p.currency} {priceDiff.toLocaleString()} (+{pctDiff}%)</span>
                              </div>
                            ) : (
                              <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <TrendingDown className="w-3 h-3" />
                                <span>Lowest Price in Comparison</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Quick Spec Preview */}
                        <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1.5 text-[11px]">
                          <div className="flex justify-between text-slate-600 dark:text-slate-400">
                            <span>Seller:</span>
                            <span className="font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                              {p.seller}
                            </span>
                          </div>
                          {p.delivery_estimate && (
                            <div className="flex justify-between text-slate-600 dark:text-slate-400">
                              <span>Delivery:</span>
                              <span className="font-bold text-slate-900 dark:text-white">
                                {p.delivery_estimate}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex gap-2">
                          <button
                            onClick={() => onAddToCart(p)}
                            className="flex-1 py-2.5 px-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-black rounded-2xl flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                          </button>
                          <a
                            href={p.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-2xl flex items-center justify-center transition-colors"
                            title="Open Source Link"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Spec Features Table */}
                {matrix && matrix.length > 0 && (
                  <div className="rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="p-4 bg-slate-100 dark:bg-slate-800/80 font-black text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Technical Specifications Comparison
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {matrix.map((row, rIdx) => (
                        <div
                          key={rIdx}
                          className="grid items-center hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                          style={{
                            gridTemplateColumns: `180px repeat(${products.length}, minmax(200px, 1fr))`,
                          }}
                        >
                          <div className="p-3.5 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
                            {row.feature}
                          </div>
                          {products.map((p, pIdx) => {
                            const pid = p.id || String(pIdx);
                            const val = row.values[pid] || "-";
                            const isWinnerCol = pIdx === best_overall_index;

                            return (
                              <div
                                key={pIdx}
                                className={`p-3.5 text-xs font-semibold text-slate-800 dark:text-slate-200 ${
                                  isWinnerCol ? "bg-amber-500/5 dark:bg-amber-500/5 font-bold" : ""
                                }`}
                              >
                                {val}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "proscons" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((p, idx) => {
                  const isWinner = idx === best_overall_index;
                  return (
                    <div
                      key={idx}
                      className={`p-5 rounded-3xl border space-y-4 ${
                        isWinner
                          ? "bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border-amber-300 dark:border-amber-800/60"
                          : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white line-clamp-1">
                          {p.product_name}
                        </h4>
                        {isWinner && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white">
                            Top Recommendation
                          </span>
                        )}
                      </div>

                      {p.pros && p.pros.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block">
                            Key Strengths (Pros)
                          </span>
                          {p.pros.map((pro, pIdx) => (
                            <div key={pIdx} className="flex items-start gap-2 text-xs text-emerald-800 dark:text-emerald-300">
                              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-600" />
                              <span>{pro}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {p.cons && p.cons.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400 block">
                            Potential Compromises (Cons)
                          </span>
                          {p.cons.map((con, cIdx) => (
                            <div key={cIdx} className="flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
                              <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
                              <span>{con}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={() => onAddToCart(p)}
                        className="w-full py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" /> Add This Pick to Cart
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === "insights" && (
              <div className="space-y-6 max-w-2xl mx-auto">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white flex items-center justify-center mx-auto shadow-md">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white">
                    Ask AI Specific Questions About This Comparison
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Get an instant AI reasoning breakdown comparing these exact products.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Instant Inquiries
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {quickQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (onAskAgent) {
                            onAskAgent(q);
                            onClose();
                          }
                        }}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-slate-200 dark:border-slate-700/80 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-between group"
                      >
                        <span>{q}</span>
                        <ArrowRight className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleAsk} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    placeholder="Ask anything about these products..."
                    className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  <button
                    type="submit"
                    disabled={!customQuestion.trim()}
                    className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-md active:scale-95"
                  >
                    Ask Agent
                  </button>
                </form>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
