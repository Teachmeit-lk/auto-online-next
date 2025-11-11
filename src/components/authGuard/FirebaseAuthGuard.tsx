"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { useFirebase } from "@/contexts/FirebaseContext";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: "buyer" | "vendor" | "admin";
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export const FirebaseAuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requiredRole,
  redirectTo = "/login",
  fallback,
}) => {
  const router = useRouter();
  const { initialized } = useFirebase();
  const authState = useSelector((state: RootState) => state.auth as any);
  const isAuthenticated = !!authState?.isAuthenticated;
  const user = authState?.user;
  const loading = !!authState?.loading;
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (initialized && !loading) {
      setIsChecking(false);

      // Check if user is authenticated
      if (!isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      // Check if user has required role
      if (requiredRole && user?.role !== requiredRole) {
        // Redirect based on user role
        if (user?.role === "buyer") {
          router.push("/user/search-vendors");
        } else if (user?.role === "vendor") {
          router.push("/vendor/products");
        } else {
          router.push("/");
        }
        return;
      }
    }
  }, [initialized, loading, isAuthenticated, user, requiredRole, router, redirectTo]);

  // Show loading state while checking authentication
  if (isChecking || loading || !initialized) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-500"></div>
        </div>
      )
    );
  }

  // Show children if authenticated and authorized
  if (isAuthenticated && (!requiredRole || user?.role === requiredRole)) {
    return <>{children}</>;
  }

  // Return null if redirecting
  return null;
};

// HOC for protecting pages
export const withFirebaseAuth = <P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    requiredRole?: "buyer" | "vendor" | "admin";
    redirectTo?: string;
    fallback?: React.ReactNode;
  }
) => {
  const AuthenticatedComponent = (props: P) => {
    return (
      <FirebaseAuthGuard
        requiredRole={options?.requiredRole}
        redirectTo={options?.redirectTo}
        fallback={options?.fallback}
      >
        <Component {...props} />
      </FirebaseAuthGuard>
    );
  };

  AuthenticatedComponent.displayName = `withFirebaseAuth(${Component.displayName || Component.name})`;
  return AuthenticatedComponent;
};

// Hook for checking authentication status
export const useAuth = () => {
  const authState = useSelector((state: RootState) => state.auth as any);
  const { initialized } = useFirebase();

  return {
    isAuthenticated: !!authState?.isAuthenticated,
    user: authState?.user,
    loading: !!authState?.loading,
    error: authState?.error,
    initialized,
    isReady: initialized && !authState?.loading,
  };
};