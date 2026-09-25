"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuthStore } from "../store/useAuthStore";
import {
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Bot,
  Mic,
  Compass,
  Search,
  CheckCircle2,
  SlidersHorizontal,
  TrendingUp,
  Globe2,
} from "lucide-react";
import { SlideUp } from "../components/motion/SlideUp";
import { StaggerContainer, StaggerItem } from "../components/motion/StaggerContainer";
import { ProductCard } from "../components/product/ProductCard";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price?: number | null;
  is_featured?: boolean;
  match_score?: number;
  match_reasons?: string[];
  status?: string;
  images: { image_url: string; is_primary?: boolean }[];
}

const POPULAR_COUNTRIES = [
  { code: "PK", name: "Pakistan", flag: "🇵🇰", currency: "PKR" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", currency: "GBP" },
  { code: "US", name: "United States", flag: "🇺🇸", currency: "USD" },
  { code: "AE", name: "UAE", flag: "🇦🇪", currency: "AED" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", currency: "SAR" },
];

const SAMPLE_PROMPTS = [
  { text: "Gaming laptop under 300,000 PKR with RTX graphics & 16GB RAM", country: "PK" },
  { text: "Best noise-cancelling headphones under £120 in the UK", country: "GB" },
  { text: "iPhone 16 Pro Max 256GB best local deal", country: "PK" },
  { text: "Lightweight running shoes under $100 with free delivery", country: "US" },
];

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [recs, setRecs] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Hero AI Assistant interactive state
  const [selectedCountry, setSelectedCountry] = useState("PK");
  const [heroPrompt, setHeroPrompt] = useState("");
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const prodRes = await api.get("/products?limit=4&sort_by=popular");
        if (prodRes.data.products) {
          setFeatured(prodRes.data.products);
        }

        if (isAuthenticated) {
          const recRes = await api.get("/dashboard/recommendations?limit=4");
          setRecs(recRes.data);
        }
      } catch (e) {
        console.error("Catalog fallback", e);
        const mockProducts: Product[] = [
          {
            id: "1",
            name: "Aura Smart Chrono Watch",
            slug: "aura-smart-chrono",
            price: 299.0,
            compare_at_price: 349.0,
            is_featured: true,
            match_score: 96,
            match_reasons: ["✓ 7-day battery life", "✓ AMOLED Display"],
            status: "published",
            images: [{ image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500", is_primary: true }],
          },
          {
            id: "2",
            name: "Neptune SoundCancelling Pro",
            slug: "neptune-sound-pro",
            price: 189.0,
            compare_at_price: null,
            is_featured: true,
            match_score: 94,
            match_reasons: ["✓ Active ANC Isolation", "✓ 40-hr Battery"],
            status: "published",
            images: [{ image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500", is_primary: true }],
          },
          {
            id: "3",
            name: "Zenith Ultrabook Pro 16GB",
            slug: "zenith-ultrabook-pro",
            price: 1199.0,
            compare_at_price: 1399.0,
            is_featured: true,
            match_score: 98,
            match_reasons: ["✓ Within budget", "✓ 16GB RAM"],
            status: "published",
            images: [{ image_url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500", is_primary: true }],
          },
          {
            id: "4",
            name: "Nike Air Zoom Runner",
            slug: "nike-air-zoom-runner",
            price: 95.0,
            compare_at_price: 120.0,
            is_featured: true,
            match_score: 92,
            match_reasons: ["✓ Under $100", "✓ Flyknit Mesh"],
            status: "published",
            images: [{ image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500", is_primary: true }],
          },
        ];
        setFeatured(mockProducts);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [isAuthenticated]);

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroPrompt.trim()) {
      router.push(`/shop?mode=ai&country=${selectedCountry}`);
      return;
    }
    router.push(`/shop?mode=ai&q=${encodeURIComponent(heroPrompt.trim())}&country=${selectedCountry}`);
  };

  const handleVoiceTrigger = () => {
    if (typeof window !== "undefined" && !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      router.push(`/shop?mode=voice&country=${selectedCountry}`);
      return;
    }

    try {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = selectedCountry === "PK" ? "ur-PK" : "en-US";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setHeroPrompt(transcript);
        setIsListening(false);
        router.push(`/shop?mode=ai&q=${encodeURIComponent(transcript)}&country=${selectedCountry}`);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
      router.push(`/shop?mode=voice&country=${selectedCountry}`);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50/50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* ── HERO SECTION: CLEAN MODERN SPLIT LAYOUT ── */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Vision & Brand Typography */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <SlideUp delay={0.1}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                <span>MK SHOP — AI Commerce Intelligence</span>
              </div>
            </SlideUp>

            <SlideUp delay={0.2}>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.08] text-slate-900 dark:text-white">
                Next-Gen Shopping, <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-teal-500 bg-clip-text text-transparent">
                  Driven by Live AI.
                </span>
              </h1>
            </SlideUp>

            <SlideUp delay={0.3}>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                Search verified products across your country with natural language or voice. We compare live prices, delivery times, and verified specifications with zero hallucinated data.
              </p>
            </SlideUp>

            {/* Quick Country Pills */}
            <SlideUp delay={0.35} className="space-y-2 pt-2">
              <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5" />
                <span>Select Target Country</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_COUNTRIES.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => setSelectedCountry(c.code)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      selectedCountry === c.code
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md scale-105"
                        : "bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <span>{c.flag}</span>
                    <span>{c.name}</span>
                    <span className="text-[10px] opacity-70 font-mono">({c.currency})</span>
                  </button>
                ))}
              </div>
            </SlideUp>

            {/* CTAs */}
            <SlideUp delay={0.4} className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                href={`/shop?mode=ai&country=${selectedCountry}`}
                className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-500/25 active:scale-95 transition-all"
              >
                <Bot className="w-4 h-4" />
                <span>Open AI Shopping Agent</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/shop"
                className="px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm flex items-center gap-2 border border-slate-200 dark:border-slate-700 transition-all"
              >
                <Compass className="w-4 h-4 text-slate-400" />
                <span>Browse Catalog</span>
              </Link>
            </SlideUp>
          </div>

          {/* Right Column: Clean Modern AI Assistant Studio Box */}
          <div className="lg:col-span-6">
            <SlideUp delay={0.25}>
              <div className="relative p-6 sm:p-8 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
                
                {/* Assistant Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                        MK Shopping Assistant
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">
                          Live MCP Gateway
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Country-locked search & specification comparison
                      </p>
                    </div>
                  </div>
                  <span className="text-xl" title={selectedCountry}>
                    {POPULAR_COUNTRIES.find((c) => c.code === selectedCountry)?.flag || "🇵🇰"}
                  </span>
                </div>

                {/* Interactive Input Form */}
                <form onSubmit={handleHeroSubmit} className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={heroPrompt}
                      onChange={(e) => setHeroPrompt(e.target.value)}
                      placeholder={`Try: "I need a gaming laptop under 300k PKR in Pakistan"`}
                      className="w-full py-4 pl-12 pr-28 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner"
                    />
                    <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />

                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleVoiceTrigger}
                        className={`p-2 rounded-xl transition-all ${
                          isListening
                            ? "bg-red-500 text-white animate-pulse"
                            : "bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-300"
                        }`}
                        title="Search with Voice"
                      >
                        <Mic className="w-4 h-4" />
                      </button>

                      <button
                        type="submit"
                        className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-md active:scale-95"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </form>

                {/* Sample Prompt Suggestions */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-blue-500" />
                    <span>Quick Examples</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SAMPLE_PROMPTS.map((sample, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedCountry(sample.country);
                          setHeroPrompt(sample.text);
                          router.push(`/shop?mode=ai&q=${encodeURIComponent(sample.text)}&country=${sample.country}`);
                        }}
                        className="p-2.5 text-left rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 dark:hover:border-blue-800 border border-slate-100 dark:border-slate-800/80 transition-all group"
                      >
                        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2">
                          "{sample.text}"
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trust & Grounding Signals */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Grounded Merchant Sources
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Multi-Spec Matrix Comparison
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Simulated Demo Payments
                  </span>
                </div>

              </div>
            </SlideUp>
          </div>

        </div>
      </section>

      {/* ── THREE KEY PILLARS ── */}
      <section className="bg-white dark:bg-slate-900/60 py-16 transition-colors border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Country-Locked Shopping</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Enforces server-side country validation to find local merchants, domestic delivery times, and true currency pricing without cross-border surprises.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Transparent Spec Comparison</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Evaluates candidates with component-based scoring across requirements, price fit, customer reviews, and shipping speed.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Safe Confirmation & Simulated Checkout</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Zero unauthorized mutations. Orders require explicit review tokens with simulated payment confirmation until live gateways are enabled.
            </p>
          </div>

        </div>
      </section>

      {/* ── FEATURED SHOWCASE CATALOG ── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">✦ Verified Listings</span>
            <h2 className="text-3xl font-black tracking-tight mt-1 text-slate-900 dark:text-white">Featured Product Showcase</h2>
          </div>
          <Link href="/shop" className="text-sm font-semibold text-blue-600 hover:text-blue-500 flex items-center gap-1">
            See all catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featured.map((product) => (
              <StaggerItem key={product.id}>
                <ProductCard product={product} showParticles={false} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </section>

      {/* ── AI PERSONALIZED RECOMMENDATIONS FEED ── */}
      {isAuthenticated && recs.length > 0 && (
        <section className="py-20 bg-slate-100/50 dark:bg-slate-900/40 transition-colors border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-indigo-500">
                <Sparkles className="w-3.5 h-3.5" /> For You
              </span>
              <h2 className="text-3xl font-black tracking-tight mt-1 text-slate-900 dark:text-white">Recommended By MK AI</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Tailored based on your recent category browsing and rating preferences.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {recs.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
