"use client";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { useRouter } from "next/navigation";
import { logoutUserAsync } from "@/app/store/slice/authslice";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const authState = useSelector((state: RootState) => state.auth as any);
  const isAuthenticated = authState.isAuthenticated as boolean;
  const role = authState.user?.role as string | undefined;
  const router = useRouter();
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (!isAuthenticated || role !== "admin") {
      router.replace("/admin/login");
    }
  }, [isAuthenticated, role, router]);

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 p-4 hidden md:flex flex-col">
          <h2 className="text-xl font-semibold mb-6">Admin</h2>
          <nav className="space-y-2 text-sm flex-1">
            <a href="/admin/dashboard" className="block px-3 py-2 rounded hover:bg-gray-100">Dashboard</a>
            <a href="/admin/users" className="block px-3 py-2 rounded hover:bg-gray-100">Users</a>
            <a href="/admin/settings" className="block px-3 py-2 rounded hover:bg-gray-100">Settings</a>
          </nav>
          <button
            onClick={async () => {
              await dispatch(logoutUserAsync() as any);
              router.replace("/admin/login");
            }}
            className="mt-4 w-full px-3 py-2 rounded bg-red-500 text-white text-sm hover:bg-red-600"
          >
            Logout
          </button>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-auto">
          <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <div className="text-lg font-semibold">Admin Dashboard</div>
            <div className="text-sm text-gray-500">{authState.user?.email}</div>
          </header>
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}


