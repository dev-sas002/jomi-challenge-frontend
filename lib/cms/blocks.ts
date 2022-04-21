/**
 * View models for the homepage dynamic zone.
 *
 * Strapi's GraphQL types are deeply optional (`Maybe<T>` everywhere) and wrap
 * media in an entity response, so rendering straight from them forces every
 * component to re-derive the same defaults and re-run the same sanitising.
 * `lib/cms/mapHomePage.ts` normalises the payload once, at the trust boundary,
 * into the shapes below; components downstream receive plain, non-optional data
 * and stay purely presentational.
 *
 * The `__typename` discriminator is kept deliberately: it is the contract the
 * CMS editor sees, and it is the key the block registry
 * (`components/blocks`) dispatches on.
 */

/** A single piece of CMS media, already resolved to an absolute, safe URL. */
export type CmsImage = {
  url: string;
  alt: string;
  /** Intrinsic dimensions when the CMS reports them; used for aspect ratio. */
  width: number | null;
  height: number | null;
};

/** A call to action whose URL has already passed `lib/safeHref`. */
export type CmsAction = {
  label: string;
  href: string;
};

export type HeaderBlock = {
  __typename: "ComponentCommonHeader";
  id: string;
  heading: string;
  action: CmsAction | null;
};

export type TwoColumnBlock = {
  __typename: "ComponentCommonTwoColumnBlock";
  id: string;
  title: string | null;
  description: string | null;
  image: CmsImage | null;
  imagePosition: "left" | "right";
  action: CmsAction | null;
};

export type CarouselBlock = {
  __typename: "ComponentCommonCarousel";
  id: string;
  items: TwoColumnBlock[];
};

/** Every block type the homepage can render. */
export type HomeBlock = HeaderBlock | TwoColumnBlock | CarouselBlock;

export type HomeBlockTypename = HomeBlock["__typename"];

/**
 * Stable React key. Strapi component ids are only unique within a component
 * table, so two different block types can both be `id: "1"`.
 */
export function blockKey(block: HomeBlock): string {
  return `${block.__typename}:${block.id}`;
}
