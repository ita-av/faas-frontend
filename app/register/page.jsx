import { PublicRoute } from "../components/RouteGuards";
import Register from "../components/Register";

export default function RegisterPage() {
  return (
    <PublicRoute>
      <Register />
    </PublicRoute>
  );
}
