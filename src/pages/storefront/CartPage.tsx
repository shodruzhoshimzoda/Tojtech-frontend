import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, extractError } from "../../api/client";
import { useCart } from "../../cart/CartContext";
import ErrorBanner from "../../components/ErrorBanner";
import { TrashIcon } from "../../components/Icons";
import QuantityStepper from "../../components/QuantityStepper";
import type { Product } from "../../types";

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export default function CartPage() {
  const { items, setQuantity, removeItem, clearCart } = useCart();
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(items.length > 0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [checkoutNote, setCheckoutNote] = useState(false);

  // Only the *set* of products decides when we refetch. Changing a quantity
  // must not trigger a request, and the quantity shown always comes from the cart.
  const uuidKey = items.map((i) => i.productUuid).sort().join(",");

  useEffect(() => {
    const uuids = uuidKey ? uuidKey.split(",") : [];
    const missing = uuids.filter((id) => !products[id]);
    if (missing.length === 0) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all(
      missing.map((id) =>
        api
          .get<{ product: Product }>(`/products/${id}`)
          .then((res) => ({ id, product: res.data.product }))
          .catch((err) => ({ id, product: null, notFound: axios.isAxiosError(err) && err.response?.status === 404, err })),
      ),
    ).then((results) => {
      if (cancelled) return;

      const loaded: Record<string, Product> = {};
      let removed = 0;
      let failure: unknown = null;

      for (const r of results) {
        if (r.product) loaded[r.id] = r.product;
        else if ("notFound" in r && r.notFound) {
          removeItem(r.id);
          removed++;
        } else if ("err" in r) failure = r.err;
      }

      setProducts((prev) => ({ ...prev, ...loaded }));
      setNotice(removed > 0 ? `${removed} ${removed === 1 ? "item is" : "items are"} no longer sold and was removed from your cart.` : "");
      setError(failure ? extractError(failure) : "");
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
    // `products` is read only to skip what is already loaded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuidKey]);

  const lines = useMemo(
    () =>
      items
        .map((item) => ({ item, product: products[item.productUuid] }))
        .filter((l): l is { item: typeof l.item; product: Product } => Boolean(l.product)),
    [items, products],
  );

  const total = lines.reduce((sum, l) => sum + l.product.price * l.item.quantity, 0);
  const unitCount = lines.reduce((sum, l) => sum + l.item.quantity, 0);

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-6" aria-busy="true">
        <div className="skeleton h-9 w-40 rounded" />
        <div className="skeleton mt-8 h-64 rounded-[1.25rem]" />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-8 sm:px-6 md:py-12">
      <h1 className="font-display text-3xl font-extrabold text-ink">Your cart</h1>

      {(error || notice) && (
        <div className="mt-6 space-y-3">
          {error && <ErrorBanner message={error} />}
          {notice && (
            <p role="status" className="rounded-xl border border-line bg-mist px-4 py-3 text-sm text-navy">
              {notice}
            </p>
          )}
        </div>
      )}

      {lines.length === 0 ? (
        <div className="mt-10 rounded-[1.25rem] border border-dashed border-line bg-white px-6 py-16 text-center">
          <img src="/logo-mark.png" alt="" className="mx-auto h-16 w-auto opacity-30" />
          <p className="mt-5 font-display text-xl font-bold text-ink">Your cart is empty</p>
          <p className="mt-1 text-sm text-ink-soft">Products you add will wait here until you are ready.</p>
          <Link to="/" className="btn btn-primary mt-6">
            Browse the catalog
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_21rem]">
          <ul className="divide-y divide-line overflow-hidden rounded-[1.25rem] border border-line bg-white">
            {lines.map(({ item, product }) => {
              const image = product.images?.find((i) => i.is_main) ?? product.images?.[0];
              const overStock = item.quantity > product.stock;
              return (
                <li key={product.uuid} className="flex gap-4 p-4 sm:p-5">
                  <Link
                    to={`/products/${product.uuid}`}
                    className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-mist"
                    aria-label={product.name}
                  >
                    {image ? (
                      <img src={image.image_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <img src="/logo-mark.png" alt="" className="h-10 w-auto opacity-25" />
                      </div>
                    )}
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        to={`/products/${product.uuid}`}
                        className="line-clamp-2 font-display text-[15px] font-bold leading-snug text-ink transition-colors hover:text-signal"
                      >
                        {product.name}
                      </Link>
                      <p className="shrink-0 font-display font-extrabold tabular-nums text-ink">
                        {money(product.price * item.quantity)}
                      </p>
                    </div>
                    <p className="mt-1 text-sm tabular-nums text-ink-soft">{money(product.price)} each</p>

                    {overStock && (
                      <p className="mt-1 text-sm font-medium text-ember">
                        {product.stock === 0 ? "Currently out of stock" : `Only ${product.stock} in stock`}
                      </p>
                    )}

                    <div className="mt-auto flex items-center justify-between pt-3">
                      <QuantityStepper
                        value={item.quantity}
                        onChange={(q) => setQuantity(product.uuid, q)}
                        max={Math.max(product.stock, 1)}
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(product.uuid)}
                        className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-ink-soft transition-colors hover:text-bad"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <aside className="rounded-[1.25rem] border border-line bg-white p-6 lg:sticky lg:top-24">
            <h2 className="font-display text-lg font-bold text-ink">Order summary</h2>

            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-soft">
                  Items ({unitCount})
                </dt>
                <dd className="font-medium tabular-nums text-ink">{money(total)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-4 text-base">
                <dt className="font-semibold text-ink">Total</dt>
                <dd className="font-display text-xl font-extrabold tabular-nums text-ink">{money(total)}</dd>
              </div>
            </dl>

            <button type="button" onClick={() => setCheckoutNote(true)} className="btn btn-primary mt-6 w-full">
              Checkout
            </button>

            {checkoutNote && (
              <p role="status" className="mt-3 rounded-xl bg-mist px-3.5 py-3 text-sm text-navy">
                Online checkout is not available yet. Your cart is saved on this device.
              </p>
            )}

            <button
              type="button"
              onClick={clearCart}
              className="mt-4 w-full text-center text-sm text-ink-soft transition-colors hover:text-bad"
            >
              Clear cart
            </button>
          </aside>
        </div>
      )}
    </main>
  );
}
