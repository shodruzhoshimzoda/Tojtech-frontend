import { useEffect, useState, type FormEvent } from "react";
import { api, extractError } from "../../api/client";
import ErrorBanner from "../../components/ErrorBanner";
import ImagePicker from "../../components/ImagePicker";
import Modal from "../../components/Modal";
import type { Brand } from "../../types";
import { slugify } from "../../utils/slug"

// The server accepts a logo up to about 500 KB, so the picker uses the same limit.
const LOGO_MAX_BYTES = 500 * 1024;
const DESCRIPTION_MAX = 500;

interface FormState {
  name: string;
  slug: string;
  logo_url: string;
  description: string;
}

const emptyForm: FormState = { name: "", slug: "", logo_url: "", description: "" };

function BrandLogo({ brand }: { brand: Brand }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-white font-display text-sm font-bold text-signal"
    >
      {brand.logo_url ? (
        <img src={brand.logo_url} alt="" className="h-full w-full object-contain p-1" />
      ) : (
        brand.name.charAt(0).toUpperCase()
      )}
    </span>
  );
}

function deleteMessage(brand: Brand) {
  if (brand.product_count === 0) return `Delete "${brand.name}"? This can't be undone.`;
  const used =
    brand.product_count === 1 ? "1 product uses" : `${brand.product_count} products use`;
  const they = brand.product_count === 1 ? "It will stay" : "They will stay";
  return `${used} the brand "${brand.name}". ${they} in the store, but will no longer have a brand.`;
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reloadKey, setReloadKey] = useState(0); // change it to load the list again

  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingUuid, setEditingUuid] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false); // true after the admin typed the slug by hand
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState<Brand | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  useEffect(() => {
    let cancelled = false; // ignore the answer if the page was closed or the effect ran again

    api
      .get<{ brands: Brand[] }>("/brands/all")
      .then((res) => {
        if (!cancelled) setBrands(res.data.brands ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(extractError(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  function openCreate() {
    setForm(emptyForm);
    setSlugTouched(false);
    setEditingUuid(null);
    setFormError("");
    setModalMode("create");
  }

  function openEdit(brand: Brand) {
    setForm({
      name: brand.name,
      slug: brand.slug,
      logo_url: brand.logo_url,
      description: brand.description,
    });
    setSlugTouched(true); // never rewrite the slug of an existing brand while the name is edited
    setEditingUuid(brand.uuid);
    setFormError("");
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setEditingUuid(null);
  }

  function handleNameChange(name: string) {
    // while the admin has not touched the slug it follows the name: "ASUS ROG" -> "asus-rog"
    setForm((f) => ({ ...f, name, slug: slugTouched ? f.slug : slugify(name) }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    setNotice("");
    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        logo_url: form.logo_url,
        description: form.description.trim(),
      };
      if (modalMode === "create") {
        await api.post("/brands", body);
        setNotice(`Brand "${body.name}" was created.`);
      } else if (modalMode === "edit" && editingUuid) {
        await api.patch(`/brands/${editingUuid}`, body);
        setNotice(`Brand "${body.name}" was saved.`);
      }
      closeModal();
      setReloadKey((k) => k + 1);
    } catch (err) {
      setFormError(extractError(err));
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    setError("");
    setNotice("");
    try {
      await api.delete(`/brands/${deleting.uuid}`);
      setBrands((prev) => prev.filter((b) => b.uuid !== deleting.uuid));
      setNotice(`Brand "${deleting.name}" was deleted.`);
      setDeleting(null);
    } catch (err) {
      setError(extractError(err));
      setDeleting(null);
      setReloadKey((k) => k + 1); // the list may be outdated (for example the brand is already gone)
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ink">Brands</h1>
          <p className="mt-2 text-ink-soft">
            HP, ASUS, MSI… Pick a brand when you create a product, and shoppers can filter by it.
          </p>
        </div>
        <button type="button" onClick={openCreate} className="btn btn-primary">
          New brand
        </button>
      </div>

      {error && (
        <div className="mt-6">
          <ErrorBanner message={error} />
        </div>
      )}

      {notice && (
        <p role="status" className="mt-6 rounded-xl border border-good/25 bg-good/10 px-4 py-3 text-sm text-good">
          {notice}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white shadow-[0_1px_2px_rgba(10,37,71,0.06)]">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-paper text-ink-soft">
              <th className="px-5 py-3 font-medium">Brand</th>
              <th className="px-5 py-3 font-medium">Products</th>
              <th className="px-5 py-3 font-medium">Description</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-line last:border-0">
                  <td colSpan={4} className="px-5 py-4">
                    <div className="skeleton h-4 w-full rounded" />
                  </td>
                </tr>
              ))
            ) : brands.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-ink-soft">
                  {error ? "The list could not be loaded." : "No brands yet. Create the first one."}
                </td>
              </tr>
            ) : (
              brands.map((b) => (
                <tr key={b.uuid} className="border-b border-line last:border-0">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <BrandLogo brand={b} />
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-ink">{b.name}</span>
                        <span className="text-xs text-ink-soft">/{b.slug}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-ink-soft">{b.product_count}</td>
                  <td className="max-w-xs truncate px-5 py-3.5 text-ink-soft">{b.description || "—"}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => openEdit(b)}
                      aria-label={`Edit ${b.name}`}
                      className="mr-4 text-signal hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(b)}
                      aria-label={`Delete ${b.name}`}
                      className="text-bad hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalMode && (
        <Modal title={modalMode === "create" ? "New brand" : "Edit brand"} onClose={closeModal}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {formError && <ErrorBanner message={formError} />}

            <div>
              <label htmlFor="brand-name" className="mb-1.5 block text-sm font-medium text-ink">
                Name
              </label>
              <input
                id="brand-name"
                required
                maxLength={100}
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="ASUS"
                className="input"
              />
            </div>

            <div>
              <label htmlFor="brand-slug" className="mb-1.5 block text-sm font-medium text-ink">
                Slug
              </label>
              <input
                id="brand-slug"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setForm({ ...form, slug: e.target.value.toLowerCase() });
                }}
                placeholder="asus"
                className="input"
              />
              <p className="mt-1.5 text-xs text-ink-soft">
                Used in links, for example <code>asus-rog</code>: lowercase Latin letters, digits and hyphens.
              </p>
            </div>

            <ImagePicker
              label="Logo"
              value={form.logo_url}
              onChange={(logo_url) => setForm({ ...form, logo_url })}
              maxBytes={LOGO_MAX_BYTES}
              fit="contain"
            />

            <div>
              <label htmlFor="brand-description" className="mb-1.5 block text-sm font-medium text-ink">
                Description <span className="font-normal text-ink-soft">(optional)</span>
              </label>
              <textarea
                id="brand-description"
                rows={3}
                maxLength={DESCRIPTION_MAX}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input"
              />
              <p className="mt-1 text-right text-xs text-ink-soft">
                {form.description.length}/{DESCRIPTION_MAX}
              </p>
            </div>

            <div className="mt-1 flex justify-end gap-3">
              <button type="button" onClick={closeModal} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={saving || !form.name.trim()} className="btn btn-primary">
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleting && (
        <Modal title="Delete brand?" onClose={() => (deleteBusy ? undefined : setDeleting(null))}>
          <p className="text-ink">{deleteMessage(deleting)}</p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setDeleting(null)}
              disabled={deleteBusy}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={deleteBusy}
              className="btn bg-bad text-white hover:opacity-90"
            >
              {deleteBusy ? "Deleting…" : "Delete"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
