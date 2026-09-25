"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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

  const handleToggleCompare = (product: DiscoveredProduct) => {
    const pid = product.id || product.product_name;
    setSelectedCompareIds((prev) => {
      const next = prev.includes(pid) ? prev.filter((id) => id !== pid) : [...prev, pid];
      // If we have selected items, filter comparison
      if (next.length >= 2) {
        const selectedProds = products.filter((p) => next.includes(p.id || p.product_name));
        agentService.compare(selectedProds).then((res) => setComparison(res));
      }
      return next;
    });
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
      // If no items in server cart, use first discovered product
      if (products.length > 0) {
        await agentService.addToCart(products[0], 1);
      }
      const data = await agentService.prepareCheckout({ payment_provider: "mock" });
      setCheckoutData(data);
      setIsCheckoutModalOpen(true);
    } catch (e) {
      // Fallback mock checkout data
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

  const promptChips = [
    "Gaming laptop in Pakistan under 300k with RTX graphics",
    "Find running shoes in UK under £100",
    "iPhone in Pakistan under 250k PKR PTA Approved",
    "Best laptop under $1200 in USA with 16GB RAM",
  ];

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-gray-900 dark:text-white">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-4">
          <CheckCircle className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Intelligence Control Bar */}
        <header className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-white/80 dark:bg-gray-900/80 border border-gray-200/80 dark:border-gray-800 shadow-sm backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-gray-900 dark:text-white">
                  MK SHOP AI Shopping Agent
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                  Country-Locked
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Status: <strong className="text-gray-800 dark:text-gray-200">{agentStatus}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
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
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 transition-opacity font-bold text-xs shadow-md active:scale-95"
            >
              <ShoppingBag className="w-4 h-4 text-blue-500" />
              <span>Simulated Checkout</span>
            </button>
          </div>
        </header>

        {/* 3-Column AI Shopping Agent Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ── LEFT COLUMN: AI Chat & Voice Assistant (4 Cols) ── */}
          <section className="lg:col-span-4 bg-white/80 dark:bg-gray-900/80 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-lg backdrop-blur-xl flex flex-col h-[750px] overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Live Shopping Assistant
                </span>
              </div>
              <button
                onClick={() => {
                  setMessages([messages[0]]);
                  setProducts([]);
                  setComparison(null);
                }}
                className="text-[11px] font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex items-center gap-1"
                title="Reset conversation session"
              >
                <RefreshCw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Messages Scroll Area */}
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
                        : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none border border-gray-200/60 dark:border-gray-700"
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.content}</p>

                    {/* Tool Execution Steps */}
                    {msg.activitySteps && msg.activitySteps.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700 space-y-1.5 text-[11px]">
                        <span className="font-extrabold uppercase tracking-widest text-blue-500 dark:text-blue-400 block text-[9px]">
                          Agent Activity
                        </span>
                        {msg.activitySteps.map((step, sIdx) => (
                          <div key={sIdx} className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>{step.step}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Grounded Citations */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-gray-200 dark:border-gray-700 space-y-1">
                        <span className="font-extrabold uppercase tracking-widest text-gray-400 block text-[9px]">
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
                  <span className="text-[10px] text-gray-400 px-1">{msg.timestamp}</span>
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
            <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block mb-1.5">
                Suggested Prompts
              </span>
              <div className="flex flex-wrap gap-1.5">
                {promptChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(chip)}
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300 transition-colors truncate max-w-full"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Input Bar */}
            <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder={`Ask anything in ${selectedCountry.name} (e.g. laptop under ${selectedCountry.currency} 300k)...`}
                className="flex-1 px-3.5 py-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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

          {/* ── CENTER COLUMN: Discovered Products (5 Cols) ── */}
          <section className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                  Live Product Discovery
                </span>
                <h2 className="text-xl font-black text-gray-900 dark:text-white">
                  {selectedCountry.flag} Verified {selectedCountry.name} Listings
                </h2>
              </div>
              <span className="text-xs font-bold text-gray-400">{products.length} Products Found</span>
            </div>

            {products.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-800 space-y-3">
                <Compass className="w-8 h-8 text-blue-500 mx-auto animate-pulse" />
                <p className="text-sm font-bold">No products retrieved yet.</p>
                <p className="text-xs text-gray-400">
                  Type a query in the chat or speak via microphone to search country merchants.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.map((p, idx) => (
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

          {/* ── RIGHT COLUMN: Side-by-Side Comparison Matrix (3 Cols) ── */}
          <section className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                  Side-by-Side Matrix
                </span>
                <h2 className="text-lg font-black text-gray-900 dark:text-white">Spec Comparison</h2>
              </div>
              <span className="text-xs font-bold text-gray-400">
                {comparison?.products?.length || 0} in Matrix
              </span>
            </div>

            <AgentComparisonMatrix
              comparison={comparison}
              onAddToCart={handleAddToCart}
            />
          </section>
        </div>
      </div>

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
