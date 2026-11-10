import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, extractError } from "../../api/client";
import { useCart } from "../../cart/CartContext";
import BrandFilter, { type BrandOption } from "../../components/BrandFilter";
import ErrorBanner from "../../components/ErrorBanner";
import Hero from "../../components/Hero";
import { CheckIcon, FilterIcon, PlusIcon, SearchIcon } from "../../components/Icons";
import Modal from "../../components/Modal";
import type { Brand, Category, Product } from "../../types";

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
  brandName,
  inCart,
  justAdded,
  onAdd,
}: {
  product: Product;
  categoryName?: string;
  brandName?: string;
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
        {(brandName || categoryName) && (
          <p className="text-[13px] text-ink-soft">{[brandName, categoryName].filter(Boolean).join(" · ")}</p>
        )}
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
  const [brandLogos, setBrandLogos] = useState<Record<string, string>>({}); // slug -> logo url
  const [filtersOpen, setFiltersOpen] = useState(false); // the brand dialog on phones
  const [searchParams, setSearchParams] = useSearchParams();
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

  // Logos come from the brands list. The filter works without them (a letter is shown instead).
  useEffect(() => {
    api
      .get<{ brands: Brand[] }>("/brands")
      .then((res) => {
        const logos: Record<string, string> = {};
        for (const b of res.data.brands ?? []) logos[b.slug] = b.logo_url;
        setBrandLogos(logos);
      })
      .catch(() => {});
  }, []);

  // The chosen brands live in the address: /?brand=asus&brand=msi. A link can be shared
  // and the Back button undoes a choice. ?brand=asus,msi is read the same way.
  const selectedBrands = useMemo(() => {
    const slugs = searchParams
      .getAll("brand")
      .flatMap((value) => value.split(","))
      .map((slug) => slug.trim().toLowerCase())
      .filter(Boolean);
    return [...new Set(slugs)];
  }, [searchParams]);

  function setBrands(next: string[]) {
    const params = new URLSearchParams(searchParams);
    params.delete("brand");
    next.forEach((slug) => params.append("brand", slug));
    setSearchParams(params);
  }

  function toggleBrand(slug: string) {
    setBrands(selectedBrands.includes(slug) ? selectedBrands.filter((s) => s !== slug) : [...selectedBrands, slug]);
  }

  // Brands for the panel: the ones that have products in the chosen category, with the number of them.
  // A brand that is chosen stays in the list even with 0 products, so it can be unchecked.
  const brandOptions = useMemo<BrandOption[]>(() => {
    const names = new Map<string, string>();
    const counts = new Map<string, number>();
    for (const p of products) {
      if (!p.brand) continue;
      names.set(p.brand.slug, p.brand.name);
      if (!activeCategory || p.category?.uuid === activeCategory) {
        counts.set(p.brand.slug, (counts.get(p.brand.slug) ?? 0) + 1);
      }
    }
    for (const slug of selectedBrands) if (!names.has(slug)) names.set(slug, slug);

    return [...names.entries()]
      .map(([slug, name]) => ({ slug, name, logoUrl: brandLogos[slug] ?? "", count: counts.get(slug) ?? 0 }))
      .filter((o) => o.count > 0 || selectedBrands.includes(o.slug))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products, activeCategory, selectedBrands, brandLogos]);

  // Show the panel if any product has a brand (not only in the current category), so it does not jump around.
  const hasBrands = products.some((p) => p.brand) || selectedBrands.length > 0;

  const categoryName = (uuid?: string) => categories.find((c) => c.uuid === uuid)?.name;
  const cartQuantity = (uuid: string) => items.find((i) => i.productUuid === uuid)?.quantity ?? 0;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products.filter(
      (p) =>
        (!activeCategory || p.category?.uuid === activeCategory) &&
        (selectedBrands.length === 0 || (p.brand !== undefined && selectedBrands.includes(p.brand.slug))) &&
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
  }, [products, activeCategory, selectedBrands, query, sort]);

  function handleAdd(product: Product) {
    addItem(product.uuid, 1);
    setAddedUuid(product.uuid);
    window.setTimeout(() => setAddedUuid((current) => (current === product.uuid ? null : current)), 1400);
  }

  const filtersActive = Boolean(query.trim() || activeCategory || selectedBrands.length > 0);

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

        <div
          className={
            hasBrands ? "mt-6 lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start lg:gap-8" : "mt-6"
          }
        >
          {hasBrands && (
            <aside
              aria-label="Filters"
              className="hidden rounded-[1.25rem] border border-line bg-white p-4 lg:sticky lg:top-24 lg:block"
            >
              <BrandFilter
                options={brandOptions}
                selected={selectedBrands}
                onToggle={toggleBrand}
                onClear={() => setBrands([])}
              />
            </aside>
          )}

          <div className="min-w-0">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-ink-soft" aria-live="polite">
                {loading ? "Loading products" : `${visible.length} ${visible.length === 1 ? "product" : "products"}`}
              </p>
              {hasBrands && (
                <button
                  type="button"
                  onClick={() => setFiltersOpen(true)}
                  className="btn btn-secondary btn-sm lg:hidden"
                >
                  <FilterIcon className="h-4 w-4" />
                  Filters
                  {selectedBrands.length > 0 && (
                    <span className="rounded-full bg-signal px-1.5 text-xs font-semibold text-white">
                      {selectedBrands.length}
                    </span>
                  )}
                </button>
              )}
            </div>

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
                        setBrands([]);
                      }}
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <div
                  className={`grid grid-cols-2 gap-4 sm:gap-6 ${
                    hasBrands ? "lg:grid-cols-3" : "lg:grid-cols-3 xl:grid-cols-4"
                  }`}
                >
                  {visible.map((p) => (
                    <ProductCard
                      key={p.uuid}
                      product={p}
                      categoryName={categoryName(p.category?.uuid)}
                      brandName={p.brand?.name}
                      inCart={cartQuantity(p.uuid)}
                      justAdded={addedUuid === p.uuid}
                      onAdd={() => handleAdd(p)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {filtersOpen && (
        <Modal title="Filters" onClose={() => setFiltersOpen(false)}>
          <BrandFilter
            options={brandOptions}
            selected={selectedBrands}
            onToggle={toggleBrand}
            onClear={() => setBrands([])}
          />
          <button type="button" onClick={() => setFiltersOpen(false)} className="btn btn-primary mt-5 w-full">
            Show {visible.length} {visible.length === 1 ? "product" : "products"}
          </button>
        </Modal>
      )}
    </div>
  );
}