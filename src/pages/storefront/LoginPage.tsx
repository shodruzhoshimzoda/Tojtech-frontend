import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { extractError } from "../../api/client";
import AuthFormShell from "../../components/AuthFormShell";
import ErrorBanner from "../../components/ErrorBanner";
import TextField from "../../components/TextField";

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
    <AuthFormShell
      title="Log in"
      subtitle="Welcome back. Pick up where you left off."
      pitchTitle="Your cart and orders, wherever you log in."
      pitchText="Sign in to keep your details in one place and check out faster."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && <ErrorBanner message={error} />}

        <TextField
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <TextField
          label="Password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
        />

        <button type="submit" disabled={submitting} className="btn btn-primary mt-1 w-full">
          {submitting ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="mt-7 text-sm text-ink-soft">
        New to TojTech?{" "}
        <Link to="/register" className="font-semibold text-signal hover:underline">
          Create an account
        </Link>
      </p>
    </AuthFormShell>
  );
}
