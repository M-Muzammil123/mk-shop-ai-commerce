"use client";

import { useState } from "react";
import { AnimatedModal } from "../motion/AnimatedModal";
import api from "../../services/api";
import { Sparkles, Send, RefreshCw, ShoppingBag, ArrowRight, User, Bot } from "lucide-react";
import Link from "next/link";

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

export function ConversationalSearchModal({ isOpen, onClose }: ConversationalSearchModalProps) {
  const [sessionId] = useState(() => "sess-" + Math.random().toString(36).substring(2, 9));
  const [inputMessage, setInputMessage] = useState("");
  const [history, setHistory] = useState<{ role: "user" | "assistant"; content: string }[]>([
    {
      role: "assistant",
      content: "Hello! I am your AI Shopping Advisor. What are you shopping for today? (e.g., 'Find me a gaming laptop under $1200' or 'Show me black Nike shoes')",
    },
  ]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(false);

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
        setHistory((prev) => [...prev, { role: "assistant", content: res.data.reply }]);
        setProducts(res.data.products || []);
      }
    } catch (err) {
      console.error("Conversational search error:", err);
      setHistory((prev) => [
        ...prev,
        { role: "assistant", content: "I couldn't process that query. Please try again with different keywords." },
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
          content: "Shopping session context cleared. How can I help you find something new?",
        },
      ]);
      setProducts([]);
    } catch (err) {
      console.error("Reset error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedModal isOpen={isOpen} onClose={onClose} title="Conversational AI Shopping Assistant" maxWidth="max-w-3xl">
      <div className="space-y-6">
        {/* Top Controls */}
        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-950/30 p-3 rounded-2xl border border-blue-100 dark:border-blue-900/40">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-300">
            <Sparkles className="w-4 h-4 text-blue-500 animate-spin" /> Session Context Active
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Session
          </button>
        </div>

        {/* Chat History Box */}
        <div className="space-y-4 max-h-[300px] overflow-y-auto p-2">
          {history.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-black text-white dark:bg-white dark:text-black rounded-tr-none"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none border border-gray-200 dark:border-gray-700"
                }`}
              >
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start items-center text-xs text-gray-400">
              <div className="w-8 h-8 rounded-full bg-blue-600/50 text-white flex items-center justify-center animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <span>AI is analyzing your request...</span>
            </div>
          )}
        </div>

        {/* Live Product Matches Bar */}
        {products.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Context Matches ({products.length})</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[160px] overflow-y-auto">
              {products.map((p) => (
                <div key={p.id} className="flex gap-3 p-2.5 rounded-2xl bg-gray-50 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 items-center">
                  <img src={p.images?.[0]?.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"} alt={p.name} className="w-12 h-12 rounded-xl object-cover" />
                  <div className="flex-grow min-w-0">
                    <p className="text-xs font-bold line-clamp-1">{p.name}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-bold">${p.price.toFixed(2)}</p>
                    {p.match_reasons?.[0] && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate block">{p.match_reasons[0]}</span>
                    )}
                  </div>
                  <Link href={`/product/${p.slug}`} onClick={onClose} className="p-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-blue-600 hover:text-white transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message Input Form */}
        <form onSubmit={handleSend} className="flex items-center gap-2 pt-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Follow up... e.g. 'Under $100' or 'Which one has best battery?'"
            className="flex-grow px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="px-5 py-3 rounded-2xl bg-blue-600 text-white font-semibold text-xs sm:text-sm hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" /> Send
          </button>
        </form>
      </div>
    </AnimatedModal>
  );
}
