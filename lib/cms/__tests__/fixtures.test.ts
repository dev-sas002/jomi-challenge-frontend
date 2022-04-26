import { existsSync } from "node:fs";
import path from "node:path";
import { homePageFixture } from "lib/cms/fixtures";
import { mapHomePage } from "lib/cms/mapHomePage";
import type { CarouselBlock, TwoColumnBlock } from "lib/cms/blocks";

/**
 * The fixture is what the Docker image, `CMS_SOURCE=fixture` and the committed
 * screenshots all render, so it is worth asserting that it stays a complete,
 * fully-populated page rather than quietly decaying into an empty state.
 */
describe("homePageFixture", () => {
  const blocks = mapHomePage(homePageFixture);

  it("maps to a populated page", () => {
    expect(blocks.length).toBeGreaterThanOrEqual(4);
  });

  it("covers every registered block type", () => {
    expect(new Set(blocks.map((block) => block.__typename))).toEqual(
      new Set([
        "ComponentCommonHeader",
        "ComponentCommonTwoColumnBlock",
        "ComponentCommonCarousel",
      ])
    );
  });

  it("leads with a header so the page has an h1", () => {
    expect(blocks[0].__typename).toBe("ComponentCommonHeader");
  });

  it("gives every image alt text and intrinsic dimensions", () => {
    const images = blocks.flatMap((block) => {
      if (block.__typename === "ComponentCommonTwoColumnBlock") {
        return block.image ? [block.image] : [];
      }
      if (block.__typename === "ComponentCommonCarousel") {
        return block.items.flatMap((item) => (item.image ? [item.image] : []));
      }
      return [];
    });

    expect(images.length).toBeGreaterThan(0);
    images.forEach((image) => {
      expect(image.alt.length).toBeGreaterThan(0);
      expect(image.width).toBeGreaterThan(0);
      expect(image.height).toBeGreaterThan(0);
      expect(image.url.startsWith("/seed/")).toBe(true);
    });
  });

  it("exercises both image positions", () => {
    const positions = blocks
      .filter(
        (block): block is TwoColumnBlock =>
          block.__typename === "ComponentCommonTwoColumnBlock"
      )
      .map((block) => block.imagePosition);

    expect(new Set(positions)).toEqual(new Set(["left", "right"]));
  });

  /**
   * The original bug in this repo was media that could never render. A fixture
   * pointing at a file that is not in `public/` would reproduce it silently:
   * the page would still "work", just with every image broken.
   */
  it("points every image at a file that exists in public/", () => {
    const urls = blocks.flatMap((block) => {
      if (block.__typename === "ComponentCommonTwoColumnBlock") {
        return block.image ? [block.image.url] : [];
      }
      if (block.__typename === "ComponentCommonCarousel") {
        return block.items.flatMap((item) => (item.image ? [item.image.url] : []));
      }
      return [];
    });

    expect(urls.length).toBeGreaterThan(0);
    urls.forEach((url) => {
      expect(existsSync(path.join(process.cwd(), "public", url))).toBe(true);
    });
  });

  it("has a carousel with more than one slide", () => {
    const carousel = blocks.find(
      (block): block is CarouselBlock =>
        block.__typename === "ComponentCommonCarousel"
    );

    expect(carousel?.items.length).toBeGreaterThan(1);
  });
});
