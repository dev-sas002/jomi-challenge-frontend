import type { HomeBlock } from "./blocks";
import { homePageFixture } from "./fixtures";
import { mapHomePage } from "./mapHomePage";

/**
 * Chooses where homepage content comes from and returns it as view models.
 *
 * Two sources, one pipeline: both a live Strapi response and the bundled
 * fixture go through `mapHomePage`, so the demo and the real thing cannot
 * drift apart.
 */

export type CmsSource = "strapi" | "fixture";

export const DEFAULT_REVALIDATE_SECONDS = 60;

export type HomePageContent = {
  blocks: HomeBlock[];
  source: CmsSource;
  /** Seconds between ISR regenerations; surfaced so the page can return it. */
  revalidateSeconds: number;
};

export function getCmsSource(): CmsSource {
  return process.env.CMS_SOURCE === "fixture" ? "fixture" : "strapi";
}

/**
 * `revalidate` is the whole caching strategy for this page: the HTML is built
 * once and then regenerated at most once per window, no matter how much traffic
 * arrives. Tunable per environment without a code change.
 */
export function getRevalidateSeconds(): number {
  const raw = process.env.CMS_REVALIDATE_SECONDS;
  if (!raw) return DEFAULT_REVALIDATE_SECONDS;

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    // eslint-disable-next-line no-console
    console.warn(
      `CMS_REVALIDATE_SECONDS="${raw}" is not a positive integer; using ${DEFAULT_REVALIDATE_SECONDS}s.`
    );
    return DEFAULT_REVALIDATE_SECONDS;
  }

  return parsed;
}

export async function loadHomePage(): Promise<HomePageContent> {
  const source = getCmsSource();
  const revalidateSeconds = getRevalidateSeconds();

  if (source === "fixture") {
    return {
      blocks: mapHomePage(homePageFixture),
      source,
      revalidateSeconds,
    };
  }

  // Imported lazily so the fixture path never pulls Apollo or the GraphQL
  // document into the build graph.
  const { fetchHomePagePayload } = await import("./strapi");

  try {
    const payload = await fetchHomePagePayload();
    return {
      blocks: mapHomePage(payload, {
        mediaBaseUrl: process.env.STRAPI_CMS_URL,
      }),
      source,
      revalidateSeconds,
    };
  } catch (error) {
    // A CMS that is down must not fail the build. The page renders its empty
    // state and the next revalidation picks the content back up.
    // eslint-disable-next-line no-console
    console.error("[cms] failed to load the homepage from Strapi:", error);
    return { blocks: [], source, revalidateSeconds };
  }
}
