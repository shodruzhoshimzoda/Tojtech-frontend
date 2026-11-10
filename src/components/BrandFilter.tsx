import { useState } from "react";
import { CheckIcon, SearchIcon } from "./Icons";

export interface BrandOption {
  slug: string;
  name: string;
  logoUrl: string; // "" when the brand has no logo
  count: number; // products of this brand in the chosen category
}

const SEARCH_FROM = 8; // with many brands a search field helps to find one

function Logo({ option }: { option: BrandOption }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md border border-line bg-white font-display text-xs font-bold text-signal"
    >
      {option.logoUrl ? (
        <img src={option.logoUrl} alt="" loading="lazy" className="h-full w-full object-contain p-0.5" />
      ) : (
        option.name.charAt(0).toUpperCase()
      )}
    </span>
  );
}

// The list of brands with checkboxes. It is used twice: in the sidebar (desktop)
// and inside a dialog (phone), so it knows nothing about the page around it.
export default function BrandFilter({
  options,
  selected,
  onToggle,
  onClear,
}: {
  options: BrandOption[];
  selected: string[];
  onToggle: (slug: string) => void;
  onClear: () => void;
}) {
  const [search, setSearch] = useState("");
  const q = search.trim().toLowerCase();
  const shown = q ? options.filter((o) => o.name.toLowerCase().includes(q)) : options;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-base font-bold text-ink">Brands</h3>
        {selected.length > 0 && (
          <button type="button" onClick={onClear} className="text-sm text-signal hover:underline">
            Clear ({selected.length})
          </button>
        )}
      </div>

      {options.length >= SEARCH_FROM && (
        <div className="relative mt-3">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brands"
            aria-label="Search brands"
            className="input !py-2 pl-9 text-sm"
          />
        </div>
      )}

      <ul className="mt-3 flex max-h-[60vh] flex-col gap-0.5 overflow-y-auto">
        {shown.map((o) => {
          const checked = selected.includes(o.slug);
          return (
            <li key={o.slug}>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-mist">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={checked}
                  onChange={() => onToggle(o.slug)}
                />
                <span
                  aria-hidden="true"
                  className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-signal/40 ${
                    checked ? "border-signal bg-signal text-white" : "border-line bg-white"
                  }`}
                >
                  {checked && <CheckIcon className="h-3 w-3" />}
                </span>
                <Logo option={o} />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{o.name}</span>
                <span className={`text-sm tabular-nums ${o.count === 0 ? "text-ink-soft/60" : "text-ink-soft"}`}>
                  {o.count}
                </span>
              </label>
            </li>
          );
        })}
        {shown.length === 0 && (
          <li className="px-2 py-3 text-sm text-ink-soft">
            {options.length === 0 ? "No brands in this category." : "No brands found."}
          </li>
        )}
      </ul>
    </div>
  );
}
