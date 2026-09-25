"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Bot, Mic, ArrowRight, X } from "lucide-react";

export function MKAIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {isOpen ? (
        <div className="w-80 p-4 rounded-3xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border border-gray-200 dark:border-gray-800 shadow-2xl space-y-3 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-gray-900 dark:text-white">MK AI Shopping Agent</h4>
                <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Grounded & Live
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-300">
            Need help finding products, comparing prices, or searching by voice across your country?
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Link
              href="/shop?mode=ai"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Chat Agent</span>
            </Link>

            <Link
              href="/shop?mode=voice"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Voice Shop</span>
            </Link>
          </div>

          <Link
            href="/shop"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-between w-full p-2 rounded-xl bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800 text-[11px] font-semibold text-gray-700 dark:text-gray-300 transition-colors"
          >
            <span>Open Full AI Shopping Studio</span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
          </Link>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 py-3 px-4 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20"
        >
          <div className="relative">
            <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400"></span>
          </div>
          <span className="text-xs font-black tracking-wide">AI Assistant</span>
        </button>
      )}
    </div>
  );
}
