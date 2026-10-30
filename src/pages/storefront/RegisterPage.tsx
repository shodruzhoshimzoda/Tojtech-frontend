import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { extractError } from "../../api/client";
import AuthFormShell from "../../components/AuthFormShell";
import ErrorBanner from "../../components/ErrorBanner";
import TextField from "../../components/TextField";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(email, password);
      navigate("/");
    } catch (err) {
      setError(extractError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthFormShell
      title="Create an account"
      subtitle="It takes less than a minute."
      pitchTitle="Build your setup, one part at a time."
      pitchText="An account keeps your cart with you and makes every future order faster."
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
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          hint="Use at least 8 characters."
        />

        <button type="submit" disabled={submitting} className="btn btn-primary mt-1 w-full">
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-7 text-sm text-ink-soft">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-signal hover:underline">
          Log in
        </Link>
      </p>
    </AuthFormShell>
  );
}
