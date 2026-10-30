import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function StorefrontFooter() {
  const { user, isAdmin } = useAuth();

  return (
    <footer className="mt-20 bg-panel-deep text-panel-text">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <img src="/logo-full-light.png" alt="TojTech, IT and electronics store" className="h-16 w-auto" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            Laptops, components and peripherals for home, office and workshop.
          </p>
        </div>

        <nav aria-label="Shop">
          <h2 className="font-display text-sm font-bold text-white">Shop</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/" className="transition-colors hover:text-white">
                Catalog
              </Link>
            </li>
            <li>
              <Link to="/cart" className="transition-colors hover:text-white">
                Cart
              </Link>
            </li>
          </ul>
        </nav>

        {(!user || isAdmin) && (
          <nav aria-label="Account">
            <h2 className="font-display text-sm font-bold text-white">Account</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {user ? (
                <li>
                  <Link to="/admin" className="transition-colors hover:text-white">
                    Admin panel
                  </Link>
                </li>
              ) : (
                <>
                  <li>
                    <Link to="/login" className="transition-colors hover:text-white">
                      Log in
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" className="transition-colors hover:text-white">
                      Create account
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        )}
      </div>

      <div className="border-t border-panel-line">
        <p className="mx-auto max-w-6xl px-5 py-5 text-xs sm:px-6">
          &copy; {new Date().getFullYear()} TojTech. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
