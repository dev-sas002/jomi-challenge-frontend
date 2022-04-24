import { screen } from "@testing-library/react";
import { renderWithTheme } from "test-utils/render";
import { carouselBlock, headerBlock, twoColumnBlock } from "test-utils/blocks";

const loadHomePage = jest.fn();

jest.mock("lib/cms/homePage", () => ({
  loadHomePage: (...args: unknown[]) => loadHomePage(...args),
}));

// Imported after the mock so `getStaticProps` picks up the fake loader. Page
// tests live outside `pages/` because Next.js treats every file under `pages/`
// as a route and would try to prerender the test module.
import Home, { getStaticProps } from "pages/index";

describe("Home", () => {
  it("renders the blocks it was handed, in order", () => {
    renderWithTheme(
      <Home
        blocks={[
          headerBlock({ heading: "Peer-reviewed surgery" }),
          twoColumnBlock({ title: "Every step" }),
          carouselBlock(),
        ]}
      />
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Peer-reviewed surgery" })
    ).toBeInTheDocument();
    expect(screen.getByText("Every step")).toBeInTheDocument();
    expect(screen.getByText("Otolaryngology")).toBeInTheDocument();
  });

  it("renders no loading state, because the content ships with the HTML", () => {
    renderWithTheme(<Home blocks={[headerBlock()]} />);

    expect(screen.queryByText(/loading/i)).toBeNull();
    expect(screen.queryByRole("progressbar")).toBeNull();
  });

  it("explains what to do when the CMS has nothing published", () => {
    renderWithTheme(<Home blocks={[]} />);

    expect(
      screen.getByRole("heading", { name: "Nothing published yet" })
    ).toBeInTheDocument();
    expect(screen.getByText(/CMS_SOURCE=fixture/)).toBeInTheDocument();
  });

  it("keeps the challenge context in the footer", () => {
    renderWithTheme(<Home blocks={[headerBlock()]} />);

    const link = screen.getByRole("link", {
      name: "https://github.com/jomijournal/jomi-cms-challenge-backend",
    });
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link.closest("footer")).not.toBeNull();
  });
});

describe("getStaticProps", () => {
  beforeEach(() => {
    loadHomePage.mockReset();
  });

  it("hands the mapped blocks to the page and sets the ISR window", async () => {
    const blocks = [headerBlock()];
    loadHomePage.mockResolvedValue({
      blocks,
      source: "fixture",
      revalidateSeconds: 60,
    });

    const result = (await getStaticProps({} as never)) as {
      props: { blocks: unknown };
      revalidate: number;
    };

    expect(result.props.blocks).toBe(blocks);
    expect(result.revalidate).toBe(60);
  });

  it("uses the configured revalidation window", async () => {
    loadHomePage.mockResolvedValue({
      blocks: [],
      source: "strapi",
      revalidateSeconds: 300,
    });

    const result = (await getStaticProps({} as never)) as {
      revalidate: number;
    };

    expect(result.revalidate).toBe(300);
  });

  it("still returns a page when the CMS gave nothing back", async () => {
    loadHomePage.mockResolvedValue({
      blocks: [],
      source: "strapi",
      revalidateSeconds: 60,
    });

    const result = (await getStaticProps({} as never)) as {
      props: { blocks: unknown[] };
    };

    expect(result.props.blocks).toEqual([]);
  });
});
