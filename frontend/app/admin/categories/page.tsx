"use client";

import { useEffect, useState } from "react";
import api from "../../../services/api";
import {
  Plus,
  Edit3,
  Trash2,
  FolderTree,
  X,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parent_id: number | null;
  created_at: string;
}

const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: "Electronics", slug: "electronics", description: "Gadgets, devices, and tech accessories", parent_id: null, created_at: "2026-06-01" },
  { id: 2, name: "Fashion", slug: "fashion", description: "Clothing, footwear, and accessories", parent_id: null, created_at: "2026-06-01" },
  { id: 3, name: "Home & Living", slug: "home-living", description: "Furniture, decor, and home essentials", parent_id: null, created_at: "2026-06-02" },
  { id: 4, name: "Sports", slug: "sports", description: "Athletic gear and outdoor equipment", parent_id: null, created_at: "2026-06-02" },
  { id: 5, name: "Books", slug: "books", description: "Fiction, non-fiction, and educational materials", parent_id: null, created_at: "2026-06-05" },
  { id: 6, name: "Smartphones", slug: "smartphones", description: "Mobile phones and accessories", parent_id: 1, created_at: "2026-06-10" },
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);

  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formParentId, setFormParentId] = useState("");

  useEffect(() => { loadCategories(); }, []);

  async function loadCategories() {
    setLoading(true);
    try {
      const res = await api.get("/products/categories");
      setCategories(res.data || []);
    } catch {
      setCategories(MOCK_CATEGORIES);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setFormName(""); setFormSlug(""); setFormDescription(""); setFormParentId("");
    setShowModal(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormDescription(cat.description || "");
    setFormParentId(cat.parent_id?.toString() || "");
    setShowModal(true);
  }

  function handleNameChange(val: string) {
    setFormName(val);
    if (!editing) setFormSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!formName || !formSlug) { toast.error("Name and slug are required."); return; }
    setSaving(true);
    const payload = {
      name: formName,
      slug: formSlug,
      description: formDescription || null,
      parent_id: formParentId ? parseInt(formParentId) : null,
    };
    try {
      if (editing) {
        await api.put(`/products/categories/${editing.id}`, payload);
        toast.success("Category updated!");
      } else {
        await api.post("/products/categories", payload);
        toast.success("Category created!");
      }
      setShowModal(false);
      loadCategories();
    } catch {
      if (editing) {
        setCategories((prev) => prev.map((c) => c.id === editing.id ? { ...c, ...payload } as Category : c));
        toast.success("Category updated (local demo)!");
      } else {
        setCategories((prev) => [{ id: Date.now(), ...payload, created_at: new Date().toISOString().slice(0, 10) } as Category, ...prev]);
        toast.success("Category created (local demo)!");
      }
      setShowModal(false);
    } finally { setSaving(false); }
  }

  async function handleDelete(cat: Category) {
    if (!confirm(`Delete "${cat.name}"?`)) return;
    try {
      await api.delete(`/products/categories/${cat.id}`);
      toast.success("Category deleted!");
      loadCategories();
    } catch {
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      toast.success("Category deleted (local demo)!");
    }
  }

  const roots = categories.filter((c) => !c.parent_id);
  const getChildren = (parentId: number) => categories.filter((c) => c.parent_id === parentId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold">Categories</h1>
          <p className="text-xs text-gray-400 mt-1">{categories.length} total categories</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-full text-xs font-bold hover:opacity-90 shadow-lg">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {roots.map((cat) => (
            <div key={cat.id} className="glass-premium p-5 rounded-3xl space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow">
                    <FolderTree className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">{cat.name}</h3>
                    <p className="text-[10px] text-gray-400 font-mono">/{cat.slug}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/20 text-gray-400 hover:text-blue-500"><Edit3 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(cat)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              {cat.description && <p className="text-[11px] text-gray-500 leading-relaxed">{cat.description}</p>}

              {/* Sub-categories */}
              {getChildren(cat.id).length > 0 && (
                <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-2">
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Sub-categories</p>
                  {getChildren(cat.id).map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-xl px-3 py-2">
                      <span className="text-xs font-semibold">{sub.name}</span>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(sub)} className="p-1 text-gray-400 hover:text-blue-500"><Edit3 className="w-3 h-3" /></button>
                        <button onClick={() => handleDelete(sub)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
          <div className="glass-premium w-full max-w-md rounded-[32px] shadow-2xl p-8 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"><X className="w-4 h-4" /></button>
            <h2 className="text-lg font-extrabold mb-6">{editing ? "Edit Category" : "Create Category"}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Name *</label>
                <input type="text" value={formName} onChange={(e) => handleNameChange(e.target.value)} className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-black/20 outline-none" required />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Slug *</label>
                <input type="text" value={formSlug} onChange={(e) => setFormSlug(e.target.value)} className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-black/20 outline-none font-mono" required />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Description</label>
                <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={2} className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-black/20 outline-none resize-none" />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Parent Category</label>
                <select value={formParentId} onChange={(e) => setFormParentId(e.target.value)} className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-black/20 outline-none">
                  <option value="">None (Top Level)</option>
                  {categories.filter((c) => c.id !== editing?.id && !c.parent_id).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-xs font-bold text-gray-500">Cancel</button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-full text-xs font-bold hover:opacity-90 disabled:opacity-50 shadow-lg">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {editing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
