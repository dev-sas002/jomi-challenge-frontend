import { screen } from "@testing-library/react";
import HeaderBlock from "components/blocks/HeaderBlock";
import { renderWithTheme } from "test-utils/render";
import { headerBlock } from "test-utils/blocks";

describe("HeaderBlock", () => {
  it("renders the heading as the page h1 when it leads the page", () => {
    renderWithTheme(<HeaderBlock block={headerBlock()} index={0} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Peer-reviewed surgery" })
    ).toBeInTheDocument();
  });

  it("steps down to h2 when it is not the first block", () => {
    renderWithTheme(<HeaderBlock block={headerBlock()} index={2} />);

    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
  });

  it("renders the call to action as a safe link", () => {
    renderWithTheme(<HeaderBlock block={headerBlock()} index={0} />);

    const link = screen.getByRole("link", { name: "Browse the library" });
    expect(link).toHaveAttribute("href", "https://example.com/library");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders no link when the block has no call to action", () => {
    renderWithTheme(
      <HeaderBlock block={headerBlock({ action: null })} index={0} />
    );

    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });
});
