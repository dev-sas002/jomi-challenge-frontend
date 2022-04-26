import {
  DEFAULT_REVALIDATE_SECONDS,
  getCmsSource,
  getRevalidateSeconds,
  loadHomePage,
} from "lib/cms/homePage";

const fetchHomePagePayload = jest.fn();

jest.mock("lib/cms/strapi", () => ({
  fetchHomePagePayload: (...args: unknown[]) => fetchHomePagePayload(...args),
}));

const ORIGINAL_ENV = process.env;

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
  fetchHomePagePayload.mockReset();
});

afterEach(() => {
  process.env = ORIGINAL_ENV;
  jest.restoreAllMocks();
});

describe("getCmsSource", () => {
  it("defaults to the live CMS", () => {
    delete process.env.CMS_SOURCE;
    expect(getCmsSource()).toBe("strapi");
  });

  it("uses the bundled fixture when asked to", () => {
    process.env.CMS_SOURCE = "fixture";
    expect(getCmsSource()).toBe("fixture");
  });

  it("treats an unrecognised value as the live CMS", () => {
    process.env.CMS_SOURCE = "nonsense";
    expect(getCmsSource()).toBe("strapi");
  });
});

describe("getRevalidateSeconds", () => {
  it("defaults to one minute", () => {
    delete process.env.CMS_REVALIDATE_SECONDS;
    expect(getRevalidateSeconds()).toBe(DEFAULT_REVALIDATE_SECONDS);
  });

  it("reads a positive integer from the environment", () => {
    process.env.CMS_REVALIDATE_SECONDS = "300";
    expect(getRevalidateSeconds()).toBe(300);
  });

  it.each(["0", "-5", "soon"])(
    "warns and falls back for the invalid value %p",
    (value) => {
      const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
      process.env.CMS_REVALIDATE_SECONDS = value;

      expect(getRevalidateSeconds()).toBe(DEFAULT_REVALIDATE_SECONDS);
      expect(warn).toHaveBeenCalled();
    }
  );
});

describe("loadHomePage", () => {
  it("renders the bundled fixture without touching the CMS", async () => {
    process.env.CMS_SOURCE = "fixture";

    const { blocks, source, revalidateSeconds } = await loadHomePage();

    expect(source).toBe("fixture");
    expect(fetchHomePagePayload).not.toHaveBeenCalled();
    expect(blocks.length).toBeGreaterThan(0);
    expect(revalidateSeconds).toBe(DEFAULT_REVALIDATE_SECONDS);
  });

  it("maps a live CMS payload, absolutising media against STRAPI_CMS_URL", async () => {
    process.env.CMS_SOURCE = "strapi";
    process.env.STRAPI_CMS_URL = "http://cms.test";
    fetchHomePagePayload.mockResolvedValue({
      homePage: {
        data: {
          attributes: {
            sections: [
              {
                __typename: "ComponentCommonTwoColumnBlock",
                id: "1",
                TitleText: "Live from the CMS",
                Image: {
                  data: {
                    id: "1",
                    attributes: { url: "/uploads/a.jpg", alternativeText: "A" },
                  },
                },
              },
            ],
          },
        },
      },
    });

    const { blocks, source } = await loadHomePage();

    expect(source).toBe("strapi");
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toMatchObject({
      __typename: "ComponentCommonTwoColumnBlock",
      image: { url: "http://cms.test/uploads/a.jpg" },
    });
  });

  it("returns no blocks instead of failing the build when the CMS is down", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    process.env.CMS_SOURCE = "strapi";
    process.env.CMS_REVALIDATE_SECONDS = "120";
    fetchHomePagePayload.mockRejectedValue(new Error("ECONNREFUSED"));

    const result = await loadHomePage();

    expect(result.blocks).toEqual([]);
    expect(result.revalidateSeconds).toBe(120);
    expect(error).toHaveBeenCalled();
  });
});
