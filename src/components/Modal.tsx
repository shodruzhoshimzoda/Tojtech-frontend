import { useEffect, useId, type ReactNode } from "react";
import { XIcon } from "./Icons";

export default function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const titleId = useId();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      // mousedown (not click) on the backdrop only: selecting text inside the
      // form and releasing the mouse outside must not throw the form away.
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-panel/55 px-4 py-8 backdrop-blur-sm sm:items-center"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-lg rounded-2xl border border-line bg-white shadow-float"
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 id={titleId} className="font-display text-lg font-bold text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-mist hover:text-ink"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
