// components/Header.js
"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import NotificationBell from "./NotificationBell";

export default function Header() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div>
            <Link href={user ? "/dashboard" : "/"}>
              <h1 className="text-3xl font-bold text-gray-900 cursor-pointer hover:text-gray-700">
                P2P Lektor
              </h1>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {loading ? (
              // Loading state
              <div className="animate-pulse">
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
              </div>
            ) : user ? (
              // Logged in state
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <NotificationBell />
                  <span className="text-sm text-gray-600">
                    Welcome, {user.displayName || user.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              // Not logged in state
              <div className="flex items-center space-x-4">
                <p className="text-sm text-gray-600">
                  Please{" "}
                  <Link
                    href="/login"
                    className="text-blue-600 hover:text-blue-500"
                  >
                    log in
                  </Link>{" "}
                  to access your dashboard.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
