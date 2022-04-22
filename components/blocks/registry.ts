import type { ComponentType } from "react";
import type { HomeBlock, HomeBlockTypename } from "lib/cms/blocks";

/**
 * The seam between the CMS and the UI.
 *
 * A Strapi dynamic zone is an open set: an editor can add a component type at
 * any time, and the front-end has to cope with types it has never seen. Rather
 * than a `switch` that every new block has to be threaded through, each block
 * ships its own definition next to its component and `blockRegistry.ts`
 * collects them. Adding a block type is one new file plus one line in that list;
 * nothing else in the app changes, and the compile-time completeness check in
 * `blockRegistry.ts` fails the build if a type in the union has no component.
 */

export type BlockProps<B extends HomeBlock = HomeBlock> = {
  block: B;
  /** Position in the dynamic zone. Blocks use it to alternate surfaces. */
  index: number;
};

export type BlockComponent<B extends HomeBlock = HomeBlock> = ComponentType<
  BlockProps<B>
>;

export type BlockDefinition<B extends HomeBlock = HomeBlock> = {
  typename: B["__typename"];
  component: BlockComponent<B>;
};

/**
 * A definition with its block type erased. Components are contravariant in
 * their props, so the concrete definitions cannot be widened to
 * `BlockDefinition<HomeBlock>`; the registry narrows again at lookup time via
 * the `__typename` it was keyed on.
 */
export type AnyBlockDefinition = {
  typename: HomeBlockTypename;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: BlockComponent<any>;
};

/** Identity helper that pins `typename` to the block the component accepts. */
export function defineBlock<B extends HomeBlock>(
  definition: BlockDefinition<B>
): BlockDefinition<B> {
  return definition;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BlockRegistry = ReadonlyMap<string, BlockComponent<any>>;

export function createBlockRegistry(
  definitions: readonly AnyBlockDefinition[]
): BlockRegistry {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const registry = new Map<string, BlockComponent<any>>();

  definitions.forEach((definition) => {
    if (registry.has(definition.typename)) {
      throw new Error(
        `Two components are registered for the block type "${definition.typename}".`
      );
    }
    registry.set(definition.typename, definition.component);
  });

  return registry;
}
