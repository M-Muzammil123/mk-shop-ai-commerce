'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { agentApi } from '@/lib/api/agent';
import { useCountryStore } from '@/store/country-store';
import { useAuthStore } from '@/store/auth-store';
import { useAIStore, ChatMessage } from '@/store/ai-store';
import { DiscoveredProductCard } from '@/components/shopping/DiscoveredProductCard';
import { AIActivityPanel } from '@/components/ai/AIActivityPanel';
import { VoiceShoppingModal } from '@/components/ai/VoiceShoppingModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  Sparkles,
  Send,
  Mic,
  RotateCcw,
  ShoppingBag,
  ExternalLink,
  Layers,
  ChevronRight,
  Bot,
  Plus,
  Search,
  User,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

function AIShoppingWorkspaceContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const { currentCountry, formatPrice } = useCountryStore();
  const { user } = useAuthStore();
  const {
    sessionId,
    setSessionId,
    messages,
    addMessage,
    isThinking,
    setThinking,
    activitySteps,
    setActivitySteps,
    selectedDiscoveredProducts,
    setSelectedDiscoveredProducts,
    activeComparison,
    setActiveComparison,
    resetChat,
  } = useAIStore();

  const [inputMessage, setInputMessage] = useState('');
  const [sessionSearch, setSessionSearch] = useState('');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [activeTabMobile, setActiveTabMobile] = useState<'chat' | 'results' | 'activity'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch previous sessions list if authenticated
  const { data: previousSessions = [] } = useQuery({
    queryKey: ['agent-sessions'],
    queryFn: agentApi.getSessions,
    enabled: !!user,
  });

  const chatMutation = useMutation({
    mutationFn: (msg: string) => {
      setThinking(true);
      return agentApi.chat({
        message: msg,
        session_id: sessionId || undefined,
        country: currentCountry.code,
        currency: currentCountry.currency,
      });
    },
    onSuccess: (data) => {
      setThinking(false);
      setSessionId(data.session_id);
      setActivitySteps(data.activity_steps || []);

      if (data.products && data.products.length > 0) {
        setSelectedDiscoveredProducts(data.products);
      }
      if (data.comparison) {
        setActiveComparison(data.comparison);
      }

      const botMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString(),
        products: data.products,
        comparison: data.comparison,
        activitySteps: data.activity_steps,
        citations: data.citations,
        nextAction: data.next_action,
        requirements: data.requirements,
      };

      addMessage(botMessage);
    },
    onError: (err) => {
      setThinking(false);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Error connecting to AI Shopping Agent: ${err instanceof Error ? err.message : 'Please try again.'}`,
        timestamp: new Date().toISOString(),
      };
      addMessage(errorMessage);
    },
  });

  const handleSendMessage = useCallback(
    (textToSend?: string) => {
      const text = (textToSend || inputMessage).trim();
      if (!text || isThinking) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text,
        timestamp: new Date().toISOString(),
      };

      addMessage(userMsg);
      setInputMessage('');
      chatMutation.mutate(text);
    },
    [inputMessage, isThinking, addMessage, setInputMessage, chatMutation]
  );

  // Handle initial query from URL search parameters on first load
  const hasSentInitialRef = useRef(false);
  useEffect(() => {
    if (initialQuery && !hasSentInitialRef.current && messages.length === 0) {
      hasSentInitialRef.current = true;
      handleSendMessage(initialQuery);
    }
  }, [initialQuery, messages.length, handleSendMessage]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const starterPrompts = [
    'Find me the best laptop for programming under $1500',
    'Compare iPhone 16 Pro vs Samsung S24 Ultra',
    'I need budget wireless headphones with good bass under $100',
    'Best 4K 144Hz gaming monitors for PS5 and PC',
  ];

  const filteredSessions = previousSessions.filter((s) =>
    s.last_message?.toLowerCase().includes(sessionSearch.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-white dark:bg-zinc-950 overflow-hidden">
      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTabMobile('chat')}
          className={`flex-1 py-1.5 text-center rounded-lg transition-colors ${
            activeTabMobile === 'chat'
              ? 'bg-white dark:bg-zinc-800 shadow-xs text-indigo-600 dark:text-indigo-400'
              : 'text-zinc-500'
          }`}
        >
          Chat Conversation
        </button>
        <button
          onClick={() => setActiveTabMobile('results')}
          className={`flex-1 py-1.5 text-center rounded-lg transition-colors flex items-center justify-center gap-1 ${
            activeTabMobile === 'results'
              ? 'bg-white dark:bg-zinc-800 shadow-xs text-indigo-600 dark:text-indigo-400'
              : 'text-zinc-500'
          }`}
        >
          Discovered Items
          {selectedDiscoveredProducts.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-indigo-600 text-white text-[10px]">
              {selectedDiscoveredProducts.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTabMobile('activity')}
          className={`flex-1 py-1.5 text-center rounded-lg transition-colors ${
            activeTabMobile === 'activity'
              ? 'bg-white dark:bg-zinc-800 shadow-xs text-indigo-600 dark:text-indigo-400'
              : 'text-zinc-500'
          }`}
        >
          Live Agent Traces
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* ========================================================
            1. LEFT PANEL: Chat Sessions & Prompt Starters (Desktop)
           ======================================================== */}
        <aside className="hidden lg:flex lg:col-span-3 border-r border-zinc-200/80 dark:border-zinc-800 flex-col bg-zinc-50/60 dark:bg-zinc-900/40 justify-between overflow-hidden">
          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            {/* Header + New Conversation Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-zinc-900 dark:text-white">
                  Shopping Sessions
                </h3>
              </div>
              <button
                onClick={resetChat}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-semibold shadow-xs transition-colors"
                title="Start a fresh shopping session"
              >
                <Plus className="h-3.5 w-3.5" /> New
              </button>
            </div>

            {/* Session Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search history..."
                value={sessionSearch}
                onChange={(e) => setSessionSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 rounded-lg text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none"
              />
            </div>

            {/* Quick Starter Templates */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
                Quick Starters
              </span>
              <div className="space-y-1">
                {starterPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(prompt)}
                    className="w-full text-left p-2.5 rounded-xl bg-white dark:bg-zinc-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-zinc-200/80 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-between group"
                  >
                    <span className="truncate pr-2 font-medium">{prompt}</span>
                    <ArrowRight className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>

            {/* Real Previous Sessions from Backend */}
            <div className="space-y-1.5 pt-3">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
                Recent Chats
              </span>
              {filteredSessions.length > 0 ? (
                <div className="space-y-1">
                  {filteredSessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => setSessionId(session.id)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex items-center justify-between ${
                        sessionId === session.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <span className="block truncate">
                          {session.title || session.last_message || 'Session'}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-normal">
                          {session.created_at
                            ? new Date(session.created_at).toLocaleDateString()
                            : 'Saved'}
                        </span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-zinc-400 italic px-1">
                  No previous sessions saved yet.
                </p>
              )}
            </div>
          </div>

          {/* User Account Bar at Bottom */}
          <div className="p-3.5 border-t border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user?.first_name ? user.first_name[0].toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <span className="text-xs font-bold text-zinc-900 dark:text-white block truncate">
                  {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : 'Shopper'}
                </span>
                <span className="text-[10px] text-zinc-400 block truncate">{user?.email}</span>
              </div>
            </div>

            <Link
              href="/profile"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              title="Account Settings"
            >
              <User className="h-4 w-4" />
            </Link>
          </div>
        </aside>

        {/* ========================================================
            2. CENTER PANEL: AI Conversation Stream & Composer
           ======================================================== */}
        <main
          className={`col-span-1 lg:col-span-5 flex flex-col bg-white dark:bg-zinc-950 h-full border-r border-zinc-200/80 dark:border-zinc-800 overflow-hidden ${
            activeTabMobile === 'chat' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Top Bar */}
          <div className="h-14 px-4 sm:px-6 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
                    MK Shopping Copilot
                  </h2>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400">
                  {currentCountry.flag} Searching {currentCountry.name} ({currentCountry.currency})
                </p>
              </div>
            </div>

            <button
              onClick={resetChat}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Reset conversation"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Conversation Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12 px-4">
                <div className="h-16 w-16 rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-xl shadow-indigo-500/25">
                  <Sparkles className="h-8 w-8" />
                </div>
                <div className="space-y-2 max-w-md">
                  <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white">
                    What are you shopping for today?
                  </h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Specify your budget, preferred brands, or technical specs. Our autonomous agent will cross-reference verified stores in {currentCountry.name} to find matching products.
                  </p>
                </div>

                {/* Starter Prompt Pills */}
                <div className="flex flex-wrap gap-2 max-w-lg justify-center">
                  {starterPrompts.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(p)}
                      className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 transition-all text-left shadow-xs"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
                  >
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 px-1">
                      <span className="font-bold text-zinc-700 dark:text-zinc-300">
                        {isUser ? (user?.first_name || 'You') : 'MK AI Agent'}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div
                      className={`max-w-[95%] sm:max-w-[90%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium rounded-tr-sm shadow-xs'
                          : 'bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-sm shadow-xs'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>

                      {/* Render Product Cards inside assistant message */}
                      {msg.products && msg.products.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-zinc-200/80 dark:border-zinc-800 space-y-3">
                          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                            Recommended Products ({msg.products.length}):
                          </span>
                          <div className="grid grid-cols-1 gap-2.5">
                            {msg.products.map((prod) => (
                              <div
                                key={prod.id || prod.product_name}
                                className="p-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center gap-3"
                              >
                                {prod.image_url && (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={prod.image_url}
                                    alt={prod.product_name}
                                    className="h-14 w-14 rounded-lg object-cover bg-zinc-100 dark:bg-zinc-800 shrink-0"
                                  />
                                )}
                                <div className="flex-1 min-w-0 text-left">
                                  <h5 className="font-bold text-xs text-zinc-900 dark:text-white truncate">
                                    {prod.product_name}
                                  </h5>
                                  <p className="text-[11px] text-zinc-500 font-mono">
                                    {formatPrice(prod.price)} • {prod.seller}
                                  </p>
                                </div>
                                {prod.source_url && (
                                  <a
                                    href={prod.source_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-indigo-600 shrink-0"
                                    title="View Source"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Display Citations */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-zinc-200/60 dark:border-zinc-800 text-xs">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                            Verified Sources:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.citations.map((cite, i) => (
                              <a
                                key={i}
                                href={cite.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700 font-medium"
                              >
                                <span>{cite.domain || cite.title}</span>
                                <ExternalLink className="h-2.5 w-2.5" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* Thinking status */}
            {isThinking && (
              <div className="flex items-center gap-2.5 text-xs text-indigo-600 dark:text-indigo-400 p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-800/50 max-w-md">
                <Sparkles className="h-4 w-4 animate-spin shrink-0 text-indigo-600" />
                <span className="font-semibold leading-relaxed">
                  Reasoning, filtering reviews & querying verified merchants in {currentCountry.name}...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Message Input Bar */}
          <div className="p-3 sm:p-4 border-t border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Ask MK Copilot about products in ${currentCountry.name}...`}
                disabled={isThinking}
                className="flex-1 h-11 rounded-xl"
              />

              <button
                type="button"
                onClick={() => setIsVoiceModalOpen(true)}
                className="h-11 w-11 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-indigo-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center shrink-0"
                title="Voice Chat"
              >
                <Mic className="h-4 w-4" />
              </button>

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isThinking || !inputMessage.trim()}
                className="h-11 rounded-xl px-4 shrink-0 font-bold"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </main>

        {/* ========================================================
            3. RIGHT PANEL: Discovered Products & Live Agent Activity
           ======================================================== */}
        <section
          className={`col-span-1 lg:col-span-4 border-l border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 p-4 sm:p-6 overflow-y-auto space-y-6 ${
            activeTabMobile === 'results' || activeTabMobile === 'activity'
              ? 'block'
              : 'hidden lg:block'
          }`}
        >
          {/* Live Agent Activity Trace Panel */}
          <AIActivityPanel steps={activitySteps} isThinking={isThinking} />

          {/* Comparison Matrix Preview */}
          {activeComparison && activeComparison.matrix && activeComparison.matrix.length > 0 && (
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-indigo-600" />
                  <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                    Live AI Comparison
                  </h4>
                </div>
                {activeComparison.best_overall_index !== undefined &&
                  activeComparison.best_overall_index !== null && (
                    <Badge variant="success" size="sm">
                      Top Pick: {activeComparison.products[activeComparison.best_overall_index]?.product_name || 'Featured'}
                    </Badge>
                  )}
              </div>

              {activeComparison.ai_summary && (
                <p className="text-xs text-zinc-500 leading-relaxed italic">
                  &ldquo;{activeComparison.ai_summary}&rdquo;
                </p>
              )}

              <Link href="/compare">
                <Button variant="outline" size="sm" className="w-full text-xs mt-2">
                  View Full Specs Table
                </Button>
              </Link>
            </div>
          )}

          {/* Discovered Products Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-sm text-zinc-900 dark:text-white">
                  Discovered Products
                </h4>
                <p className="text-[11px] text-zinc-400">
                  {selectedDiscoveredProducts.length} verified listings found in {currentCountry.name}
                </p>
              </div>

              {selectedDiscoveredProducts.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold font-mono">
                  {selectedDiscoveredProducts.length}
                </span>
              )}
            </div>

            {selectedDiscoveredProducts.length > 0 ? (
              <div className="space-y-4">
                {selectedDiscoveredProducts.map((product) => (
                  <DiscoveredProductCard
                    key={product.id || product.product_name}
                    product={product}
                    sessionId={sessionId || undefined}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
                <ShoppingBag className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mx-auto" />
                <p className="text-xs font-semibold text-zinc-500">
                  No products discovered in this turn yet
                </p>
                <p className="text-[11px] text-zinc-400">
                  Ask the copilot above to search for laptops, shoes, monitors, or phones.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Voice Shopping Modal */}
      <VoiceShoppingModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onResultsReceived={(result) => {
          if (result.transcript) {
            handleSendMessage(result.transcript);
          }
        }}
      />
    </div>
  );
}

export default function AIShoppingPage() {
  return (
    <ProtectedRoute>
      <Suspense
        fallback={
          <div className="h-[calc(100vh-64px)] flex items-center justify-center">
            <div className="h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          </div>
        }
      >
        <AIShoppingWorkspaceContent />
      </Suspense>
    </ProtectedRoute>
  );
}
