'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useCountryStore } from '@/store/country-store';
import { useCartUIStore } from '@/store/cart-store';
import { useCompareStore } from '@/store/compare-store';
import { useQuery } from '@tanstack/react-query';
import { cartApi } from '@/lib/api/cart';
import { CountrySelectorModal } from './CountrySelectorModal';
import { NotificationsPopover } from './NotificationsPopover';
import {
  Sparkles,
  ShoppingBag,
  Layers,
  Search,
  User,
  Menu,
  X,
  LogOut,
  ShieldAlert,
  ChevronDown,
  Package,
  ArrowRight,
  Bot,
  LayoutDashboard,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, logout, isLoading: authLoading } = useAuthStore();
  const { currentCountry } = useCountryStore();
  const { openCart } = useCartUIStore();
  const { items: compareItems } = useCompareStore();

  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
  }

  // Live cart query - only executed if user is logged in
  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.getCart,
    enabled: !!token,
  });

  const cartCount = cart?.total_items || 0;
  const compareCount = compareItems.length;

  const handleHeaderSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!headerSearch.trim()) return;
    router.push(`/shop?search=${encodeURIComponent(headerSearch.trim())}`);
    setHeaderSearch('');
  };

  const isAuthenticated = !authLoading && !!token;

  // -------------------------------------------------------------
  // 1. PUBLIC MARKETING NAVBAR (When NOT authenticated)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    const publicLinks = [
      { href: '/', label: 'Home' },
      { href: '/shop', label: 'Shop' },
      {
        href: '/ai',
        label: 'AI Shopping',
        isAi: true,
      },
      {
        href: '/compare',
        label: 'Compare',
        badge: compareCount > 0 ? compareCount : null,
      },
    ];

    return (
      <>
        <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-md transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            {/* Left: Brand */}
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-zinc-950 via-zinc-800 to-indigo-950 dark:from-white dark:via-zinc-200 dark:to-indigo-200 text-white dark:text-zinc-950 flex items-center justify-center font-black text-lg shadow-md group-hover:scale-105 transition-transform">
                  MK
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-base tracking-tight text-zinc-900 dark:text-white leading-tight">
                    MK <span className="text-indigo-600 dark:text-indigo-400">AI</span>
                  </span>
                  <span className="text-[10px] tracking-wider uppercase font-semibold text-zinc-400">
                    Shopping Platform
                  </span>
                </div>
              </Link>

              {/* Desktop Center Links */}
              <nav className="hidden md:flex items-center gap-1">
                {publicLinks.map((link) => {
                  const isActive = pathname === link.href;
                  if (link.isAi) {
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`relative px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ml-1 ${
                          isActive
                            ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-sm'
                            : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
                        }`}
                      >
                        <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                        {link.label}
                      </Link>
                    );
                  }

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors relative ${
                        isActive
                          ? 'text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800/80 font-semibold'
                          : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                      }`}
                    >
                      {link.label}
                      {link.badge && (
                        <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right: Public Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Country Selector */}
              <button
                onClick={() => setIsCountryModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors"
                title="Select Country & Currency"
              >
                <span className="text-base">{currentCountry.flag}</span>
                <span className="hidden sm:inline font-mono">{currentCountry.currency}</span>
                <ChevronDown className="h-3 w-3 text-zinc-400" />
              </button>

              <div className="hidden sm:flex items-center gap-2 border-l border-zinc-200 dark:border-zinc-800 pl-3">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="font-semibold text-xs">
                    Log In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button
                    variant="primary"
                    size="sm"
                    className="font-bold text-xs rounded-xl shadow-sm gap-1.5"
                  >
                    Get Started <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

              {/* Mobile menu trigger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-4 space-y-2">
              {publicLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2 rounded-xl text-sm font-medium ${
                    pathname === link.href
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-2">
                <Link href="/auth/login" className="w-full">
                  <Button variant="outline" size="md" className="w-full">
                    Log In
                  </Button>
                </Link>
                <Link href="/auth/register" className="w-full">
                  <Button variant="primary" size="md" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </header>

        <CountrySelectorModal
          isOpen={isCountryModalOpen}
          onClose={() => setIsCountryModalOpen(false)}
        />
      </>
    );
  }

  // -------------------------------------------------------------
  // 2. AUTHENTICATED APPLICATION HEADER (When logged in)
  // -------------------------------------------------------------
  const authLinks = [
    { href: '/app', label: 'Home', icon: LayoutDashboard },
    { href: '/ai', label: 'AI Shopping', isAi: true, icon: Bot },
    { href: '/shop', label: 'Shop', icon: ShoppingBag },
    {
      href: '/compare',
      label: 'Compare',
      badge: compareCount > 0 ? compareCount : null,
      icon: Layers,
    },
    { href: '/orders', label: 'Orders', icon: Package },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200/90 dark:border-zinc-800/90 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Brand with Application Indicator */}
          <div className="flex items-center gap-4 lg:gap-6 shrink-0">
            <Link href="/app" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                MK
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-zinc-900 dark:text-white leading-tight">
                    MK
                  </span>
                  <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    Workspace
                  </span>
                </div>
                <span className="text-[10px] font-medium text-zinc-400">
                  {user?.role === 'admin' ? 'Admin Mode' : 'AI Copilot Active'}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {authLinks.map((link) => {
                const isActive = pathname === link.href;
                if (link.isAi) {
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`relative px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ml-1 ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-sm'
                          : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
                      }`}
                    >
                      <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                      {link.label}
                    </Link>
                  );
                }

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors relative flex items-center gap-1.5 ${
                      isActive
                        ? 'text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800/80 font-semibold'
                        : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                    }`}
                  >
                    {link.label}
                    {link.badge && (
                      <span className="ml-1 px-1.5 py-0.2 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Center Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xs xl:max-w-md mx-2">
            <form onSubmit={handleHeaderSearchSubmit} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search products or ask AI..."
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-4 rounded-xl text-xs bg-zinc-100/80 dark:bg-zinc-900 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none transition-all"
              />
            </form>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Country Selector Button */}
            <button
              onClick={() => setIsCountryModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors"
              title="Select Country & Currency"
            >
              <span className="text-base">{currentCountry.flag}</span>
              <span className="hidden sm:inline font-mono text-[11px]">
                {currentCountry.currency}
              </span>
              <ChevronDown className="h-3 w-3 text-zinc-400" />
            </button>

            {/* Notifications Popover */}
            <NotificationsPopover />

            {/* Cart Trigger with live badge */}
            <button
              onClick={openCart}
              className="relative p-2 rounded-xl text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Shopping Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {user?.first_name ? user.first_name[0].toUpperCase() : 'U'}
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-zinc-400 hidden sm:block" />
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800">
                    <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                      {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : 'User'}
                    </p>
                    <p className="text-[11px] text-zinc-400 truncate">{user?.email}</p>
                    {user?.role === 'admin' && (
                      <span className="mt-1 inline-block px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                        Administrator
                      </span>
                    )}
                  </div>

                  <div className="py-1">
                    <Link
                      href="/app"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 font-medium"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5 text-zinc-400" />
                      App Home
                    </Link>
                    <Link
                      href="/orders"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 font-medium"
                    >
                      <Package className="h-3.5 w-3.5 text-zinc-400" />
                      My Orders
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 font-medium"
                    >
                      <User className="h-3.5 w-3.5 text-zinc-400" />
                      Account Settings
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 font-semibold"
                      >
                        <ShieldAlert className="h-3.5 w-3.5 text-purple-600" />
                        Admin Dashboard
                      </Link>
                    )}
                  </div>

                  <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      onClick={() => {
                        logout();
                        router.push('/');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium"
                    >
                      <LogOut className="h-3.5 w-3.5 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu for authenticated users */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-4 space-y-3">
            <form onSubmit={handleHeaderSearchSubmit} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search products or ask AI..."
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-xl text-xs bg-zinc-100 dark:bg-zinc-900 border border-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none"
              />
            </form>

            <div className="space-y-1">
              {authLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium ${
                    pathname === link.href
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}

              <Link
                href="/cart"
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400"
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="h-4 w-4" />
                  Cart
                </div>
                {cartCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-xs font-bold">
                    {cartCount} items
                  </span>
                )}
              </Link>

              <Link
                href="/profile"
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400"
              >
                <User className="h-4 w-4" />
                Profile Settings
              </Link>
            </div>

            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => {
                  logout();
                  router.push('/');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-600 font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      <CountrySelectorModal
        isOpen={isCountryModalOpen}
        onClose={() => setIsCountryModalOpen(false)}
      />
    </>
  );
}
