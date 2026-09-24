import { useEffect, useState, type FormEvent } from "react";
import { api, extractError } from "../../api/client";
import ErrorBanner from "../../components/ErrorBanner";
import Modal from "../../components/Modal";
import type { Category } from "../../types";

interface FormState {
  name: string;
  slug: string;
  description: string;
}

const emptyForm: FormState = { name: "", slug: "", description: "" };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingUuid, setEditingUuid] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    api
      .get<{ categories: Category[] }>("/categories")
      .then((res) => setCategories(res.data.categories ?? []))
      .catch((err) => setError(extractError(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openCreate() {
    setForm(emptyForm);
    setFormError("");
    setModalMode("create");
  }

  function openEdit(category: Category) {
    setForm({ name: category.name, slug: category.slug, description: category.description });
    setEditingUuid(category.uuid);
    setFormError("");
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setEditingUuid(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      if (modalMode === "create") {
        await api.post("/categories", form);
      } else if (modalMode === "edit" && editingUuid) {
        await api.patch(`/categories/${editingUuid}`, form);
      }
      closeModal();
      load();
    } catch (err) {
      setFormError(extractError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category: Category) {
    if (!confirm(`Delete "${category.name}"? This can't be undone.`)) return;
    try {
      await api.delete(`/categories/${category.uuid}`);
      setCategories((prev) => prev.filter((c) => c.uuid !== category.uuid));
    } catch (err) {
      setError(extractError(err));
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-600 text-ink">Categories</h1>
          <p className="mt-1 text-sm text-ink-soft">Group products so shoppers can filter them.</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-md bg-signal px-4 py-2 text-sm font-medium text-white hover:bg-signal-dim"
        >
          New category
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
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-ink-soft">
                  Loading…
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-ink-soft">
                  No categories yet. Create the first one.
                </td>
              </tr>
            ) : (
              categories.map((c) => (
                <tr key={c.uuid} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-medium text-ink">{c.name}</td>
                  <td className="px-4 py-3 text-ink-soft">/{c.slug}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-ink-soft">
                    {c.description || "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(c)}
                      className="mr-3 text-signal hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c)}
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
        <Modal
          title={modalMode === "create" ? "New category" : "Edit category"}
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
                rows={3}
                className="rounded-md border border-line px-3 py-2 outline-none focus:border-signal"
              />
            </label>

            <div className="mt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-md px-4 py-2 text-sm text-ink-soft hover:text-ink"
              >
                Cancel
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
        </Modal>
      )}
    </div>
  );
}
