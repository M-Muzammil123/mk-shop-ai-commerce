'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/lib/api/products';
import { useAuthStore } from '@/store/auth-store';
import { useCountryStore } from '@/store/country-store';
import { HeroAIDemo } from '@/components/shopping/HeroAIDemo';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Sparkles,
  ShoppingBag,
  Bot,
  ArrowRight,
  MessageSquare,
  CheckCircle,
  Mic,
  Scale,
} from 'lucide-react';

export default function HomePage() {
  const { token } = useAuthStore();
  const { currentCountry } = useCountryStore();

  // Fetch real featured products from backend
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['home-featured-products'],
    queryFn: () => productsApi.getProducts({ limit: 8, sort_by: 'newest' }),
  });

  // Fetch real categories from backend
  const { data: categories = [] } = useQuery({
    queryKey: ['home-categories'],
    queryFn: productsApi.getCategories,
  });

  const products = productsData?.products || [];

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-b from-zinc-50/50 via-white to-white dark:from-zinc-950 dark:via-zinc-900/40 dark:to-zinc-950">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-indigo-500/15 via-purple-500/15 to-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-6 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 animate-pulse text-indigo-500" />
            <span>Next-Generation Autonomous Shopping Platform</span>
            <span className="text-zinc-300 dark:text-zinc-700">|</span>
            <span className="flex items-center gap-1 font-normal text-zinc-600 dark:text-zinc-400">
              {currentCountry.flag} Serving {currentCountry.name} ({currentCountry.currency})
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-zinc-900 dark:text-white max-w-4xl mx-auto leading-[1.08]">
            Shop Smarter with{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Intelligence
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Find products, compare options, understand reviews, check delivery, and make better buying decisions with an AI shopping assistant.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link href={token ? '/app' : '/shop'}>
              <Button
                variant="primary"
                size="lg"
                className="rounded-2xl gap-2 font-bold shadow-lg shadow-indigo-600/15 h-12 px-6"
              >
                <ShoppingBag className="h-4 w-4" /> Start Shopping
              </Button>
            </Link>
            <Link href={token ? '/ai' : '/auth/login?next=/ai'}>
              <Button
                variant="ai"
                size="lg"
                className="rounded-2xl gap-2 font-bold shadow-lg shadow-purple-600/15 h-12 px-6"
              >
                <Bot className="h-4 w-4" /> Ask AI
              </Button>
            </Link>
          </div>

          {/* Interactive Hero AI Marketing Demo */}
          <div className="mt-14">
            <HeroAIDemo />
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS (4 STEPS) */}
      <section className="py-20 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge variant="outline" size="sm" className="font-bold uppercase tracking-wider">
              Autonomous Workflow
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              How AI Shopping Works
            </h2>
            <p className="text-sm sm:text-base text-zinc-500">
              From natural conversation to verified delivery — our multi-agent framework orchestrates every stage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-lg">
                01
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Describe What You Need
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Speak or type naturally. Specify your exact budget, required specs, preferred brands, or usage constraints.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black text-lg">
                02
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Multi-Store Research
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Autonomous agents cross-reference regional sellers, check real-time stock levels, and verify merchant authenticity.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center font-black text-lg">
                03
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Spec & Review Intelligence
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                AI extracts verified buyer pros & cons, builds side-by-side matrices, and filters misleading seller claims.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-lg">
                04
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Seamless Checkout
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Add directly to your synchronized cart, apply optimal coupon codes, and track shipments with live order milestones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE AI PILLARS (AI WORKSPACE, COMPARISON, REVIEW INTELLIGENCE, VOICE) */}
      <section className="py-20 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge variant="outline" size="sm" className="font-bold uppercase tracking-wider">
              Core Capabilities
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Built Different than Traditional Stores
            </h2>
            <p className="text-sm sm:text-base text-zinc-500">
              We replaced rigid filter checkboxes with conversational intelligence and autonomous research agents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pillar 1: Conversational Workspace */}
            <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-4 shadow-sm">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Bot className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                Dedicated AI Shopping Workspace
              </h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Chat multi-turn with a copilot that remembers your constraints. Get structured recommendations with match scores, merchant URLs, and instant add-to-cart actions.
              </p>
              <div className="pt-2">
                <Link href={token ? '/ai' : '/auth/login?next=/ai'}>
                  <Button variant="outline" size="sm" className="gap-2 font-semibold text-xs">
                    Try Workspace <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Pillar 2: Side-by-Side Spec Comparison */}
            <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-4 shadow-sm">
              <div className="h-12 w-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Scale className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                Automated Spec & Price Comparison
              </h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Select up to 4 items and let our comparison engine extract exact technical specifications, highlight value-for-money winners, and isolate weaknesses.
              </p>
              <div className="pt-2">
                <Link href="/compare">
                  <Button variant="outline" size="sm" className="gap-2 font-semibold text-xs">
                    Explore Compare Engine <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Pillar 3: Review Sentiment Intelligence */}
            <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-4 shadow-sm">
              <div className="h-12 w-12 rounded-2xl bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                AI Review Sentiment Summaries
              </h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Never read hundreds of repetitive comments. Our NLP model digests verified customer reviews to output clean pros, cons, and durability ratings.
              </p>
              <div className="pt-2">
                <Link href="/shop">
                  <Button variant="outline" size="sm" className="gap-2 font-semibold text-xs">
                    See Verified Reviews <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Pillar 4: Voice Shopping Copilot */}
            <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-4 shadow-sm">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Mic className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                Hands-Free Voice Shopping
              </h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Equipped with Web Speech audio recognition and backend neural synthesis. Speak naturally while cooking or commuting to order products seamlessly.
              </p>
              <div className="pt-2">
                <Link href={token ? '/ai' : '/auth/login?next=/ai'}>
                  <Button variant="outline" size="sm" className="gap-2 font-semibold text-xs">
                    Test Voice Copilot <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. POPULAR CATEGORIES */}
      {categories.length > 0 && (
        <section className="py-16 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  Popular Categories
                </h2>
                <p className="text-xs text-zinc-500">Browse verified inventories across domains</p>
              </div>
              <Link href="/shop">
                <Button variant="ghost" size="sm" className="text-xs font-semibold gap-1">
                  View All <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${encodeURIComponent(cat.slug)}`}
                  className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-indigo-500/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all text-center group"
                >
                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {cat.name}
                  </p>
                  <span className="text-[10px] text-zinc-400 block mt-1">Explore →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. FEATURED PRODUCTS (LIVE FROM BACKEND) */}
      <section className="py-20 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <Badge variant="outline" size="sm" className="font-bold uppercase tracking-wider mb-2">
                Verified Catalog
              </Badge>
              <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                Featured Live Products
              </h2>
              <p className="text-sm text-zinc-500 mt-1">
                Real-time product inventory connected to the MK API
              </p>
            </div>
            <Link href="/shop">
              <Button variant="outline" size="sm" className="gap-2 rounded-xl text-xs font-semibold">
                View Full Catalog ({productsData?.total || 0}) <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-2xl" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <p className="text-sm text-zinc-500">No products found in the catalog.</p>
            </div>
          )}
        </div>
      </section>

      {/* 6. WHY MK (COMPARISON MATRIX) */}
      <section className="py-20 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <Badge variant="outline" size="sm" className="font-bold uppercase tracking-wider">
              Comparison Matrix
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Why Shop With MK E-Commerce AI?
            </h2>
            <p className="text-sm text-zinc-500 max-w-xl mx-auto">
              How our autonomous AI platform outperforms traditional marketplaces.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 font-bold border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-4 px-6">Shopping Feature</th>
                  <th className="py-4 px-6 text-indigo-600 dark:text-indigo-400 font-extrabold">
                    MK E-Commerce AI
                  </th>
                  <th className="py-4 px-6 text-zinc-400 font-normal">Traditional Marketplace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800">
                <tr>
                  <td className="py-4 px-6 font-semibold text-zinc-900 dark:text-white">
                    Search Experience
                  </td>
                  <td className="py-4 px-6 text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 shrink-0" /> Multi-turn Conversational AI
                  </td>
                  <td className="py-4 px-6 text-zinc-500">Keyword matching & spam filters</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold text-zinc-900 dark:text-white">
                    Product Research
                  </td>
                  <td className="py-4 px-6 text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 shrink-0" /> Autonomous Multi-Store Scraping
                  </td>
                  <td className="py-4 px-6 text-zinc-500">Single store listing only</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold text-zinc-900 dark:text-white">
                    Spec Comparison
                  </td>
                  <td className="py-4 px-6 text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 shrink-0" /> AI Winner Scoring & Weakness Flags
                  </td>
                  <td className="py-4 px-6 text-zinc-500">Manual tab switching across windows</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold text-zinc-900 dark:text-white">
                    Reviews Analysis
                  </td>
                  <td className="py-4 px-6 text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 shrink-0" /> NLP Pros, Cons & Fraud Detection
                  </td>
                  <td className="py-4 px-6 text-zinc-500">Unfiltered sponsored reviews</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold text-zinc-900 dark:text-white">
                    Regional Currency & Delivery
                  </td>
                  <td className="py-4 px-6 text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 shrink-0" /> Native Country & Currency Conversion
                  </td>
                  <td className="py-4 px-6 text-zinc-500">Hidden exchange fees at checkout</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 7. FINAL CALL TO ACTION */}
      <section className="py-20 bg-gradient-to-tr from-indigo-950 via-zinc-950 to-purple-950 text-white relative overflow-hidden border-t border-zinc-800">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-semibold text-indigo-300">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Ready for the Future of Shopping?</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Start shopping with your AI copilot today.
          </h2>

          <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Join thousands of shoppers making informed decisions, comparing specifications, and saving money on every purchase.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={token ? '/app' : '/auth/register'}>
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto rounded-2xl h-12 px-8 font-bold gap-2 shadow-xl shadow-indigo-600/25 bg-white text-zinc-950 hover:bg-zinc-100"
              >
                Create Free Account <ArrowRight className="h-4 w-4 text-zinc-950" />
              </Button>
            </Link>
            <Link href={token ? '/ai' : '/auth/login?next=/ai'}>
              <Button
                variant="ai"
                size="lg"
                className="w-full sm:w-auto rounded-2xl h-12 px-8 font-bold gap-2"
              >
                <Bot className="h-4 w-4" /> Try AI Workspace
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
