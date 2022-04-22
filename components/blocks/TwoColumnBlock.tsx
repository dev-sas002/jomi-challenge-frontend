import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import type { TwoColumnBlock as TwoColumnBlockData } from "lib/cms/blocks";
import { sectionSurface } from "theme";
import TwoColumnContent from "./TwoColumnContent";
import { defineBlock, type BlockProps } from "./registry";

/**
 * A full-width section holding one image/text pairing. Surfaces alternate with
 * position so consecutive sections stay visually separated without the editor
 * having to think about it.
 */
const TwoColumnBlock = ({ block, index }: BlockProps<TwoColumnBlockData>) => (
  <Box
    component="section"
    sx={{
      bgcolor: sectionSurface(index).background,
      py: { xs: 7, md: 12 },
    }}
  >
    <Container maxWidth="lg">
      <TwoColumnContent block={block} priority={index === 0} />
    </Container>
  </Box>
);

export const twoColumnBlockDefinition = defineBlock({
  typename: "ComponentCommonTwoColumnBlock",
  component: TwoColumnBlock,
});

export default TwoColumnBlock;
