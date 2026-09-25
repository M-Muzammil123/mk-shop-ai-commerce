"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Heart, ShoppingBag, Check, BarChart2, Zap } from "lucide-react";
import { useCartStore } from "../../store/useCartStore";
import { useAuthStore } from "../../store/useAuthStore";
import { toast } from "sonner";

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compare_at_price?: number | null;
    sku?: string;
    is_featured?: boolean;
    match_score?: number;
    match_reasons?: string[];
    images?: { image_url: string; is_primary?: boolean }[];
  };
  isCompared?: boolean;
  onToggleCompare?: (id: string) => void;
  showParticles?: boolean;
}

export function ProductCard({
  product,
  isCompared = false,
  onToggleCompare,
  showParticles = false,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart, wishlist, toggleWishlist } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const isWished = wishlist.some((item) => item.product_id === product.id);

  const primaryImage =
    product.images?.find((img) => img.is_primary)?.image_url ||
    product.images?.[0]?.image_url ||
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500";

  const secondaryImage =
    product.images?.[1]?.image_url || primaryImage;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product as any, 1, isAuthenticated);
    setIsAdded(true);
    toast.success(`Added ${product.name} to cart!`);
    setTimeout(() => setIsAdded(false), 1800);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Please sign in to save items to your wishlist");
      return;
    }
    toggleWishlist(product as any, isAuthenticated);
  };

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 350, damping: 26 }}
      className="group relative glass-premium rounded-3xl overflow-hidden flex flex-col justify-between h-full border border-gray-200/70 dark:border-gray-800/80 shadow-md hover:shadow-2xl transition-shadow duration-300"
    >
      {/* 1. Subtle AI Particle Glow Around Product on Hover / Featured */}
      {(isHovered || showParticles || product.is_featured) && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 0.8 : 0.3 }}
            transition={{ duration: 0.4 }}
            className="absolute -top-12 -right-12 w-36 h-36 bg-blue-500/10 dark:bg-blue-400/10 rounded-full blur-2xl"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 0.6 : 0.2 }}
            transition={{ duration: 0.4 }}
            className="absolute -bottom-12 -left-12 w-36 h-36 bg-indigo-500/10 dark:bg-purple-400/10 rounded-full blur-2xl"
          />

          {/* Floating particle sparkles */}
          {isHovered && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: [0, 1, 0], y: [-5, -20] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute top-6 right-8 text-blue-400"
              >
                ✦
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: [0, 1, 0], y: [-5, -18] }}
                transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }}
                className="absolute bottom-16 left-6 text-purple-400 text-xs"
              >
                ✦
              </motion.div>
            </>
          )}
        </div>
      )}

      {/* 2. Top Badges & Wishlist Action */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
        {/* Animated AI Match Badge */}
        {product.match_score ? (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-blue-600/90 text-white text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full shadow-lg backdrop-blur-md flex items-center gap-1 border border-blue-400/30"
          >
            <Sparkles className="w-3 h-3 animate-pulse" /> ✦ AI MATCH {product.match_score}%
          </motion.span>
        ) : product.is_featured ? (
          <span className="bg-black/90 text-white dark:bg-white/90 dark:text-black text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full shadow-md backdrop-blur-md flex items-center gap-1">
            ✦ AI PICK
          </span>
        ) : (
          <span />
        )}

        {/* Animated Wishlist Button */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={handleWishlist}
          className={`p-2.5 rounded-full backdrop-blur-md pointer-events-auto shadow-md transition-all ${
            isWished
              ? "bg-red-500 text-white"
              : "bg-white/80 dark:bg-black/80 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800"
          }`}
          aria-label="Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWished ? "fill-white" : ""}`} />
        </motion.button>
      </div>

      {/* 3. Product Image Showcase with Light Sweep & Smooth Image Swap */}
      <Link
        href={`/product/${product.slug}`}
        className="block relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-900 z-10"
      >
        {/* Primary & Secondary Image Swap */}
        <motion.img
          src={isHovered && secondaryImage ? secondaryImage : primaryImage}
          alt={product.name}
          animate={{ scale: isHovered ? 1.04 : 1 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="object-cover w-full h-full"
        />

        {/* Light Sweep Effect on Hover */}
        {isHovered && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none"
          />
        )}
      </Link>

      {/* 4. Details & Progressive Match Checkmarks */}
      <div className="p-6 space-y-3 flex-grow flex flex-col justify-between z-10">
        <div>
          <Link
            href={`/product/${product.slug}`}
            className="font-extrabold text-base line-clamp-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-gray-950 dark:text-white"
          >
            {product.name}
          </Link>
          <p className="text-lg font-black mt-1 text-gray-950 dark:text-white">
            ${product.price.toFixed(2)}
            {product.compare_at_price && (
              <span className="text-xs line-through text-gray-400 font-semibold ml-2">
                ${product.compare_at_price.toFixed(2)}
              </span>
            )}
          </p>

          {/* AI Match Reasons Checkmarks */}
          {product.match_reasons && product.match_reasons.length > 0 && (
            <div className="space-y-1 pt-2">
              {product.match_reasons.slice(0, 2).map((reason, idx) => (
                <span key={idx} className="block text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {reason}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 5. Quick Actions Bar */}
        <div className="pt-2 flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleAddToCart}
            className={`flex-grow py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm ${
              isAdded
                ? "bg-emerald-600 text-white"
                : "bg-black text-white dark:bg-white dark:text-black hover:opacity-90"
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" /> Added to Cart
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
              </>
            )}
          </motion.button>

          {onToggleCompare && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={(e) => {
                e.preventDefault();
                onToggleCompare(product.id);
              }}
              className={`p-3 rounded-2xl border text-xs font-bold transition-colors ${
                isCompared
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
              title="Compare"
            >
              <BarChart2 className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
