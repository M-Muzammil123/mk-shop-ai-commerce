'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useCountryStore } from '@/store/country-store';
import { Button } from '@/components/ui/Button';
import { RatingStars } from '@/components/ui/RatingStars';
import {
  Bot,
  ArrowRight,
  CheckCircle2,
  Laptop,
  Headphones,
  Smartphone,
} from 'lucide-react';

interface DemoQuery {
  id: string;
  tabLabel: string;
  icon: React.ElementType;
  prompt: string;
  assistantSummary: string;
  topPick: {
    name: string;
    brand: string;
    price: number;
    rating: number;
    reviewCount: number;
    matchScore: number;
    imageUrl: string;
    merchant: string;
    delivery: string;
    reason: string;
    pros: string[];
  };
}

const DEMO_QUERIES: DemoQuery[] = [
  {
    id: 'laptop',
    tabLabel: 'Developer Laptop',
    icon: Laptop,
    prompt: 'Find me the best laptop for software development and multitasking under $1500.',
    assistantSummary:
      'I analyzed 14 developer-grade workstations across verified merchants. Evaluated thermals, RAM expansion, code compile benchmarks, and battery longevity.',
    topPick: {
      name: 'ThinkPad Pro X1 Carbon Gen 11 (Core i7, 32GB RAM, 1TB NVMe)',
      brand: 'Lenovo',
      price: 1420,
      rating: 4.85,
      reviewCount: 312,
      matchScore: 96,
      imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600',
      merchant: 'Lenovo Verified Store',
      delivery: '2-3 Business Days',
      reason: 'Top compilation speeds, industry-leading keyboard ergonomics, and Linux/Docker compatibility.',
      pros: ['32GB LPDDR5X Memory', 'Anti-glare 400-nit Display', 'All-day battery life'],
    },
  },
  {
    id: 'headphones',
    tabLabel: 'ANC Headphones',
    icon: Headphones,
    prompt: 'I want wireless noise-canceling headphones for focus work with comfortable ear cups under $350.',
    assistantSummary:
      'Compared 9 active noise-canceling headsets. Screened for acoustic isolation, microphone background suppression, and multi-point Bluetooth pairing.',
    topPick: {
      name: 'Sony WH-1000XM5 Wireless Noise-Canceling Headset',
      brand: 'Sony',
      price: 329,
      rating: 4.9,
      reviewCount: 1420,
      matchScore: 98,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
      merchant: 'Official Sony Partner',
      delivery: '1-2 Days Fast Shipping',
      reason: 'Industry benchmark for noise suppression in coffee shops/open offices with 30hr battery.',
      pros: ['Dual V1/QN1 Processors', 'Crystal-clear 8-mic array', 'Ultralight fit'],
    },
  },
  {
    id: 'phone',
    tabLabel: 'Camera Phone',
    icon: Smartphone,
    prompt: 'Recommend a flagship smartphone with professional low-light cameras and smooth 120Hz display.',
    assistantSummary:
      'Evaluated sensor sizes, optical image stabilization, zoom optics, and battery drain under camera loads across 8 flagship models.',
    topPick: {
      name: 'Samsung Galaxy S24 Ultra (512GB, 200MP Quad Camera)',
      brand: 'Samsung',
      price: 1199,
      rating: 4.8,
      reviewCount: 890,
      matchScore: 94,
      imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600',
      merchant: 'Samsung Premier Merchant',
      delivery: '2-4 Days Express',
      reason: '200MP main sensor with 5x optical telephoto and titanium chassis durability.',
      pros: ['Dynamic AMOLED 2X', 'S-Pen Integrated', '7 Years OS Updates'],
    },
  },
];

export function HeroAIDemo() {
  const router = useRouter();
  const { token } = useAuthStore();
  const { formatPrice } = useCountryStore();
  const [activeQuery, setActiveQuery] = useState<DemoQuery>(DEMO_QUERIES[0]);

  const handleLaunchLiveCopilot = () => {
    const targetUrl = `/ai?q=${encodeURIComponent(activeQuery.prompt)}`;
    if (token) {
      router.push(targetUrl);
    } else {
      router.push(`/auth/login?next=${encodeURIComponent(targetUrl)}`);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-2xl overflow-hidden backdrop-blur-xl text-left text-white">
      {/* Top Demo Bar */}
      <div className="px-5 py-3.5 bg-zinc-950/80 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-xs font-semibold text-zinc-400 ml-2">
            MK AI Shopping Copilot — Interactive Preview
          </span>
        </div>

        {/* Demo pill switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {DEMO_QUERIES.map((q) => {
            const Icon = q.icon;
            const isSelected = activeQuery.id === q.id;
            return (
              <button
                key={q.id}
                onClick={() => setActiveQuery(q)}
                className={`px-3 py-1 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="whitespace-nowrap">{q.tabLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Preview Content */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* User Prompt Bubble */}
        <div className="flex items-start gap-3 max-w-2xl">
          <div className="h-8 w-8 rounded-xl bg-zinc-800 text-zinc-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
            You
          </div>
          <div className="p-4 rounded-2xl rounded-tl-sm bg-zinc-800/90 text-sm font-medium text-zinc-100 border border-zinc-700/80 shadow-sm leading-relaxed">
            &ldquo;{activeQuery.prompt}&rdquo;
          </div>
        </div>

        {/* AI Agent Response Bubble */}
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-md shadow-indigo-500/20">
            <Bot className="h-4 w-4" />
          </div>
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-400">MK Agent</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  Multi-Store Verified
                </span>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                {activeQuery.assistantSummary}
              </p>
            </div>

            {/* Recommended Product Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col sm:flex-row gap-5 items-start sm:items-center">
              {/* Product Thumbnail */}
              <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-xl overflow-hidden bg-zinc-900 shrink-0 border border-zinc-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeQuery.topPick.imageUrl}
                  alt={activeQuery.topPick.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-indigo-600/90 text-[10px] font-extrabold text-white">
                  {activeQuery.topPick.matchScore}% Match
                </div>
              </div>

              {/* Product Details */}
              <div className="flex-1 space-y-2 text-left">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                    {activeQuery.topPick.brand}
                  </span>
                  <h4 className="text-base font-bold text-white leading-snug">
                    {activeQuery.topPick.name}
                  </h4>
                </div>

                <div className="flex items-center gap-3 text-xs text-zinc-400">
                  <div className="flex items-center gap-1 text-amber-400">
                    <RatingStars rating={activeQuery.topPick.rating} />
                    <span className="font-bold ml-1">{activeQuery.topPick.rating}</span>
                  </div>
                  <span>({activeQuery.topPick.reviewCount} reviews)</span>
                  <span>•</span>
                  <span className="text-zinc-300 font-medium">{activeQuery.topPick.merchant}</span>
                </div>

                <p className="text-xs text-zinc-300 italic">
                  &ldquo;{activeQuery.topPick.reason}&rdquo;
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {activeQuery.topPick.pros.map((p, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-[11px] font-medium"
                    >
                      ✓ {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price & Action */}
              <div className="sm:border-l sm:border-zinc-800 sm:pl-5 flex flex-col justify-between items-start sm:items-end w-full sm:w-auto shrink-0 gap-3">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                    Estimated Price
                  </span>
                  <span className="text-xl font-mono font-extrabold text-white">
                    {formatPrice(activeQuery.topPick.price)}
                  </span>
                  <span className="text-[10px] text-emerald-400 block mt-0.5">
                    {activeQuery.topPick.delivery}
                  </span>
                </div>

                <Button
                  onClick={handleLaunchLiveCopilot}
                  variant="ai"
                  size="sm"
                  className="w-full sm:w-auto rounded-xl gap-1 text-xs font-bold"
                >
                  Ask Live AI <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Note that this is interactive preview */}
            <div className="pt-1 flex items-center justify-between text-[11px] text-zinc-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
                Live agent will search {DEMO_QUERIES.length > 0 ? 'real regional inventories' : ''} in real time
              </span>
              <button
                onClick={handleLaunchLiveCopilot}
                className="text-indigo-400 hover:text-indigo-300 font-semibold underline"
              >
                Launch with this query →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
