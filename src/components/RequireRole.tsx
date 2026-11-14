import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { Role } from "../types";

interface Props {
  role?: Role; // without a role any logged-in user may pass
  children: React.ReactNode;
}

export default function RequireRole({ role, children }: Props) {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <div
        role="status"
        className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper text-sm text-ink-soft"
        aria-live="polite"
      >
        <img src="/logo-mark.png" alt="" className="h-14 w-auto animate-pulse motion-reduce:animate-none" />
        Checking your session
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;

  return <>{children}</>;
}