import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, extractError } from "../../api/client";
import { useCart } from "../../cart/CartContext";
import ErrorBanner from "../../components/ErrorBanner";
import Hero from "../../components/Hero";
import { CheckIcon, PlusIcon, SearchIcon } from "../../components/Icons";
import type { Category, Product } from "../../types";

type SortKey = "newest" | "price-asc" | "price-desc" | "name";

function money(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function mainImage(p: Product) {
  return p.images?.find((i) => i.is_main) ?? p.images?.[0];
}

function StockLabel({ stock }: { stock: number }) {
  const [tone, text] =
    stock === 0
      ? ["text-bad", "Out of stock"]
      : stock <= 5
        ? ["text-ember", `Only ${stock} left`]
        : ["text-good", `${stock} in stock`];

  return (
    <p className={`mt-1 flex items-center gap-1.5 text-[13px] font-medium ${tone}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {text}
    </p>
  );
}

function ProductCard({
  product,
  categoryName,
  inCart,
  justAdded,
  onAdd,
}: {
  product: Product;
  categoryName?: string;
  inCart: number;
  justAdded: boolean;
  onAdd: () => void;
}) {
  const image = mainImage(product);
  const soldOut = product.stock === 0;
  const allInCart = !soldOut && inCart >= product.stock;
  const link = `/products/${product.uuid}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-[1.25rem] border border-line bg-white transition-shadow duration-200 hover:shadow-lift">
      <Link to={link} className="block" tabIndex={-1} aria-hidden="true">
        <div className="relative aspect-[4/3] overflow-hidden bg-mist">
          {image ? (
            <img
              src={image.image_url}
              alt=""
              loading="lazy"
              className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] ${
                soldOut ? "opacity-60 grayscale" : ""
              }`}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <img src="/logo-mark.png" alt="" className="h-16 w-auto opacity-20" />
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        {categoryName && <p className="text-[13px] text-ink-soft">{categoryName}</p>}
        <Link
          to={link}
          className="mt-0.5 line-clamp-2 font-display text-[15px] font-bold leading-snug text-ink transition-colors hover:text-signal"
        >
          {product.name}
        </Link>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            <p className="font-display text-lg font-extrabold tabular-nums text-ink">
              {money(product.price)}
            </p>
            <StockLabel stock={product.stock} />
          </div>

          <button
            type="button"
            onClick={onAdd}
            disabled={soldOut || allInCart}
            aria-label={
              allInCart
                ? `All available units of ${product.name} are in your cart`
                : `Add ${product.name} to cart`
            }
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              justAdded ? "bg-good" : "bg-signal hover:bg-signal-dim"
            }`}
          >
            {justAdded ? <CheckIcon className="h-5 w-5" /> : <PlusIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </article>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-[1.25rem] border border-line bg-white">
          <div className="skeleton aspect-[4/3]" />
          <div className="space-y-3 p-4">
            <div className="skeleton h-3 w-1/3 rounded" />
            <div className="skeleton h-4 w-4/5 rounded" />
            <div className="skeleton h-5 w-1/2 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CatalogPage() {
  const { items, addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addedUuid, setAddedUuid] = useState<string | null>(null);

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

  const categoryName = (uuid?: string) => categories.find((c) => c.uuid === uuid)?.name;
  const cartQuantity = (uuid: string) => items.find((i) => i.productUuid === uuid)?.quantity ?? 0;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products.filter(
      (p) =>
        (!activeCategory || p.category?.uuid === activeCategory) &&
        (!q || p.name.toLowerCase().includes(q) || (p.description ?? "").toLowerCase().includes(q)),
    );

    switch (sort) {
      case "price-asc":
        return [...list].sort((a, b) => a.price - b.price);
      case "price-desc":
        return [...list].sort((a, b) => b.price - a.price);
      case "name":
        return [...list].sort((a, b) => a.name.localeCompare(b.name));
      default:
        return [...list].sort((a, b) => b.created_at.localeCompare(a.created_at));
    }
  }, [products, activeCategory, query, sort]);

  function handleAdd(product: Product) {
    addItem(product.uuid, 1);
    setAddedUuid(product.uuid);
    window.setTimeout(() => setAddedUuid((current) => (current === product.uuid ? null : current)), 1400);
  }

  const filtersActive = Boolean(query.trim() || activeCategory);

  return (
    <div className="mx-auto max-w-6xl px-5 pt-6 sm:px-6 sm:pt-8">
      <Hero products={products} />

      {error && (
        <div className="mt-8">
          <ErrorBanner message={error} />
        </div>
      )}

      <section id="catalog" className="scroll-mt-24 pt-14">
        <div className="flex items-center gap-4">
          <h2 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">Catalog</h2>
          <div className="hidden h-px flex-1 bg-line sm:block" aria-hidden="true" />
          <span
            aria-hidden="true"
            className="hidden h-3 w-3 rounded-full border-2 border-cyan sm:block"
          />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-soft" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products"
              aria-label="Search products"
              className="input pl-10"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label="Sort products"
            className="input sm:w-56"
          >
            <option value="newest">Newest first</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>

        {categories.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="chip" aria-pressed={activeCategory === null} onClick={() => setActiveCategory(null)}>
              All products
            </button>
            {categories.map((c) => (
              <button
                key={c.uuid}
                type="button"
                className="chip"
                aria-pressed={activeCategory === c.uuid}
                onClick={() => setActiveCategory(c.uuid)}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        <p className="mt-6 text-sm text-ink-soft" aria-live="polite">
          {loading ? "Loading products" : `${visible.length} ${visible.length === 1 ? "product" : "products"}`}
        </p>

        <div className="mt-4">
          {loading ? (
            <SkeletonGrid />
          ) : visible.length === 0 ? (
            <div className="rounded-[1.25rem] border border-dashed border-line bg-white px-6 py-16 text-center">
              <img src="/logo-mark.png" alt="" className="mx-auto h-14 w-auto opacity-30" />
              <p className="mt-4 font-display text-lg font-bold text-ink">
                {filtersActive ? "No products match your search" : "The catalog is empty"}
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                {filtersActive
                  ? "Try a different word or clear the filters."
                  : "New products will show up here as soon as they are added."}
              </p>
              {filtersActive && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm mt-5"
                  onClick={() => {
                    setQuery("");
                    setActiveCategory(null);
                  }}
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {visible.map((p) => (
                <ProductCard
                  key={p.uuid}
                  product={p}
                  categoryName={categoryName(p.category?.uuid)}
                  inCart={cartQuantity(p.uuid)}
                  justAdded={addedUuid === p.uuid}
                  onAdd={() => handleAdd(p)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
