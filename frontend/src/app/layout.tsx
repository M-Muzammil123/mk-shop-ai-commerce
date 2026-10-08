import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';

export const metadata: Metadata = {
  title: 'MK E-Commerce AI — Intelligent Shopping Platform',
  description:
    'Production AI-powered commercial marketplace with multi-turn shopping agents, automated spec comparison, review intelligence, and cross-border regional pricing.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 antialiased selection:bg-indigo-500 selection:text-white pb-14 md:pb-0">
        <Providers>
          <React.Suspense fallback={<div className="h-16 border-b border-zinc-200 dark:border-zinc-800" />}>
            <Navbar />
          </React.Suspense>
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
          <React.Suspense fallback={null}>
            <MobileBottomNav />
          </React.Suspense>
        </Providers>
      </body>
    </html>
  );
}
