import { screen } from "@testing-library/react";
import BlockList from "components/blocks/BlockList";
import type { HomeBlock } from "lib/cms/blocks";
import { renderWithTheme } from "test-utils/render";
import { carouselBlock, headerBlock, twoColumnBlock } from "test-utils/blocks";

describe("BlockList", () => {
  it("renders each block with its registered component", () => {
    renderWithTheme(
      <BlockList
        blocks={[
          headerBlock({ heading: "Header block" }),
          twoColumnBlock({ title: "Two column block" }),
          carouselBlock(),
        ]}
      />
    );

    expect(screen.getByText("Header block")).toBeInTheDocument();
    expect(screen.getByText("Two column block")).toBeInTheDocument();
    expect(screen.getByText("Orthopaedics")).toBeInTheDocument();
  });

  it("renders the blocks in the order the CMS returned them", () => {
    renderWithTheme(
      <BlockList
        blocks={[
          twoColumnBlock({ id: "a", title: "First" }),
          twoColumnBlock({ id: "b", title: "Second" }),
        ]}
      />
    );

    const headings = screen.getAllByRole("heading").map((el) => el.textContent);
    expect(headings).toEqual(["First", "Second"]);
  });

  it("tolerates blocks of different types sharing a Strapi id", () => {
    const warn = jest.spyOn(console, "error").mockImplementation(() => {});

    renderWithTheme(
      <BlockList
        blocks={[
          headerBlock({ id: "1", heading: "Same id, different table" }),
          twoColumnBlock({ id: "1", title: "Also id one" }),
        ]}
      />
    );

    expect(screen.getByText("Same id, different table")).toBeInTheDocument();
    expect(screen.getByText("Also id one")).toBeInTheDocument();
    // A duplicate React key would show up here as a console error.
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it("skips an unregistered block type instead of throwing", () => {
    const unknown = {
      __typename: "ComponentCommonVideoHero",
      id: "1",
    } as unknown as HomeBlock;

    const { container } = renderWithTheme(
      <BlockList blocks={[unknown, headerBlock({ heading: "Still here" })]} />
    );

    expect(container).not.toBeEmptyDOMElement();
    expect(screen.getByText("Still here")).toBeInTheDocument();
  });

  it("renders nothing for an empty dynamic zone", () => {
    const { container } = renderWithTheme(<BlockList blocks={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
