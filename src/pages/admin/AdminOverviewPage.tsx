import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, extractError } from "../../api/client";
import ErrorBanner from "../../components/ErrorBanner";
import type { Category, Product } from "../../types";

export default function AdminOverviewPage() {
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

  const outOfStock = products.filter((p) => p.stock === 0).length;

  return (
    <div>
      <h1 className="font-display text-2xl font-600 text-ink">Overview</h1>
      <p className="mt-1 text-sm text-ink-soft">
        A quick read on what's in the catalog right now.
      </p>

      {error && (
        <div className="mt-6">
          <ErrorBanner message={error} />
        </div>
      )}

      {!loading && (
        <div className="mt-8 grid grid-cols-3 gap-4">
          <StatCard label="Products" value={products.length} to="/admin/products" />
          <StatCard label="Categories" value={categories.length} to="/admin/categories" />
          <StatCard
            label="Out of stock"
            value={outOfStock}
            to="/admin/products"
            tone={outOfStock > 0 ? "warn" : "default"}
          />
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  to,
  tone = "default",
}: {
  label: string;
  value: number;
  to: string;
  tone?: "default" | "warn";
}) {
  return (
    <Link
      to={to}
      className="rounded-lg border border-line bg-white px-5 py-4 transition-colors hover:border-ink"
    >
      <p className="text-sm text-ink-soft">{label}</p>
      <p
        className={`mt-1 font-display text-3xl font-600 ${
          tone === "warn" && value > 0 ? "text-ember" : "text-ink"
        }`}
      >
        {value}
      </p>
    </Link>
  );
}
