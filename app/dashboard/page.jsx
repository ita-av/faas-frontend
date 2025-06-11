// app/dashboard/page.js (Protected route)
import { ProtectedRoute } from "../components/RouteGuards";
import Dashboard from "../components/Dashboard";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
