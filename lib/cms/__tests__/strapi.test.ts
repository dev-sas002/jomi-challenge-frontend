import { HomePageDocument } from "graphql/cms/homepage.generated";

/**
 * `lib/cms/strapi` reads `process.env` at call time but caches nothing, so the
 * module is loaded fresh per test only where the environment is involved.
 */
type StrapiModule = typeof import("lib/cms/strapi");

const loadModule = (): StrapiModule => {
  let mod: StrapiModule | undefined;
  jest.isolateModules(() => {
    mod = require("lib/cms/strapi") as StrapiModule;
  });
  if (!mod) throw new Error("failed to load lib/cms/strapi");
  return mod;
};

const ORIGINAL_ENV = process.env;

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

afterEach(() => {
  process.env = ORIGINAL_ENV;
  jest.restoreAllMocks();
});

describe("getStrapiUrl", () => {
  it("uses STRAPI_URL when it is set", () => {
    process.env.STRAPI_URL = "https://cms.example.com/graphql";
    expect(loadModule().getStrapiUrl()).toBe("https://cms.example.com/graphql");
  });

  it("falls back to the local Strapi endpoint when STRAPI_URL is unset", () => {
    delete process.env.STRAPI_URL;
    const mod = loadModule();
    expect(mod.getStrapiUrl()).toBe(mod.DEFAULT_STRAPI_URL);
    expect(mod.DEFAULT_STRAPI_URL).toBe("http://localhost:1337/graphql");
  });

  it("does not warn under NODE_ENV=test", () => {
    delete process.env.STRAPI_URL;
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    loadModule().getStrapiUrl();
    expect(warn).not.toHaveBeenCalled();
  });

  it("warns once the fallback is used in development", () => {
    delete process.env.STRAPI_URL;
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const mod = loadModule();
    (process.env as Record<string, string>).NODE_ENV = "development";
    mod.getStrapiUrl();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toContain("STRAPI_URL is not set");
  });
});

describe("strapiRequestHeaders", () => {
  it("sends no Authorization header when no token is configured", () => {
    delete process.env.STRAPI_TOKEN;
    expect(loadModule().strapiRequestHeaders()).toEqual({});
  });

  it("sends a bearer token when STRAPI_TOKEN is set", () => {
    process.env.STRAPI_TOKEN = "example-token";
    expect(loadModule().strapiRequestHeaders()).toEqual({
      Authorization: "Bearer example-token",
    });
  });
});

describe("createStrapiClient", () => {
  it("builds a server-side client with an empty cache", () => {
    process.env.STRAPI_URL = "https://cms.example.com/graphql";
    const client = loadModule().createStrapiClient();

    expect(client).toBeDefined();
    expect(client.cache.extract()).toEqual({});
  });
});

describe("fetchHomePagePayload", () => {
  it("runs the generated HomePage document against the injected client", async () => {
    const query = jest.fn().mockResolvedValue({
      data: { homePage: { data: { attributes: { sections: [] } } } },
    });

    const payload = await loadModule().fetchHomePagePayload({ query });

    expect(query).toHaveBeenCalledWith({ query: HomePageDocument });
    expect(payload.homePage?.data?.attributes?.sections).toEqual([]);
  });

  it("returns an empty payload when the CMS answers with no data", async () => {
    const query = jest.fn().mockResolvedValue({ data: null });

    await expect(
      loadModule().fetchHomePagePayload({ query })
    ).resolves.toEqual({});
  });

  it("propagates a transport failure to the caller", async () => {
    const query = jest.fn().mockRejectedValue(new Error("ECONNREFUSED"));

    await expect(
      loadModule().fetchHomePagePayload({ query })
    ).rejects.toThrow("ECONNREFUSED");
  });
});
