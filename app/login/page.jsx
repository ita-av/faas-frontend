import { PublicRoute } from "../components/RouteGuards";
import Login from "../components/Login";

export default function LoginPage() {
  return (
    <PublicRoute>
      <Login />
    </PublicRoute>
  );
}
