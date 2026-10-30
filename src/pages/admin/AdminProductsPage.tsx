import { useEffect, useState, type FormEvent } from "react";
import { api, extractError } from "../../api/client";
import ErrorBanner from "../../components/ErrorBanner";
import ImagePicker from "../../components/ImagePicker";
import Modal from "../../components/Modal";
import type { Category, Product } from "../../types";

interface FormState {
  name: string;
  slug: string;
  description: string;
  price: string;
  stock: string;
  category_uuid: string;
  imageUrl: string; // only used when creating - a fresh product has no uuid to attach images to yet
}

const emptyForm: FormState = {
  name: "",
  slug: "",
  description: "",
  price: "",
  stock: "",
  category_uuid: "",
  imageUrl: "",
};

function money(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");

  function load() {
    setLoading(true);
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
  }

  useEffect(load, []);

  const categoryName = (uuid?: string) =>
    categories.find((c) => c.uuid === uuid)?.name ?? "Uncategorized";

  function openCreate() {
    setForm(emptyForm);
    setFormError("");
    setEditingProduct(null);
    setModalMode("create");
  }

  function openEdit(product: Product) {
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      category_uuid: product.category?.uuid ?? "",
      imageUrl: "", // not used in edit mode - the images manager below handles that
    });
    setEditingProduct(product);
    setFormError("");
    setNewImageUrl("");
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setEditingProduct(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    setSaving(true);

    // The API decodes this straight into its Product struct, where the
    // category is a nested { uuid } object — not a flat category_uuid field.
    // Sending category_uuid gets silently dropped, Category stays nil, and
    // the API replies "specified category does not exist" even for a valid id.
    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description,
      price: Number(form.price),
      stock: Number(form.stock),
      category: { uuid: form.category_uuid },
    };

    try {
      if (modalMode === "create") {
        const res = await api.post<{ product: Product }>("/products", payload);
        const created = res.data.product;

        // Image upload is a separate endpoint that needs the product's uuid,
        // so a picture picked in the create form is attached right after.
        if (form.imageUrl) {
          try {
            await api.post(`/products/${created.uuid}/images`, {
              image_url: form.imageUrl,
              is_main: true,
            });
          } catch (imgErr) {
            // The product exists now. Switch the modal to edit mode so that
            // pressing Save again patches it instead of creating a duplicate,
            // and the image can be added from the images section below.
            setEditingProduct(created);
            setModalMode("edit");
            setNewImageUrl("");
            setFormError(
              `Product created, but the image failed to attach: ${extractError(imgErr)}. You can add it below.`,
            );
            load();
            setSaving(false);
            return;
          }
        }
        closeModal();
      } else if (modalMode === "edit" && editingProduct) {
        await api.patch(`/products/${editingProduct.uuid}`, payload);
        // Keep the modal open on edit so images can still be managed below.
      }
      load();
    } catch (err) {
      setFormError(extractError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product: Product) {
    if (!confirm(`Delete "${product.name}"? This can't be undone.`)) return;
    try {
      await api.delete(`/products/${product.uuid}`);
      setProducts((prev) => prev.filter((p) => p.uuid !== product.uuid));
    } catch (err) {
      setError(extractError(err));
    }
  }

  async function handleAddImage() {
    if (!editingProduct || !newImageUrl.trim()) return;
    try {
      await api.post(`/products/${editingProduct.uuid}/images`, {
        image_url: newImageUrl.trim(),
        is_main: (editingProduct.images ?? []).length === 0,
      });
      setNewImageUrl("");
      load();
      // Refresh the in-modal snapshot too.
      const res = await api.get<{ product: Product }>(`/products/${editingProduct.uuid}`);
      setEditingProduct(res.data.product);
    } catch (err) {
      setFormError(extractError(err));
    }
  }

  async function handleDeleteImage(imageUuid: string) {
    if (!editingProduct) return;
    try {
      await api.delete(`/products/${editingProduct.uuid}/images/${imageUuid}`);
      setEditingProduct({
        ...editingProduct,
        images: (editingProduct.images ?? []).filter((i) => i.uuid !== imageUuid),
      });
      load();
    } catch (err) {
      setFormError(extractError(err));
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-600 text-ink">Products</h1>
          <p className="mt-1 text-sm text-ink-soft">Manage what's for sale and how much of it.</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-md bg-signal px-4 py-2 text-sm font-medium text-white hover:bg-signal-dim"
        >
          New product
        </button>
      </div>

      {error && (
        <div className="mt-6">
          <ErrorBanner message={error} />
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-lg border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-ink-soft">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-ink-soft">
                  Loading…
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-ink-soft">
                  No products yet. Create the first one.
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const thumb = p.images?.find((i) => i.is_main) ?? p.images?.[0];
                return (
                  <tr key={p.uuid} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded border border-line bg-paper">
                          {thumb && (
                            <img
                              src={thumb.image_url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <span className="font-medium text-ink">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{categoryName(p.category?.uuid)}</td>
                    <td className="px-4 py-3 text-ink">{money(p.price)}</td>
                    <td className="px-4 py-3">
                      <span className={p.stock > 0 ? "text-good" : "text-bad"}>{p.stock}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openEdit(p)}
                        className="mr-3 text-signal hover:underline"
                      >
                        Edit
                      </button>
                      <button onClick={() => handleDelete(p)} className="text-bad hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {modalMode && (
        <Modal
          title={modalMode === "create" ? "New product" : "Edit product"}
          onClose={closeModal}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {formError && <ErrorBanner message={formError} />}

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-ink-soft">Name</span>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-md border border-line px-3 py-2 outline-none focus:border-signal"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-ink-soft">Slug</span>
              <input
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="rounded-md border border-line px-3 py-2 outline-none focus:border-signal"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-ink-soft">Description</span>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="rounded-md border border-line px-3 py-2 outline-none focus:border-signal"
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-ink-soft">Price</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="rounded-md border border-line px-3 py-2 outline-none focus:border-signal"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-ink-soft">Stock</span>
                <input
                  type="number"
                  min="0"
                  required
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="rounded-md border border-line px-3 py-2 outline-none focus:border-signal"
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-ink-soft">Category</span>
              <select
                required
                value={form.category_uuid}
                onChange={(e) => setForm({ ...form, category_uuid: e.target.value })}
                className="rounded-md border border-line bg-white px-3 py-2 outline-none focus:border-signal"
              >
                <option value="" disabled>
                  Select a category
                </option>
                {categories.map((c) => (
                  <option key={c.uuid} value={c.uuid}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            {modalMode === "create" && (
              <ImagePicker
                label="Product image (optional)"
                value={form.imageUrl}
                onChange={(v) => setForm({ ...form, imageUrl: v })}
              />
            )}

            <div className="mt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-md px-4 py-2 text-sm text-ink-soft hover:text-ink"
              >
                {modalMode === "edit" ? "Close" : "Cancel"}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-signal px-4 py-2 text-sm font-medium text-white hover:bg-signal-dim disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </form>

          {modalMode === "edit" && editingProduct && (
            <div className="mt-6 border-t border-line pt-5">
              <h3 className="text-sm font-medium text-ink">Images</h3>

              {(editingProduct.images ?? []).length === 0 ? (
                <p className="mt-2 text-sm text-ink-soft">No images yet.</p>
              ) : (
                <ul className="mt-3 flex flex-wrap gap-3">
                  {editingProduct.images!.map((img) => (
                    <li key={img.uuid} className="relative">
                      <img
                        src={img.image_url}
                        alt=""
                        className="h-16 w-16 rounded border border-line object-cover"
                      />
                      {img.is_main && (
                        <span className="absolute -top-2 -left-2 rounded-full bg-ember px-1.5 py-0.5 text-[10px] font-medium text-white">
                          Main
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(img.uuid)}
                        className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs text-bad shadow"
                        aria-label="Remove image"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-4">
                <ImagePicker label="Add an image" value={newImageUrl} onChange={setNewImageUrl} />
                <button
                  type="button"
                  onClick={handleAddImage}
                  disabled={!newImageUrl}
                  className="mt-2 rounded-md border border-line px-3 py-2 text-sm font-medium text-ink hover:border-ink disabled:opacity-50"
                >
                  Add image
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
