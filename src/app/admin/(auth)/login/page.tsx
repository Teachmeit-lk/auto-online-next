"use client";

import React from "react";
import * as Yup from "yup";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RootState } from "@/app/store/store";
import { loginUserAsync, logout } from "@/app/store/slice/authslice";

const schema = Yup.object().shape({
  email: Yup.string().required("Email is required.").email("Invalid email address."),
  password: Yup.string().required("Password is required."),
});

const AdminLoginPage: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const authState = useSelector((state: RootState) => state.auth as any);
  const loading = authState.loading as boolean;
  const error = authState.error as string | null;

  const { control, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data: any) => {
    if (authState.isAuthenticated && authState.user?.role !== "admin") {
      (dispatch as any)(logout());
    }
    const result = await dispatch(
      loginUserAsync({ credentials: { email: data.email, password: data.password }, userType: "admin" }) as any
    );
    if (loginUserAsync.fulfilled.match(result)) {
      router.replace("/admin/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white shadow rounded p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Admin Login</h1>
          <Link href="/" className="text-sm text-blue-600 hover:underline">Back to main app</Link>
        </div>
        {error && (
          <div className="mb-3 p-2 rounded bg-red-50 text-red-600 text-sm text-center">{error}</div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Controller
              name="email"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input
                  {...field}
                  type="email"
                  className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${errors.email ? "focus:ring-red-500 border-red-300" : "focus:ring-yellow-500 border-gray-300"}`}
                  placeholder="admin@example.com"
                />
              )}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <Controller
              name="password"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input
                  {...field}
                  type="password"
                  className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${errors.password ? "focus:ring-red-500 border-red-300" : "focus:ring-yellow-500 border-gray-300"}`}
                  placeholder="Enter password"
                />
              )}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded bg-yellow-500 text-black font-semibold ${loading ? "opacity-70" : "hover:bg-yellow-600"}`}
          >
            {loading ? "LOGGING IN..." : "LOGIN"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;



