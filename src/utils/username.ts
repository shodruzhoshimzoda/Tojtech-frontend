export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;

// Same rules as the server (internal/domain/user/username.go).
// Returns a message for the first problem, or null when the username is fine.
export function checkUsername(value: string): string | null {
  const v = value.trim();
  if (!v) return "Enter a username.";
  if (!/^[A-Za-z0-9_]+$/.test(v)) return "Use only Latin letters, digits and underscore.";
  if (v.length < USERNAME_MIN) return `At least ${USERNAME_MIN} characters.`;
  if (v.length > USERNAME_MAX) return `At most ${USERNAME_MAX} characters.`;
  return null;
}