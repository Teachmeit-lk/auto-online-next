"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import * as Yup from "yup";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { changePassword } from "@/service/firebaseAuthService";

const AdminProfilePage: React.FC = () => {
  const authState = useSelector((state: RootState) => state.auth as any);
  const user = authState.user;
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const schema = Yup.object().shape({
    currentPassword: Yup.string().required("Current password is required."),
    newPassword: Yup.string()
      .required("New password is required.")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/,
        "Must be 8+ chars with upper, lower, and special character."
      ),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword")], "Passwords must match.")
      .required("Confirm your new password."),
  });

  const { control, handleSubmit, formState: { errors }, reset } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data: any) => {
    setUpdating(true);
    setMessage(null);
    setError(null);
    try {
      await changePassword(data.currentPassword, data.newPassword);
      setMessage("Password updated successfully.");
      reset({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e: any) {
      setError(e?.message || "Failed to update password.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      <div className="bg-white rounded shadow p-4 space-y-2 text-sm">
        <div><span className="text-gray-500">Name:</span> {user?.firstName} {user?.lastName}</div>
        <div><span className="text-gray-500">Email:</span> {user?.email}</div>
        <div><span className="text-gray-500">Role:</span> {user?.role}</div>
      </div>

      <div className="mt-6 bg-white rounded shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Update Password</h2>
        {message && <div className="mb-3 p-2 rounded bg-green-50 text-green-700 text-sm">{message}</div>}
        {error && <div className="mb-3 p-2 rounded bg-red-50 text-red-600 text-sm">{error}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium mb-1">Current Password</label>
            <Controller
              name="currentPassword"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input
                  {...field}
                  type="password"
                  className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${errors.currentPassword ? "focus:ring-red-500 border-red-300" : "focus:ring-yellow-500 border-gray-300"}`}
                />
              )}
            />
            {errors.currentPassword && <p className="text-red-500 text-sm mt-1">{errors.currentPassword.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <Controller
              name="newPassword"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input
                  {...field}
                  type="password"
                  className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${errors.newPassword ? "focus:ring-red-500 border-red-300" : "focus:ring-yellow-500 border-gray-300"}`}
                />
              )}
            />
            {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirm New Password</label>
            <Controller
              name="confirmPassword"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input
                  {...field}
                  type="password"
                  className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${errors.confirmPassword ? "focus:ring-red-500 border-red-300" : "focus:ring-yellow-500 border-gray-300"}`}
                />
              )}
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
          </div>
          <button
            type="submit"
            disabled={updating}
            className={`px-4 py-2 rounded bg-yellow-500 text-black text-sm font-semibold ${updating ? "opacity-70" : "hover:bg-yellow-600"}`}
          >
            {updating ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminProfilePage;


