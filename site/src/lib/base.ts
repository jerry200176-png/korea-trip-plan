/**
 * Normalize Astro BASE_URL to always end with `/`.
 */
export function siteBase(): string {
  const raw = import.meta.env.BASE_URL || "/";
  return raw.endsWith("/") ? raw : `${raw}/`;
}
