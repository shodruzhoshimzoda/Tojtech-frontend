import type { ReactNode } from "react";

export default function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-ink/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg border border-line bg-white p-6 shadow-[0_8px_30px_rgba(20,21,26,0.12)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between">
          <h2 className="font-display text-lg font-600 text-ink">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-ink-soft hover:text-ink"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
