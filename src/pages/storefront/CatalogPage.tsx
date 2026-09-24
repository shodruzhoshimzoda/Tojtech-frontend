import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, extractError } from "../../api/client";
import ErrorBanner from "../../components/ErrorBanner";
import type { Category, Product } from "../../types";

function money(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get<{ products: Product[] }>("/products"),
      api.get<{ categories: Category[] }>("/categories"),
    ])
      .then(([productsRes, categoriesRes]) => {
        setProducts(productsRes.data.products ?? []);
        setCategories(categoriesRes.data.categories ?? []);
      })
      .catch((err) => setError(extractError(err)))
      .finally(() => setLoading(false));
  }, []);

  const categoryName = (uuid?: string) =>
    categories.find((c) => c.uuid === uuid)?.name;

  const visibleProducts = useMemo(() => {
    if (!activeCategory) return products;
    return products.filter((p) => p.category?.uuid === activeCategory);
  }, [products, activeCategory]);

  const featured = visibleProducts.slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 md:py-14">
      <section className="relative mb-14 overflow-hidden rounded-3xl bg-panel px-7 py-10 text-white shadow-[0_24px_70px_rgba(12,36,67,0.18)] md:grid md:grid-cols-2 md:items-center md:px-12 md:py-14">
        <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full border-[38px] border-signal/30" />
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-blue-200">The blue shelf</p>
          <h1 className="max-w-md font-display text-4xl font-600 leading-[1.05] md:text-5xl">
            Electronics that keep up with you.
          </h1>
          <p className="mt-5 max-w-sm text-blue-100">
            Every item on TojTech is checked against stock in real time —
            what you see here is what's actually on the shelf.
          </p>
        </div>

        <div className="relative h-64 hidden md:block">
          {featured.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-blue-300/30 text-sm text-blue-100">
              New arrivals will preview here
            </div>
          ) : (
            featured.map((p, i) => {
              const image = p.images?.find((im) => im.is_main) ?? p.images?.[0];
              return (
                <div
                  key={p.uuid}
                  className="absolute w-48 overflow-hidden rounded-xl border border-blue-100/40 bg-white text-ink shadow-[0_14px_30px_rgba(0,0,0,0.2)]"
                  style={{
                    right: `${i * 56}px`,
                    top: `${i * 22}px`,
                    zIndex: 10 - i,
                    transform: `rotate(${(i - 1) * 3}deg)`,
                  }}
                >
                  <div className="aspect-[4/3] w-full bg-line/40">
                    {image && (
                      <img
                        src={image.image_url}
                        alt={p.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="px-3 py-2">
                    <p className="truncate text-xs font-medium text-ink">{p.name}</p>
                    <p className="text-xs font-semibold text-ember">{money(p.price)}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {error && (
        <div className="mb-8">
          <ErrorBanner message={error} />
        </div>
      )}

      {categories.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2 border-b border-line pb-6">
          <button
            onClick={() => setActiveCategory(null)}
            className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                activeCategory === null
                ? "border-signal bg-signal text-white shadow-[0_5px_14px_rgba(23,105,224,0.2)]"
                : "border-line bg-white/70 text-ink-soft hover:border-signal hover:text-signal"
            }`}
          >
            All products
          </button>
          {categories.map((c) => (
            <button
              key={c.uuid}
              onClick={() => setActiveCategory(c.uuid)}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                activeCategory === c.uuid
                  ? "border-signal bg-signal text-white shadow-[0_5px_14px_rgba(23,105,224,0.2)]"
                  : "border-line bg-white/70 text-ink-soft hover:border-signal hover:text-signal"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="text-ink-soft">Loading catalog…</p>
      ) : visibleProducts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line px-6 py-16 text-center">
          <p className="text-ink">No products here yet.</p>
          <p className="mt-1 text-sm text-ink-soft">
            {activeCategory
              ? "Try a different category, or check back soon."
              : "The catalog is empty right now — check back soon."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {visibleProducts.map((p) => {
            const image = p.images?.find((im) => im.is_main) ?? p.images?.[0];
            const catName = categoryName(p.category?.uuid);
            return (
              <Link key={p.uuid} to={`/products/${p.uuid}`} className="group block">
                <div className="aspect-square w-full overflow-hidden rounded-2xl border border-line bg-white shadow-[0_8px_24px_rgba(32,83,137,0.07)]">
                  {image ? (
                    <img
                      src={image.image_url}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-ink-soft">
                      No image
                    </div>
                  )}
                </div>
                <div className="mt-3 px-1">
                  {catName && (
                    <p className="text-xs text-ink-soft">{catName}</p>
                  )}
                  <h3 className="font-display text-sm font-600 text-ink">{p.name}</h3>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="font-semibold text-ember">{money(p.price)}</span>
                    <span
                      className={`text-xs ${p.stock > 0 ? "text-good" : "text-bad"}`}
                    >
                      {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
