'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Mic } from 'lucide-react';
import { VoiceShoppingModal } from '@/components/ai/VoiceShoppingModal';

export function AISearchBar({
  className,
  placeholder = 'Ask AI: "Find me high-performance laptop under my budget for development"...',
  initialQuery = '',
}: {
  className?: string;
  placeholder?: string;
  initialQuery?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    // Route to AI Shopping workspace with query parameter
    router.push(`/ai?q=${encodeURIComponent(query.trim())}`);
  };

  const samplePrompts = [
    'Best ultrabook under budget for coding',
    'Noise cancelling headphones for travel',
    'Minimalist desk lamp with warm light',
  ];

  return (
    <div className={`w-full max-w-3xl mx-auto ${className || ''}`}>
      <form onSubmit={handleSubmit} className="relative group">
        {/* Glow effect on hover/focus */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur-md group-hover:opacity-40 group-focus-within:opacity-50 transition-all duration-300 pointer-events-none" />

        <div className="relative flex items-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-xl overflow-hidden p-1.5 focus-within:ring-2 focus-within:ring-purple-500/50 focus-within:border-transparent transition-all">
          <div className="pl-3.5 pr-2 flex items-center text-purple-600 dark:text-purple-400">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent px-2 py-3 text-sm sm:text-base text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
          />

          <div className="flex items-center gap-1.5 pr-1">
            {/* Voice input button */}
            <button
              type="button"
              onClick={() => setIsVoiceOpen(true)}
              className="p-2.5 rounded-xl text-zinc-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
              title="Voice Shopping"
            >
              <Mic className="h-4 w-4" />
            </button>

            {/* Submit button */}
            <button
              type="submit"
              className="h-10 px-4 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold text-xs sm:text-sm flex items-center gap-1.5 hover:bg-zinc-800 dark:hover:bg-zinc-100 shadow-sm transition-all active:scale-95"
            >
              <span>Ask AI</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </form>

      {/* Suggested prompts underneath */}
      <div className="flex items-center flex-wrap gap-2 mt-3 text-xs justify-center sm:justify-start">
        <span className="text-zinc-400 font-medium">Try:</span>
        {samplePrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => {
              setQuery(prompt);
              router.push(`/ai?q=${encodeURIComponent(prompt)}`);
            }}
            className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-[11px] font-medium transition-colors cursor-pointer"
          >
            &quot;{prompt}&quot;
          </button>
        ))}
      </div>

      <VoiceShoppingModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onResultsReceived={(result) => {
          if (result.transcript) {
            router.push(`/ai?q=${encodeURIComponent(result.transcript)}`);
          }
        }}
      />
    </div>
  );
}
