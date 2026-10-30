import { useState, type ChangeEvent } from "react";

type Mode = "link" | "upload";

const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2 MB: the data URL is stored as text in Postgres

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
      setFileError("The image is larger than 2 MB. Choose a smaller one.");
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
        <span className="text-sm font-medium text-ink">{label}</span>
        <div role="group" aria-label="Image source" className="flex rounded-lg border border-line bg-paper p-0.5 text-xs font-medium">
          {(["link", "upload"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className={`rounded-md px-3 py-1 transition-colors ${
                mode === m ? "bg-white text-navy shadow-sm" : "text-ink-soft hover:text-ink"
              }`}
            >
              {m === "link" ? "Link" : "Upload"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2">
        {mode === "link" ? (
          <input
            type="url"
            placeholder="https://example.com/photo.jpg"
            value={value.startsWith("data:") ? "" : value}
            onChange={(e) => onChange(e.target.value)}
            className="input text-sm"
          />
        ) : (
          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="w-full text-sm text-ink-soft file:mr-3 file:cursor-pointer file:rounded-lg file:border file:border-line file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-ink hover:file:border-signal"
          />
        )}
      </div>

      {fileError && (
        <p role="alert" className="mt-1.5 text-xs text-bad">
          {fileError}
        </p>
      )}

      {value && (
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-line bg-paper p-2">
          <img src={value} alt="Preview" className="h-14 w-14 rounded-lg border border-line object-cover" />
          <span className="flex-1 text-xs text-ink-soft">{value.startsWith("data:") ? "Uploaded from your device" : "Linked image"}</span>
          <button type="button" onClick={() => onChange("")} className="rounded-lg px-2 py-1 text-xs text-ink-soft transition-colors hover:text-bad">
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
