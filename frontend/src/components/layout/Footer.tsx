'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Shield, Truck, Cpu } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 text-sm">
      {/* Feature Highlights Banner */}
      <div className="border-b border-zinc-200/80 dark:border-zinc-800/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">
                AI Shopping Copilot
              </h4>
              <p className="text-[11px] text-zinc-500">
                Multi-agent reasoning with spec comparison.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shrink-0">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">
                Verified Merchants
              </h4>
              <p className="text-[11px] text-zinc-500">
                Authentic catalog & cross-border warranty.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shrink-0">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">
                Regional Delivery
              </h4>
              <p className="text-[11px] text-zinc-500">
                Live shipping calculations by country.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 shrink-0">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">
                MCP Tool Gateway
              </h4>
              <p className="text-[11px] text-zinc-500">
                Live currency, stock, & sentiment analytics.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-7 w-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-black text-sm">
              MK
            </div>
            <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-white">
              MK E-COMMERCE AI
            </span>
          </div>
          <p className="text-xs text-zinc-500 max-w-sm leading-relaxed mb-4">
            Next-generation commercial intelligence platform combining deep catalog discovery, MCP tool execution, automated spec matrices, and multi-turn conversational agents.
          </p>
          <div className="text-[11px] text-zinc-400">
            Powered by FastAPI, SQLAlchemy, Google Gemini & Next.js
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-3">
            Shopping
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/shop" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                Catalog Browse
              </Link>
            </li>
            <li>
              <Link href="/ai" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                AI Shopping Copilot
              </Link>
            </li>
            <li>
              <Link href="/compare" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                Product Comparison
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                Shopping Cart
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-3">
            Account
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/orders" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                Track Orders
              </Link>
            </li>
            <li>
              <Link href="/profile" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                Account Settings
              </Link>
            </li>
            <li>
              <Link href="/auth/login" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                Sign In
              </Link>
            </li>
            <li>
              <Link href="/auth/register" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                Create Account
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-3">
            AI Platform
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <span className="text-zinc-500">Gemini 2.5 Flash</span>
            </li>
            <li>
              <span className="text-zinc-500">MCP Multi-Store Gateway</span>
            </li>
            <li>
              <span className="text-zinc-500">Voice Shopping Agent</span>
            </li>
            <li>
              <span className="text-zinc-500">Sentiment Synthesis</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-zinc-200/80 dark:border-zinc-800/80 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p>© 2026 MK E-Commerce AI Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security & Guardrails</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
