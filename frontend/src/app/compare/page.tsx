'use client';

import React, { useState } from 'react';
import { useCompareStore } from '@/store/compare-store';
import { useCountryStore } from '@/store/country-store';
import { aiApi } from '@/lib/api/ai';
import { agentApi } from '@/lib/api/agent';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { RatingStars } from '@/components/ui/RatingStars';
import {
  Layers,
  Sparkles,
  Trash2,
  Award,
  DollarSign,
  ShoppingBag,
} from 'lucide-react';
import Link from 'next/link';

export default function ComparePage() {
  const { items, removeItem, clearCompare } = useCompareStore();
  const { formatPrice } = useCountryStore();

  const [aiAnalysisResult, setAiAnalysisResult] = useState<{
    best_overall_id?: string;
    best_value_id?: string;
    best_performance_id?: string;
    ai_summary?: string;
    spec_table?: Array<{ feature: string; values: Record<string, string> }>;
  } | null>(null);

  const compareAiMutation = useMutation({
    mutationFn: async () => {
      // Check if all items have valid UUIDs or if any are external
      const allInternal = items.every((i) => !i.isExternal && i.id.length > 20);
      if (allInternal) {
        const res = await aiApi.compareProducts(items.map((i) => i.id));
        return {
          best_overall_id: res.best_overall_id,
          best_value_id: res.best_value_id,
          best_performance_id: res.best_performance_id,
          ai_summary: res.ai_summary,
          spec_table: res.spec_table,
        };
      } else {
        // External products: convert to DiscoveredProduct
        const discoveredProds = items.map((i) => {
          if (i.raw && 'seller' in i.raw) {
            return i.raw;
          }
          return {
            id: i.id,
            product_name: i.name,
            price: i.price,
            currency: 'PKR',
            availability: 'in_stock',
            seller: 'Verified Merchant',
            condition: 'new',
            specifications: {},
            country_code: 'PK',
            source_url: '#',
            source_domain: 'merchant.com',
            retrieved_at: new Date().toISOString(),
            match_reasons: [],
            pros: [],
            cons: [],
            cross_border: false,
            is_internal: true,
          };
        });
        const res = await agentApi.compare(discoveredProds);
        return {
          ai_summary: res.ai_summary,
          spec_table: res.matrix.map((m) => ({
            feature: m.feature,
            values: m.values,
          })),
        };
      }
    },
    onSuccess: (data) => {
      setAiAnalysisResult(data);
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
            <Layers className="h-4 w-4" />
            Side-By-Side Evaluation
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Product Comparison
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Compare specs, pricing, and ratings across {items.length} selected item{items.length === 1 ? '' : 's'}.
          </p>
        </div>

        {items.length > 0 && (
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={clearCompare}
              className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            >
              Clear All
            </Button>
            <Button
              variant="ai"
              size="sm"
              onClick={() => compareAiMutation.mutate()}
              isLoading={compareAiMutation.isPending}
              disabled={items.length < 2}
              className="text-xs gap-1.5 shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Ask AI to Compare ({items.length})
            </Button>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 space-y-4">
          <Layers className="h-12 w-12 text-zinc-300 mx-auto" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            No products selected for comparison
          </h2>
          <p className="text-sm text-zinc-500 max-w-md mx-auto">
            Browse our catalog or AI shopping workspace and click the comparison icon on any product card to compare up to 4 items simultaneously.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link href="/shop">
              <Button variant="outline" size="sm">
                Explore Catalog
              </Button>
            </Link>
            <Link href="/ai">
              <Button variant="ai" size="sm" className="gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> AI Workspace
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* AI Analysis Summary Banner */}
          {aiAnalysisResult?.ai_summary && (
            <div className="rounded-3xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-pink-50/50 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-pink-950/20 p-6 space-y-3 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  AI Commercial Synthesis
                </h3>
              </div>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                {aiAnalysisResult.ai_summary}
              </p>
            </div>
          )}

          {/* Comparison Table Grid */}
          <div className="overflow-x-auto rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60">
                  <th className="p-5 font-bold text-xs uppercase tracking-wider text-zinc-400 w-1/4">
                    Product Details
                  </th>
                  {items.map((item) => {
                    const isBestOverall = aiAnalysisResult?.best_overall_id === item.id;
                    const isBestValue = aiAnalysisResult?.best_value_id === item.id;

                    return (
                      <th
                        key={item.id}
                        className="p-5 w-[280px] min-w-[240px] align-top relative"
                      >
                        <div className="space-y-3">
                          {/* Image */}
                          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-zinc-400">
                                <ShoppingBag className="h-10 w-10" />
                              </div>
                            )}

                            <button
                              onClick={() => removeItem(item.id)}
                              className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 dark:bg-zinc-900/90 text-zinc-400 hover:text-rose-500 shadow-sm"
                              title="Remove item"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>

                            {/* AI Badges */}
                            {isBestOverall && (
                              <div className="absolute bottom-2 left-2">
                                <Badge variant="best">
                                  <Award className="h-3 w-3" /> Best Overall
                                </Badge>
                              </div>
                            )}
                            {isBestValue && (
                              <div className="absolute bottom-2 left-2">
                                <Badge variant="success">
                                  <DollarSign className="h-3 w-3" /> Best Value
                                </Badge>
                              </div>
                            )}
                          </div>

                          <div>
                            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-2">
                              {item.name}
                            </h3>
                            <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 block mt-1">
                              {formatPrice(item.price)}
                            </span>
                            <RatingStars rating={item.rating || 4.7} size="xs" className="mt-1" />
                          </div>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-xs">
                {/* Price Row */}
                <tr>
                  <td className="p-4 font-semibold text-zinc-500">Price</td>
                  {items.map((i) => (
                    <td key={i.id} className="p-4 font-bold text-zinc-900 dark:text-zinc-100">
                      {formatPrice(i.price)}
                    </td>
                  ))}
                </tr>

                {/* Brand Row */}
                <tr>
                  <td className="p-4 font-semibold text-zinc-500">Brand / Source</td>
                  {items.map((i) => (
                    <td key={i.id} className="p-4 text-zinc-700 dark:text-zinc-300">
                      {i.brand || 'Verified Catalog'}
                    </td>
                  ))}
                </tr>

                {/* Rating Row */}
                <tr>
                  <td className="p-4 font-semibold text-zinc-500">User Rating</td>
                  {items.map((i) => (
                    <td key={i.id} className="p-4">
                      <RatingStars rating={i.rating || 4.7} size="xs" />
                    </td>
                  ))}
                </tr>

                {/* Dynamic Spec Rows from Backend Matrix if available */}
                {aiAnalysisResult?.spec_table?.map((row, rIdx) => (
                  <tr key={rIdx}>
                    <td className="p-4 font-semibold text-zinc-500">{row.feature}</td>
                    {items.map((item) => (
                      <td key={item.id} className="p-4 text-zinc-800 dark:text-zinc-200">
                        {row.values[item.id] || row.values[item.name] || 'Standard Spec'}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Action Row */}
                <tr className="bg-zinc-50/50 dark:bg-zinc-900/50">
                  <td className="p-4 font-semibold text-zinc-500">Action</td>
                  {items.map((item) => (
                    <td key={item.id} className="p-4">
                      <Link href={`/shop?search=${encodeURIComponent(item.name.slice(0, 20))}`}>
                        <Button variant="primary" size="sm" className="w-full text-xs">
                          View & Order
                        </Button>
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
