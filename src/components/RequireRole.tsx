import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { Role } from "../types";

interface Props {
  role: Role;
  children: React.ReactNode;
}

/**
 * Client-side gate for UX only — hides admin screens from people who
 * shouldn't see them. It is NOT the real security boundary: the API's
 * RequireRole middleware is what actually protects the write endpoints.
 */
export default function RequireRole({ role, children }: Props) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/" replace />;

  return <>{children}</>;
}
