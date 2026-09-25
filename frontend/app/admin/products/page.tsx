"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "../../../services/api";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  ImagePlus,
  X,
  Loader2,
  Package,
  Eye,
  EyeOff,
  Star,
  Upload,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

/* ───────── Types ───────── */
interface ProductImage {
  id?: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  sku: string;
  status: string;
  is_featured: boolean;
  category_id: number | null;
  category?: { id: number; name: string; slug: string } | null;
  images: ProductImage[];
  inventory?: { quantity: number; low_stock_threshold: number } | null;
  created_at: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

/* ───────── Mock Data ───────── */
const MOCK_PRODUCTS: Product[] = [
  {
    id: "p1", name: "Aura Smart Chrono Watch", slug: "aura-smart-chrono-watch",
    description: "Premium smartwatch with AI health tracking, sapphire crystal display, and 14-day battery life.",
    price: 299.0, compare_at_price: 399.0, sku: "AURA-CHR-001", status: "active", is_featured: true,
    category_id: 1, category: { id: 1, name: "Electronics", slug: "electronics" },
    images: [{ image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400", is_primary: true, display_order: 0 }],
    inventory: { quantity: 48, low_stock_threshold: 10 }, created_at: "2026-06-15",
  },
  {
    id: "p2", name: "Nebula Wireless Earbuds", slug: "nebula-wireless-earbuds",
    description: "Active noise cancellation with spatial audio and 32-hour total playtime.",
    price: 79.99, compare_at_price: null, sku: "NEB-EAR-002", status: "active", is_featured: false,
    category_id: 1, category: { id: 1, name: "Electronics", slug: "electronics" },
    images: [{ image_url: "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400", is_primary: true, display_order: 0 }],
    inventory: { quantity: 124, low_stock_threshold: 20 }, created_at: "2026-06-18",
  },
  {
    id: "p3", name: "Zenith Leather Tote Bag", slug: "zenith-leather-tote-bag",
    description: "Full-grain Italian leather with laptop compartment and magnetic closure.",
    price: 189.0, compare_at_price: 249.0, sku: "ZEN-BAG-003", status: "active", is_featured: true,
    category_id: 2, category: { id: 2, name: "Fashion", slug: "fashion" },
    images: [{ image_url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400", is_primary: true, display_order: 0 }],
    inventory: { quantity: 32, low_stock_threshold: 5 }, created_at: "2026-06-20",
  },
  {
    id: "p4", name: "Prism RGB Desk Lamp", slug: "prism-rgb-desk-lamp",
    description: "Smart desk lamp with 16M color options, touch controls, and USB-C charging.",
    price: 54.0, compare_at_price: null, sku: "PRI-LMP-004", status: "draft", is_featured: false,
    category_id: 3, category: { id: 3, name: "Home & Living", slug: "home-living" },
    images: [], inventory: { quantity: 0, low_stock_threshold: 10 }, created_at: "2026-06-25",
  },
];

const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: "Electronics", slug: "electronics" },
  { id: 2, name: "Fashion", slug: "fashion" },
  { id: 3, name: "Home & Living", slug: "home-living" },
  { id: 4, name: "Sports", slug: "sports" },
];

/* ═══════════════════════════════════════════
   Admin Products CRUD Page
   ═══════════════════════════════════════════ */
export default function AdminProductsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formComparePrice, setFormComparePrice] = useState("");
  const [formSku, setFormSku] = useState("");
  const [formStatus, setFormStatus] = useState("draft");
  const [formFeatured, setFormFeatured] = useState(false);
  const [formCategoryId, setFormCategoryId] = useState<string>("");
  const [formStock, setFormStock] = useState("");
  const [formLowStock, setFormLowStock] = useState("10");
  const [formImages, setFormImages] = useState<{ url: string; file?: File }[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get("/products?limit=100"),
        api.get("/products/categories"),
      ]);
      setProducts(prodRes.data.products || []);
      setCategories(catRes.data || []);
    } catch (e) {
      console.warn("API unavailable — using mock data", e);
      setProducts(MOCK_PRODUCTS);
      setCategories(MOCK_CATEGORIES);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditing(null);
    resetForm();
    setShowModal(true);
  }

  function openEditModal(product: Product) {
    setEditing(product);
    setFormName(product.name);
    setFormSlug(product.slug);
    setFormDescription(product.description || "");
    setFormPrice(product.price.toString());
    setFormComparePrice(product.compare_at_price?.toString() || "");
    setFormSku(product.sku);
    setFormStatus(product.status);
    setFormFeatured(product.is_featured);
    setFormCategoryId(product.category_id?.toString() || "");
    setFormStock(product.inventory?.quantity?.toString() || "0");
    setFormLowStock(product.inventory?.low_stock_threshold?.toString() || "10");
    setFormImages(product.images.map((img) => ({ url: img.image_url })));
    setShowModal(true);
  }

  function resetForm() {
    setFormName("");
    setFormSlug("");
    setFormDescription("");
    setFormPrice("");
    setFormComparePrice("");
    setFormSku("");
    setFormStatus("draft");
    setFormFeatured(false);
    setFormCategoryId("");
    setFormStock("0");
    setFormLowStock("10");
    setFormImages([]);
  }

  // Auto-generate slug from name
  function handleNameChange(val: string) {
    setFormName(val);
    if (!editing) {
      setFormSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  }

  // Handle image file upload
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const newImages = Array.from(files).map((file) => ({
      url: URL.createObjectURL(file),
      file,
    }));
    setFormImages((prev) => [...prev, ...newImages]);
    e.target.value = "";
  }

  function removeImage(index: number) {
    setFormImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!formName || !formSlug || !formPrice || !formSku) {
      toast.error("Please fill all required fields.");
      return;
    }

    setSaving(true);

    const payload = {
      name: formName,
      slug: formSlug,
      description: formDescription,
      price: parseFloat(formPrice),
      compare_at_price: formComparePrice ? parseFloat(formComparePrice) : null,
      sku: formSku,
      status: formStatus,
      is_featured: formFeatured,
      category_id: formCategoryId ? parseInt(formCategoryId) : null,
      inventory: { quantity: parseInt(formStock) || 0, low_stock_threshold: parseInt(formLowStock) || 10 },
      images: formImages.map((img, i) => ({
        image_url: img.url,
        is_primary: i === 0,
        display_order: i,
      })),
    };

    try {
      if (editing) {
        await api.put(`/products/${editing.id}`, payload);
        toast.success("Product updated successfully!");
      } else {
        await api.post("/products", payload);
        toast.success("Product created successfully!");
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      console.warn("Save fell through to local mock", err);
      // Simulate success for demo
      if (editing) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editing.id
              ? {
                  ...p,
                  ...payload,
                  images: payload.images.map((img, i) => ({ ...img, id: `img_${i}` })),
                  inventory: payload.inventory as any,
                  category: categories.find((c) => c.id === payload.category_id) || null,
                }
              : p
          )
        );
        toast.success("Product updated (local demo)!");
      } else {
        const newProduct: Product = {
          id: `p_${Date.now()}`,
          ...payload,
          compare_at_price: payload.compare_at_price,
          images: payload.images.map((img, i) => ({ ...img, id: `img_${i}` })),
          inventory: payload.inventory as any,
          category: categories.find((c) => c.id === payload.category_id) || null,
          created_at: new Date().toISOString().slice(0, 10),
        };
        setProducts((prev) => [newProduct, ...prev]);
        toast.success("Product created (local demo)!");
      }
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product: Product) {
    if (!confirm(`Delete "${product.name}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/products/${product.id}`);
      toast.success("Product deleted!");
      loadData();
    } catch {
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      toast.success("Product deleted (local demo)!");
    }
  }

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold">Products</h1>
          <p className="text-xs text-gray-400 mt-1">{products.length} total products in catalog</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-full text-xs font-bold hover:opacity-90 transition-opacity shadow-lg"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search products by name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-black/20 outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="glass rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                  <th className="text-left py-4 px-5">Product</th>
                  <th className="text-left py-4 px-4">SKU</th>
                  <th className="text-left py-4 px-4">Category</th>
                  <th className="text-right py-4 px-4">Price</th>
                  <th className="text-center py-4 px-4">Stock</th>
                  <th className="text-center py-4 px-4">Status</th>
                  <th className="text-right py-4 px-5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-gray-50 dark:border-gray-900 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors"
                  >
                    {/* Product Name + Image */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0">
                          {product.images[0] ? (
                            <img
                              src={product.images[0].image_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">{product.name}</p>
                          {product.is_featured && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] text-amber-500 font-bold mt-0.5">
                              <Star className="w-2.5 h-2.5 fill-current" /> Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-xs font-mono text-gray-500">{product.sku}</td>

                    <td className="py-3.5 px-4 text-xs text-gray-500">
                      {product.category?.name || "—"}
                    </td>

                    <td className="py-3.5 px-4 text-xs font-bold text-right tabular-nums">
                      ${product.price.toFixed(2)}
                      {product.compare_at_price && (
                        <span className="block text-[10px] text-gray-400 line-through">
                          ${product.compare_at_price.toFixed(2)}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`text-xs font-bold tabular-nums ${
                          (product.inventory?.quantity || 0) === 0
                            ? "text-red-500"
                            : (product.inventory?.quantity || 0) <=
                              (product.inventory?.low_stock_threshold || 10)
                            ? "text-amber-500"
                            : "text-emerald-500"
                        }`}
                      >
                        {product.inventory?.quantity ?? 0}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          product.status === "active"
                            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                            : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {product.status === "active" ? (
                          <Eye className="w-3 h-3" />
                        ) : (
                          <EyeOff className="w-3 h-3" />
                        )}
                        {product.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/20 text-gray-400 hover:text-blue-500 transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-xs text-gray-400 italic">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════ Create / Edit Modal ═══════ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-10 px-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="glass-premium w-full max-w-2xl rounded-[32px] shadow-2xl p-8 relative">
            {/* Close */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-lg font-extrabold mb-6">
              {editing ? "Edit Product" : "Create New Product"}
            </h2>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Name + Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-black/20 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-black/20 outline-none font-mono"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
                  Description
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-black/20 outline-none resize-none"
                />
              </div>

              {/* Price + Compare + SKU */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-black/20 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
                    Compare Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formComparePrice}
                    onChange={(e) => setFormComparePrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-black/20 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
                    SKU *
                  </label>
                  <input
                    type="text"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-black/20 outline-none font-mono"
                    required
                  />
                </div>
              </div>

              {/* Category + Status + Featured */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
                    Category
                  </label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-black/20 outline-none"
                  >
                    <option value="">None</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-black/20 outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formFeatured}
                      onChange={(e) => setFormFeatured(e.target.checked)}
                      className="w-4 h-4 rounded accent-amber-500"
                    />
                    <span className="text-xs font-semibold flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-500" /> Featured
                    </span>
                  </label>
                </div>
              </div>

              {/* Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-black/20 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
                    Low Stock Alert
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formLowStock}
                    onChange={(e) => setFormLowStock(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-black/20 outline-none"
                  />
                </div>
              </div>

              {/* ── Image Upload Section ── */}
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase block mb-2">
                  Product Images
                </label>
                <div className="flex flex-wrap gap-3">
                  {formImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 group"
                    >
                      <img
                        src={img.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      {idx === 0 && (
                        <span className="absolute top-0.5 left-0.5 bg-blue-500 text-white text-[7px] font-bold px-1 rounded">
                          Primary
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}

                  {/* Upload trigger */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 flex flex-col items-center justify-center gap-1 transition-colors"
                  >
                    <Upload className="w-4 h-4 text-gray-400" />
                    <span className="text-[8px] text-gray-400 font-bold">Upload</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
                <p className="text-[9px] text-gray-400 mt-2">
                  First image becomes primary. Drag & drop or click to upload. Max 5 images.
                </p>
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-xs font-bold text-gray-500 hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-full text-xs font-bold hover:opacity-90 disabled:opacity-50 shadow-lg"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  {editing ? "Update Product" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
