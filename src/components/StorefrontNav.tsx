import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useCart } from "../cart/CartContext";
import { CartIcon } from "./Icons";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? "bg-mist text-navy" : "text-ink-soft hover:text-ink"
  }`;

export default function StorefrontNav() {
  const { user, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5 sm:gap-6 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5" aria-label="TojTech home">
          <img src="/logo-mark.png" alt="" className="h-9 w-auto" />
          <span className="font-display text-[1.15rem] font-extrabold tracking-[0.05em] text-navy">
            TOJTECH
          </span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex" aria-label="Main">
          <NavLink to="/" end className={linkClass}>
            Catalog
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className={linkClass}>
              Admin panel
            </NavLink>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <Link
            to="/cart"
            aria-label={itemCount > 0 ? `Cart, ${itemCount} items` : "Cart"}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-white text-ink transition-colors hover:border-signal hover:text-signal"
          >
            <CartIcon />
            {itemCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-signal px-1 text-[11px] font-bold tabular-nums text-white">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <>
              <div className="hidden items-center gap-2.5 md:flex">
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-navy font-display text-sm font-bold text-white"
                >
                  {user.email.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-[11rem] truncate text-sm text-ink-soft">{user.email}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink sm:block"
              >
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
