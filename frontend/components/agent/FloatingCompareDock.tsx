"use client";

import React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart2, X, Sparkles, ArrowRight, Trash2 } from "lucide-react";
import { DiscoveredProduct } from "../../services/agent";

interface FloatingCompareDockProps {
  products: DiscoveredProduct[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onCompare: () => void;
  isLoading?: boolean;
}

export const FloatingCompareDock: React.FC<FloatingCompareDockProps> = ({
  products,
  onRemove,
  onClear,
  onCompare,
  isLoading = false,
}) => {
  if (products.length === 0) return null;

  const canCompare = products.length >= 2;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 80, opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-4xl"
      >
        <div className="relative p-3 sm:p-4 rounded-3xl bg-slate-900/95 dark:bg-slate-950/95 text-white backdrop-blur-2xl border border-slate-700/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] ring-1 ring-white/10">
          {/* Ambient Top Glow */}
          <div className="absolute -top-1 inset-x-12 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent blur-sm" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            
            {/* Left: Indicator & Thumbnails */}
            <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <div className="flex items-center gap-2 pl-1 pr-2 border-r border-slate-700/60 flex-shrink-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black tracking-tight">Compare Dock</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {products.length}/4
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {canCompare
                      ? "Ready for deep AI spec matrix"
                      : "Select at least 1 more product"}
                  </p>
                </div>
              </div>

              {/* Product Preview Chips */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {products.map((p, idx) => {
                  const pid = p.id || p.product_name;
                  return (
                    <motion.div
                      key={pid || idx}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="relative group flex items-center gap-2 p-1.5 pr-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-slate-600 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-xl bg-slate-700 overflow-hidden flex-shrink-0 relative">
                        {p.image_url ? (
                          <Image
                            src={p.image_url}
                            alt={p.product_name}
                            fill
                            className="object-cover"
                            sizes="32px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-400">
                            MK
                          </div>
                        )}
                      </div>
                      <div className="max-w-[100px] truncate">
                        <p className="text-[11px] font-bold text-slate-200 truncate leading-tight">
                          {p.product_name}
                        </p>
                        <p className="text-[10px] font-semibold text-blue-400 leading-tight">
                          {p.currency} {p.price.toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => onRemove(pid)}
                        className="w-5 h-5 rounded-full bg-slate-700/80 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors ml-0.5"
                        title="Remove from comparison"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-shrink-0">
              <button
                onClick={onClear}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                title="Clear all selected products"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>

              <button
                onClick={onCompare}
                disabled={!canCompare || isLoading}
                className={`px-5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all shadow-lg active:scale-95 ${
                  canCompare && !isLoading
                    ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-blue-500/25 animate-pulse"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isLoading ? "Analyzing Matrix..." : `Compare Now (${products.length})`}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
