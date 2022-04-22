import { createTheme } from "@mui/material/styles";

/**
 * A single source of truth for typography, colour and spacing.
 *
 * The blocks render CMS content that an editor controls, so the only way to
 * keep the page coherent is for every block to draw from the same tokens
 * instead of styling itself. Fonts are a system stack: no webfont request on
 * first paint, and nothing to fetch inside the container.
 */

const fontStack = [
  "-apple-system",
  "BlinkMacSystemFont",
  '"Segoe UI"',
  "Roboto",
  '"Helvetica Neue"',
  "Arial",
  "sans-serif",
].join(",");

/** Page background tint used to separate alternating sections. */
export const SURFACE_TINT = "#F1F5FA";

const theme = createTheme({
  palette: {
    primary: {
      main: "#0E5FA4",
      dark: "#0A4374",
      light: "#3E8FD4",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#0F8F8F",
      contrastText: "#FFFFFF",
    },
    text: {
      primary: "#10202F",
      secondary: "#4B5F72",
    },
    background: {
      default: "#FFFFFF",
      paper: "#FFFFFF",
    },
    divider: "rgba(16, 32, 47, 0.12)",
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: fontStack,
    // `clamp` keeps display type readable from 360px up to a wide desktop
    // without a pile of breakpoint overrides.
    h1: {
      fontSize: "clamp(2.25rem, 1.4rem + 3.2vw, 3.75rem)",
      fontWeight: 700,
      lineHeight: 1.08,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontSize: "clamp(1.75rem, 1.25rem + 1.8vw, 2.5rem)",
      fontWeight: 700,
      lineHeight: 1.15,
      letterSpacing: "-0.015em",
    },
    h3: {
      fontSize: "clamp(1.375rem, 1.1rem + 1vw, 1.75rem)",
      fontWeight: 650,
      lineHeight: 1.2,
      letterSpacing: "-0.01em",
    },
    subtitle1: { fontSize: "1.125rem", lineHeight: 1.6 },
    body1: { fontSize: "1.0625rem", lineHeight: 1.7 },
    button: { textTransform: "none", fontWeight: 600, letterSpacing: 0 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: { WebkitFontSmoothing: "antialiased", scrollBehavior: "smooth" },
        body: { backgroundColor: "#FFFFFF" },
        // A visible, consistent focus ring everywhere, including on the
        // carousel controls and CMS-driven links.
        ":focus-visible": {
          outline: "3px solid #3E8FD4",
          outlineOffset: "2px",
          borderRadius: "4px",
        },
        "@media (prefers-reduced-motion: reduce)": {
          "*": {
            animationDuration: "0.01ms !important",
            transitionDuration: "0.01ms !important",
            scrollBehavior: "auto !important",
          },
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 999, paddingInline: 22, paddingBlock: 10 },
        sizeLarge: { paddingInline: 30, paddingBlock: 13, fontSize: "1rem" },
      },
    },
    MuiLink: {
      defaultProps: { underline: "hover" },
    },
  },
});

export default theme;

/**
 * Alternating section surfaces. Blocks call this with their position in the
 * dynamic zone so neighbouring sections never share a background, whatever
 * order the editor puts them in. `card` is the contrasting colour for content
 * sitting on top of the section (carousel slides).
 */
export function sectionSurface(index: number): {
  background: string;
  card: string;
} {
  const tinted = index % 2 === 1;
  return {
    background: tinted ? SURFACE_TINT : "#FFFFFF",
    card: tinted ? "#FFFFFF" : SURFACE_TINT,
  };
}
