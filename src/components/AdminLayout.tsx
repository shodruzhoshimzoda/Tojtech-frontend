import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { BoxIcon, GridIcon, LogoutIcon, StoreIcon, TagIcon } from "./Icons";

const links = [
  { to: "/admin", label: "Overview", end: true, Icon: GridIcon },
  { to: "/admin/products", label: "Products", Icon: BoxIcon },
  { to: "/admin/categories", label: "Categories", Icon: TagIcon },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-paper lg:flex">
      <aside className="flex flex-col bg-panel text-panel-text lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0">
        <div className="flex items-center justify-between gap-3 px-5 py-4 lg:border-b lg:border-panel-line lg:py-5">
          <Link to="/admin" className="flex items-center gap-3">
            <img src="/logo-mark-light.png" alt="" className="h-9 w-auto" />
            <span>
              <span className="block font-display text-base font-extrabold leading-none tracking-[0.05em] text-white">
                TOJTECH
              </span>
              <span className="mt-1 block text-xs text-panel-text/70">Control panel</span>
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-lg px-3 py-1.5 text-sm text-panel-text transition-colors hover:bg-panel-line hover:text-white lg:hidden"
          >
            Log out
          </button>
        </div>

        <nav
          aria-label="Admin"
          className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:overflow-visible lg:py-4"
        >
          {links.map(({ to, label, end, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? "bg-signal text-white" : "text-panel-text hover:bg-panel-line hover:text-white"
                }`
              }
            >
              <Icon className="h-[18px] w-[18px]" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden border-t border-panel-line p-4 lg:block">
          <div className="flex items-center gap-3 px-1">
            <span
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan font-display text-sm font-bold text-panel"
            >
              {user?.email.charAt(0).toUpperCase()}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm text-white">{user?.email}</span>
              <span className="block text-xs text-panel-text/70">Administrator</span>
            </span>
          </div>

          <div className="mt-4 space-y-1">
            <Link
              to="/"
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-panel-line hover:text-white"
            >
              <StoreIcon className="h-[18px] w-[18px]" />
              View store
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-panel-line hover:text-white"
            >
              <LogoutIcon className="h-[18px] w-[18px]" />
              Log out
            </button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-10">
        <Outlet />
      </main>
    </div>
  );
}
