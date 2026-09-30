"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatedModal } from "../motion/AnimatedModal";
import api from "../../services/api";
import {
  Sparkles,
  Send,
  RefreshCw,
  ArrowRight,
  User,
  Bot,
  Loader2,
  Search,
  ShoppingBag,
  Zap,
  BarChart2,
} from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

interface ConversationalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  match_score: number;
  match_reasons: string[];
  images: { image_url: string }[];
}

export function ConversationalSearchModal({
  isOpen,
  onClose,
}: ConversationalSearchModalProps) {
  const [sessionId] = useState(
    () => "sess-" + Math.random().toString(36).substring(2, 9)
  );
  const [inputMessage, setInputMessage] = useState("");
  const [history, setHistory] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([
    {
      role: "assistant",
      content:
        "👋 Hey! I'm your AI Shopping Advisor. Tell me what you're looking for — I'll search, compare, and find the best deals for you.\n\nTry something like:\n• \"Find me a gaming laptop under $1200\"\n• \"Compare iPhone 15 vs Samsung S24\"\n• \"Best noise-cancelling headphones under $200\"",
    },
  ]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userMsg = inputMessage.trim();
    setInputMessage("");
    setHistory((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await api.post("/ai/conversational-search", {
        session_id: sessionId,
        message: userMsg,
      });

      if (res.data.success) {
        setHistory((prev) => [
          ...prev,
          { role: "assistant", content: res.data.reply },
        ]);
        setProducts(res.data.products || []);
      }
    } catch (err) {
      console.error("Conversational search error:", err);
      setHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I had trouble processing that. Try rephrasing or ask me something else!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      await api.post("/ai/conversational-search", {
        session_id: sessionId,
        message: "reset",
        reset: true,
      });
      setHistory([
        {
          role: "assistant",
          content:
            "🔄 Session cleared! What would you like to search for?",
        },
      ]);
      setProducts([]);
    } catch (err) {
      console.error("Reset error:", err);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "Gaming laptops under $1200",
    "Best phones with great camera",
    "Running shoes under $100",
    "Compare AirPods vs Sony WF",
  ];

  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="max-w-2xl"
    >
      <div className="flex flex-col h-[70vh] max-h-[600px] -mt-2">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                MK AI Shopping Assistant
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase">
                  Live
                </span>
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Search, compare & discover the best products
              </p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-semibold"
          >
            <RefreshCw className="w-3 h-3" /> New Chat
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 min-h-0">
          {history.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-2.5 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`max-w-[80%] px-4 py-3 text-[13px] leading-relaxed whitespace-pre-line ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl rounded-tr-md shadow-md"
                    : "bg-gray-50 dark:bg-gray-800/80 text-gray-800 dark:text-gray-100 rounded-2xl rounded-tl-md border border-gray-100 dark:border-gray-700/60"
                }`}
              >
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5 justify-start">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500/60 to-indigo-600/60 text-white flex items-center justify-center flex-shrink-0 animate-pulse">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl rounded-tl-md bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/60">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Searching products & comparing prices...
                </span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Product Results Strip */}
        {products.length > 0 && (
          <div className="flex-shrink-0 border-t border-slate-100 dark:border-slate-800 pt-3 pb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                {products.length} AI Discovered Matches
              </span>
              <span className="text-[10px] font-bold text-emerald-500">Live Ranked</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {products.map((p) => {
                const img =
                  p.images?.[0]?.image_url ||
                  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300";
                return (
                  <div
                    key={p.id}
                    className="flex-shrink-0 w-52 p-3 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 group flex flex-col justify-between"
                  >
                    <div>
                      {/* Image & Match Badge */}
                      <div className="relative w-full h-24 rounded-xl overflow-hidden mb-2 bg-slate-100 dark:bg-slate-900">
                        <img
                          src={img}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {p.match_score && (
                          <div className="absolute top-1.5 right-1.5">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" />
                              {p.match_score}%
                            </span>
                          </div>
                        )}
                      </div>

                      <Link
                        href={`/product/${p.slug}`}
                        onClick={onClose}
                        className="text-xs font-bold line-clamp-1 text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors block"
                      >
                        {p.name}
                      </Link>

                      {/* Match reasons */}
                      {p.match_reasons && p.match_reasons.length > 0 && (
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate mt-0.5">
                          ✓ {p.match_reasons[0]}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        ${formatPrice(p.price)}
                      </span>
                      <Link
                        href={`/product/${p.slug}`}
                        onClick={onClose}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold flex items-center gap-1 transition-all shadow-sm active:scale-95"
                      >
                        <span>View</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Prompts (shown when no products and short history) */}
        {products.length === 0 && history.length <= 2 && (
          <div className="flex-shrink-0 pt-2 pb-1">
            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputMessage(prompt);
                  }}
                  className="px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-[11px] font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 border border-gray-100 dark:border-gray-700/60 transition-all flex items-center gap-1"
                >
                  <Zap className="w-3 h-3 opacity-50" />
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-800 flex-shrink-0"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me anything — search, compare, or discover..."
              className="w-full pl-9 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/60 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="p-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 transition-all shadow-md active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </AnimatedModal>
  );
}
