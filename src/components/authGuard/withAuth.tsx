"use client";

import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect, ComponentType } from "react";
import { RootState } from "@/app/store/store";

export default function withAuth<T extends object>(WrappedComponent: ComponentType<T>) {
  const ComponentWithAuth = (props: T) => {
    const router = useRouter();
    const isAuthenticated = useSelector(
      (state: RootState) => state.auth.isAuthenticated
    );

    useEffect(() => {
      if (!isAuthenticated) {
        router.replace("/user/login"); // Adjust route as needed
      }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) return null;

    return <WrappedComponent {...props} />;
  };

  return ComponentWithAuth;
}
