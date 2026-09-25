"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, MessageSquare, Zap, Cpu, BarChart2, Star, ArrowRight } from "lucide-react";
import { AnimatedButton } from "../motion/AnimatedButton";

interface AISearchBarProps {
  initialQuery?: string;
  onOpenChat?: () => void;
  onSelectMode?: (mode: string) => void;
}

export function AISearchBar({ initialQuery = "", onOpenChat, onSelectMode }: AISearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [activeMode, setActiveMode] = useState<"quick" | "ai" | "deep" | "compare" | "recs">("ai");
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/shop?q=${encodeURIComponent(query.trim())}&mode=${activeMode}`);
  };

  const quickSuggestions = [
    { label: "Gaming laptops", query: "Find a gaming laptop under $1200 with 16GB RAM" },
    { label: "Best phones", query: "Best phone under $700 with great camera" },
    { label: "Running shoes", query: "Black Nike running shoes size 10 under $100" },
    { label: "Office setup", query: "Complete home office setup under $1500" },
    { label: "Under $100", query: "Top luxury gadgets under $100" },
    { label: "Trending products", query: "Trending products with highest customer ratings" },
  ];

  const modes = [
    { id: "quick", label: "Quick Search", icon: Zap },
    { id: "ai", label: "AI Search", icon: Sparkles },
    { id: "deep", label: "Deep Search", icon: Cpu },
    { id: "compare", label: "Compare", icon: BarChart2 },
    { id: "recs", label: "For You", icon: Star },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Search Mode Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isActive = activeMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => {
                setActiveMode(mode.id as any);
                if (onSelectMode) onSelectMode(mode.id);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                isActive
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-md"
                  : "bg-gray-100 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-blue-400 dark:text-blue-600" : ""}`} />
              {mode.label}
            </button>
          );
        })}
      </div>

      {/* Main Search Input */}
      <form
        onSubmit={handleSearch}
        className={`relative transition-all duration-300 rounded-3xl ${
          isFocused
            ? "ring-2 ring-blue-500 shadow-2xl scale-[1.01]"
            : "shadow-xl border border-gray-200 dark:border-gray-800"
        } glass-premium bg-white/90 dark:bg-gray-900/90`}
      >
        <div className="flex items-center px-6 py-4">
          <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0 animate-pulse" />
          
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder='Ask for anything... "Find a lightweight laptop under $1200 with 16GB RAM"'
            className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none text-base sm:text-lg font-medium"
          />

          <div className="flex items-center gap-2 ml-2 flex-shrink-0">
            {onOpenChat && (
              <button
                type="button"
                onClick={onOpenChat}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-100 transition-colors"
                title="Open Conversational Search"
              >
                <MessageSquare className="w-4 h-4" /> Chat
              </button>
            )}

            <AnimatedButton
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold flex items-center gap-2 text-sm shadow-md transition-all"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </AnimatedButton>
          </div>
        </div>
      </form>

      {/* Quick Suggestion Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        <span className="text-xs text-gray-400 font-medium mr-1">Quick suggestions:</span>
        {quickSuggestions.map((item, idx) => (
          <button
            key={idx}
            onClick={() => {
              setQuery(item.query);
              router.push(`/shop?q=${encodeURIComponent(item.query)}&mode=${activeMode}`);
            }}
            className="text-xs px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 transition-all font-medium flex items-center gap-1"
          >
            {item.label} <ArrowRight className="w-3 h-3 opacity-60" />
          </button>
        ))}
      </div>
    </div>
  );
}
