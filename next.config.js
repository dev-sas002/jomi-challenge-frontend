/**
 * `images.domains` entries must be bare hostnames. Accepts a full URL, a
 * "host:port" pair or a bare host and returns the hostname, or undefined when
 * the input is missing/unparseable.
 * @param {string | undefined} value
 * @returns {string | undefined}
 */
function hostnameOf(value) {
  if (!value) return undefined;
  try {
    return new URL(value).hostname;
  } catch (e) {
    return value.replace(/^.*:\/\//, "").split("/")[0].split(":")[0] || undefined;
  }
}

/**
 * Sent on every response. No CSP here: MUI/Emotion inject styles at runtime, so
 * a useful policy needs a nonce plumbed through `_document`, which is a change
 * to make deliberately rather than as a default.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  // Produces .next/standalone: a self-contained server plus only the
  // node_modules it actually requires, which is what the runtime Docker stage
  // copies. See Dockerfile.
  experimental: {
    outputStandalone: true,
  },
  // No CMS variable is inlined into the browser bundle. The homepage is built
  // on the server (`getStaticProps`), so `STRAPI_URL` and `STRAPI_TOKEN` stay
  // server-side and the client never learns the CMS address.
  images: {
    // `images.domains` takes bare hostnames, but `STRAPI_CMS_URL` is a full
    // origin (e.g. "http://localhost:1337"), so extract the host. The value may
    // also be missing in local/dev/test, hence the filter.
    domains: Array.from(
      new Set(["localhost", hostnameOf(process.env.STRAPI_CMS_URL)])
    ).filter(Boolean),
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

module.exports = nextConfig;
