"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "../store/useAuthStore";
import { useCartStore } from "../store/useCartStore";
import {
  ShoppingBag,
  Heart,
  User,
  Sun,
  Moon,
  LogOut,
  Grid,
  Menu,
  X,
  Sparkles,
  Compass,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { items } = useCartStore();
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDarkMode(false);
    } else {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDarkMode(true);
    }
  };

  const totalItems = items.reduce((acc, curr) => acc + curr.quantity, 0);

  const isActive = (path: string) => {
    if (path === "/shop?mode=ai") {
      return pathname === "/shop";
    }
    return pathname === path;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Main Floating Navbar Capsule */}
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800 shadow-[0_4px_25px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.4)] rounded-full mt-3 sm:mt-4 px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between transition-colors">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-2.5 group flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950 flex items-center justify-center font-black text-xs tracking-tighter shadow-md group-hover:scale-105 transition-transform border border-slate-200 dark:border-slate-800">
              MK
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center">
              MK <span className="font-light text-blue-600 dark:text-blue-400 ml-1">SHOP</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[9px] uppercase bg-blue-600/10 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300 px-2 py-0.5 rounded-full font-mono font-black tracking-wider border border-blue-200/80 dark:border-blue-800/80">
              <Sparkles className="w-2.5 h-2.5" /> AI
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-7">
            <Link
              href="/shop"
              className={`text-sm font-bold transition-colors ${
                pathname === "/shop"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              Shop
            </Link>

            <Link
              href="/shop?mode=ai"
              className="text-xs font-black px-3 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/80 hover:bg-blue-500/20 dark:hover:bg-blue-500/30 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Search & Compare</span>
            </Link>

            <Link
              href="/categories"
              className={`text-sm font-bold transition-colors ${
                pathname === "/categories"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              Categories
            </Link>

            {user?.role === "admin" && (
              <Link
                href="/admin"
                className="text-xs font-black px-2.5 py-1 rounded-full bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center gap-1 hover:opacity-85"
              >
                <Grid className="w-3.5 h-3.5" /> Admin Panel
              </Link>
            )}
          </div>

          {/* Right Controls & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Light / Dark Mode"
              aria-label="Toggle theme"
            >
              {mounted && darkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 dark:text-slate-200" />
              )}
            </button>

            {/* Wishlist Link */}
            {isAuthenticated && (
              <Link
                href="/wishlist"
                className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Wishlist"
              >
                <Heart className="w-4 h-4" />
              </Link>
            )}

            {/* Shopping Cart Link */}
            <Link
              href="/cart"
              className="relative p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-[9px] font-black shadow-sm">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Auth Menu */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                <Link
                  href="/profile"
                  className="flex items-center gap-1.5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-700 dark:text-slate-200" />
                  <span className="hidden sm:inline text-xs font-bold text-slate-800 dark:text-slate-100 max-w-[80px] truncate">
                    {user?.first_name || "Profile"}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                className="text-xs font-black px-4 py-2 bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 rounded-full transition-all shadow-sm active:scale-95"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 p-4 rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800 shadow-xl space-y-2 animate-in fade-in slide-in-from-top-2">
            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Shop Catalog
            </Link>
            <Link
              href="/shop?mode=ai"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> AI Search & Compare
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider">Live</span>
            </Link>
            <Link
              href="/categories"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Categories
            </Link>
            {user?.role === "admin" && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-2xl text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30"
              >
                Admin Panel
              </Link>
            )}
          </div>
        )}

      </div>
    </nav>
  );
}
