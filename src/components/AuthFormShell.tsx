import type { ReactNode } from "react";

export default function AuthFormShell({
  title,
  subtitle,
  pitchTitle,
  pitchText,
  children,
}: {
  title: string;
  subtitle: string;
  pitchTitle: string;
  pitchText: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:py-12">
      <div className="grid overflow-hidden rounded-[2rem] border border-line bg-white shadow-lift lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="board relative hidden flex-col overflow-hidden p-10 lg:flex">
          <img src="/logo-full-light.png" alt="TojTech, IT and electronics store" className="h-16 w-auto self-start" />

          <div className="relative z-10 mt-14">
            <h2 className="max-w-xs text-balance font-display text-3xl font-extrabold leading-tight text-white">
              {pitchTitle}
            </h2>
            <p className="mt-4 max-w-xs leading-relaxed text-panel-text">{pitchText}</p>
          </div>

          <svg
            viewBox="0 0 520 150"
            className="pointer-events-none absolute inset-x-0 bottom-0 w-full"
            fill="none"
            stroke="#2cbbf5"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path strokeOpacity="0.5" d="M0 104 H112 L146 138 H250" />
            <path strokeOpacity="0.3" d="M520 64 H430 L398 96 H332" />
            <circle cx="258" cy="138" r="5" fill="#07264a" strokeOpacity="0.7" />
            <circle cx="324" cy="96" r="5" fill="#07264a" strokeOpacity="0.5" />
          </svg>
        </aside>

        <div className="flex flex-col justify-center px-6 py-10 sm:px-12 sm:py-14">
          <div className="mx-auto w-full max-w-sm">
            <img src="/logo-mark.png" alt="" className="mb-6 h-12 w-auto lg:hidden" />
            <h1 className="font-display text-3xl font-extrabold text-ink">{title}</h1>
            <p className="mt-2 text-ink-soft">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
