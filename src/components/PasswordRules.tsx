import { checkPassword } from "../utils/password";
import { CheckIcon } from "./Icons";

// Live checklist under the password field. Each rule turns green when it is met.
export default function PasswordRules({ password }: { password: string }) {
  const rules = checkPassword(password);

  return (
    <ul aria-label="Password requirements" className="mt-3 grid gap-1.5 text-sm">
      {rules.map((rule) => (
        <li
          key={rule.id}
          className={`flex items-center gap-2 transition-colors ${
            rule.ok ? "text-good" : "text-ink-soft"
          }`}
        >
          <span
            aria-hidden="true"
            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
              rule.ok ? "border-good bg-good text-white" : "border-current"
            }`}
          >
            {rule.ok && <CheckIcon className="h-3 w-3" />}
          </span>
          <span>
            {rule.label}
            <span className="sr-only">{rule.ok ? " — done" : " — not met yet"}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
