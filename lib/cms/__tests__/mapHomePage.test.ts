import type { HomePageSectionsDynamicZone } from "graphql/types";
import { mapHomePage, resolveMediaUrl } from "lib/cms/mapHomePage";
import type { HomePagePayload } from "lib/cms/mapHomePage";
import type { CarouselBlock, HeaderBlock, TwoColumnBlock } from "lib/cms/blocks";

const section = (value: unknown) => value as HomePageSectionsDynamicZone;

const payload = (sections: unknown[] | null): HomePagePayload =>
  ({
    homePage: {
      data: { attributes: { sections: sections as never } },
    },
  } as HomePagePayload);

const media = (attributes: Record<string, unknown> | null) => ({
  data: attributes === null ? null : { id: "1", attributes },
});

const rawHeader = (overrides: Record<string, unknown> = {}) =>
  section({
    __typename: "ComponentCommonHeader",
    id: "1",
    Text: "Peer-reviewed surgery",
    ButtonText: "Browse",
    ButtonLink: "https://example.com/library",
    ...overrides,
  });

const rawTwoColumn = (overrides: Record<string, unknown> = {}) =>
  section({
    __typename: "ComponentCommonTwoColumnBlock",
    id: "2",
    TitleText: "Every step",
    Description: "Narrated by the attending surgeon.",
    ButtonText: "Watch",
    ButtonUrl: "https://example.com/article",
    ImagePosition: "Left",
    Image: media({
      url: "/uploads/hero.jpg",
      previewUrl: null,
      alternativeText: "An operating theatre",
      width: 1440,
      height: 960,
    }),
    ...overrides,
  });

describe("resolveMediaUrl", () => {
  it("prefixes root-relative CMS paths with the media base URL", () => {
    expect(resolveMediaUrl("/uploads/a.jpg", "http://cms.test")).toBe(
      "http://cms.test/uploads/a.jpg"
    );
  });

  it("tolerates a trailing slash on the base URL", () => {
    expect(resolveMediaUrl("/uploads/a.jpg", "http://cms.test/")).toBe(
      "http://cms.test/uploads/a.jpg"
    );
  });

  it("leaves absolute URLs alone", () => {
    expect(resolveMediaUrl("https://cdn.test/a.jpg", "http://cms.test")).toBe(
      "https://cdn.test/a.jpg"
    );
  });

  it("leaves paths alone when no base URL is configured", () => {
    expect(resolveMediaUrl("/seed/a.jpg", undefined)).toBe("/seed/a.jpg");
  });
});

describe("mapHomePage", () => {
  it("returns an empty list for a missing payload", () => {
    expect(mapHomePage(null)).toEqual([]);
    expect(mapHomePage(undefined)).toEqual([]);
    expect(mapHomePage({})).toEqual([]);
    expect(mapHomePage(payload(null))).toEqual([]);
  });

  it("preserves the order the editor arranged the sections in", () => {
    const blocks = mapHomePage(
      payload([
        rawTwoColumn({ id: "2" }),
        rawHeader({ id: "1" }),
        rawTwoColumn({ id: "3" }),
      ])
    );

    expect(blocks.map((block) => block.id)).toEqual(["2", "1", "3"]);
  });

  describe("header blocks", () => {
    it("maps text and the call to action", () => {
      const [block] = mapHomePage(payload([rawHeader()])) as HeaderBlock[];

      expect(block).toEqual({
        __typename: "ComponentCommonHeader",
        id: "1",
        heading: "Peer-reviewed surgery",
        action: { label: "Browse", href: "https://example.com/library" },
      });
    });

    it("drops a header with no text", () => {
      expect(mapHomePage(payload([rawHeader({ Text: "   " })]))).toEqual([]);
      expect(mapHomePage(payload([rawHeader({ Text: null })]))).toEqual([]);
    });

    it("trims surrounding whitespace", () => {
      const [block] = mapHomePage(
        payload([rawHeader({ Text: "  Spaced out  " })])
      ) as HeaderBlock[];

      expect(block.heading).toBe("Spaced out");
    });

    it("drops the action when either half is missing", () => {
      const noLabel = mapHomePage(
        payload([rawHeader({ ButtonText: null })])
      ) as HeaderBlock[];
      const noUrl = mapHomePage(
        payload([rawHeader({ ButtonLink: "" })])
      ) as HeaderBlock[];

      expect(noLabel[0].action).toBeNull();
      expect(noUrl[0].action).toBeNull();
    });

    it("rejects an unsafe javascript: URL supplied by the CMS", () => {
      const [block] = mapHomePage(
        payload([rawHeader({ ButtonLink: "javascript:alert(1)" })])
      ) as HeaderBlock[];

      expect(block.action).toBeNull();
    });

    it("keeps relative links, which are safe by construction", () => {
      const [block] = mapHomePage(
        payload([rawHeader({ ButtonLink: "/library" })])
      ) as HeaderBlock[];

      expect(block.action).toEqual({ label: "Browse", href: "/library" });
    });
  });

  describe("two-column blocks", () => {
    it("normalises Strapi's media entity response", () => {
      const [block] = mapHomePage(payload([rawTwoColumn()]), {
        mediaBaseUrl: "http://cms.test",
      }) as TwoColumnBlock[];

      expect(block.image).toEqual({
        url: "http://cms.test/uploads/hero.jpg",
        alt: "An operating theatre",
        width: 1440,
        height: 960,
      });
    });

    it("falls back to previewUrl when there is no url", () => {
      const [block] = mapHomePage(
        payload([
          rawTwoColumn({
            Image: media({
              url: null,
              previewUrl: "/uploads/preview.jpg",
              alternativeText: "Preview",
            }),
          }),
        ])
      ) as TwoColumnBlock[];

      expect(block.image?.url).toBe("/uploads/preview.jpg");
    });

    it("falls back to the title for alt text, then to an empty string", () => {
      const [withTitle] = mapHomePage(
        payload([
          rawTwoColumn({
            Image: media({ url: "/a.jpg", alternativeText: null }),
          }),
        ])
      ) as TwoColumnBlock[];
      expect(withTitle.image?.alt).toBe("Every step");

      const [withoutTitle] = mapHomePage(
        payload([
          rawTwoColumn({
            TitleText: null,
            Image: media({ url: "/a.jpg", alternativeText: null }),
          }),
        ])
      ) as TwoColumnBlock[];
      expect(withoutTitle.image?.alt).toBe("");
    });

    it("reports missing intrinsic dimensions as null", () => {
      const [block] = mapHomePage(
        payload([
          rawTwoColumn({
            Image: media({ url: "/a.jpg", alternativeText: "A" }),
          }),
        ])
      ) as TwoColumnBlock[];

      expect(block.image).toMatchObject({ width: null, height: null });
    });

    it("has no image when the media entity is empty", () => {
      const [nullEntity] = mapHomePage(
        payload([rawTwoColumn({ Image: media(null) })])
      ) as TwoColumnBlock[];
      const [nullMedia] = mapHomePage(
        payload([rawTwoColumn({ Image: null })])
      ) as TwoColumnBlock[];
      const [noUrl] = mapHomePage(
        payload([
          rawTwoColumn({ Image: media({ url: null, previewUrl: null }) }),
        ])
      ) as TwoColumnBlock[];

      expect(nullEntity.image).toBeNull();
      expect(nullMedia.image).toBeNull();
      expect(noUrl.image).toBeNull();
    });

    it("drops an image whose URL is not a safe protocol", () => {
      const [block] = mapHomePage(
        payload([
          rawTwoColumn({ Image: media({ url: "javascript:alert(1)" }) }),
        ])
      ) as TwoColumnBlock[];

      expect(block.image).toBeNull();
    });

    it("maps the image position, defaulting to left", () => {
      const read = (position: unknown) =>
        (
          mapHomePage(
            payload([rawTwoColumn({ ImagePosition: position })])
          ) as TwoColumnBlock[]
        )[0].imagePosition;

      expect(read("Right")).toBe("right");
      expect(read("Left")).toBe("left");
      expect(read(null)).toBe("left");
      expect(read("Sideways")).toBe("left");
    });

    it("drops a block with nothing to render", () => {
      expect(
        mapHomePage(
          payload([
            rawTwoColumn({
              TitleText: null,
              Description: null,
              ButtonText: null,
              ButtonUrl: null,
              Image: null,
            }),
          ])
        )
      ).toEqual([]);
    });

    it("keeps a block that only has a call to action", () => {
      const blocks = mapHomePage(
        payload([
          rawTwoColumn({ TitleText: null, Description: null, Image: null }),
        ])
      ) as TwoColumnBlock[];

      expect(blocks).toHaveLength(1);
      expect(blocks[0].action?.label).toBe("Watch");
    });
  });

  describe("carousel blocks", () => {
    it("maps its items through the same two-column mapper", () => {
      const [block] = mapHomePage(
        payload([
          section({
            __typename: "ComponentCommonCarousel",
            id: "9",
            Item: [rawTwoColumn({ id: "a" }), rawTwoColumn({ id: "b" })],
          }),
        ])
      ) as CarouselBlock[];

      expect(block.items.map((item) => item.id)).toEqual(["a", "b"]);
      expect(block.items[0].__typename).toBe("ComponentCommonTwoColumnBlock");
    });

    it("skips null and empty items", () => {
      const [block] = mapHomePage(
        payload([
          section({
            __typename: "ComponentCommonCarousel",
            id: "9",
            Item: [
              null,
              rawTwoColumn({ id: "a" }),
              rawTwoColumn({
                id: "b",
                TitleText: null,
                Description: null,
                ButtonText: null,
                ButtonUrl: null,
                Image: null,
              }),
            ],
          }),
        ])
      ) as CarouselBlock[];

      expect(block.items.map((item) => item.id)).toEqual(["a"]);
    });

    it("drops a carousel with no usable items", () => {
      expect(
        mapHomePage(
          payload([
            section({ __typename: "ComponentCommonCarousel", id: "9", Item: [] }),
          ])
        )
      ).toEqual([]);
      expect(
        mapHomePage(
          payload([
            section({
              __typename: "ComponentCommonCarousel",
              id: "9",
              Item: null,
            }),
          ])
        )
      ).toEqual([]);
    });
  });

  describe("sections the front-end cannot render", () => {
    it("drops Error members of the dynamic zone", () => {
      expect(
        mapHomePage(
          payload([
            section({ __typename: "Error", code: "BAD", message: "boom" }),
            rawHeader(),
          ])
        )
      ).toHaveLength(1);
    });

    it("drops a block type that has no mapping yet", () => {
      expect(
        mapHomePage(payload([section({ __typename: "ComponentNewThing", id: "1" })]))
      ).toEqual([]);
    });

    it("drops null and non-object entries", () => {
      expect(mapHomePage(payload([null, section("nope"), rawHeader()]))).toHaveLength(1);
    });
  });
});
