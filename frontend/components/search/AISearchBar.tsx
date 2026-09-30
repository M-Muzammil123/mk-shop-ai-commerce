"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  Sparkles,
  MessageSquare,
  Zap,
  Cpu,
  BarChart2,
  Star,
  ArrowRight,
  Mic,
  Compass,
} from "lucide-react";
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
  const [isListening, setIsListening] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/shop?q=${encodeURIComponent(query.trim())}&mode=${activeMode}`);
  };

  const handleVoiceSearch = () => {
    if (typeof window !== "undefined" && !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      router.push("/shop?mode=voice");
      return;
    }

    try {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.continuous = false;
      recognition.interimResults = false;

      setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
        router.push(`/shop?q=${encodeURIComponent(transcript)}&mode=${activeMode}`);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
      router.push("/shop?mode=voice");
    }
  };

  const quickSuggestions = [
    { label: "Gaming laptops", query: "Find a gaming laptop under $1200 with 16GB RAM", icon: Zap },
    { label: "Best camera phones", query: "Best phone under $700 with great camera", icon: Sparkles },
    { label: "Running sneakers", query: "Nike running shoes size 10 under $100", icon: Compass },
    { label: "Home office desk", query: "Complete ergonomic home office setup under $1500", icon: Cpu },
    { label: "Headphones ANC", query: "Top wireless noise cancelling headphones under $200", icon: Star },
  ];

  const modes = [
    { id: "ai", label: "AI Neural Search", icon: Sparkles, color: "text-blue-500" },
    { id: "deep", label: "Deep Spec Scout", icon: Cpu, color: "text-purple-500" },
    { id: "compare", label: "Live Compare", icon: BarChart2, color: "text-indigo-500" },
    { id: "quick", label: "Fast Instant", icon: Zap, color: "text-amber-500" },
    { id: "recs", label: "For You", icon: Star, color: "text-emerald-500" },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* ── Search Mode Tabs ── */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isActive = activeMode === mode.id;
          return (
            <motion.button
              key={mode.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveMode(mode.id as any);
                if (onSelectMode) onSelectMode(mode.id);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                isActive
                  ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-lg shadow-blue-500/10 scale-105"
                  : "bg-slate-100/90 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-blue-400 dark:text-blue-600" : mode.color}`} />
              <span>{mode.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* ── Main Search Input with Ambient Glow & Glassmorphism ── */}
      <div className="relative group">
        {/* Radiant Ambient Blur Ring on Focus */}
        <div
          className={`absolute -inset-1 rounded-[34px] bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 opacity-0 transition-opacity duration-500 blur-lg ${
            isFocused ? "opacity-40" : "group-hover:opacity-20"
          }`}
        />

        <form
          onSubmit={handleSearch}
          className={`relative transition-all duration-300 rounded-[30px] ${
            isFocused
              ? "ring-2 ring-blue-500/80 shadow-2xl scale-[1.008]"
              : "shadow-xl border border-slate-200/80 dark:border-slate-800"
          } bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl overflow-hidden`}
        >
          <div className="flex items-center px-6 py-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600/15 to-indigo-600/15 flex items-center justify-center mr-3 flex-shrink-0">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-pulse" />
            </div>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder='Ask anything... "Gaming laptop under $1200 with 16GB RAM and RTX graphics"'
              className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none text-base sm:text-lg font-semibold"
            />

            <div className="flex items-center gap-2 ml-2 flex-shrink-0">
              {/* Voice Search Button */}
              <button
                type="button"
                onClick={handleVoiceSearch}
                className={`p-2.5 rounded-2xl transition-all ${
                  isListening
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
                title="Search using Voice"
              >
                <Mic className="w-4 h-4" />
              </button>

              {onOpenChat && (
                <button
                  type="button"
                  onClick={onOpenChat}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                  title="Open Conversational Search"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat Deck</span>
                </button>
              )}

              <AnimatedButton
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold flex items-center gap-2 text-sm shadow-lg shadow-blue-500/25 transition-all"
              >
                <Search className="w-4 h-4" />
                <span>AI Search</span>
              </AnimatedButton>
            </div>
          </div>
        </form>
      </div>

      {/* ── Quick Suggestion Cards ── */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mr-1">Trending Prompts:</span>
        {quickSuggestions.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                setQuery(item.query);
                router.push(`/shop?q=${encodeURIComponent(item.query)}&mode=${activeMode}`);
              }}
              className="text-xs px-3.5 py-1.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/50 dark:border-slate-700/50 transition-all font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Icon className="w-3 h-3 text-blue-500 opacity-80" />
              <span>{item.label}</span>
              <ArrowRight className="w-2.5 h-2.5 opacity-50" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

