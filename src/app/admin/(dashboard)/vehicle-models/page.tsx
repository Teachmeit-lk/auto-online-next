"use client";

import React, { useEffect, useMemo, useState } from "react";
import * as Yup from "yup";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FirestoreService, COLLECTIONS, VehicleBrand, VehicleModel } from "@/service/firestoreService";

type CreateModelsForm = {
  brandId: string;
  models: string; // comma or newline separated
};

const schema = Yup.object().shape({
  brandId: Yup.string().required("Vehicle brand is required."),
  models: Yup.string().required("Enter one or more model names."),
});

const AdminVehicleModelsPage: React.FC = () => {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [brands, setBrands] = useState<VehicleBrand[]>([]);
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<VehicleModel | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [brandFilter, setBrandFilter] = useState<string>("all");

  const { control, handleSubmit, formState: { errors }, reset } = useForm<CreateModelsForm>({
    resolver: yupResolver(schema),
    defaultValues: { brandId: "", models: "" },
  });

  const brandIdToName = useMemo(() => {
    const m: Record<string, string> = {};
    brands.forEach((b) => { if (b.id) m[b.id] = b.country ? `${b.name} - ${b.country}` : b.name; });
    return m;
  }, [brands]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [brandList, modelList] = await Promise.all([
        FirestoreService.getAll<VehicleBrand>(COLLECTIONS.VEHICLE_BRANDS, undefined, "sortOrder", "asc"),
        FirestoreService.getAll<VehicleModel>(COLLECTIONS.VEHICLE_MODELS, undefined, "name", "asc"),
      ]);
      setBrands(brandList);
      setModels(modelList);
    } catch (e: any) {
      setError(e?.message || "Failed to load vehicle models");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const onSubmit = async (data: CreateModelsForm) => {
    setSubmitting(true);
    setMessage(null);
    setError(null);
    try {
      const names = data.models
        .split(/\n|,/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      if (names.length === 0) {
        setError("Please enter at least one model name.");
        setSubmitting(false);
        return;
      }

      // Batch create
      await FirestoreService.batchWrite(
        names.map((name) => ({
          type: "create" as const,
          collection: COLLECTIONS.VEHICLE_MODELS,
          data: {
            brandId: data.brandId,
            name,
            type: "",
            yearStart: 0,
            fuelTypes: [],
            isActive: true,
          },
        }))
      );

      setMessage("Vehicle models created successfully.");
      reset({ brandId: "", models: "" });
      setOpen(false);
      await loadAll();
    } catch (e: any) {
      setError(e?.message || "Failed to create vehicle models.");
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
      await FirestoreService.update<VehicleModel>(COLLECTIONS.VEHICLE_MODELS, selected.id, {
        name: selected.name,
        brandId: selected.brandId,
      } as any);
      setMessage("Vehicle model updated successfully.");
      setEditOpen(false);
      await loadAll();
    } catch (e: any) {
      setError(e?.message || "Failed to update vehicle model.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (model: VehicleModel) => {
    if (!model?.id) return;
    setSubmitting(true);
    setError(null);
    try {
      await FirestoreService.update<VehicleModel>(COLLECTIONS.VEHICLE_MODELS, model.id, { isActive: !(model as any).isActive } as any);
      await loadAll();
    } catch (e: any) {
      setError(e?.message || "Failed to update model status.");
    } finally {
      setSubmitting(false);
    }
  };

  const visible = models.filter((m) => {
    const active = (m as any).isActive ?? true;
    if (statusFilter === "active" && !active) return false;
    if (statusFilter === "inactive" && active) return false;
    if (brandFilter !== "all" && m.brandId !== brandFilter) return false;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">Vehicle Models</h1>
        <div className="flex items-center gap-3 ml-auto flex-wrap">
          <label className="text-sm text-gray-600">Brand</label>
          <select
            className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
          >
            <option value="all">All</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.country ? `${b.name} - ${b.country}` : b.name}</option>
            ))}
          </select>
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
                <th className="text-left px-4 py-2">Brand</th>
                <th className="text-left px-4 py-2">Model</th>
                <th className="text-left px-4 py-2">Active</th>
                <th className="text-left px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-4 py-3" colSpan={4}>Loading...</td></tr>
              ) : visible.length === 0 ? (
                <tr><td className="px-4 py-3" colSpan={4}>No models found.</td></tr>
              ) : (
                visible.map((m) => (
                  <tr key={m.id} className="border-t">
                    <td className="px-4 py-2">{brandIdToName[m.brandId] || m.brandId}</td>
                    <td className="px-4 py-2">{m.name}</td>
                    <td className="px-4 py-2">{(m as any).isActive ? "Yes" : "No"}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <button
                          className="px-3 py-1 rounded border text-xs hover:bg-gray-50"
                          onClick={() => { setSelected({ ...m }); setEditOpen(true); }}
                        >
                          Edit
                        </button>
                        <button
                          className={`px-3 py-1 rounded text-xs ${(m as any).isActive ? "bg-red-500 text-white hover:bg-red-600" : "bg-green-500 text-white hover:bg-green-600"}`}
                          onClick={() => toggleActive(m)}
                          disabled={submitting}
                        >
                          {(m as any).isActive ? "Revoke" : "Activate"}
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
              <h2 className="text-lg font-semibold">Create Vehicle Models</h2>
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            {message && <div className="mb-3 p-2 rounded bg-green-50 text-green-700 text-sm">{message}</div>}
            {error && <div className="mb-3 p-2 rounded bg-red-50 text-red-600 text-sm">{error}</div>}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Vehicle Brand</label>
                <Controller
                  name="brandId"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 ${errors.brandId ? "focus:ring-red-500 border-red-300" : "focus:ring-yellow-500 border-gray-300"}`}
                    >
                      <option value="">Select Brand</option>
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>{b.country ? `${b.name} - ${b.country}` : b.name}</option>
                      ))}
                    </select>
                  )}
                />
                {errors.brandId && <p className="text-red-500 text-sm mt-1">{errors.brandId.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Models (comma or newline separated)</label>
                <Controller
                  name="models"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <textarea
                      {...field}
                      rows={4}
                      className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${errors.models ? "focus:ring-red-500 border-red-300" : "focus:ring-yellow-500 border-gray-300"}`}
                    />
                  )}
                />
                {errors.models && <p className="text-red-500 text-sm mt-1">{errors.models.message}</p>}
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
              <h2 className="text-lg font-semibold">Edit Vehicle Model</h2>
              <button onClick={() => setEditOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            {error && <div className="mb-3 p-2 rounded bg-red-50 text-red-600 text-sm">{error}</div>}
            <form onSubmit={onEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Vehicle Brand</label>
                <select
                  value={selected.brandId}
                  onChange={(e) => setSelected({ ...(selected as VehicleModel), brandId: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.country ? `${b.name} - ${b.country}` : b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Model</label>
                <input
                  value={selected.name || ""}
                  onChange={(e) => setSelected({ ...(selected as VehicleModel), name: e.target.value })}
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

export default AdminVehicleModelsPage;


