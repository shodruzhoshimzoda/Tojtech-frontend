import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { api, extractError } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import ErrorBanner from "../../components/ErrorBanner";
import { BoxIcon, TagIcon, AlertIcon } from "../../components/Icons";
import type { Category, Product } from "../../types";

function money(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function StatCard({
  label,
  value,
  to,
  icon,
  warn = false,
}: {
  label: string;
  value: number;
  to: string;
  icon: ReactNode;
  warn?: boolean;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 rounded-2xl border border-line bg-white p-5 transition-shadow hover:shadow-lift"
    >
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-xl ${
          warn ? "bg-ember/10 text-ember" : "bg-mist text-signal"
        }`}
      >
        {icon}
      </span>
      <span>
        <span className="block font-display text-3xl font-extrabold tabular-nums text-ink">{value}</span>
        <span className="block text-sm text-ink-soft">{label}</span>
      </span>
    </Link>
  );
}

function ProductRow({ product }: { product: Product }) {
  const image = product.images?.find((i) => i.is_main) ?? product.images?.[0];
  return (
    <li className="flex items-center gap-3 py-3">
      <span className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-mist">
        {image && <img src={image.image_url} alt="" className="h-full w-full object-cover" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-ink">{product.name}</span>
        <span className="block text-xs text-ink-soft">
          {product.stock === 0 ? "Out of stock" : `${product.stock} in stock`}
        </span>
      </span>
      <span className="font-display text-sm font-bold tabular-nums text-ink">{money(product.price)}</span>
    </li>
  );
}

export default function AdminOverviewPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ products: Product[] }>("/products"),
      api.get<{ categories: Category[] }>("/categories"),
    ])
      .then(([p, c]) => {
        setProducts(p.data.products ?? []);
        setCategories(c.data.categories ?? []);
      })
      .catch((err) => setError(extractError(err)))
      .finally(() => setLoading(false));
  }, []);

  const outOfStock = products.filter((p) => p.stock === 0);
  const recent = [...products].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">Overview</h1>
      <p className="mt-1 text-ink-soft">Signed in as {user?.email}. Here is the catalog right now.</p>

      {error && (
        <div className="mt-6">
          <ErrorBanner message={error} />
        </div>
      )}

      {loading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-3" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <StatCard label="Products" value={products.length} to="/admin/products" icon={<BoxIcon />} />
            <StatCard label="Categories" value={categories.length} to="/admin/categories" icon={<TagIcon />} />
            <StatCard
              label="Out of stock"
              value={outOfStock.length}
              to="/admin/products"
              icon={<AlertIcon />}
              warn={outOfStock.length > 0}
            />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <section className="min-w-0 rounded-2xl border border-line bg-white p-5">
              <h2 className="font-display text-base font-bold text-ink">Recently added</h2>
              {recent.length === 0 ? (
                <p className="mt-3 text-sm text-ink-soft">
                  No products yet.{" "}
                  <Link to="/admin/products" className="font-medium text-signal hover:underline">
                    Add the first product
                  </Link>
                </p>
              ) : (
                <ul className="mt-2 divide-y divide-line">
                  {recent.map((p) => (
                    <ProductRow key={p.uuid} product={p} />
                  ))}
                </ul>
              )}
            </section>

            <section className="min-w-0 rounded-2xl border border-line bg-white p-5">
              <h2 className="font-display text-base font-bold text-ink">Needs restocking</h2>
              {outOfStock.length === 0 ? (
                <p className="mt-3 text-sm text-ink-soft">Everything in the catalog is in stock.</p>
              ) : (
                <ul className="mt-2 divide-y divide-line">
                  {outOfStock.slice(0, 5).map((p) => (
                    <ProductRow key={p.uuid} product={p} />
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
