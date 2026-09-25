"use client";

import { useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  BarChart3,
  ChevronRight,
  Shield,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth?redirect=/admin");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Admin Breadcrumb Header */}
      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-6">
        <Shield className="w-3.5 h-3.5 text-violet-500" />
        <span>Admin Panel</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground capitalize">
          {pathname === "/admin" ? "Dashboard" : pathname.split("/").pop()}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        {/* Sidebar Navigation */}
        <aside className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-lg"
                    : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-foreground"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </aside>

        {/* Main Content Area */}
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
