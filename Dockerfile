# syntax=docker/dockerfile:1

# Three stages so the runtime image carries neither yarn, the toolchain, nor
# the source tree: only the standalone server Next.js emits and the static
# assets it serves.

FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock ./
# Playwright is a devDependency used only by the screenshot and seed-art
# scripts; it is never needed to build or run the app.
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
RUN yarn install --frozen-lockfile


FROM node:18-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# The homepage is prerendered during the build, so the source chosen here is
# what the container serves until the first revalidation. Defaulting to the
# bundled fixture means the image boots populated with no CMS reachable; build
# with `--build-arg CMS_SOURCE=strapi` (and STRAPI_URL set) to bake in live
# content instead.
ARG CMS_SOURCE=fixture
ENV CMS_SOURCE=$CMS_SOURCE

COPY --from=deps /app/node_modules ./node_modules
COPY . .
# `experimental.outputStandalone` in next.config.js produces .next/standalone.
RUN yarn build


FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=8261 \
    HOSTNAME=0.0.0.0

# Seed content, so the container serves a fully populated page on first boot
# with no CMS attached. Override with CMS_SOURCE=strapi.
ENV CMS_SOURCE=fixture

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 --ingroup nodejs nextjs

# The standalone bundle includes its own minimal node_modules and server.js.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 8261

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + process.env.PORT).then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "server.js"]
