import type {
  CarouselBlock,
  CmsImage,
  HeaderBlock,
  TwoColumnBlock,
} from "lib/cms/blocks";

/** View-model factories, so tests state only what they care about. */

export const cmsImage = (overrides: Partial<CmsImage> = {}): CmsImage => ({
  url: "/seed/operating-room.jpg",
  alt: "An operating theatre",
  width: 1440,
  height: 960,
  ...overrides,
});

export const headerBlock = (
  overrides: Partial<HeaderBlock> = {}
): HeaderBlock => ({
  __typename: "ComponentCommonHeader",
  id: "1",
  heading: "Peer-reviewed surgery",
  action: { label: "Browse the library", href: "https://example.com/library" },
  ...overrides,
});

export const twoColumnBlock = (
  overrides: Partial<TwoColumnBlock> = {}
): TwoColumnBlock => ({
  __typename: "ComponentCommonTwoColumnBlock",
  id: "1",
  title: "Every step, from incision to closure",
  description: "Narrated by the attending surgeon.",
  image: cmsImage(),
  imagePosition: "left",
  action: { label: "Watch a procedure", href: "https://example.com/article" },
  ...overrides,
});

export const carouselBlock = (
  overrides: Partial<CarouselBlock> = {}
): CarouselBlock => ({
  __typename: "ComponentCommonCarousel",
  id: "1",
  items: [
    twoColumnBlock({ id: "2", title: "General surgery" }),
    twoColumnBlock({ id: "3", title: "Orthopaedics" }),
    twoColumnBlock({ id: "4", title: "Otolaryngology" }),
  ],
  ...overrides,
});
