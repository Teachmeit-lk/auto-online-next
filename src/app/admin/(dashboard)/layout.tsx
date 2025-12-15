"use client";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { useRouter, usePathname } from "next/navigation";
import { logoutUserAsync } from "@/app/store/slice/authslice";
import Link from "next/link";
import { User as UserIcon, Menu, X } from "lucide-react";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authState = useSelector((state: RootState) => state.auth as any);
  const isAuthenticated = authState.isAuthenticated as boolean;
  const role = authState.user?.role as string | undefined;
  const router = useRouter();
  const dispatch = useDispatch();
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = React.useState(false);

  const navItems = [
    { label: "Users", href: "/admin/users" },
    { label: "Vehicle Brands", href: "/admin/vehicle-brands" },
    { label: "Vehicle Types", href: "/admin/vehicle-types" },
    { label: "Fuel Types", href: "/admin/fuel-types" },
    { label: "Measurement Units", href: "/admin/measurement-units" },
    { label: "Main Categories", href: "/admin/main-categories" },
    { label: "Main Services", href: "/admin/main-services" },
  ];

  const isActive = (href: string) => {
    if (!pathname) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  React.useEffect(() => {
    if (!isAuthenticated || role !== "admin") {
      router.replace("/admin/login");
    }
  }, [isAuthenticated, role, router]);

  const handleLogout = async () => {
    await dispatch(logoutUserAsync() as any);
    router.replace("/admin/login");
  };

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="flex h-screen">
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
                  } block px-3 py-2 rounded`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          <button
            onClick={handleLogout}
            className="mt-2 w-full px-3 py-2 rounded bg-red-500 text-white text-sm hover:bg-red-600"
          >
            Logout
          </button>
        </aside>

        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 p-4 transform transition-transform duration-200 ease-in-out md:hidden ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Admin</h2>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1 rounded hover:bg-gray-100"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="space-y-1 text-sm flex-1">
            {navItems.map(({ label, href }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMobileOpen(false)}
                  className={`${
                    active
                      ? "bg-gray-100 text-gray-900 font-semibold border-l-4 border-yellow-500"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent"
                  } block px-3 py-2 rounded`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          <button
            onClick={async () => {
              setMobileOpen(false);
              await handleLogout();
            }}
            className="w-full px-3 py-2 mt-40 rounded bg-red-500 text-white text-sm hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        <main className="flex-1 overflow-auto">
          <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                className="md:hidden p-2 rounded-md border border-gray-200 hover:bg-gray-100"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="text-lg font-semibold">Admin Dashboard</div>
            </div>

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
