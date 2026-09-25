"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Toaster } from "sonner";
import { useAuthStore } from "../store/useAuthStore";
import { useCartStore } from "../store/useCartStore";

import { MKAIAssistantWidget } from "./search/MKAIAssistantWidget";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));
  const { fetchCart } = useCartStore();
  const authIsAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    // Theme restore from local storage
    const savedTheme = localStorage.getItem("theme");
    const root = document.documentElement;
    if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    // Fetch cart whenever auth status updates
    fetchCart(authIsAuthenticated);
  }, [authIsAuthenticated, fetchCart]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
        <Navbar />
        
        {/* Main Content Area */}
        <main className="flex-grow pt-24 pb-12">
          {children}
        </main>

        <MKAIAssistantWidget />
        <Footer />
        <Toaster position="top-right" richColors />
      </div>
    </QueryClientProvider>
  );
}
