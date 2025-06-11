"use client";

import { ProtectedRoute } from "./components/RouteGuards";
import Dashboard from "./components/Dashboard";

export default function Home() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
