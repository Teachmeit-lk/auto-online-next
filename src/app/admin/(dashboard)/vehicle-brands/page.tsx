"use client";

import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FirestoreService, COLLECTIONS, VehicleBrand } from "@/service/firestoreService";

type CreateBrandForm = {
  name: string;
  country: string;
  sortOrder: number;
};

const schema = Yup.object().shape({
  name: Yup.string().required("Name is required."),
  country: Yup.string().required("Country is required."),
  sortOrder: Yup.number().typeError("Sort order must be a number").min(0).required("Sort order is required"),
});

const AdminVehicleBrandsPage: React.FC = () => {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [brands, setBrands] = useState<VehicleBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<VehicleBrand | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const { control, handleSubmit, formState: { errors }, reset } = useForm<CreateBrandForm>({
    resolver: yupResolver(schema),
    defaultValues: { name: "", country: "", sortOrder: 0 },
  });

  const loadBrands = async () => {
    setLoading(true);
    try {
      const list = await FirestoreService.getAll<VehicleBrand>(COLLECTIONS.VEHICLE_BRANDS, undefined, "sortOrder", "asc");
      setBrands(list);
    } catch (e: any) {
      setError(e?.message || "Failed to load vehicle brands");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const onSubmit = async (data: CreateBrandForm) => {
    setSubmitting(true);
    setMessage(null);
    setError(null);
    try {
      await FirestoreService.create<VehicleBrand>(COLLECTIONS.VEHICLE_BRANDS, {
        name: data.name,
        country: data.country,
        sortOrder: Number(data.sortOrder) || 0,
        isActive: true,
      } as any);
      setMessage("Vehicle brand created successfully.");
      reset({ name: "", country: "", sortOrder: 0 });
      setOpen(false);
      await loadBrands();
    } catch (e: any) {
      setError(e?.message || "Failed to create vehicle brand.");
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
      await FirestoreService.update<VehicleBrand>(COLLECTIONS.VEHICLE_BRANDS, selected.id, {
        name: selected.name,
        country: selected.country,
        sortOrder: selected.sortOrder ?? 0,
      } as any);
      setMessage("Vehicle brand updated successfully.");
      setEditOpen(false);
      await loadBrands();
    } catch (e: any) {
      setError(e?.message || "Failed to update vehicle brand.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (brand: VehicleBrand) => {
    if (!brand?.id) return;
    setSubmitting(true);
    setError(null);
    try {
      await FirestoreService.update<VehicleBrand>(COLLECTIONS.VEHICLE_BRANDS, brand.id, { isActive: !brand.isActive } as any);
      await loadBrands();
    } catch (e: any) {
      setError(e?.message || "Failed to update brand status.");
    } finally {
      setSubmitting(false);
    }
  };

  const visible = brands.filter((b) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "active") return !!b.isActive;
    return !b.isActive;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">Vehicle Brands</h1>
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
                <th className="text-left px-4 py-2">Country</th>
                <th className="text-left px-4 py-2">Sort Order</th>
                <th className="text-left px-4 py-2">Active</th>
                <th className="text-left px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-4 py-3" colSpan={5}>Loading...</td></tr>
              ) : visible.length === 0 ? (
                <tr><td className="px-4 py-3" colSpan={5}>No brands found.</td></tr>
              ) : (
                visible.map((b) => (
                  <tr key={b.id} className="border-t">
                    <td className="px-4 py-2">{b.name}</td>
                    <td className="px-4 py-2">{b.country}</td>
                    <td className="px-4 py-2">{b.sortOrder ?? 0}</td>
                    <td className="px-4 py-2">{b.isActive ? "Yes" : "No"}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <button
                          className="px-3 py-1 rounded border text-xs hover:bg-gray-50"
                          onClick={() => { setSelected({ ...b }); setEditOpen(true); }}
                        >
                          Edit
                        </button>
                        <button
                          className={`px-3 py-1 rounded text-xs ${b.isActive ? "bg-red-500 text-white hover:bg-red-600" : "bg-green-500 text-white hover:bg-green-600"}`}
                          onClick={() => toggleActive(b)}
                          disabled={submitting}
                        >
                          {b.isActive ? "Revoke" : "Activate"}
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
              <h2 className="text-lg font-semibold">Create New Vehicle Brand</h2>
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
                <label className="block text-sm font-medium mb-1">Country</label>
                <Controller
                  name="country"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <input
                      {...field}
                      className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${errors.country ? "focus:ring-red-500 border-red-300" : "focus:ring-yellow-500 border-gray-300"}`}
                    />
                  )}
                />
                {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>}
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
              <h2 className="text-lg font-semibold">Edit Vehicle Brand</h2>
              <button onClick={() => setEditOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            {error && <div className="mb-3 p-2 rounded bg-red-50 text-red-600 text-sm">{error}</div>}
            <form onSubmit={onEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  value={selected.name || ""}
                  onChange={(e) => setSelected({ ...(selected as VehicleBrand), name: e.target.value })}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Country</label>
                <input
                  value={selected.country || ""}
                  onChange={(e) => setSelected({ ...(selected as VehicleBrand), country: e.target.value })}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sort Order</label>
                <input
                  value={selected.sortOrder ?? 0}
                  onChange={(e) => setSelected({ ...(selected as VehicleBrand), sortOrder: Number(e.target.value) || 0 })}
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

export default AdminVehicleBrandsPage;


