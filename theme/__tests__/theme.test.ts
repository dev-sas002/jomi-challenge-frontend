import theme, { SURFACE_TINT, sectionSurface } from "theme";

describe("sectionSurface", () => {
  it("alternates the background with the block's position", () => {
    expect(sectionSurface(0).background).toBe("#FFFFFF");
    expect(sectionSurface(1).background).toBe(SURFACE_TINT);
    expect(sectionSurface(2).background).toBe("#FFFFFF");
  });

  it("gives content sitting on the section the contrasting colour", () => {
    expect(sectionSurface(0).card).toBe(SURFACE_TINT);
    expect(sectionSurface(1).card).toBe("#FFFFFF");
  });
});

describe("theme", () => {
  it("ships a system font stack, so the first paint needs no webfont", () => {
    expect(theme.typography.fontFamily).toContain("-apple-system");
    expect(theme.typography.fontFamily).not.toContain("http");
  });

  it("scales display type fluidly instead of per breakpoint", () => {
    expect(String(theme.typography.h1.fontSize)).toContain("clamp(");
  });

  it("defines a visible focus ring for keyboard users", () => {
    const baseline = theme.components?.MuiCssBaseline?.styleOverrides as
      | Record<string, Record<string, unknown>>
      | undefined;

    expect(baseline?.[":focus-visible"]?.outline).toBeDefined();
  });
});
