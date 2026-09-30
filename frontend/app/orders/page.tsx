"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import api from "../../services/api";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, Eye, Loader2, ArrowRight, Calendar, DollarSign, Tag } from "lucide-react";
import { formatPrice } from "@/lib/format";

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  items: any[];
}

export default function OrdersPage() {
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated]);

  async function loadOrders() {
    setLoading(true);
    try {
      const res = await api.get("/orders");
      setOrders(res.data || []);
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setLoading(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 space-y-6 text-center">
        <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Sign In Required</h1>
          <p className="text-xs text-gray-500 max-w-sm">
            Please log in to your account to check order logs, tracking timelines, and transaction histories.
          </p>
        </div>
        <Link href="/auth?redirect=/orders" className="px-8 py-3 bg-black text-white dark:bg-white dark:text-black rounded-full font-semibold text-xs flex items-center gap-2 hover:opacity-90 transition-all">
          Sign In <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400";
      case "processing":
      case "processing...":
      case "shipped":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400";
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      
      {/* Title */}
      <div className="mb-12 border-b border-gray-150 dark:border-gray-850 pb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-blue-500" /> Purchase History
          </h1>
          <p className="text-xs text-gray-550 mt-1">Review purchase records, invoice receipt summaries, and dispatch tracking details.</p>
        </div>
        
        <Link href="/shop" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
          Go back to shop
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-premium p-12 rounded-[36px] text-center max-w-md mx-auto space-y-6">
          <p className="text-xs italic text-gray-500">
            No orders found. Once you checkout products, your invoice history will be listed here.
          </p>
          <Link href="/shop" className="inline-block px-8 py-3 bg-black text-white dark:bg-white dark:text-black rounded-full text-xs font-semibold hover:opacity-90 transition-all">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-premium p-6 sm:p-8 rounded-[36px] hover:shadow-lg transition-shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono tracking-widest text-gray-400 uppercase bg-gray-100 dark:bg-gray-900 px-3 py-1 rounded-lg">
                    ID: #{order.id.slice(0, 8)}
                  </span>
                  
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-8 gap-y-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-gray-450" />
                    {new Date(order.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
                  </span>
                  <span className="flex items-center gap-1 font-bold">
                    <DollarSign className="w-4 h-4 text-gray-455" />
                    Total Paid: ${formatPrice(order.total_amount)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Tag className="w-4 h-4 text-gray-450" />
                    Items: {order.items?.reduce((acc, curr) => acc + curr.quantity, 0) || 0}
                  </span>
                </div>
              </div>

              <Link
                href={`/orders/${order.id}`}
                className="px-6 py-3 bg-black text-white dark:bg-white dark:text-black hover:opacity-90 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm self-stretch sm:self-auto text-center justify-center transition-all hover:scale-[1.02]"
              >
                <Eye className="w-4 h-4" /> View Details
              </Link>
            </motion.div>
          ))}
        </div>
      )}

    </div>
  );
}
