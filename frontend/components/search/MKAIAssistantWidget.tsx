"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Bot,
  Mic,
  ArrowRight,
  X,
  Search,
  Zap,
  BarChart2,
  TrendingUp,
  ShieldCheck,
  Compass,
  Cpu,
} from "lucide-react";

export function MKAIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"trending" | "deals" | "compare">("trending");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/shop?mode=ai&q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setQuery("");
    }
  };

  const categoryPrompts = {
    trending: [
      {
        title: "Gaming Laptops",
        desc: "Under $1,200 with RTX graphics",
        query: "Find high-performance gaming laptops with RTX under $1200",
        icon: Zap,
        badge: "Hot",
        badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      },
      {
        title: "Noise-Cancelling Audio",
        desc: "Sony vs Bose vs Apple AirPods",
        query: "Best active noise cancelling headphones under $250",
        icon: Sparkles,
        badge: "Top Rated",
        badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      },
    ],
    deals: [
      {
        title: "Clearance & Mega Deals",
        desc: "Discounts up to 40% verified",
        query: "Show best discounts and deals with highest customer ratings",
        icon: TrendingUp,
        badge: "Save Big",
        badgeColor: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      },
      {
        title: "Home Office Tech",
        desc: "Ergonomic & 4K monitor setup",
        query: "Home office tech upgrades and 4K monitors under $400",
        icon: Cpu,
        badge: "Popular",
        badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      },
    ],
    compare: [
      {
        title: "Flagship Smartphones",
        desc: "iPhone 16 Pro vs Galaxy S24 Ultra",
        query: "Compare iPhone 16 Pro vs Samsung Galaxy S24 Ultra camera and battery",
        icon: BarChart2,
        badge: "Vs Matrix",
        badgeColor: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      },
      {
        title: "Smartwatches & Wearables",
        desc: "Apple Watch Ultra vs Garmin",
        query: "Compare Apple Watch vs Garmin for fitness tracking and battery",
        icon: Compass,
        badge: "Specs",
        badgeColor: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
      },
    ],
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="w-[360px] sm:w-[380px] rounded-[32px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl border border-slate-200/90 dark:border-slate-800 shadow-[0_25px_60px_rgba(0,0,0,0.25)] overflow-hidden"
          >
            {/* ── Top Header with Holographic Glow ── */}
            <div className="relative p-5 pb-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-blue-600/5 via-indigo-600/5 to-purple-600/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                    <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      MK AI Shopping Agent
                      <span className="px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[9px] font-extrabold uppercase">
                        2.5 Live
                      </span>
                    </h4>
                    <p className="text-[11px] text-emerald-500 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Zero Hallucination • Verified Specs
                    </p>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* ── Search Input ── */}
            <div className="p-4 space-y-3.5">
              <form onSubmit={handleSearch} className="relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask for specs, budgets, or models..."
                  className="w-full pl-10 pr-12 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-slate-900 dark:text-white placeholder-slate-400 transition-all shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!query.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white disabled:opacity-40 transition-all shadow-sm hover:scale-105 active:scale-95"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* ── Mode Navigation Tabs ── */}
              <div className="flex bg-slate-100/90 dark:bg-slate-800/90 p-1 rounded-2xl text-[11px] font-bold">
                <button
                  onClick={() => setActiveCategory("trending")}
                  className={`flex-1 py-1.5 rounded-xl transition-all ${
                    activeCategory === "trending"
                      ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  Trending
                </button>
                <button
                  onClick={() => setActiveCategory("deals")}
                  className={`flex-1 py-1.5 rounded-xl transition-all ${
                    activeCategory === "deals"
                      ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  Top Deals
                </button>
                <button
                  onClick={() => setActiveCategory("compare")}
                  className={`flex-1 py-1.5 rounded-xl transition-all ${
                    activeCategory === "compare"
                      ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  Compare
                </button>
              </div>

              {/* ── Dazzling Quick Cards ── */}
              <div className="space-y-2">
                {categoryPrompts[activeCategory].map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.01, x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        router.push(
                          `/shop?mode=ai&q=${encodeURIComponent(action.query)}`
                        );
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 hover:bg-blue-50/80 dark:hover:bg-blue-950/40 border border-slate-200/60 dark:border-slate-700/60 text-left transition-all group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                            {action.title}
                          </p>
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${action.badgeColor}`}
                          >
                            {action.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                          {action.desc}
                        </p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* ── Quick Action Command Buttons ── */}
            <div className="p-4 pt-1 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    router.push("/shop?mode=ai");
                    setIsOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                >
                  <Bot className="w-4 h-4" />
                  <span>Full Chat Deck</span>
                </button>
                <button
                  onClick={() => {
                    router.push("/shop?mode=voice");
                    setIsOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  <Mic className="w-4 h-4 animate-pulse" />
                  <span>Voice Shopping</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating Holographic Trigger Button ── */}
      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3 py-3.5 px-5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-[0_12px_35px_rgba(59,130,246,0.35)] hover:shadow-[0_16px_45px_rgba(99,102,241,0.5)] border border-white/20 transition-all duration-300"
        >
          {/* Subtle Rotating Shimmer Aura */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 opacity-0 group-hover:opacity-30 blur-md transition-opacity" />

          <div className="relative">
            <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-indigo-600" />
          </div>
          <span className="text-xs font-black tracking-wide">AI Assistant</span>
        </motion.button>
      )}
    </div>
  );
}

