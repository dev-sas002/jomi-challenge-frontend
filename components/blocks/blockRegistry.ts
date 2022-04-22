import type { HomeBlockTypename } from "lib/cms/blocks";
import { carouselBlockDefinition } from "./CarouselBlock";
import { headerBlockDefinition } from "./HeaderBlock";
import { twoColumnBlockDefinition } from "./TwoColumnBlock";
import {
  createBlockRegistry,
  type AnyBlockDefinition,
  type BlockComponent,
} from "./registry";

/**
 * The block registry. To support a new CMS component: add its view model to
 * `lib/cms/blocks.ts`, map it in `lib/cms/mapHomePage.ts`, write the component
 * next to this file with a `defineBlock(...)` export, and add it to the list
 * below. Nothing else needs to change.
 */
const definitions = [
  headerBlockDefinition,
  twoColumnBlockDefinition,
  carouselBlockDefinition,
] as const;

export const blockDefinitions: readonly AnyBlockDefinition[] = definitions;

export const blockRegistry = createBlockRegistry(blockDefinitions);

export type RegisteredBlockTypename = (typeof definitions)[number]["typename"];

/**
 * Compile-time completeness check: if a block type is added to `HomeBlock`
 * without a component, `Missing` is non-empty and this type stops being `true`,
 * so `next build` fails rather than the page silently dropping the block.
 */
export type AllBlockTypesRegistered = Exclude<
  HomeBlockTypename,
  RegisteredBlockTypename
> extends never
  ? true
  : ["missing block component for", Exclude<HomeBlockTypename, RegisteredBlockTypename>];

export const ALL_BLOCK_TYPES_REGISTERED: AllBlockTypesRegistered = true;

/** Looks up the component for a `__typename`, or `undefined` if unregistered. */
export function resolveBlockComponent(
  typename: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): BlockComponent<any> | undefined {
  return blockRegistry.get(typename);
}
