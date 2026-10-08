'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useQuery } from '@tanstack/react-query';
import { cartApi } from '@/lib/api/cart';
import {
  Home,
  Bot,
  ShoppingBag,
  User,
  Layers,
  Sparkles,
  LayoutDashboard,
  LogIn,
} from 'lucide-react';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { token, isLoading } = useAuthStore();

  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.getCart,
    enabled: !!token,
  });

  const cartCount = cart?.total_items || 0;

  if (isLoading) return null;

  // Authenticated Mobile Navigation
  if (token) {
    const items = [
      { href: '/app', label: 'Home', icon: LayoutDashboard },
      { href: '/shop', label: 'Shop', icon: ShoppingBag },
      { href: '/ai', label: 'AI Copilot', icon: Bot, isAi: true },
      { href: '/cart', label: 'Cart', icon: ShoppingBag, badge: cartCount },
      { href: '/profile', label: 'Profile', icon: User },
    ];

    return (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-950/95 border-t border-zinc-200/90 dark:border-zinc-800/90 backdrop-blur-lg px-2 py-1.5 flex items-center justify-around shadow-lg">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isAi) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -top-3 flex flex-col items-center group"
              >
                <div
                  className={`h-11 w-11 rounded-2xl flex items-center justify-center shadow-lg transition-transform ${
                    isActive
                      ? 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 text-white scale-110 shadow-indigo-500/30 ring-2 ring-white dark:ring-zinc-950'
                      : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:scale-105'
                  }`}
                >
                  <Sparkles className="h-5 w-5 text-amber-300" />
                </div>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                  AI
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 h-4 w-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  // Public Mobile Navigation
  const publicItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/shop', label: 'Shop', icon: ShoppingBag },
    { href: '/auth/login?next=/ai', label: 'Ask AI', icon: Bot, isAi: true },
    { href: '/compare', label: 'Compare', icon: Layers },
    { href: '/auth/login', label: 'Sign In', icon: LogIn },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-950/95 border-t border-zinc-200/90 dark:border-zinc-800/90 backdrop-blur-lg px-2 py-1.5 flex items-center justify-around shadow-lg">
      {publicItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        if (item.isAi) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative -top-3 flex flex-col items-center group"
            >
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-2 ring-white dark:ring-zinc-950">
                <Sparkles className="h-5 w-5 text-amber-300" />
              </div>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                AI
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
              isActive
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
