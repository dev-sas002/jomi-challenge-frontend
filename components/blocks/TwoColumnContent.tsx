import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CmsImage from "components/ui/CmsImage";
import type { TwoColumnBlock } from "lib/cms/blocks";

type Props = {
  block: TwoColumnBlock;
  /** Tighter scale, used inside a carousel slide. */
  dense?: boolean;
  /** Skip lazy-loading for above-the-fold media. */
  priority?: boolean;
  headingComponent?: "h2" | "h3";
};

/**
 * The image/text pairing used both as a standalone section and as a carousel
 * slide. Keeping it separate from the section chrome is what lets the carousel
 * reuse it without inheriting a full-width band of padding.
 */
const TwoColumnContent = ({
  block,
  dense = false,
  priority = false,
  headingComponent = "h2",
}: Props) => {
  const hasImage = Boolean(block.image);

  return (
    <Grid
      container
      spacing={{ xs: 4, md: dense ? 5 : 8 }}
      alignItems="center"
      direction={block.imagePosition === "right" ? "row-reverse" : "row"}
    >
      {block.image ? (
        <Grid item xs={12} md={6}>
          <CmsImage
            image={block.image}
            priority={priority}
            sizes="(max-width: 900px) 100vw, 50vw"
          />
        </Grid>
      ) : null}

      <Grid item xs={12} md={hasImage ? 6 : 12}>
        <Stack
          spacing={2.5}
          alignItems={hasImage ? "flex-start" : "center"}
          sx={{
            maxWidth: hasImage ? 560 : 760,
            mx: hasImage ? 0 : "auto",
            textAlign: hasImage ? "left" : "center",
          }}
        >
          <Box
            aria-hidden
            sx={{
              width: 44,
              height: 4,
              borderRadius: 2,
              bgcolor: "secondary.main",
            }}
          />

          {block.title ? (
            <Typography
              variant={dense ? "h3" : "h2"}
              component={headingComponent}
            >
              {block.title}
            </Typography>
          ) : null}

          {block.description ? (
            <Typography
              // `subtitle1` renders an <h6> by default, which would put a
              // heading in the middle of the block's prose.
              component="p"
              variant={dense ? "body1" : "subtitle1"}
              color="text.secondary"
            >
              {block.description}
            </Typography>
          ) : null}

          {block.action ? (
            <Button
              variant="contained"
              size={dense ? "medium" : "large"}
              href={block.action.href}
              rel="noopener noreferrer"
              sx={{ mt: 1 }}
            >
              {block.action.label}
            </Button>
          ) : null}
        </Stack>
      </Grid>
    </Grid>
  );
};

export default TwoColumnContent;
