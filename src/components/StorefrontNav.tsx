import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function StorefrontNav() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-8 px-6 py-4">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-700 tracking-tight text-ink">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal text-sm text-white shadow-[0_6px_16px_rgba(23,105,224,0.25)]">T</span>
          <span>TojTech</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm text-ink-soft">
          <Link to="/" className="hover:text-ink transition-colors">
            Catalog
          </Link>
          {isAdmin && (
            <Link to="/admin" className="hover:text-ink transition-colors">
              Admin panel
            </Link>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-4 text-sm">
          {user ? (
            <>
              <span className="text-ink-soft">
                {user.email}
                <span className="ml-1.5 rounded-full border border-line px-2 py-0.5 text-xs text-ink-soft">
                  {user.role}
                </span>
              </span>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-line bg-white px-3 py-1.5 font-medium text-ink transition-colors hover:border-signal hover:text-signal"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-ink-soft hover:text-ink transition-colors">
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-signal px-3 py-1.5 font-medium text-white hover:bg-signal-dim transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
