/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    API_URL: process.env.API_URL,
    STRAPI_CMS_URL: process.env.STRAPI_CMS_URL,
  },
  images: {
    // `process.env.STRAPI_CMS_URL` may be undefined in local/dev/test.
    // Next.js requires `images.domains` to be an array of strings only.
    domains: ["localhost", process.env.STRAPI_CMS_URL].filter(Boolean),
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
};

module.exports = nextConfig;
