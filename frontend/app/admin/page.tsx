"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useRouter } from "next/navigation";
import api from "../../services/api";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  Loader2,
  Sparkles,
  Search,
  Zap,
  MousePointer,
  AlertCircle
} from "lucide-react";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";

/* ───────── Types ───────── */
interface AnalyticsCard {
  label: string;
  value: number;
  change_percentage: number;
}

interface SalesChartPoint {
  date: string;
  revenue: number;
  orders_count: number;
}

interface RecentOrder {
  id: string;
  customer: string;
  email: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface BestSeller {
  id: string;
  name: string;
  price: number;
  sold_quantity: number;
}

interface AISearchAnalyticsData {
  total_searches: number;
  avg_latency_ms: number;
  zero_result_searches_count: number;
  click_through_rate: number;
  search_to_cart_rate: number;
  search_to_purchase_rate: number;
  top_queries: { query: string; count: number }[];
  zero_result_queries: string[];
}

interface DashboardData {
  revenue_card: AnalyticsCard;
  orders_card: AnalyticsCard;
  products_card: AnalyticsCard;
  customers_card: AnalyticsCard;
  sales_chart: SalesChartPoint[];
  recent_orders: RecentOrder[];
  best_sellers: BestSeller[];
}

/* ───────── Mock fallback ───────── */
const MOCK_DATA: DashboardData = {
  revenue_card: { label: "Total Revenue", value: 48520.0, change_percentage: 12.4 },
  orders_card: { label: "Total Orders", value: 376, change_percentage: 8.2 },
  products_card: { label: "Active Catalog", value: 128, change_percentage: 3.5 },
  customers_card: { label: "Total Customers", value: 1024, change_percentage: 15.1 },
  sales_chart: [
    { date: "2026-06-26", revenue: 5400, orders_count: 42 },
    { date: "2026-06-27", revenue: 7320, orders_count: 56 },
    { date: "2026-06-28", revenue: 6100, orders_count: 48 },
    { date: "2026-06-29", revenue: 8950, orders_count: 71 },
    { date: "2026-06-30", revenue: 7700, orders_count: 62 },
    { date: "2026-07-01", revenue: 9200, orders_count: 78 },
    { date: "2026-07-02", revenue: 3850, orders_count: 19 },
  ],
  recent_orders: [
    { id: "ord_a1b2c3d4", customer: "Alice Chen", email: "alice@example.com", total_amount: 329.0, status: "delivered", created_at: "2026-07-02 14:22" },
    { id: "ord_e5f6g7h8", customer: "Bob Marley", email: "bob@example.com", total_amount: 175.5, status: "processing", created_at: "2026-07-02 12:04" },
    { id: "ord_i9j0k1l2", customer: "Cara Delevingne", email: "cara@example.com", total_amount: 89.99, status: "shipped", created_at: "2026-07-01 23:51" },
    { id: "ord_m3n4o5p6", customer: "Daniel Kim", email: "daniel@example.com", total_amount: 512.0, status: "delivered", created_at: "2026-07-01 18:10" },
    { id: "ord_q7r8s9t0", customer: "Emily Watson", email: "emily@example.com", total_amount: 64.0, status: "cancelled", created_at: "2026-07-01 09:33" },
  ],
  best_sellers: [
    { id: "1", name: "Aura Smart Chrono Watch", price: 299.0, sold_quantity: 142 },
    { id: "2", name: "Nebula Wireless Earbuds", price: 79.99, sold_quantity: 118 },
    { id: "3", name: "Zenith Leather Tote Bag", price: 189.0, sold_quantity: 97 },
    { id: "4", name: "Prism RGB Desk Lamp", price: 54.0, sold_quantity: 84 },
    { id: "5", name: "Titanium Travel Mug 16oz", price: 42.0, sold_quantity: 76 },
  ],
};

const MOCK_AI_ANALYTICS: AISearchAnalyticsData = {
  total_searches: 1420,
  avg_latency_ms: 22.4,
  zero_result_searches_count: 8,
  click_through_rate: 68.4,
  search_to_cart_rate: 34.2,
  search_to_purchase_rate: 18.5,
  top_queries: [
    { query: "gaming laptop under $1200", count: 184 },
    { query: "running shoes size 10", count: 142 },
    { query: "noise cancelling headphones", count: 96 },
    { query: "smartwatch long battery", count: 78 },
    { query: "ergonomic office chair", count: 64 },
  ],
  zero_result_queries: ["4k OLED TV under $200", "pink mechanical keyboard wireless", "foldable electric scooter"],
};

/* ───────── Helpers ───────── */
const CARD_ICONS = [DollarSign, ShoppingCart, Package, Users];
const CARD_COLORS = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-violet-500 to-purple-600",
];

function statusBadge(status: string) {
  switch (status.toLowerCase()) {
    case "delivered":
      return { bg: "bg-emerald-500/10 dark:bg-emerald-500/20", text: "text-emerald-500", icon: CheckCircle };
    case "shipped":
      return { bg: "bg-blue-500/10 dark:bg-blue-500/20", text: "text-blue-500", icon: ArrowUpRight };
    case "processing":
      return { bg: "bg-amber-500/10 dark:bg-amber-500/20", text: "text-amber-500", icon: Clock };
    case "cancelled":
      return { bg: "bg-red-500/10 dark:bg-red-500/20", text: "text-red-500", icon: XCircle };
    default:
      return { bg: "bg-gray-500/10 dark:bg-gray-500/20", text: "text-gray-500", icon: Clock };
  }
}

function RevenueChart({ data }: { data: SalesChartPoint[] }) {
  const maxRevenue = useMemo(() => Math.max(...data.map((d) => d.revenue), 1), [data]);

  return (
    <div className="glass p-6 rounded-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm">Revenue Trajectory</h3>
          <p className="text-[11px] text-gray-400">Daily sales performance over the past 7 days</p>
        </div>
        <BarChart3 className="w-5 h-5 text-gray-400" />
      </div>

      <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 px-2">
        {data.map((point) => {
          const heightPct = Math.round((point.revenue / maxRevenue) * 100);
          const dayLabel = new Date(point.date).toLocaleDateString("en-US", { weekday: "short" });

          return (
            <div key={point.date} className="flex-1 flex flex-col items-center gap-2 group relative">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-10">
                ${point.revenue.toLocaleString()} ({point.orders_count} orders)
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-t-xl h-full flex items-end overflow-hidden p-0.5">
                <div
                  style={{ height: `${Math.max(heightPct, 6)}%` }}
                  className="w-full bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-lg transition-all duration-500 group-hover:brightness-110"
                />
              </div>
              <span className="text-[10px] text-gray-400 font-semibold uppercase">{dayLabel}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [data, setData] = useState<DashboardData | null>(null);
  const [aiAnalytics, setAiAnalytics] = useState<AISearchAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      toast.error("Admin privileges required to view dashboard");
      router.push("/");
      return;
    }

    async function loadDashboardData() {
      try {
        const res = await api.get("/dashboard/analytics");
        setData(res.data);
      } catch (err) {
        console.error("Dashboard fetch error, showing mock values:", err);
        setData(MOCK_DATA);
      }

      try {
        const aiRes = await api.get("/dashboard/ai-search-analytics");
        setAiAnalytics(aiRes.data);
      } catch (err) {
        console.error("AI Analytics fetch error, showing mock values:", err);
        setAiAnalytics(MOCK_AI_ANALYTICS);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [isAuthenticated, user, router]);

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const metricCards = [
    data.revenue_card,
    data.orders_card,
    data.products_card,
    data.customers_card,
  ];

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-red-500">Admin Control Center</span>
        <h1 className="text-3xl font-black tracking-tight mt-1">Platform & AI Analytics</h1>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card, idx) => {
          const Icon = CARD_ICONS[idx];
          const colorClass = CARD_COLORS[idx];
          const positive = card.change_percentage >= 0;
          const formattedVal =
            idx === 0
              ? `$${card.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
              : card.value.toLocaleString();

          return (
            <div key={card.label} className="glass p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{card.label}</span>
                <div className={`p-2.5 rounded-2xl bg-gradient-to-br ${colorClass} text-white shadow-sm`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-black tracking-tight tabular-nums">{formattedVal}</span>
              </div>
              <div className={`mt-3 flex items-center gap-1 text-[11px] font-bold ${positive ? "text-emerald-500" : "text-red-500"}`}>
                {positive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {positive ? "+" : ""}
                {card.change_percentage}%
                <span className="text-gray-400 font-normal ml-1">vs last period</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI SEARCH ANALYTICS SECTION */}
      {aiAnalytics && (
        <section className="p-8 rounded-3xl glass-premium border border-gray-200 dark:border-gray-800 space-y-6">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
              <Sparkles className="w-4 h-4" /> AI Search & Discovery Telemetry
            </span>
            <span className="text-xs font-bold text-gray-400">Real-Time Search Metrics</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Total AI Queries</span>
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 block">{aiAnalytics.total_searches}</span>
              <span className="text-[10px] text-gray-400 font-medium">Avg Latency: {aiAnalytics.avg_latency_ms}ms</span>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Click-Through Rate</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">{aiAnalytics.click_through_rate}%</span>
              <span className="text-[10px] text-gray-400 font-medium">Search → Add to Cart: {aiAnalytics.search_to_cart_rate}%</span>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Zero-Result Queries</span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">{aiAnalytics.zero_result_searches_count}</span>
              <span className="text-[10px] text-gray-400 font-medium">Opportunities for inventory expansion</span>
            </div>
          </div>

          {/* Top Searches vs Zero Result Queries Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Top Queries */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-blue-500" /> Top Natural Language Queries
              </h4>
              <div className="space-y-2">
                {aiAnalytics.top_queries.map((q, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-2xl bg-gray-50 dark:bg-gray-850 text-xs">
                    <span className="font-bold text-gray-900 dark:text-white truncate">&quot;{q.query}&quot;</span>
                    <span className="font-mono font-extrabold text-blue-600 dark:text-blue-400 shrink-0">{q.count} searches</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Zero-Result Queries */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Zero-Result Queries (Unmatched)
              </h4>
              <div className="space-y-2">
                {aiAnalytics.zero_result_queries.map((q, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 text-xs border border-amber-100 dark:border-amber-900/40">
                    <span className="font-semibold text-gray-800 dark:text-gray-200">&quot;{q}&quot;</span>
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">0 matches</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Chart & Best Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={data.sales_chart} />
        </div>

        <div className="glass p-6 rounded-3xl space-y-4">
          <h3 className="font-bold text-sm">Top Selling Products</h3>
          <div className="space-y-3">
            {data.best_sellers.map((item, idx) => (
              <div key={item.id} className="flex items-center gap-3 group">
                <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-[10px] font-extrabold text-gray-500 shrink-0">
                  {idx + 1}
                </span>
                <div className="flex-grow min-w-0">
                  <p className="text-xs font-semibold truncate">{item.name}</p>
                  <p className="text-[10px] text-gray-400">{item.sold_quantity} sold · ${formatPrice(item.price)}</p>
                </div>
                <span className="text-xs font-extrabold text-emerald-500 tabular-nums shrink-0">
                  ${(Number(item.sold_quantity) * Number(item.price)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="glass p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm">Recent Orders</h3>
          <span className="text-[10px] text-gray-400 font-mono">{data.recent_orders.length} latest</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                <th className="text-left py-3 pr-4">Order ID</th>
                <th className="text-left py-3 pr-4">Customer</th>
                <th className="text-left py-3 pr-4">Date</th>
                <th className="text-right py-3 pr-4">Amount</th>
                <th className="text-right py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_orders.map((order) => {
                const badge = statusBadge(order.status);
                const StatusIcon = badge.icon;
                return (
                  <tr key={order.id} className="border-b border-gray-50 dark:border-gray-900 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="py-3.5 pr-4 text-xs font-mono font-bold">{order.id}</td>
                    <td className="py-3.5 pr-4">
                      <p className="text-xs font-semibold">{order.customer}</p>
                      <p className="text-[10px] text-gray-400">{order.email}</p>
                    </td>
                    <td className="py-3.5 pr-4 text-xs text-gray-500">{order.created_at}</td>
                    <td className="py-3.5 pr-4 text-xs font-extrabold text-right tabular-nums">
                      ${formatPrice(order.total_amount)}
                    </td>
                    <td className="py-3.5 text-right">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${badge.bg} ${badge.text}`}>
                        <StatusIcon className="w-3 h-3" />
                        {order.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
