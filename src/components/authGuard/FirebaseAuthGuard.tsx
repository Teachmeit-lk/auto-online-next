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
  const { isAuthenticated, user, loading } = useSelector((state: RootState) => state.auth);
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
          router.push("/user/profile");
        } else if (user?.role === "vendor") {
          router.push("/vendor/profile");
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
  const { isAuthenticated, user, loading, error } = useSelector((state: RootState) => state.auth);
  const { initialized } = useFirebase();

  return {
    isAuthenticated,
    user,
    loading,
    error,
    initialized,
    isReady: initialized && !loading,
  };
};