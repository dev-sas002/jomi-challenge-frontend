import type {
  ComponentCommonCarousel,
  ComponentCommonHeader,
  ComponentCommonTwoColumnBlock,
  HomePageSectionsDynamicZone,
  UploadFileEntityResponse,
} from "graphql/types";
import { safeHref } from "lib/safeHref";
import type {
  CarouselBlock,
  CmsAction,
  CmsImage,
  HeaderBlock,
  HomeBlock,
  TwoColumnBlock,
} from "./blocks";

/** The shape `HomePage` query results arrive in, narrowed to what we read. */
export type HomePagePayload = {
  homePage?: {
    data?: {
      attributes?: {
        sections?: Array<HomePageSectionsDynamicZone | null> | null;
      } | null;
    } | null;
  } | null;
};

export type MapOptions = {
  /**
   * Origin used to absolutise root-relative media URLs. Strapi's local upload
   * provider returns paths like `/uploads/hero.png`, which would otherwise
   * resolve against the Next.js origin and 404. Empty for content that is
   * already served by this app (the built-in fixtures).
   */
  mediaBaseUrl?: string;
};

const trimmed = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text.length > 0 ? text : null;
};

/**
 * Joins a root-relative CMS path onto the CMS origin. Absolute URLs and paths
 * served by this app are returned untouched.
 */
export function resolveMediaUrl(
  url: string,
  mediaBaseUrl: string | undefined
): string {
  if (!mediaBaseUrl) return url;
  if (!url.startsWith("/")) return url;
  return `${mediaBaseUrl.replace(/\/+$/, "")}${url}`;
}

/**
 * CMS links are untrusted input: an editor (or anyone who can write to the CMS)
 * could store a `javascript:` URL, which React will happily emit into an
 * `href`. Sanitising happens here, once, rather than in every component.
 */
function toAction(
  label: unknown,
  url: unknown
): CmsAction | null {
  const text = trimmed(label);
  const rawHref = trimmed(url);
  if (!text || !rawHref) return null;

  const href = safeHref(rawHref);
  if (!href) return null;

  return { label: text, href };
}

function toImage(
  media: UploadFileEntityResponse | null | undefined,
  fallbackAlt: string | null,
  options: MapOptions
): CmsImage | null {
  // Strapi wraps media in an entity response: the UploadFile fields live at
  // `Image.data.attributes`, not on `Image.data`.
  const file = media?.data?.attributes;
  if (!file) return null;

  const rawUrl = trimmed(file.url) ?? trimmed(file.previewUrl);
  if (!rawUrl) return null;

  const resolved = resolveMediaUrl(rawUrl, options.mediaBaseUrl);
  const url = safeHref(resolved);
  if (!url) return null;

  return {
    url,
    alt: trimmed(file.alternativeText) ?? fallbackAlt ?? "",
    width: typeof file.width === "number" ? file.width : null,
    height: typeof file.height === "number" ? file.height : null,
  };
}

function mapHeader(
  section: ComponentCommonHeader
): HeaderBlock | null {
  const heading = trimmed(section.Text);
  if (!heading) return null;

  return {
    __typename: "ComponentCommonHeader",
    id: String(section.id),
    heading,
    action: toAction(section.ButtonText, section.ButtonLink),
  };
}

function mapTwoColumn(
  section: ComponentCommonTwoColumnBlock,
  options: MapOptions
): TwoColumnBlock | null {
  const title = trimmed(section.TitleText);
  const description = trimmed(section.Description);
  const image = toImage(section.Image, title, options);
  const action = toAction(section.ButtonText, section.ButtonUrl);

  // A block with nothing to show is dropped rather than rendered as an empty
  // band of whitespace.
  if (!title && !description && !image && !action) return null;

  return {
    __typename: "ComponentCommonTwoColumnBlock",
    id: String(section.id),
    title,
    description,
    image,
    imagePosition: section.ImagePosition === "Right" ? "right" : "left",
    action,
  };
}

function mapCarousel(
  section: ComponentCommonCarousel,
  options: MapOptions
): CarouselBlock | null {
  const items = (section.Item ?? [])
    .map((item) => (item ? mapTwoColumn(item, options) : null))
    .filter((item): item is TwoColumnBlock => item !== null);

  if (items.length === 0) return null;

  return {
    __typename: "ComponentCommonCarousel",
    id: String(section.id),
    items,
  };
}

function mapSection(
  section: HomePageSectionsDynamicZone | null | undefined,
  options: MapOptions
): HomeBlock | null {
  if (!section || typeof section !== "object") return null;

  switch (section.__typename) {
    case "ComponentCommonHeader":
      return mapHeader(section);
    case "ComponentCommonTwoColumnBlock":
      return mapTwoColumn(section, options);
    case "ComponentCommonCarousel":
      return mapCarousel(section, options);
    case "Error":
      // The dynamic zone can carry an `Error` member; it is a CMS-side problem
      // with that one block, not a reason to fail the page.
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.warn(
          `[cms] homepage section returned an error: ${section.code} ${section.message ?? ""}`.trim()
        );
      }
      return null;
    default:
      // A block type added in the CMS but not yet implemented here must not
      // crash the page. See components/blocks/registry.ts for the other half.
      return null;
  }
}

/**
 * Turns a raw `HomePage` GraphQL payload into the list of blocks the page
 * renders. Unknown, empty and errored sections are dropped; editor ordering is
 * preserved.
 */
export function mapHomePage(
  payload: HomePagePayload | null | undefined,
  options: MapOptions = {}
): HomeBlock[] {
  const sections = payload?.homePage?.data?.attributes?.sections ?? [];

  return sections
    .map((section) => mapSection(section, options))
    .filter((block): block is HomeBlock => block !== null);
}

export default mapHomePage;
