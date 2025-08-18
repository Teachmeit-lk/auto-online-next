"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { useRouter } from "next/navigation";

export default function AdminAuthLayout({ children }: { children: React.ReactNode }) {
  const authState = useSelector((state: RootState) => state.auth as any);
  const isAuthenticated = authState.isAuthenticated as boolean;
  const role = authState.user?.role as string | undefined;
  const router = useRouter();

  React.useEffect(() => {
    if (isAuthenticated && role === "admin") {
      router.replace("/admin/dashboard");
    }
  }, [isAuthenticated, role, router]);

  return <>{children}</>;
}


