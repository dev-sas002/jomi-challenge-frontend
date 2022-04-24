import type { HomeBlockTypename } from "lib/cms/blocks";
import {
  ALL_BLOCK_TYPES_REGISTERED,
  blockDefinitions,
  blockRegistry,
  resolveBlockComponent,
} from "components/blocks/blockRegistry";
import { createBlockRegistry } from "components/blocks/registry";

/**
 * Every member of the CMS dynamic zone the front-end claims to support must
 * have a component. This list is written out by hand on purpose: deriving it
 * from the registry would make the test agree with itself.
 */
const SUPPORTED_TYPENAMES: HomeBlockTypename[] = [
  "ComponentCommonHeader",
  "ComponentCommonTwoColumnBlock",
  "ComponentCommonCarousel",
];

describe("block registry", () => {
  it("registers a component for every supported block type", () => {
    SUPPORTED_TYPENAMES.forEach((typename) => {
      expect(resolveBlockComponent(typename)).toBeDefined();
    });
  });

  it("registers nothing beyond the supported block types", () => {
    expect(Array.from(blockRegistry.keys()).sort()).toEqual(
      [...SUPPORTED_TYPENAMES].sort()
    );
  });

  it("passes its own compile-time completeness check", () => {
    expect(ALL_BLOCK_TYPES_REGISTERED).toBe(true);
  });

  it("returns undefined for a block type the CMS has but the app does not", () => {
    expect(resolveBlockComponent("ComponentCommonVideoHero")).toBeUndefined();
  });

  it("keys each definition by the typename it declares", () => {
    blockDefinitions.forEach((definition) => {
      expect(blockRegistry.get(definition.typename)).toBe(definition.component);
    });
  });

  it("refuses two components for the same block type", () => {
    const definition = blockDefinitions[0];

    expect(() => createBlockRegistry([definition, definition])).toThrow(
      /Two components are registered/
    );
  });
});
