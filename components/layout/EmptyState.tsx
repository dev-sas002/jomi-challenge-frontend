import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

/**
 * Shown when the CMS is reachable but the homepage has no publishable
 * sections, and when a build ran against an unreachable CMS. It explains what
 * to do rather than leaving a blank page.
 */
const EmptyState = () => (
  <Box sx={{ py: { xs: 10, md: 16 }, px: 2 }}>
    <Container maxWidth="sm">
      <Box
        sx={{
          textAlign: "center",
          border: 1,
          borderColor: "divider",
          borderRadius: 4,
          px: { xs: 3, md: 6 },
          py: { xs: 5, md: 8 },
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom>
          Nothing published yet
        </Typography>
        <Typography color="text.secondary">
          This page renders the <code>homePage</code> dynamic zone from Strapi.
          Publish some sections in the CMS, or set{" "}
          <code>CMS_SOURCE=fixture</code> to preview the page with the bundled
          sample content.
        </Typography>
      </Box>
    </Container>
  </Box>
);

export default EmptyState;
