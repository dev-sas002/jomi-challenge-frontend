import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import {
  HomePageDocument,
  type HomePageQuery,
} from "graphql/cms/homepage.generated";
import type { HomePagePayload } from "./mapHomePage";

/**
 * Server-side GraphQL access to Strapi.
 *
 * This module is only ever imported from `getStaticProps`, so Next.js strips it
 * out of the browser bundle: Apollo Client, the GraphQL document and the CMS
 * URL never reach the client. See the design notes in the README for why the
 * page no longer runs a client-side query.
 */

/** Used when `STRAPI_URL` is not set — matches the default Strapi dev server. */
export const DEFAULT_STRAPI_URL = "http://localhost:1337/graphql";

export function getStrapiUrl(): string {
  const uri = process.env.STRAPI_URL;
  if (uri) return uri;

  if (process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test") {
    // eslint-disable-next-line no-console
    console.warn(
      `STRAPI_URL is not set; falling back to ${DEFAULT_STRAPI_URL}. ` +
        "Copy .env.example to .env and point STRAPI_URL at your Strapi GraphQL endpoint."
    );
  }

  return DEFAULT_STRAPI_URL;
}

/**
 * Strapi API tokens are read on the server only and are never forwarded into
 * the bundle (`next.config.js` inlines no CMS variables). Unset means the
 * public, unauthenticated endpoint.
 */
export function strapiRequestHeaders(): Record<string, string> {
  const token = process.env.STRAPI_TOKEN;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function createStrapiClient() {
  return new ApolloClient({
    ssrMode: true,
    link: new HttpLink({ uri: getStrapiUrl(), headers: strapiRequestHeaders() }),
    cache: new InMemoryCache(),
    defaultOptions: {
      // One-shot build-time query: never serve a stale normalised result.
      query: { fetchPolicy: "no-cache", errorPolicy: "all" },
    },
  });
}

/** The slice of Apollo's client surface this module needs. */
export type HomePageQueryClient = {
  query: (options: {
    query: typeof HomePageDocument;
  }) => Promise<{ data?: HomePageQuery | null }>;
};

/**
 * Runs the `HomePage` query against Strapi and returns the raw payload. The
 * client is injectable so tests can exercise this without a network stack.
 */
export async function fetchHomePagePayload(
  client: HomePageQueryClient = createStrapiClient()
): Promise<HomePagePayload> {
  const { data } = await client.query({ query: HomePageDocument });

  return (data ?? {}) as HomePagePayload;
}
