import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, extractError } from "../../api/client";
import { useCart } from "../../cart/CartContext";
import ErrorBanner from "../../components/ErrorBanner";
import { CartIcon, CheckIcon } from "../../components/Icons";
import QuantityStepper from "../../components/QuantityStepper";
import type { Category, Product } from "../../types";

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export default function ProductPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const { items, addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!uuid) return;
    Promise.all([
      api.get<{ product: Product }>(`/products/${uuid}`),
      api.get<{ categories: Category[] }>("/categories"),
    ])
      .then(([productRes, categoriesRes]) => {
        const loaded = productRes.data.product;
        setProduct(loaded);
        setCategory((categoriesRes.data.categories ?? []).find((c) => c.uuid === loaded.category?.uuid) ?? null);
      })
      .catch((err) => setError(extractError(err)))
      .finally(() => setLoading(false));
  }, [uuid]);

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-6" aria-busy="true">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div className="skeleton aspect-square rounded-3xl" />
          <div className="space-y-4 pt-4">
            <div className="skeleton h-4 w-1/3 rounded" />
            <div className="skeleton h-10 w-4/5 rounded" />
            <div className="skeleton h-8 w-1/4 rounded" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-16 sm:px-6">
        {error ? <ErrorBanner message={error} /> : <p className="text-ink-soft">This product could not be found.</p>}
        <Link to="/" className="btn btn-secondary mt-6">
          Back to catalog
        </Link>
      </main>
    );
  }

  const images = product.images ?? [];
  const activeImage = images[selectedImage] ?? images[0];
  const inCart = items.find((i) => i.productUuid === product.uuid)?.quantity ?? 0;
  const remaining = Math.max(product.stock - inCart, 0);
  const soldOut = product.stock === 0;
  const safeQuantity = Math.min(quantity, Math.max(remaining, 1));

  function handleAddToCart() {
    if (!product) return;
    addItem(product.uuid, safeQuantity);
    setQuantity(1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2200);
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-8 sm:px-6 md:py-12">
      <nav aria-label="Breadcrumb" className="mb-7 flex flex-wrap items-center gap-2 text-sm text-ink-soft">
        <Link to="/" className="transition-colors hover:text-signal">
          Catalog
        </Link>
        {category && (
          <>
            <span aria-hidden="true">/</span>
            <span>{category.name}</span>
          </>
        )}
        <span aria-hidden="true">/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <section aria-label="Product images">
          <div className="aspect-square overflow-hidden rounded-3xl border border-line bg-mist">
            {activeImage ? (
              <img src={activeImage.image_url} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-ink-soft">
                <img src="/logo-mark.png" alt="" className="h-20 w-auto opacity-25" />
                <span className="text-sm">No image yet</span>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-4 grid grid-cols-5 gap-3">
              {images.map((image, index) => (
                <button
                  key={image.uuid}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  aria-label={`Show image ${index + 1}`}
                  aria-current={selectedImage === index}
                  className={`aspect-square overflow-hidden rounded-xl border-2 bg-mist transition-colors ${
                    selectedImage === index ? "border-signal" : "border-transparent hover:border-line"
                  }`}
                >
                  <img src={image.image_url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="flex flex-col">
          {category && <p className="text-sm font-medium text-signal">{category.name}</p>}
          <h1 className="mt-1.5 text-balance font-display text-3xl font-extrabold leading-tight text-ink md:text-4xl">
            {product.name}
          </h1>

          <p className="mt-5 font-display text-4xl font-extrabold tabular-nums text-ink">{money(product.price)}</p>

          <p
            className={`mt-4 flex items-center gap-2 text-sm font-medium ${
              soldOut ? "text-bad" : product.stock <= 5 ? "text-ember" : "text-good"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />
            {soldOut ? "Out of stock" : product.stock <= 5 ? `Only ${product.stock} left` : `${product.stock} in stock`}
          </p>

          <div className="mt-7 border-t border-line pt-7">
            {soldOut ? (
              <button type="button" disabled className="btn btn-primary w-full sm:w-auto">
                Out of stock
              </button>
            ) : remaining === 0 ? (
              <div>
                <p className="text-sm text-ink-soft">
                  All {product.stock} available {product.stock === 1 ? "unit is" : "units are"} already in your cart.
                </p>
                <Link to="/cart" className="btn btn-primary mt-4 w-full sm:w-auto">
                  <CartIcon className="h-[18px] w-[18px]" />
                  View cart
                </Link>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <QuantityStepper value={safeQuantity} onChange={setQuantity} max={remaining} />
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`btn flex-1 sm:flex-none sm:px-8 ${added ? "bg-good text-white" : "btn-primary"}`}
                >
                  {added ? (
                    <>
                      <CheckIcon className="h-[18px] w-[18px]" />
                      Added to cart
                    </>
                  ) : (
                    <>
                      <CartIcon className="h-[18px] w-[18px]" />
                      Add to cart
                    </>
                  )}
                </button>
              </div>
            )}

            <p className="mt-3 text-sm text-ink-soft" aria-live="polite">
              {inCart > 0 && remaining > 0 && (
                <>
                  {inCart} in your cart.{" "}
                  <Link to="/cart" className="font-medium text-signal hover:underline">
                    View cart
                  </Link>
                </>
              )}
            </p>
          </div>

          <div className="mt-8">
            <h2 className="font-display text-lg font-bold text-ink">About this product</h2>
            <p className="mt-3 max-w-prose whitespace-pre-line leading-7 text-ink-soft">
              {product.description || "No description has been added yet."}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
