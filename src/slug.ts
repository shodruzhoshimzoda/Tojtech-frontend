// Makes a link-friendly slug from a name: "ASUS ROG" -> "asus-rog".
// Same rules as the backend (internal/domain/brand Slugify): lowercase Latin letters
// and digits separated by single hyphens. Other characters become separators.
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
