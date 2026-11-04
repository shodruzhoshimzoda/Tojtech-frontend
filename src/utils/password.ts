// Password rules for a NEW password. They must match the backend (internal/domain/user/password.go).
// The backend is the real judge; this file only gives the user instant feedback.

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 16;

export interface PasswordRule {
  id: string;
  label: string;
  ok: boolean;
}

export function checkPassword(password: string): PasswordRule[] {
  // [...password] splits by characters (not bytes), like `range` in Go
  const length = [...password].length;

  return [
    {
      id: "length",
      label: `${PASSWORD_MIN}–${PASSWORD_MAX} characters`,
      ok: length >= PASSWORD_MIN && length <= PASSWORD_MAX,
    },
    { id: "lower", label: "A lowercase letter (a–z)", ok: /[a-z]/.test(password) },
    { id: "upper", label: "An uppercase letter (A–Z)", ok: /[A-Z]/.test(password) },
    { id: "digit", label: "A digit (0–9)", ok: /[0-9]/.test(password) },
    {
      id: "chars",
      label: "Only Latin letters and digits",
      // an empty password has nothing forbidden, but it must not show a green tick
      ok: password.length > 0 && /^[A-Za-z0-9]*$/.test(password),
    },
  ];
}

export function isPasswordValid(password: string): boolean {
  return checkPassword(password).every((rule) => rule.ok);
}
