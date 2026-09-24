import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const links = [
  { to: "/admin", label: "Overview", end: true },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/categories", label: "Categories" },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-paper">
      <aside className="flex w-60 shrink-0 flex-col bg-panel text-panel-text">
        <div className="border-b border-panel-line px-6 py-5">
          <span className="font-display text-lg font-600 text-white">TojTech</span>
          <div className="mt-0.5 text-xs uppercase tracking-wide text-panel-text/60">
            Control panel
          </div>
        </div>

        <nav className="flex-1 px-3 py-4">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `mb-1 block rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-signal text-white"
                    : "text-panel-text hover:bg-panel-line hover:text-white"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-panel-line px-6 py-4 text-xs">
          <div className="text-white">{user?.email}</div>
          <div className="mb-3 text-panel-text/60">Signed in as admin</div>
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="text-panel-text underline decoration-panel-line underline-offset-2 hover:text-white"
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 px-10 py-8">
        <Outlet />
      </main>
    </div>
  );
}
