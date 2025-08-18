"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { useRouter } from "next/navigation";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const authState = useSelector((state: RootState) => state.auth as any);
  const isAuthenticated = authState.isAuthenticated as boolean;
  const role = authState.user?.role as string | undefined;
  const router = useRouter();

  React.useEffect(() => {
    if (!isAuthenticated || role !== "admin") {
      router.replace("/admin/login");
    }
  }, [isAuthenticated, role, router]);

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 p-4 hidden md:block">
          <h2 className="text-xl font-semibold mb-6">Admin</h2>
          <nav className="space-y-2 text-sm">
            <a href="/admin/dashboard" className="block px-3 py-2 rounded hover:bg-gray-100">Dashboard</a>
            <a href="/admin/users" className="block px-3 py-2 rounded hover:bg-gray-100">Users</a>
            <a href="/admin/settings" className="block px-3 py-2 rounded hover:bg-gray-100">Settings</a>
          </nav>
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


