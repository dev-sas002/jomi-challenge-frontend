import { blockKey, type HomeBlock } from "lib/cms/blocks";
import { resolveBlockComponent } from "./blockRegistry";

type Props = {
  blocks: HomeBlock[];
};

/**
 * Renders a dynamic zone in editor order by looking each block up in the
 * registry. A block type with no registered component is skipped with a
 * development warning rather than throwing: the CMS can always be ahead of a
 * deploy, and one unknown block must not take the page down.
 */
const BlockList = ({ blocks }: Props) => (
  <>
    {blocks.map((block, index) => {
      const Block = resolveBlockComponent(block.__typename);

      if (!Block) {
        if (process.env.NODE_ENV === "development") {
          // eslint-disable-next-line no-console
          console.warn(
            `[blocks] no component registered for "${block.__typename}"; skipping it.`
          );
        }
        return null;
      }

      return <Block key={blockKey(block)} block={block} index={index} />;
    })}
  </>
);

export default BlockList;
