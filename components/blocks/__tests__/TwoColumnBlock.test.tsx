import { screen } from "@testing-library/react";
import TwoColumnBlock from "components/blocks/TwoColumnBlock";
import { SURFACE_TINT } from "theme";
import { renderWithTheme } from "test-utils/render";
import { twoColumnBlock } from "test-utils/blocks";

const gridOf = (container: HTMLElement) =>
  container.querySelector(".MuiGrid-container") as HTMLElement;

describe("TwoColumnBlock", () => {
  it("renders the title, description, image and call to action", () => {
    renderWithTheme(<TwoColumnBlock block={twoColumnBlock()} index={0} />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Every step, from incision to closure",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Narrated by the attending surgeon.")
    ).toBeInTheDocument();
    expect(screen.getByAltText("An operating theatre")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Watch a procedure" })
    ).toHaveAttribute("href", "https://example.com/article");
  });

  it("reverses the columns when the editor puts the image on the right", () => {
    const { container } = renderWithTheme(
      <TwoColumnBlock
        block={twoColumnBlock({ imagePosition: "right" })}
        index={0}
      />
    );

    expect(getComputedStyle(gridOf(container)).flexDirection).toBe(
      "row-reverse"
    );
  });

  it("keeps the natural order when the image is on the left", () => {
    const { container } = renderWithTheme(
      <TwoColumnBlock block={twoColumnBlock()} index={0} />
    );

    expect(getComputedStyle(gridOf(container)).flexDirection).toBe("row");
  });

  it("renders no image element when the block has no media", () => {
    const { container } = renderWithTheme(
      <TwoColumnBlock block={twoColumnBlock({ image: null })} index={0} />
    );

    expect(container.querySelector("img")).toBeNull();
    expect(
      screen.getByText("Every step, from incision to closure")
    ).toBeInTheDocument();
  });

  it("alternates the section surface with its position on the page", () => {
    const first = renderWithTheme(
      <TwoColumnBlock block={twoColumnBlock()} index={0} />
    );
    const second = renderWithTheme(
      <TwoColumnBlock block={twoColumnBlock({ id: "2" })} index={1} />
    );

    const sectionOf = (result: { container: HTMLElement }) =>
      getComputedStyle(result.container.querySelector("section") as HTMLElement)
        .backgroundColor;

    expect(sectionOf(first)).not.toBe(sectionOf(second));
    expect(sectionOf(second)).toBe(hexToRgb(SURFACE_TINT));
  });

  it("omits optional text instead of rendering empty elements", () => {
    renderWithTheme(
      <TwoColumnBlock
        block={twoColumnBlock({ title: null, description: null })}
        index={0}
      />
    );

    expect(screen.queryByRole("heading")).toBeNull();
    expect(
      screen.getByRole("link", { name: "Watch a procedure" })
    ).toBeInTheDocument();
  });

  it("renders no call to action when the block has none", () => {
    renderWithTheme(
      <TwoColumnBlock block={twoColumnBlock({ action: null })} index={0} />
    );

    expect(screen.queryByRole("link")).toBeNull();
  });
});

function hexToRgb(hex: string): string {
  const value = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((offset) =>
    Number.parseInt(value.slice(offset, offset + 2), 16)
  );
  return `rgb(${r}, ${g}, ${b})`;
}
