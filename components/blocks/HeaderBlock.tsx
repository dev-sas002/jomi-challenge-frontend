import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import type { HeaderBlock as HeaderBlockData } from "lib/cms/blocks";
import { defineBlock, type BlockProps } from "./registry";

/**
 * The hero band. When it is the first block on the page its heading is the
 * document's `h1`; further down it steps to `h2` so the outline stays valid
 * however the editor orders the dynamic zone.
 */
const HeaderBlock = ({ block, index }: BlockProps<HeaderBlockData>) => (
  <Box
    component="section"
    sx={{
      position: "relative",
      overflow: "hidden",
      color: "common.white",
      px: 2,
      py: { xs: 9, md: 15 },
      textAlign: "center",
      backgroundImage:
        "linear-gradient(135deg, #082F55 0%, #0E5FA4 55%, #0F8F8F 130%)",
      "&::after": {
        content: '""',
        position: "absolute",
        inset: 0,
        backgroundImage:
          "radial-gradient(60% 70% at 20% 0%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 70%)",
        pointerEvents: "none",
      },
    }}
  >
    <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
      <Typography
        variant="h1"
        component={index === 0 ? "h1" : "h2"}
        sx={{ mb: block.action ? 5 : 0, textWrap: "balance" }}
      >
        {block.heading}
      </Typography>

      {block.action ? (
        <Button
          variant="contained"
          size="large"
          href={block.action.href}
          rel="noopener noreferrer"
          sx={{
            bgcolor: "common.white",
            color: "primary.dark",
            "&:hover": { bgcolor: "grey.100" },
          }}
        >
          {block.action.label}
        </Button>
      ) : null}
    </Container>
  </Box>
);

export const headerBlockDefinition = defineBlock({
  typename: "ComponentCommonHeader",
  component: HeaderBlock,
});

export default HeaderBlock;
