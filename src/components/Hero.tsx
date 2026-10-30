import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { Product } from "../types";

function money(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function mainImage(p: Product) {
  return p.images?.find((i) => i.is_main) ?? p.images?.[0];
}

const delay = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

// The showcase is laid out in a 520 x 460 space and scales with its container,
// so the SVG traces always meet the card edges exactly.
const SLOTS = [
  { left: 0, top: 5, d: 1.0 },
  { left: 60, top: 0, d: 1.15 },
  { left: 30, top: 54, d: 1.3 },
];

function Showcase({ products }: { products: Product[] }) {
  return (
    <div className="relative hidden aspect-[520/460] w-full md:block" aria-label="Latest products">
      <svg
        viewBox="0 0 520 460"
        className="absolute inset-0 h-full w-full"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* traces that join the three cards */}
        <path className="trace" pathLength="1" stroke="#2cbbf5" style={delay(0.1)} d="M208 119 H236 L260 143 V248" />
        <path className="trace" pathLength="1" stroke="#2cbbf5" style={delay(0.3)} d="M312 96 H284 L260 120 V143" />
        {/* quiet decorative traces */}
        <path className="trace" pathLength="1" stroke="#2cbbf5" strokeOpacity="0.35" style={delay(0.5)} d="M0 316 H40 L72 348 H128" />
        <path className="trace" pathLength="1" stroke="#2cbbf5" strokeOpacity="0.35" style={delay(0.6)} d="M520 300 H488 L458 330 H396" />

        {[
          [208, 119, 0.9],
          [312, 96, 1.0],
          [260, 248, 1.1],
        ].map(([cx, cy, d]) => (
          <circle key={`${cx}-${cy}`} className="node" cx={cx} cy={cy} r="5" fill="#07264a" stroke="#2cbbf5" style={delay(d)} />
        ))}
        <circle className="node" cx="134" cy="348" r="5" fill="#07264a" stroke="#2cbbf5" strokeOpacity="0.5" style={delay(1.1)} />
        <circle className="node" cx="390" cy="330" r="5" fill="#07264a" stroke="#2cbbf5" strokeOpacity="0.5" style={delay(1.2)} />
      </svg>

      {SLOTS.map((slot, i) => {
        const product = products[i];
        const position: CSSProperties = {
          left: `${slot.left}%`,
          top: `${slot.top}%`,
          width: "40%",
          ...delay(slot.d),
        };

        if (!product) {
          return (
            <div
              key={`empty-${i}`}
              className="hero-card absolute overflow-hidden rounded-2xl border border-white/15 bg-white/5"
              style={position}
            >
              <div className="flex aspect-[16/10] items-center justify-center">
                <img src="/logo-mark-light.png" alt="" className="h-14 w-auto opacity-50" />
              </div>
              <div className="px-3.5 py-3">
                <p className="text-sm font-semibold text-panel-text">More arriving soon</p>
                <p className="text-xs text-panel-text/70">Check the catalog below</p>
              </div>
            </div>
          );
        }

        const image = mainImage(product);
        return (
          <Link
            key={product.uuid}
            to={`/products/${product.uuid}`}
            className="hero-card absolute block overflow-hidden rounded-2xl bg-white shadow-float transition-transform duration-200 hover:-translate-y-1"
            style={position}
          >
            <div className="aspect-[16/10] bg-mist">
              {image ? (
                <img src={image.image_url} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <img src="/logo-mark.png" alt="" className="h-12 w-auto opacity-25" />
                </div>
              )}
            </div>
            <div className="px-3.5 py-3">
              <p className="truncate font-display text-sm font-bold text-ink">{product.name}</p>
              <p className="mt-0.5 font-display text-sm font-bold tabular-nums text-signal">
                {money(product.price)}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default function Hero({ products }: { products: Product[] }) {
  const { user } = useAuth();
  const latest = [...products]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 3);

  return (
    <section className="board relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 -top-28 h-96 w-96 rounded-full bg-cyan/25 blur-3xl"
      />

      <div className="relative grid items-center gap-12 md:grid-cols-2">
        <div>
          <h1 className="max-w-xl text-balance font-display text-4xl font-extrabold leading-[1.06] text-white sm:text-5xl lg:text-[3.4rem]">
            Hardware you can count on.
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-panel-text">
            Laptops, components and peripherals for home, office and workshop. Prices and stock levels are always live.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#catalog" className="btn btn-light">
              Shop the catalog
            </a>
            {user ? (
              <Link to="/cart" className="btn btn-outline-light">
                Open cart
              </Link>
            ) : (
              <Link to="/register" className="btn btn-outline-light">
                Create account
              </Link>
            )}
          </div>
        </div>

        <Showcase products={latest} />
      </div>
    </section>
  );
}
