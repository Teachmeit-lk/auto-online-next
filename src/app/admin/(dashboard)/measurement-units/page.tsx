"use client";

import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FirestoreService, COLLECTIONS, BaseDocument } from "@/service/firestoreService";

type UnitDoc = BaseDocument & { name: string };
type CreateUnitForm = { name: string };

const schema = Yup.object().shape({
  name: Yup.string().required("Name is required."),
});

const AdminMeasurementUnitsPage: React.FC = () => {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<UnitDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<UnitDoc | null>(null);

  const { control, handleSubmit, formState: { errors }, reset } = useForm<CreateUnitForm>({
    resolver: yupResolver(schema),
    defaultValues: { name: "" },
  });

  const load = async () => {
    setLoading(true);
    try {
      const list = await FirestoreService.getAll<UnitDoc>(COLLECTIONS.MEASUREMENT_UNITS, undefined, "name", "asc");
      setItems(list);
    } catch (e: any) {
      setError(e?.message || "Failed to load measurement units");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onSubmit = async (data: CreateUnitForm) => {
    setSubmitting(true);
    setMessage(null);
    setError(null);
    try {
      await FirestoreService.create<UnitDoc>(COLLECTIONS.MEASUREMENT_UNITS, { name: data.name, isActive: true } as any);
      setMessage("Measurement unit created successfully.");
      reset({ name: "" });
      setOpen(false);
      await load();
    } catch (e: any) {
      setError(e?.message || "Failed to create measurement unit.");
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
      await FirestoreService.update<UnitDoc>(COLLECTIONS.MEASUREMENT_UNITS, selected.id, { name: selected.name } as any);
      setMessage("Measurement unit updated successfully.");
      setEditOpen(false);
      await load();
    } catch (e: any) {
      setError(e?.message || "Failed to update measurement unit.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (item: UnitDoc) => {
    if (!item?.id) return;
    setSubmitting(true);
    setError(null);
    try {
      await FirestoreService.update<UnitDoc>(COLLECTIONS.MEASUREMENT_UNITS, item.id, { isActive: !item.isActive } as any);
      await load();
    } catch (e: any) {
      setError(e?.message || "Failed to update status.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">Measurement Units</h1>
        <div className="flex items-center gap-3 ml-auto">
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
                <th className="text-left px-4 py-2">Active</th>
                <th className="text-left px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-4 py-3" colSpan={3}>Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td className="px-4 py-3" colSpan={3}>No measurement units found.</td></tr>
              ) : (
                items.map((it) => (
                  <tr key={it.id} className="border-t">
                    <td className="px-4 py-2">{it.name}</td>
                    <td className="px-4 py-2">{it.isActive ? "Yes" : "No"}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <button
                          className="px-3 py-1 rounded border text-xs hover:bg-gray-50"
                          onClick={() => { setSelected({ ...it }); setEditOpen(true); }}
                        >
                          Edit
                        </button>
                        <button
                          className={`px-3 py-1 rounded text-xs ${it.isActive ? "bg-red-500 text-white hover:bg-red-600" : "bg-green-500 text-white hover:bg-green-600"}`}
                          onClick={() => toggleActive(it)}
                          disabled={submitting}
                        >
                          {it.isActive ? "Revoke" : "Activate"}
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
              <h2 className="text-lg font-semibold">Create Measurement Unit</h2>
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
              <h2 className="text-lg font-semibold">Edit Measurement Unit</h2>
              <button onClick={() => setEditOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            {error && <div className="mb-3 p-2 rounded bg-red-50 text-red-600 text-sm">{error}</div>}
            <form onSubmit={onEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  value={selected.name || ""}
                  onChange={(e) => setSelected({ ...(selected as UnitDoc), name: e.target.value })}
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

export default AdminMeasurementUnitsPage;


