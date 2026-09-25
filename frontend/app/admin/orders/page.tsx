"use client";

import { useEffect, useState } from "react";
import api from "../../../services/api";
import {
  Search,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  Truck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customer: string;
  email: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  items: OrderItem[];
  shipping_address?: string;
}

const MOCK_ORDERS: Order[] = [
  { id: "ord_a1b2c3d4", customer: "Alice Chen", email: "alice@example.com", total_amount: 329.0, status: "delivered", payment_status: "paid", created_at: "2026-07-02 14:22", items: [{ id: "i1", product_name: "Aura Smart Chrono Watch", quantity: 1, price: 299.0 }, { id: "i2", product_name: "USB-C Cable", quantity: 2, price: 15.0 }], shipping_address: "123 Main St, San Francisco, CA 94102" },
  { id: "ord_e5f6g7h8", customer: "Bob Marley", email: "bob@example.com", total_amount: 175.5, status: "processing", payment_status: "paid", created_at: "2026-07-02 12:04", items: [{ id: "i3", product_name: "Zenith Leather Tote Bag", quantity: 1, price: 175.5 }], shipping_address: "456 Oak Ave, NYC, NY 10001" },
  { id: "ord_i9j0k1l2", customer: "Cara Delevingne", email: "cara@example.com", total_amount: 89.99, status: "shipped", payment_status: "paid", created_at: "2026-07-01 23:51", items: [{ id: "i4", product_name: "Nebula Wireless Earbuds", quantity: 1, price: 79.99 }, { id: "i5", product_name: "Ear Tips Pack", quantity: 1, price: 10.0 }] },
  { id: "ord_m3n4o5p6", customer: "Daniel Kim", email: "daniel@example.com", total_amount: 512.0, status: "processing", payment_status: "pending", created_at: "2026-07-01 18:10", items: [{ id: "i6", product_name: "Gaming Mechanical Keyboard", quantity: 1, price: 189.0 }, { id: "i7", product_name: "27\" 4K Monitor", quantity: 1, price: 323.0 }] },
  { id: "ord_q7r8s9t0", customer: "Emily Watson", email: "emily@example.com", total_amount: 64.0, status: "cancelled", payment_status: "refunded", created_at: "2026-07-01 09:33", items: [{ id: "i8", product_name: "Prism RGB Desk Lamp", quantity: 1, price: 54.0 }, { id: "i9", product_name: "Smart Plug", quantity: 1, price: 10.0 }] },
  { id: "ord_u1v2w3x4", customer: "Fatima Zahra", email: "fatima@example.com", total_amount: 42.0, status: "delivered", payment_status: "paid", created_at: "2026-06-30 15:44", items: [{ id: "i10", product_name: "Titanium Travel Mug 16oz", quantity: 1, price: 42.0 }] },
];

const STATUS_OPTIONS = ["processing", "shipped", "delivered", "cancelled"];

const statusConfig: Record<string, { bg: string; text: string; icon: React.ComponentType<any> }> = {
  delivered: { bg: "bg-emerald-100 dark:bg-emerald-950/30", text: "text-emerald-600 dark:text-emerald-400", icon: CheckCircle },
  processing: { bg: "bg-blue-100 dark:bg-blue-950/30", text: "text-blue-600 dark:text-blue-400", icon: Clock },
  shipped: { bg: "bg-amber-100 dark:bg-amber-950/30", text: "text-amber-600 dark:text-amber-400", icon: Truck },
  cancelled: { bg: "bg-red-100 dark:bg-red-950/30", text: "text-red-500 dark:text-red-400", icon: XCircle },
};

const paymentConfig: Record<string, string> = {
  paid: "text-emerald-500",
  pending: "text-amber-500",
  failed: "text-red-500",
  refunded: "text-violet-500",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => { loadOrders(); }, []);

  async function loadOrders() {
    setLoading(true);
    try {
      const res = await api.get("/orders?admin=true&limit=50");
      setOrders(res.data || []);
    } catch {
      setOrders(MOCK_ORDERS);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(orderId: string, newStatus: string) {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      loadOrders();
    } catch {
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Status updated to ${newStatus} (local demo)`);
    }
  }

  const filtered = orders.filter((o) => {
    const matchSearch = o.id.includes(search) || o.customer.toLowerCase().includes(search.toLowerCase()) || o.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold">Orders</h1>
        <p className="text-xs text-gray-400 mt-1">{orders.length} total orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by order ID, customer, or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-black/20 outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-3 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-black/20 outline-none">
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const cfg = statusConfig[order.status] || statusConfig.processing;
            const StatusIcon = cfg.icon;
            const isExpanded = expandedId === order.id;
            return (
              <div key={order.id} className="glass rounded-3xl overflow-hidden">
                {/* Order Row */}
                <div className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors" onClick={() => setExpandedId(isExpanded ? null : order.id)}>
                  <div className="flex items-center gap-4 min-w-0">
                    <div>
                      <p className="text-xs font-mono font-bold">{order.id}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{order.created_at}</p>
                    </div>
                    <div className="hidden sm:block min-w-0">
                      <p className="text-xs font-semibold truncate">{order.customer}</p>
                      <p className="text-[10px] text-gray-400">{order.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-[10px] font-bold capitalize ${paymentConfig[order.payment_status] || "text-gray-400"}`}>{order.payment_status}</span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${cfg.bg} ${cfg.text}`}>
                      <StatusIcon className="w-3 h-3" />{order.status}
                    </span>
                    <span className="text-sm font-extrabold tabular-nums">${order.total_amount.toFixed(2)}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Items */}
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Items</p>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-xs">
                              <span>{item.product_name} <span className="text-gray-400">×{item.quantity}</span></span>
                              <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Address */}
                      {order.shipping_address && (
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Shipping Address</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{order.shipping_address}</p>
                        </div>
                      )}
                    </div>
                    {/* Status Update */}
                    <div className="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">Update Status:</span>
                      {STATUS_OPTIONS.map((s) => (
                        <button key={s} onClick={() => updateStatus(order.id, s)} disabled={order.status === s}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-bold capitalize transition-all ${order.status === s ? "bg-black text-white dark:bg-white dark:text-black" : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-foreground"}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && <div className="text-center py-16 text-xs text-gray-400 italic">No orders found.</div>}
        </div>
      )}
    </div>
  );
}
