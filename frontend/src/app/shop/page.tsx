'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/lib/api/products';
import { useCountryStore } from '@/store/country-store';
import { ProductCard } from '@/components/product/ProductCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Sparkles,
  X,
} from 'lucide-react';
import Link from 'next/link';

export default function ShopPage() {
  const { currentCountry } = useCountryStore();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(0);
  const limit = 12;

  // Fetch Categories
  const { data: categories = [] } = useQuery({
    queryKey: ['shop-categories'],
    queryFn: productsApi.getCategories,
  });

  // Fetch Products with filters
  const { data: productsData, isLoading } = useQuery({
    queryKey: [
      'shop-products',
      page,
      search,
      selectedCategory,
      sortBy,
      inStockOnly,
      minPrice,
      maxPrice,
    ],
    queryFn: () =>
      productsApi.getProducts({
        skip: page * limit,
        limit,
        search: search.trim() || undefined,
        category: selectedCategory || undefined,
        sort_by: sortBy,
        in_stock: inStockOnly,
        min_price: minPrice,
        max_price: maxPrice,
      }),
  });

  const products = productsData?.products || [];
  const total = productsData?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSortBy('newest');
    setInStockOnly(false);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setPage(0);
  };

  const hasActiveFilters =
    Boolean(search) ||
    Boolean(selectedCategory) ||
    sortBy !== 'newest' ||
    inStockOnly ||
    minPrice !== undefined ||
    maxPrice !== undefined;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-zinc-200 dark:border-zinc-800 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Product Catalog
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Browse verified listings in {currentCountry.name} ({currentCountry.currency}) with real-time stock & pricing.
          </p>
        </div>

        <Link href="/ai">
          <Button variant="ai" size="sm" className="gap-2 shadow-sm">
            <Sparkles className="h-4 w-4" />
            Can&apos;t find it? Ask AI Agent
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </h2>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
              >
                <X className="h-3 w-3" /> Reset all
              </button>
            )}
          </div>

          {/* Search filter input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Keywords
            </label>
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
              Category
            </label>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setPage(0);
                }}
                className={`text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  selectedCategory === ''
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.slug);
                    setPage(0);
                  }}
                  className={`text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    selectedCategory === cat.slug
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
              Price Range ({currentCountry.currency})
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={minPrice ?? ''}
                onChange={(e) => {
                  setMinPrice(e.target.value ? parseFloat(e.target.value) : undefined);
                  setPage(0);
                }}
              />
              <Input
                type="number"
                placeholder="Max"
                value={maxPrice ?? ''}
                onChange={(e) => {
                  setMaxPrice(e.target.value ? parseFloat(e.target.value) : undefined);
                  setPage(0);
                }}
              />
            </div>
          </div>

          {/* Availability checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => {
                  setInStockOnly(e.target.checked);
                  setPage(0);
                }}
                className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Product Catalog Grid */}
        <main className="lg:col-span-3 space-y-6">
          {/* Top Bar: Sort By and Total Count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50 dark:bg-zinc-900/50 p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
            <span className="text-xs font-medium text-zinc-500">
              Showing <strong className="text-zinc-900 dark:text-zinc-100">{products.length}</strong> of{' '}
              <strong className="text-zinc-900 dark:text-zinc-100">{total}</strong> products
            </span>

            <div className="flex items-center gap-2">
              <label htmlFor="sortBySelect" className="text-xs font-medium text-zinc-500">Sort by:</label>
              <select
                id="sortBySelect"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(0);
                }}
                className="h-9 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
                  <Skeleton className="aspect-square w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4 rounded-md" />
                  <Skeleton className="h-4 w-1/2 rounded-md" />
                  <Skeleton className="h-9 w-full rounded-xl" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-3xl p-8 space-y-4">
              <ShoppingBag className="h-12 w-12 text-zinc-300 mx-auto" />
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                No matching products found
              </h3>
              <p className="text-sm text-zinc-500 max-w-md mx-auto">
                Try adjusting your search criteria, or let our AI Shopping Copilot search verified merchant partners for you.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Clear Filters
                </Button>
                <Link href="/ai">
                  <Button variant="ai" size="sm" className="gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" /> Ask AI Agent
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
                className="gap-1 text-xs"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>

              <span className="text-xs text-zinc-500">
                Page {page + 1} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages - 1}
                className="gap-1 text-xs"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
