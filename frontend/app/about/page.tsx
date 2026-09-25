"use client";

import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Zap, Layers, Cpu, Database } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  const stack = [
    { name: "Next.js 15 App Router", role: "Frontend & WebGL Render", icon: Layers, desc: "React Three Fiber rendering context, server-side pre-fetching, and fast client-side state navigation." },
    { name: "FastAPI Backend", role: "AI Core & Services", icon: Cpu, desc: "REST endpoints, recommendation similarity vectors, and robust security authentication services." },
    { name: "Supabase PostgreSQL", role: "Data Infrastructure", icon: Database, desc: "17-table schema, native Row-Level Security (RLS), and database triggers sync." },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      
      {/* Title Header Section */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 text-xs font-semibold"
        >
          <Sparkles className="w-3.5 h-3.5" /> Next-Gen AI Architecture
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight"
        >
          Behind the{" "}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent dark:from-white dark:to-gray-400">
            Aura Showroom
          </span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-sm sm:text-base text-gray-500 dark:text-gray-450 leading-relaxed"
        >
          Aura is built on clean-architecture guidelines, merging WebGL 3D design and machine learning systems to deliver a premium retail catalog.
        </motion.p>
      </div>

      {/* Grid of Key Pillars */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
      >
        <motion.div variants={itemVariants} className="glass-premium p-8 rounded-[36px] flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Interactive 3D Engine</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Explore products in full 3D detail. Built using React Three Fiber, Drei, and GSAP camera pathways, allowing customers to manipulate and customize catalog designs.
            </p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-premium p-8 rounded-[36px] flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">AI Product Pairing</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Integrated recommendation engine uses cosine similarity calculations on customer activity logs, cart actions, and reviews to generate live feeds.
            </p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-premium p-8 rounded-[36px] flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Supabase Infrastructure</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Secure multi-tenant Row-Level Security (RLS) handles address syncs, payment triggers, and notifications, protected by HMAC JWT verification.
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Tech Stack Diagram Section */}
      <div className="glass p-8 md:p-12 rounded-[48px] relative overflow-hidden mb-12">
        <div className="max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">Production-Ready Tech Stack</h2>
          <p className="text-xs text-gray-500 leading-relaxed mb-8">
            Engineered with modern tools for optimal performance, fast Time-To-Interactive (TTI), and SEO search visibility indexing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stack.map((item, index) => (
            <div key={index} className="bg-white/40 dark:bg-black/20 p-6 rounded-3xl border border-gray-150 dark:border-gray-850 space-y-4">
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-blue-500" />
                <div>
                  <h4 className="text-sm font-bold">{item.name}</h4>
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{item.role}</span>
                </div>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
