import { MinusIcon, PlusIcon } from "./Icons";

export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  const atMin = value <= min;
  const atMax = max !== undefined && value >= max;

  return (
    <div
      role="group"
      aria-label="Quantity"
      className="inline-flex items-center rounded-xl border border-line bg-white"
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={atMin}
        aria-label="Decrease quantity"
        className="flex h-10 w-10 items-center justify-center text-ink-soft transition-colors hover:text-signal disabled:opacity-35 disabled:hover:text-ink-soft"
      >
        <MinusIcon className="h-4 w-4" />
      </button>
      <span className="w-9 text-center font-semibold tabular-nums text-ink" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(max === undefined ? value + 1 : Math.min(max, value + 1))}
        disabled={atMax}
        aria-label="Increase quantity"
        className="flex h-10 w-10 items-center justify-center text-ink-soft transition-colors hover:text-signal disabled:opacity-35 disabled:hover:text-ink-soft"
      >
        <PlusIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
