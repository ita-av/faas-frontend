// components/RouteGuards.js
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";

// Loading component
function LoadingSpinner() {
  return (
    <div className="min-h-scree.n flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

// Protected Route Component (requires authentication)
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null; // or redirect component
  }

  return children;
}

// Public Route Component (redirects authenticated users)
export function PublicRoute({ children, redirectTo = "/dashboard" }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return null; // or redirect component
  }

  return children;
}

// Semi-protected route (accessible to both, but shows different content)
export function ConditionalRoute({ children, fallback }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return user ? children : fallback;
}
