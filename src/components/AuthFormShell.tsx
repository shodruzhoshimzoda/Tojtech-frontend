import type { ReactNode } from "react";

export default function AuthFormShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <h1 className="font-display text-2xl font-600 text-ink">{title}</h1>
      <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>
      <div className="mt-8">{children}</div>
    </div>
  );
}
