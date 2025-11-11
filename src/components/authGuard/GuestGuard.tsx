"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { useFirebase } from "@/contexts/FirebaseContext";

interface GuestGuardProps {
  children: React.ReactNode;
}

// Renders children only when NOT authenticated. If authenticated, redirects away.
export const GuestGuard: React.FC<GuestGuardProps> = ({ children }) => {
  const router = useRouter();
  const { initialized } = useFirebase();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === "buyer") {
        router.replace("/user/search-vendors");
      } else if (user?.role === "vendor") {
        router.replace("/vendor/products");
      } else {
        router.replace("/");
      }
    }
  }, [isAuthenticated, user, router]);

  // Always render children; if already authenticated the effect will redirect away.
  return <>{children}</>;
};


