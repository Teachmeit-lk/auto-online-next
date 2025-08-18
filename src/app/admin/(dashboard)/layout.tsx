"use client";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { useRouter, usePathname } from "next/navigation";
import { logoutUserAsync } from "@/app/store/slice/authslice";
import Link from "next/link";
import { User as UserIcon } from "lucide-react";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const authState = useSelector((state: RootState) => state.auth as any);
  const isAuthenticated = authState.isAuthenticated as boolean;
  const role = authState.user?.role as string | undefined;
  const router = useRouter();
  const dispatch = useDispatch();
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Users", href: "/admin/users" },
    { label: "Settings", href: "/admin/settings" },
  ];

  const isActive = (href: string) => {
    if (!pathname) return false;
    // Consider the item active if current path equals or starts with the href
    return pathname === href || pathname.startsWith(href + "/");
  };

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
          <h2 className="text-xl font-semibold mb-4">Admin</h2>
          <nav className="space-y-1 text-sm flex-1">
            {navItems.map(({ label, href }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`${
                    active
                      ? "bg-gray-100 text-gray-900 font-semibold border-l-4 border-yellow-500"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent"
                  } block px-3 py-2 rounded"`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          <button
            onClick={async () => {
              await dispatch(logoutUserAsync() as any);
              router.replace("/admin/login");
            }}
            className="mt-2 w-full px-3 py-2 rounded bg-red-500 text-white text-sm hover:bg-red-600"
          >
            Logout
          </button>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-auto">
          <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <div className="text-lg font-semibold">Admin Dashboard</div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/profile"
                className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 cursor-pointer"
                aria-label="Open profile"
              >
                <UserIcon size={18} className="text-gray-700" />
              </Link>
            </div>
          </header>
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}


