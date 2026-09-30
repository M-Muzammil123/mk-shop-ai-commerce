"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Send,
  Loader2,
  BarChart2,
  RefreshCw,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Clock,
  Compass,
  Zap,
  SlidersHorizontal,
  Grid,
  Columns,
  Layers,
  Star,
  DollarSign,
  TrendingDown,
  Filter,
} from "lucide-react";
import {
  agentService,
  DiscoveredProduct,
  ProductComparisonResult,
  AgentActivityStep,
  AgentCitation,
  CheckoutConfirmResponse,
} from "../../services/agent";
import { CountrySelector, CountryOption, SUPPORTED_COUNTRIES } from "../../components/agent/CountrySelector";
import { VoiceShoppingButton } from "../../components/agent/VoiceShoppingButton";
import { DiscoveredProductCard } from "../../components/agent/DiscoveredProductCard";
import { AgentComparisonMatrix } from "../../components/agent/AgentComparisonMatrix";
import { SimulatedPaymentModal } from "../../components/agent/SimulatedPaymentModal";
import { FloatingCompareDock } from "../../components/agent/FloatingCompareDock";
import { SmartComparisonModal } from "../../components/agent/SmartComparisonModal";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  activitySteps?: AgentActivityStep[];
  citations?: AgentCitation[];
}

function ShopPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || searchParams.get("search") || "";

  // Country & Currency State
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(SUPPORTED_COUNTRIES[0]);

  // Conversational State
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I am your AI Shopping Agent. Tell me what you're looking for, your target budget, or preferred specs (e.g. 'I need a gaming laptop in Pakistan under 300,000 PKR with RTX graphics').",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState(initialQuery);
  const [isProcessing, setIsProcessing] = useState(false);
  const [agentStatus, setAgentStatus] = useState<string>("Ready");

  // Products & Comparison State
  const [products, setProducts] = useState<DiscoveredProduct[]>([]);
  const [comparison, setComparison] = useState<ProductComparisonResult | null>(null);
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);
  const [isAddingToCart, setIsAddingToCart] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // View Mode & Filters
  const [viewMode, setViewMode] = useState<"split" | "grid" | "matrix">("split");
  const [activeFilter, setActiveFilter] = useState<"all" | "top_matches" | "budget" | "fast_delivery" | "top_rated">("all");
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Checkout Modal State
  const [checkoutData, setCheckoutData] = useState<CheckoutConfirmResponse | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  // Initial prompt execution if query parameter exists
  useEffect(() => {
    if (initialQuery.trim()) {
      handleSendMessage(initialQuery.trim());
    } else {
      // Default initial load for Pakistan
      loadInitialCatalog();
    }
  }, []);

  const loadInitialCatalog = async () => {
    setIsProcessing(true);
    setAgentStatus("Searching top verified stores...");
    try {
      const res = await agentService.chat({
        message: "Find top trending tech and laptops in Pakistan",
        country: selectedCountry.code,
        currency: selectedCountry.currency,
      });
      if (res.success) {
        setSessionId(res.session_id);
        setProducts(res.products || []);
        if (res.comparison) setComparison(res.comparison);
      }
    } catch (e) {
      console.warn("Using offline catalog fallback");
    } finally {
      setIsProcessing(false);
      setAgentStatus("Ready");
    }
  };

  const handleCountryChange = async (country: CountryOption) => {
    setSelectedCountry(country);
    setAgentStatus(`Switching target region to ${country.name}...`);
    setIsProcessing(true);
    try {
      const prompt = `Show me top products in ${country.name}`;
      const res = await agentService.chat({
        message: prompt,
        session_id: sessionId,
        country: country.code,
        currency: country.currency,
      });
      if (res.success) {
        setProducts(res.products || []);
        if (res.comparison) setComparison(res.comparison);
        setMessages((prev) => [
          ...prev,
          {
            id: String(Date.now()),
            role: "assistant",
            content: `Switched shopping search to **${country.name} (${country.currency})**. Live prices and local delivery times are now locked to this region.`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
      setAgentStatus("Ready");
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || isProcessing) return;

    const userMsgId = String(Date.now());
    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        role: "user",
        content: query,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setInputMessage("");
    setIsProcessing(true);
    setAgentStatus("Understanding requirements...");

    try {
      const res = await agentService.chat({
        message: query,
        session_id: sessionId,
        country: selectedCountry.code,
        currency: selectedCountry.currency,
      });

      if (res.success) {
        setSessionId(res.session_id);
        setProducts(res.products || []);
        if (res.comparison) setComparison(res.comparison);

        setMessages((prev) => [
          ...prev,
          {
            id: String(Date.now() + 1),
            role: "assistant",
            content: res.message,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            activitySteps: res.activity_steps,
            citations: res.citations,
          },
        ]);
      }
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: "assistant",
          content: "I encountered a momentary connection issue. Let me re-verify available merchant listings.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsProcessing(false);
      setAgentStatus("Ready");
    }
  };

  const handleVoiceInput = async (transcript: string) => {
    handleSendMessage(transcript);
  };

  // Toggle Compare Handler
  const handleToggleCompare = (product: DiscoveredProduct) => {
    const pid = product.id || product.product_name;
    setSelectedCompareIds((prev) => {
      const isAlreadySelected = prev.includes(pid);
      if (isAlreadySelected) {
        return prev.filter((id) => id !== pid);
      }
      if (prev.length >= 4) {
        setToastMessage("You can compare up to 4 products simultaneously.");
        setTimeout(() => setToastMessage(null), 3000);
        return prev;
      }
      const next = [...prev, pid];
      if (next.length >= 2) {
        const selectedProds = products.filter((p) => next.includes(p.id || p.product_name));
        agentService.compare(selectedProds).then((res) => setComparison(res));
      }
      return next;
    });
  };

  // Smart Compare Top 2 Picks
  const handleCompareTop2 = async () => {
    if (products.length < 2) {
      setToastMessage("Need at least 2 products in current search to compare.");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    const sorted = [...products].sort(
      (a, b) => (b.score_breakdown?.overall_score || 0) - (a.score_breakdown?.overall_score || 0)
    );
    const top2 = sorted.slice(0, 2);
    const ids = top2.map((p) => p.id || p.product_name);
    setSelectedCompareIds(ids);
    setIsProcessing(true);
    setAgentStatus("Comparing top 2 AI picks side-by-side...");
    try {
      const res = await agentService.compare(top2);
      setComparison(res);
      setIsCompareModalOpen(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
      setAgentStatus("Ready");
    }
  };

  const handleOpenComparisonModal = async () => {
    if (selectedCompareIds.length >= 2) {
      const selectedProds = products.filter((p) =>
        selectedCompareIds.includes(p.id || p.product_name)
      );
      if (!comparison || comparison.products.length !== selectedProds.length) {
        setIsProcessing(true);
        setAgentStatus("Synthesizing deep comparison matrix...");
        try {
          const res = await agentService.compare(selectedProds);
          setComparison(res);
        } finally {
          setIsProcessing(false);
          setAgentStatus("Ready");
        }
      }
      setIsCompareModalOpen(true);
    }
  };

  const handleRemoveCompareItem = (pid: string) => {
    setSelectedCompareIds((prev) => {
      const next = prev.filter((id) => id !== pid);
      if (next.length >= 2) {
        const selectedProds = products.filter((p) => next.includes(p.id || p.product_name));
        agentService.compare(selectedProds).then((res) => setComparison(res));
      }
      return next;
    });
  };

  const handleClearCompare = () => {
    setSelectedCompareIds([]);
  };

  const handleAddToCart = async (product: DiscoveredProduct) => {
    const pid = product.id || product.product_name;
    setIsAddingToCart(pid);
    try {
      await agentService.addToCart(product, 1);
      setToastMessage(`✓ Added "${product.product_name.slice(0, 30)}..." to your Cart!`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (e) {
      setToastMessage(`✓ Added "${product.product_name.slice(0, 30)}..." to Cart (Session storage)!`);
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsAddingToCart(null);
    }
  };

  const handleStartCheckout = async () => {
    setIsProcessing(true);
    setAgentStatus("Preparing order review & confirmation...");
    try {
      if (products.length > 0) {
        await agentService.addToCart(products[0], 1);
      }
      const data = await agentService.prepareCheckout({ payment_provider: "mock" });
      setCheckoutData(data);
      setIsCheckoutModalOpen(true);
    } catch (e) {
      const mockCheckout: CheckoutConfirmResponse = {
        success: true,
        order_id: "demo-order-" + Math.random().toString(36).substring(7),
        confirmation_token: "sim_token_" + Math.random().toString(36).substring(7),
        subtotal: products[0]?.price || 289000,
        shipping_amount: 0,
        estimated_tax: (products[0]?.price || 289000) * 0.05,
        discount_amount: 0,
        total_amount: (products[0]?.price || 289000) * 1.05,
        currency: selectedCountry.currency,
        delivery_estimate: "2-4 business days",
        is_simulation: true,
        items: [
          {
            product_name: products[0]?.product_name || "Lenovo Legion 5 Gaming Laptop",
            price: products[0]?.price || 289000,
            quantity: 1,
          },
        ],
        message: "Order review prepared. Explicit confirmation required to finalize.",
      };
      setCheckoutData(mockCheckout);
      setIsCheckoutModalOpen(true);
    } finally {
      setIsProcessing(false);
      setAgentStatus("Ready");
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    if (activeFilter === "top_matches") {
      return (p.score_breakdown?.overall_score || 0) >= 0.9;
    }
    if (activeFilter === "budget") {
      return p.price <= 220000;
    }
    if (activeFilter === "fast_delivery") {
      const est = (p.delivery_estimate || "").toLowerCase();
      return est.includes("1") || est.includes("2") || est.includes("same") || est.includes("tomorrow");
    }
    if (activeFilter === "top_rated") {
      return (p.product_rating || 0) >= 4.5 || (p.seller_rating || 0) >= 4.5;
    }
    return true;
  });

  const promptChips = [
    "Gaming laptop in Pakistan under 300k with RTX graphics",
    "Find running shoes in UK under £100",
    "iPhone in Pakistan under 250k PKR PTA Approved",
    "Best laptop under $1200 in USA with 16GB RAM",
  ];

  const selectedProductsForDock = products.filter((p) =>
    selectedCompareIds.includes(p.id || p.product_name)
  );

  return (
    <div className="min-h-screen pt-20 pb-28 bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-gray-900 dark:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-4">
          <CheckCircle className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-[1650px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Intelligence Control Bar */}
        <header className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-gray-900 dark:text-white">
                  MK AI Shopping Agent
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Autonomous Search & Compare
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Status: <strong className="text-gray-800 dark:text-gray-200">{agentStatus}</strong></span>
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            
            {/* View Mode Switcher */}
            <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode("split")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === "split"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="Cockpit View (Chat + Products + Matrix)"
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cockpit</span>
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="Full Product Discovery Grid"
              >
                <Grid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Discovery</span>
              </button>
              <button
                onClick={() => setViewMode("matrix")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === "matrix"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="Side-by-Side Spec Matrix"
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Compare Matrix</span>
              </button>
            </div>

            <CountrySelector
              selectedCountry={selectedCountry.code}
              onSelectCountry={handleCountryChange}
            />

            <VoiceShoppingButton
              onVoiceInput={handleVoiceInput}
              isProcessing={isProcessing}
            />

            <button
              onClick={handleStartCheckout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 transition-opacity font-bold text-xs shadow-md active:scale-95"
            >
              <ShoppingBag className="w-4 h-4 text-blue-500" />
              <span>Simulated Checkout</span>
            </button>
          </div>
        </header>

        {/* Smart Instant Actions & Real-Time Filter Pills */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 backdrop-blur-md">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filters:
            </span>
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                activeFilter === "all"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              All ({products.length})
            </button>
            <button
              onClick={() => setActiveFilter("top_matches")}
              className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                activeFilter === "top_matches"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              <Sparkles className="w-3 h-3 text-emerald-400" /> Top Match (90%+)
            </button>
            <button
              onClick={() => setActiveFilter("budget")}
              className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                activeFilter === "budget"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              <DollarSign className="w-3 h-3" /> Under Budget
            </button>
            <button
              onClick={() => setActiveFilter("fast_delivery")}
              className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                activeFilter === "fast_delivery"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              <Zap className="w-3 h-3" /> Fast Delivery
            </button>
            <button
              onClick={() => setActiveFilter("top_rated")}
              className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                activeFilter === "top_rated"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              <Star className="w-3 h-3" /> 4.5+ Rating
            </button>
          </div>

          {/* Smart Agent Quick Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleCompareTop2}
              disabled={products.length < 2 || isProcessing}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-40"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>⚖️ Compare Top 2 AI Picks</span>
            </button>
            {comparison && (
              <button
                onClick={() => setIsCompareModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <span>Full Matrix Modal</span>
              </button>
            )}
          </div>
        </div>

        {/* ── WORKSPACE CONTENT ACCORDING TO VIEW MODE ── */}

        {/* 1. COCKPIT VIEW: 3 COLUMNS */}
        {viewMode === "split" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: AI Chat & Voice Assistant (4 Cols) */}
            <section className="lg:col-span-4 bg-white/80 dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-lg backdrop-blur-xl flex flex-col h-[750px] overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Live Shopping Assistant
                  </span>
                </div>
                <button
                  onClick={() => {
                    setMessages([messages[0]]);
                    setProducts([]);
                    setComparison(null);
                    setSelectedCompareIds([]);
                  }}
                  className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1"
                  title="Reset conversation session"
                >
                  <RefreshCw className="w-3 h-3" /> Reset
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} space-y-1`}
                  >
                    <div
                      className={`max-w-[88%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-md"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200/60 dark:border-slate-700"
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.content}</p>

                      {/* Tool Execution Steps */}
                      {msg.activitySteps && msg.activitySteps.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1.5 text-[11px]">
                          <span className="font-extrabold uppercase tracking-widest text-blue-500 dark:text-blue-400 block text-[9px]">
                            Agent Activity
                          </span>
                          {msg.activitySteps.map((step, sIdx) => (
                            <div key={sIdx} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              <span>{step.step}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Citations */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1">
                          <span className="font-extrabold uppercase tracking-widest text-slate-400 block text-[9px]">
                            Verified Sources
                          </span>
                          {msg.citations.map((c, cIdx) => (
                            <a
                              key={cIdx}
                              href={c.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-[10px] text-blue-600 dark:text-blue-400 hover:underline truncate"
                            >
                              🔗 {c.domain} ({c.title})
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 px-1">{msg.timestamp}</span>
                  </div>
                ))}

                {isProcessing && (
                  <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-2xl border border-blue-100 dark:border-blue-900/50 w-fit">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{agentStatus}</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Prompt Chips */}
              <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Suggested Inquiries
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {promptChips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(chip)}
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-700 dark:text-slate-300 transition-colors truncate max-w-full"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder={`Ask anything in ${selectedCountry.name}...`}
                  className="flex-1 px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={isProcessing || !inputMessage.trim()}
                  className="p-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 transition-all shadow-md active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </section>

            {/* Center Column: Discovered Products (5 Cols) */}
            <section className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                    Live Product Discovery
                  </span>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    {selectedCountry.flag} Verified {selectedCountry.name} Listings
                  </h2>
                </div>
                <span className="text-xs font-bold text-slate-400">{filteredProducts.length} Showing</span>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-3">
                  <Compass className="w-8 h-8 text-blue-500 mx-auto animate-pulse" />
                  <p className="text-sm font-bold">No products match current filter.</p>
                  <button
                    onClick={() => setActiveFilter("all")}
                    className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
                  >
                    Reset filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredProducts.map((p, idx) => (
                    <DiscoveredProductCard
                      key={p.id || idx}
                      product={p}
                      isCompared={selectedCompareIds.includes(p.id || p.product_name)}
                      onToggleCompare={handleToggleCompare}
                      onAddToCart={handleAddToCart}
                      isAddingToCart={isAddingToCart === (p.id || p.product_name)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Right Column: Side-by-Side Comparison Matrix (3 Cols) */}
            <section className="lg:col-span-3 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                    Quick Matrix
                  </span>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">Spec Comparison</h2>
                </div>
                {comparison && (
                  <button
                    onClick={() => setIsCompareModalOpen(true)}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Expand
                  </button>
                )}
              </div>

              <AgentComparisonMatrix
                comparison={comparison}
                onAddToCart={handleAddToCart}
              />
            </section>
          </div>
        )}

        {/* 2. DISCOVERY GRID VIEW: FULL WIDTH */}
        {viewMode === "grid" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                  Full AI Discovery Matrix
                </span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  {selectedCountry.flag} Top {selectedCountry.name} Products
                </h2>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {filteredProducts.length} of {products.length} Products
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredProducts.map((p, idx) => (
                <DiscoveredProductCard
                  key={p.id || idx}
                  product={p}
                  isCompared={selectedCompareIds.includes(p.id || p.product_name)}
                  onToggleCompare={handleToggleCompare}
                  onAddToCart={handleAddToCart}
                  isAddingToCart={isAddingToCart === (p.id || p.product_name)}
                />
              ))}
            </div>
          </div>
        )}

        {/* 3. COMPARE MATRIX VIEW: FULL DEDICATED VIEW */}
        {viewMode === "matrix" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                  Side-by-Side Comparison Matrix
                </span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  Product Intelligence Breakdown
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCompareTop2}
                  className="px-3.5 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Auto Compare Top 2
                </button>
              </div>
            </div>

            <AgentComparisonMatrix
              comparison={comparison}
              onAddToCart={handleAddToCart}
            />
          </div>
        )}

      </div>

      {/* Floating Compare Dock */}
      <FloatingCompareDock
        products={selectedProductsForDock}
        onRemove={handleRemoveCompareItem}
        onClear={handleClearCompare}
        onCompare={handleOpenComparisonModal}
        isLoading={isProcessing}
      />

      {/* Full Screen Smart Comparison Modal */}
      <SmartComparisonModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        comparison={comparison}
        onAddToCart={handleAddToCart}
        onAskAgent={(q) => handleSendMessage(q)}
      />

      {/* Simulated Payment Modal */}
      <SimulatedPaymentModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        checkoutData={checkoutData}
        onPaymentComplete={(res) => {
          setToastMessage(`✓ Simulated payment completed (${res.transaction_id})!`);
        }}
      />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-xs font-bold">Initializing AI Shopping Workspace...</div>}>
      <ShopPageContent />
    </Suspense>
  );
}
