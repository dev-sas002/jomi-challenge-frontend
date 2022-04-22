import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

const CHALLENGE_REPO =
  "https://github.com/jomijournal/jomi-cms-challenge-backend";

/**
 * Keeps the challenge context on the page without letting it compete with the
 * CMS content it is supposed to showcase.
 */
const PageFooter = () => (
  <Box
    component="footer"
    sx={{
      bgcolor: "#0B1B2B",
      color: "rgba(255,255,255,0.72)",
      py: { xs: 5, md: 6 },
      px: 2,
    }}
  >
    <Container maxWidth="lg">
      <Typography variant="body2" sx={{ maxWidth: 720 }}>
        JOMI code challenge — this page renders the <code>homePage</code>{" "}
        dynamic zone from the Strapi CMS in{" "}
        <Link
          href={CHALLENGE_REPO}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: "common.white" }}
        >
          {CHALLENGE_REPO}
        </Link>
        .
      </Typography>
    </Container>
  </Box>
);

export default PageFooter;
