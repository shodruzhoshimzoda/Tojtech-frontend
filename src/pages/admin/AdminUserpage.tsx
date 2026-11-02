import { useEffect, useState } from "react";
import { api, extractError } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import ErrorBanner from "../../components/ErrorBanner";
import type { Role, User } from "../../types";

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [savingUuid, setSavingUuid] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0); // change it to load the list again

  // Load the list on mount and every time reloadKey changes.
  useEffect(() => {
    let cancelled = false; // ignore the answer if the page was closed or the effect ran again

    api
      .get<{ users: User[] }>("/users")
      .then((res) => {
        if (!cancelled) setUsers(res.data.users ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(extractError(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  async function handleRoleChange(target: User, newRole: Role) {
    if (target.role === newRole) return;

    const question =
      newRole === "admin"
        ? `Give admin access to ${target.email}?`
        : `Remove admin access from ${target.email}?`;
    if (!confirm(question)) return;

    setSavingUuid(target.uuid);
    setError("");
    setNotice("");
    try {
      await api.patch(`/users/${target.uuid}/role`, { role: newRole });
      setUsers((prev) => prev.map((u) => (u.uuid === target.uuid ? { ...u, role: newRole } : u)));
      setNotice(`${target.email} is now ${newRole === "admin" ? "an admin" : "a customer"}.`);
    } catch (err) {
      setError(extractError(err));
      setReloadKey((k) => k + 1); // the list may be outdated (for example the user was removed)
    } finally {
      setSavingUuid(null);
    }
  }

  const adminCount = users.filter((u) => u.role === "admin").length;

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-ink">Users</h1>
      <p className="mt-2 text-ink-soft">
        Accounts registered in the store. Admins can open this panel; customers can only shop.
      </p>

      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <span className="rounded-full bg-mist px-3 py-1 text-ink-soft">
          Total: <strong className="text-ink">{users.length}</strong>
        </span>
        <span className="rounded-full bg-mist px-3 py-1 text-ink-soft">
          Admins: <strong className="text-ink">{adminCount}</strong>
        </span>
      </div>

      {error && (
        <div className="mt-6">
          <ErrorBanner message={error} />
        </div>
      )}

      {notice && (
        <p role="status" className="mt-6 rounded-xl border border-good/25 bg-good/10 px-4 py-3 text-sm text-good">
          {notice}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white shadow-[0_1px_2px_rgba(10,37,71,0.06)]">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-paper text-ink-soft">
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-line last:border-0">
                  <td colSpan={3} className="px-5 py-4">
                    <div className="skeleton h-4 w-full rounded" />
                  </td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-5 py-12 text-center text-ink-soft">
                  {error ? "The list could not be loaded." : "No users yet."}
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isSelf = u.uuid === currentUser?.uuid;
                const isSaving = savingUuid === u.uuid;
                return (
                  <tr key={u.uuid} className="border-b border-line last:border-0">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden="true"
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mist font-display text-xs font-bold text-signal"
                        >
                          {u.email.charAt(0).toUpperCase()}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-ink">{u.email}</span>
                          {isSelf && <span className="text-xs text-ink-soft">That's you</span>}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <label className="sr-only" htmlFor={`role-${u.uuid}`}>
                        Role for {u.email}
                      </label>
                      <select
                        id={`role-${u.uuid}`}
                        value={u.role}
                        disabled={isSelf || isSaving}
                        onChange={(e) => handleRoleChange(u, e.target.value as Role)}
                        title={isSelf ? "You can't change your own role" : undefined}
                        className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm text-ink outline-none transition-colors focus:border-signal disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="customer">Customer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-5 py-3.5 text-ink-soft">{formatDate(u.created_at)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-ink-soft">
        A role change applies to the user's next sign-in or token refresh (up to 24 hours for an already open session).
      </p>
    </div>
  );
}