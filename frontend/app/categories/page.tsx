"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { Laptop, ShoppingBag, Shirt, Home, ArrowRight, Grid, Loader2 } from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api.get("/products/categories");
        setCategories(res.data || []);
      } catch (err) {
        console.error("Failed to load backend categories, serving static list.", err);
        // Fallback categories
        setCategories([
          { id: 1, name: "Electronics", slug: "electronics", description: "Premium design electronic items and next-gen tech accessories." },
          { id: 2, name: "Accessories", slug: "accessories", description: "Handcrafted personal accessories, carry goods, and leather bags." },
          { id: 3, name: "Apparel", slug: "apparel", description: "Minimalist style luxury garments, curated fabrics, and clean silhouettes." },
          { id: 4, name: "Home Decor", slug: "home-decor", description: "Contemporary workspace aesthetics, desk organizers, and statement furniture." }
        ]);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  const iconMap: Record<string, any> = {
    electronics: Laptop,
    accessories: ShoppingBag,
    apparel: Shirt,
    "home-decor": Home,
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      
      {/* Title */}
      <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 text-xs font-semibold">
          <Grid className="w-3.5 h-3.5" /> Curated Collections
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Browse by{" "}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent dark:from-white dark:to-gray-400">
            Category
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
          Select a category to filter our smart-pair catalog entries.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {categories.map((cat) => {
            const IconComponent = iconMap[cat.slug] || Grid;
            return (
              <motion.div
                key={cat.id}
                variants={cardVariants}
                className="glass-premium p-8 rounded-[36px] flex flex-col justify-between hover:scale-[1.03] transition-all duration-300 group hover:shadow-xl cursor-pointer"
              >
                <Link href={`/shop?category=${cat.slug}`} className="h-full flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold group-hover:text-blue-500 transition-colors">{cat.name}</h3>
                      <p className="text-[11px] text-gray-500 leading-relaxed mt-2 line-clamp-3">
                        {cat.description || "Browse premium items matching your high-end design aspirations."}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:gap-3 transition-all pt-4">
                    Explore Catalog <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
      
    </div>
  );
}
