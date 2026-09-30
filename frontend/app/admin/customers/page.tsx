"use client";

import { useEffect, useState } from "react";
import api from "../../../services/api";
import { Search, Loader2, Mail, Phone, ShoppingBag, Calendar, User } from "lucide-react";
import { formatPrice } from "@/lib/format";

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role: string;
  created_at: string;
  orders_count: number;
  total_spent: number;
}

const MOCK_CUSTOMERS: Customer[] = [
  { id: "c1", first_name: "Alice", last_name: "Chen", email: "alice@example.com", phone: "+14155551234", role: "customer", created_at: "2026-05-12", orders_count: 8, total_spent: 1842.5 },
  { id: "c2", first_name: "Bob", last_name: "Marley", email: "bob@example.com", phone: "+17185559876", role: "customer", created_at: "2026-05-15", orders_count: 3, total_spent: 526.5 },
  { id: "c3", first_name: "Cara", last_name: "Delevingne", email: "cara@example.com", phone: null, role: "customer", created_at: "2026-05-20", orders_count: 12, total_spent: 3210.0 },
  { id: "c4", first_name: "Daniel", last_name: "Kim", email: "daniel@example.com", phone: "+12125557777", role: "customer", created_at: "2026-06-01", orders_count: 5, total_spent: 1456.0 },
  { id: "c5", first_name: "Emily", last_name: "Watson", email: "emily@example.com", phone: null, role: "customer", created_at: "2026-06-10", orders_count: 1, total_spent: 64.0 },
  { id: "c6", first_name: "Fatima", last_name: "Zahra", email: "fatima@example.com", phone: "+33612345678", role: "customer", created_at: "2026-06-18", orders_count: 2, total_spent: 221.0 },
  { id: "c7", first_name: "George", last_name: "Walker", email: "george@example.com", phone: null, role: "admin", created_at: "2026-04-01", orders_count: 0, total_spent: 0 },
];

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.get("/dashboard/customers");
        setCustomers(res.data || []);
      } catch {
        setCustomers(MOCK_CUSTOMERS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = customers.filter(
    (c) =>
      `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = customers.reduce((s, c) => s + c.total_spent, 0);
  const avgOrderValue = customers.reduce((s, c) => s + c.orders_count, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold">Customers</h1>
        <p className="text-xs text-gray-400 mt-1">{customers.length} registered customers</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass p-4 rounded-2xl text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Customers</p>
          <p className="text-2xl font-extrabold mt-1">{customers.filter((c) => c.role === "customer").length}</p>
        </div>
        <div className="glass p-4 rounded-2xl text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Revenue</p>
          <p className="text-2xl font-extrabold mt-1">${totalRevenue.toLocaleString()}</p>
        </div>
        <div className="glass p-4 rounded-2xl text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Orders</p>
          <p className="text-2xl font-extrabold mt-1">{avgOrderValue}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search customers by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-black/20 outline-none focus:ring-1 focus:ring-blue-500" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : (
        <div className="glass rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                  <th className="text-left py-4 px-5">Customer</th>
                  <th className="text-left py-4 px-4">Contact</th>
                  <th className="text-center py-4 px-4">Orders</th>
                  <th className="text-right py-4 px-4">Total Spent</th>
                  <th className="text-center py-4 px-4">Role</th>
                  <th className="text-right py-4 px-5">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((customer) => (
                  <tr key={customer.id} className="border-b border-gray-50 dark:border-gray-900 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {customer.first_name.charAt(0)}{customer.last_name.charAt(0)}
                        </div>
                        <span className="text-xs font-bold">{customer.first_name} {customer.last_name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <p className="text-[11px] text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3" />{customer.email}</p>
                        {customer.phone && <p className="text-[11px] text-gray-400 flex items-center gap-1"><Phone className="w-3 h-3" />{customer.phone}</p>}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-xs font-bold flex items-center justify-center gap-1">
                        <ShoppingBag className="w-3 h-3 text-gray-400" />{customer.orders_count}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-xs font-extrabold tabular-nums text-emerald-500">${formatPrice(customer.total_spent)}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${customer.role === "admin" ? "bg-violet-100 text-violet-600 dark:bg-violet-950/30 dark:text-violet-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800"}`}>
                        <User className="w-3 h-3" />{customer.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right text-xs text-gray-400 flex items-center justify-end gap-1">
                      <Calendar className="w-3 h-3" />{customer.created_at}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
