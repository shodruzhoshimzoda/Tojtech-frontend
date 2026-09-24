import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, extractError } from "../../api/client";
import ErrorBanner from "../../components/ErrorBanner";
import type { Product } from "../../types";

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export default function ProductPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!uuid) return;
    api.get<{ product: Product }>(`/products/${uuid}`)
      .then((response) => setProduct(response.data.product))
      .catch((err) => setError(extractError(err)))
      .finally(() => setLoading(false));
  }, [uuid]);

  if (loading) return <main className="mx-auto max-w-6xl px-6 py-16 text-ink-soft">Loading product...</main>;
  if (error || !product) {
    return <main className="mx-auto max-w-6xl px-6 py-16">{error ? <ErrorBanner message={error} /> : <p className="text-ink-soft">This product could not be found.</p>}<Link to="/" className="mt-6 inline-block font-medium text-signal hover:underline">Back to catalog</Link></main>;
  }

  const images = product.images ?? [];
  const activeImage = images[selectedImage] ?? images[0];

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 md:py-14">
      <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-ink-soft transition-colors hover:text-signal"><span aria-hidden="true">←</span> Back to catalog</Link>
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <section>
          <div className="aspect-square overflow-hidden rounded-3xl border border-line bg-white shadow-[0_18px_45px_rgba(32,83,137,0.1)]">
            {activeImage ? <img src={activeImage.image_url} alt={product.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-ink-soft">No image available</div>}
          </div>
          {images.length > 1 && <div className="mt-4 grid grid-cols-5 gap-3">{images.map((image, index) => <button key={image.uuid} type="button" onClick={() => setSelectedImage(index)} className={`aspect-square overflow-hidden rounded-xl border-2 bg-white ${selectedImage === index ? "border-signal" : "border-line"}`} aria-label={`View image ${index + 1}`}><img src={image.image_url} alt="" className="h-full w-full object-cover" /></button>)}</div>}
        </section>
        <section className="flex flex-col justify-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-signal">TojTech selection</p>
          <h1 className="mt-3 font-display text-4xl font-700 leading-tight text-ink md:text-5xl">{product.name}</h1>
          <p className="mt-5 text-3xl font-700 text-signal">{money(product.price)}</p>
          <div className="mt-5 flex items-center gap-3"><span className={`rounded-full px-3 py-1 text-sm font-semibold ${product.stock > 0 ? "bg-blue-100 text-signal-dim" : "bg-red-100 text-bad"}`}>{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</span><span className="text-sm text-ink-soft">Ships from our local shelf</span></div>
          <div className="my-8 h-px bg-line" />
          <h2 className="font-display text-lg font-700 text-ink">About this product</h2>
          <p className="mt-3 whitespace-pre-line leading-7 text-ink-soft">{product.description || "No description available yet."}</p>
        </section>
      </div>
    </main>
  );
}