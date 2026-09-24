import { useState, type ChangeEvent } from "react";

type Mode = "link" | "upload";

const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2MB — data-URL хранится прямо в Postgres как текст

export default function ImagePicker({
  value,
  onChange,
  label = "Image",
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  const [mode, setMode] = useState<Mode>("link");
  const [fileError, setFileError] = useState("");

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFileError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setFileError("Keep it under 2MB for now.");
      return;
    }

    setFileError("");
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result));
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-ink-soft">{label}</span>
        <div className="flex rounded-md border border-line p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setMode("link")}
            className={`rounded px-2 py-1 transition-colors ${
              mode === "link" ? "bg-ink text-white" : "text-ink-soft"
            }`}
          >
            Link
          </button>
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`rounded px-2 py-1 transition-colors ${
              mode === "upload" ? "bg-ink text-white" : "text-ink-soft"
            }`}
          >
            Upload
          </button>
        </div>
      </div>

      <div className="mt-1.5">
        {mode === "link" ? (
          <input
            type="url"
            placeholder="https://…"
            value={value.startsWith("data:") ? "" : value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-signal"
          />
        ) : (
          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="w-full text-sm text-ink-soft file:mr-3 file:rounded-md file:border file:border-line file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ink"
          />
        )}
      </div>

      {fileError && <p className="mt-1 text-xs text-bad">{fileError}</p>}

      {value && (
        <div className="mt-2 flex items-center gap-2">
          <img src={value} alt="Preview" className="h-12 w-12 rounded border border-line object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs text-ink-soft hover:text-bad"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
