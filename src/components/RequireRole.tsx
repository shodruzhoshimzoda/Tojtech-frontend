import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { Role } from "../types";

interface Props {
  role: Role;
  children: React.ReactNode;
}

export default function RequireRole({ role, children }: Props) {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-ink-soft">
        Loading…
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/" replace />;

  return <>{children}</>;
}