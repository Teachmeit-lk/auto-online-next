"use client";

import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FirestoreService, COLLECTIONS, Category } from "@/service/firestoreService";

type CreateCategoryForm = {
  name: string;
  description?: string;
  sortOrder: number;
};

const schema = Yup.object().shape({
  name: Yup.string().required("Name is required."),
  description: Yup.string().notRequired(),
  sortOrder: Yup.number().typeError("Sort order must be a number").min(0).required("Sort order is required"),
});

const AdminMainCategoriesPage: React.FC = () => {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<Category | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const { control, handleSubmit, formState: { errors }, reset } = useForm<CreateCategoryForm>({
    resolver: yupResolver(schema),
    defaultValues: { name: "", description: "", sortOrder: 0 },
  });

  const loadCategories = async () => {
    setLoading(true);
    try {
      const list = await FirestoreService.getAll<Category>(COLLECTIONS.CATEGORIES, undefined, "createdAt", "desc");
      setCategories(list);
    } catch (e: any) {
      setError(e?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const onSubmit = async (data: CreateCategoryForm) => {
    setSubmitting(true);
    setMessage(null);
    setError(null);
    try {
      await FirestoreService.create<Category>(COLLECTIONS.CATEGORIES, {
        name: data.name,
        description: data.description || "",
        sortOrder: Number(data.sortOrder) || 0,
        isActive: true,
      } as any);
      setMessage("Category created successfully.");
      reset({ name: "", description: "", sortOrder: 0 });
      setOpen(false);
      await loadCategories();
    } catch (e: any) {
      setError(e?.message || "Failed to create category.");
    } finally {
      setSubmitting(false);
    }
  };

  const onEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selected?.id) return;
    setSubmitting(true);
    setMessage(null);
    setError(null);
    try {
      await FirestoreService.update<Category>(COLLECTIONS.CATEGORIES, selected.id, {
        name: selected.name,
        description: selected.description || "",
        sortOrder: selected.sortOrder ?? 0,
      } as any);
      setMessage("Category updated successfully.");
      setEditOpen(false);
      await loadCategories();
    } catch (e: any) {
      setError(e?.message || "Failed to update category.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (category: Category) => {
    if (!category?.id) return;
    setSubmitting(true);
    setError(null);
    try {
      await FirestoreService.update<Category>(COLLECTIONS.CATEGORIES, category.id, { isActive: !category.isActive } as any);
      await loadCategories();
    } catch (e: any) {
      setError(e?.message || "Failed to update category status.");
    } finally {
      setSubmitting(false);
    }
  };

  const visible = categories.filter((c) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "active") return !!c.isActive;
    return !c.isActive;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">Main Categories</h1>
        <div className="flex items-center gap-3 ml-auto">
          <label className="text-sm text-gray-600">Status</label>
          <select
            className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 rounded bg-yellow-500 text-black text-sm font-semibold hover:bg-yellow-600"
          >
            Create New
          </button>
        </div>
      </div>

      <div className="bg-white rounded shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left px-4 py-2">Name</th>
                <th className="text-left px-4 py-2">Description</th>
                <th className="text-left px-4 py-2">Sort Order</th>
                <th className="text-left px-4 py-2">Active</th>
                <th className="text-left px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-4 py-3" colSpan={5}>Loading...</td></tr>
              ) : visible.length === 0 ? (
                <tr><td className="px-4 py-3" colSpan={5}>No categories found.</td></tr>
              ) : (
                visible.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="px-4 py-2">{c.name}</td>
                    <td className="px-4 py-2">{c.description || "-"}</td>
                    <td className="px-4 py-2">{c.sortOrder ?? 0}</td>
                    <td className="px-4 py-2">{c.isActive ? "Yes" : "No"}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <button
                          className="px-3 py-1 rounded border text-xs hover:bg-gray-50"
                          onClick={() => { setSelected({ ...c }); setEditOpen(true); }}
                        >
                          Edit
                        </button>
                        <button
                          className={`px-3 py-1 rounded text-xs ${c.isActive ? "bg-red-500 text-white hover:bg-red-600" : "bg-green-500 text-white hover:bg-green-600"}`}
                          onClick={() => toggleActive(c)}
                          disabled={submitting}
                        >
                          {c.isActive ? "Revoke" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded shadow-lg p-5 w-full max-w-lg">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Create New Category</h2>
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            {message && <div className="mb-3 p-2 rounded bg-green-50 text-green-700 text-sm">{message}</div>}
            {error && <div className="mb-3 p-2 rounded bg-red-50 text-red-600 text-sm">{error}</div>}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Controller
                  name="name"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <input
                      {...field}
                      className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${errors.name ? "focus:ring-red-500 border-red-300" : "focus:ring-yellow-500 border-gray-300"}`}
                    />
                  )}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Controller
                  name="description"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <textarea
                      {...field}
                      rows={3}
                      className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${errors.description ? "focus:ring-red-500 border-red-300" : "focus:ring-yellow-500 border-gray-300"}`}
                    />
                  )}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sort Order</label>
                <Controller
                  name="sortOrder"
                  control={control}
                  defaultValue={0}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${errors.sortOrder ? "focus:ring-red-500 border-red-300" : "focus:ring-yellow-500 border-gray-300"}`}
                    />
                  )}
                />
                {errors.sortOrder && <p className="text-red-500 text-sm mt-1">{errors.sortOrder.message}</p>}
              </div>
              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded border text-sm">Cancel</button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-4 py-2 rounded bg-yellow-500 text-black text-sm font-semibold ${submitting ? "opacity-70" : "hover:bg-yellow-600"}`}
                >
                  {submitting ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded shadow-lg p-5 w-full max-w-lg">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Edit Category</h2>
              <button onClick={() => setEditOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            {error && <div className="mb-3 p-2 rounded bg-red-50 text-red-600 text-sm">{error}</div>}
            <form onSubmit={onEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  value={selected.name || ""}
                  onChange={(e) => setSelected({ ...(selected as Category), name: e.target.value })}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={selected.description || ""}
                  onChange={(e) => setSelected({ ...(selected as Category), description: e.target.value })}
                  rows={3}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sort Order</label>
                <input
                  value={selected.sortOrder ?? 0}
                  onChange={(e) => setSelected({ ...(selected as Category), sortOrder: Number(e.target.value) || 0 })}
                  type="number"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={() => setEditOpen(false)} className="px-4 py-2 rounded border text-sm">Cancel</button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-4 py-2 rounded bg-yellow-500 text-black text-sm font-semibold ${submitting ? "opacity-70" : "hover:bg-yellow-600"}`}
                >
                  {submitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMainCategoriesPage;


