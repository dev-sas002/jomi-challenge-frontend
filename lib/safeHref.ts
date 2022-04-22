/**
 * Section links (button targets, image sources) come straight out of the CMS,
 * so they are untrusted input. Rendering an attacker-supplied `javascript:` or
 * `data:` URL into an `href` is a stored-XSS vector — React warns about it but
 * still emits the attribute — so every CMS-provided URL is normalised here.
 *
 * Returns the URL when it is safe to render, or `null` when it is not, so the
 * caller can drop the link entirely instead of rendering a dead/unsafe one.
 */
const SAFE_PROTOCOLS = ["http:", "https:", "mailto:", "tel:"];

export function safeHref(
  href: string | null | undefined,
  base = "http://localhost"
): string | null {
  if (typeof href !== "string") return null;

  const trimmed = href.trim();
  if (!trimmed) return null;

  // Relative and root-relative URLs never carry a protocol, so they are safe.
  // `new URL` needs a base to resolve them; the base is only used for parsing.
  let parsed: URL;
  try {
    parsed = new URL(trimmed, base);
  } catch {
    return null;
  }

  if (!SAFE_PROTOCOLS.includes(parsed.protocol)) return null;

  return trimmed;
}

export default safeHref;
