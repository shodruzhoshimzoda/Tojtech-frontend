import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { extractError } from "../../api/client";
import AuthFormShell from "../../components/AuthFormShell";
import ErrorBanner from "../../components/ErrorBanner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(extractError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthFormShell title="Log in" subtitle="Welcome back to TojTech.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <ErrorBanner message={error} />}

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-ink-soft">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-line bg-white px-3 py-2 text-ink outline-none focus:border-signal"
            placeholder="you@example.com"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-ink-soft">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border border-line bg-white px-3 py-2 text-ink outline-none focus:border-signal"
            placeholder="••••••••"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-md bg-signal px-4 py-2.5 font-medium text-white transition-colors hover:bg-signal-dim disabled:opacity-60"
        >
          {submitting ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-sm text-ink-soft">
        No account yet?{" "}
        <Link to="/register" className="text-signal hover:underline">
          Create one
        </Link>
      </p>
    </AuthFormShell>
  );
}
