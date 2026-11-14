import { useState, type FormEvent } from "react";
import { useAuth } from "../../auth/AuthContext";
import { extractError } from "../../api/client";
import ErrorBanner from "../../components/ErrorBanner";
import PasswordRules from "../../components/PasswordRules";
import TextField from "../../components/TextField";
import { avatarLetter, displayName } from "../../utils/displayName";
import { isPasswordValid } from "../../utils/password";
import { checkUsername, USERNAME_MAX } from "../../utils/username";

function Notice({ message }: { message: string }) {
  return (
    <p role="status" className="rounded-xl border border-good/25 bg-good/10 px-4 py-3 text-sm text-good">
      {message}
    </p>
  );
}

function Card({ title, text, children }: { title: string; text: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-6 shadow-[0_1px_2px_rgba(10,37,71,0.06)]">
      <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
      <p className="mt-1 text-sm text-ink-soft">{text}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function UsernameForm() {
  const { user, updateProfile } = useAuth();
  const [username, setUsername] = useState(user?.username ?? "");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  const problem = checkUsername(username);
  const unchanged = username.trim() === (user?.username ?? "");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (problem || unchanged) return;
    setError("");
    setNotice("");
    setSaving(true);
    try {
      await updateProfile(username.trim());
      setNotice("Username saved.");
    } catch (err) {
      setError(extractError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card
      title="Username"
      text={
        user?.username
          ? "This name is shown instead of your email."
          : "You don't have a username yet. Pick one and it will be shown instead of your email."
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && <ErrorBanner message={error} />}
        {notice && <Notice message={notice} />}

        <TextField
          label="Username"
          required
          maxLength={USERNAME_MAX}
          autoComplete="username"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setNotice("");
          }}
          placeholder="alex_01"
          hint={
            username && problem ? problem : "3–20 characters: Latin letters, digits and underscore."
          }
        />

        <div>
          <button type="submit" disabled={saving || Boolean(problem) || unchanged} className="btn btn-primary">
            {saving ? "Saving…" : "Save username"}
          </button>
        </div>
      </form>
    </Card>
  );
}

function PasswordForm() {
  const { changePassword } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  const mismatch = confirm.length > 0 && confirm !== next;
  const canSubmit = current.length > 0 && isPasswordValid(next) && next === confirm;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setNotice("");
    setSaving(true);
    try {
      await changePassword(current, next);
      setCurrent("");
      setNext("");
      setConfirm("");
      setNotice("Password changed. You were signed out on your other devices.");
    } catch (err) {
      setError(extractError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card title="Password" text="Enter your current password to set a new one.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && <ErrorBanner message={error} />}
        {notice && <Notice message={notice} />}

        <TextField
          label="Current password"
          type="password"
          required
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
        />
        <div>
          <TextField
            label="New password"
            type="password"
            required
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            placeholder="8–16 characters"
          />
          <PasswordRules password={next} />
        </div>
        <TextField
          label="Repeat new password"
          type="password"
          required
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          hint={mismatch ? "The passwords do not match." : undefined}
        />

        <div>
          <button type="submit" disabled={saving || !canSubmit} className="btn btn-primary">
            {saving ? "Saving…" : "Change password"}
          </button>
        </div>
      </form>
    </Card>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null; // the route is guarded, this only keeps TypeScript happy

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 sm:px-6 sm:py-12">
      <div className="flex items-center gap-4">
        <span
          aria-hidden="true"
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-navy font-display text-2xl font-bold text-white"
        >
          {avatarLetter(user)}
        </span>
        <div className="min-w-0">
          <h1 className="truncate font-display text-2xl font-extrabold text-ink sm:text-3xl">
            {displayName(user)}
          </h1>
          <p className="truncate text-ink-soft">{user.email}</p>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-ink-soft">
            {user.role === "admin" ? "Administrator" : "Customer"}
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-6">
        <UsernameForm />
        <PasswordForm />
      </div>
    </div>
  );
}
