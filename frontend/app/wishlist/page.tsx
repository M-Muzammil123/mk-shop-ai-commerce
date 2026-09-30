"use client";

import { useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useCartStore } from "../../store/useCartStore";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingCart, Trash2, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/format";

export default function WishlistPage() {
  const { isAuthenticated } = useAuthStore();
  const { wishlist, fetchWishlist, toggleWishlist, addToCart, loading } = useCartStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated, fetchWishlist]);

  const handleRemove = async (product: any) => {
    try {
      await toggleWishlist(product, isAuthenticated);
      toast.success("Removed from wishlist");
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  const handleMoveToCart = async (product: any) => {
    try {
      await addToCart(product, 1, isAuthenticated);
      await toggleWishlist(product, isAuthenticated);
      toast.success("Moved item to shopping cart!");
    } catch (err) {
      toast.error("Failed to add to cart");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 space-y-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
          <Heart className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Sign In Required</h1>
          <p className="text-xs text-gray-500 max-w-sm">
            Please log in to your account to save products and synchronize your personal wishlist items.
          </p>
        </div>
        <Link href="/auth?redirect=/wishlist" className="px-8 py-3 bg-black text-white dark:bg-white dark:text-black rounded-full font-semibold text-xs flex items-center gap-2 hover:opacity-90 transition-all">
          Sign In <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-12 border-b border-gray-100 dark:border-gray-900 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-2">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" /> My Wishlist
          </h1>
          <p className="text-xs text-gray-500 mt-1">Items saved for smart-pairing recommendation insights.</p>
        </div>
        
        <Link href="/shop" className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 hover:underline">
          Continue Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {loading && wishlist.length === 0 ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : wishlist.length === 0 ? (
        <div className="glass-premium p-12 rounded-[36px] text-center max-w-md mx-auto space-y-6">
          <p className="text-xs italic text-gray-550">
            Your wishlist is empty. Add items from the catalog.
          </p>
          <Link href="/shop" className="inline-block px-8 py-3 bg-black text-white dark:bg-white dark:text-black rounded-full text-xs font-semibold hover:opacity-90 transition-all">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {wishlist.map((item) => {
              const product = item.product;
              const imageUrl = product.images?.[0]?.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500";
              
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="glass-premium p-6 rounded-[36px] flex flex-col justify-between hover:shadow-xl transition-shadow relative group"
                >
                  <div className="space-y-4">
                    {/* Image */}
                    <div className="aspect-square w-full rounded-2xl overflow-hidden relative bg-gray-50 dark:bg-black/40">
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Delete button absolute */}
                      <button
                        onClick={() => handleRemove(product)}
                        className="absolute top-4 right-4 p-2.5 rounded-full bg-white/80 dark:bg-black/60 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 hover:scale-110 transition-all shadow-sm"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-1">
                      <h3 className="font-bold text-base truncate">{product.name}</h3>
                      <p className="text-[10px] font-mono tracking-widest text-gray-400 uppercase">{product.sku}</p>
                    </div>
                  </div>

                  {/* Actions & Price */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-150 dark:border-gray-850">
                    <div>
                      <span className="text-base font-extrabold">${formatPrice(product.price)}</span>
                    </div>

                    <button
                      onClick={() => handleMoveToCart(product)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-semibold flex items-center gap-1.5 hover:scale-[1.03] active:scale-[0.98] transition-all shadow-md"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" /> Move to Cart
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
      
    </div>
  );
}
