"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useCartStore } from "../store/useCartStore";
import { ShoppingBag, Heart, User, Sun, Moon, LogOut, Grid } from "lucide-react";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { items, fetchCart } = useCartStore();
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Sync theme on mount
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
    
    // Initial fetch of cart items if logged in
    fetchCart(isAuthenticated);
  }, [isAuthenticated, fetchCart]);

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

  if (!mounted) return null;

  const totalItems = items.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="glass shadow-sm rounded-full mt-4 px-6 py-3 flex items-center justify-between">
          
          {/* MK SHOP Monogram Logo */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-black text-xs tracking-tighter shadow-md group-hover:scale-105 transition-transform border border-white/20">
              MK
            </div>
            <span className="text-lg font-black tracking-tight bg-gradient-to-r from-gray-950 via-gray-800 to-gray-600 bg-clip-text text-transparent dark:from-white dark:via-gray-200 dark:to-gray-400">
              MK <span className="font-light text-blue-600 dark:text-blue-400">SHOP</span>
            </span>
            <span className="text-[9px] uppercase bg-blue-600/10 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 px-1.5 py-0.5 rounded font-mono font-bold tracking-widest border border-blue-200 dark:border-blue-800">
              ✦ AI
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/shop" className="text-sm font-semibold hover:text-blue-600 transition-colors">
              Shop
            </Link>
            <Link href="/shop?mode=ai" className="text-sm font-semibold hover:text-blue-600 transition-colors flex items-center gap-1 text-blue-600 dark:text-blue-400">
              AI Search
            </Link>
            <Link href="/categories" className="text-sm font-medium hover:text-blue-500 transition-colors">
              Categories
            </Link>
            {user?.role === "admin" && (
              <Link href="/admin" className="text-sm font-semibold text-red-500 dark:text-red-400 flex items-center gap-1 hover:opacity-80">
                <Grid className="w-4 h-4" /> Admin Panel
              </Link>
            )}
          </div>

          {/* User Controls */}
          <div className="flex items-center space-x-4">
            
            {/* Theme Toggle */}
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {darkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-gray-600" />}
            </button>

            {/* Wishlist Link */}
            {isAuthenticated && (
              <Link href="/wishlist" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Heart className="w-4 h-4" />
              </Link>
            )}

            {/* Shopping Cart Drawer Link */}
            <Link href="/cart" className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <ShoppingBag className="w-4 h-4" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-[9px] font-bold">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Auth Menu */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-2 border-l border-gray-200 dark:border-gray-800">
                <Link href="/profile" className="flex items-center gap-1.5 hover:opacity-85">
                  <User className="w-4 h-4" />
                  <span className="text-xs font-semibold max-w-[80px] truncate">
                    {user?.first_name || "Profile"}
                  </span>
                </Link>
                <button onClick={logout} className="p-1.5 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link href="/auth" className="text-xs font-semibold px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-full hover:opacity-90">
                Sign In
              </Link>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
}
