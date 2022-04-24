import { fireEvent, screen, within } from "@testing-library/react";
import CarouselBlock from "components/blocks/CarouselBlock";
import { renderWithTheme } from "test-utils/render";
import { carouselBlock, twoColumnBlock } from "test-utils/blocks";

describe("CarouselBlock", () => {
  it("renders every slide so the content is there without JavaScript", () => {
    renderWithTheme(<CarouselBlock block={carouselBlock()} index={0} />);

    expect(screen.getByText("General surgery")).toBeInTheDocument();
    expect(screen.getByText("Orthopaedics")).toBeInTheDocument();
    expect(screen.getByText("Otolaryngology")).toBeInTheDocument();
  });

  it("announces itself as a carousel with labelled slides", () => {
    renderWithTheme(<CarouselBlock block={carouselBlock()} index={0} />);

    const region = screen.getByLabelText("Featured collections");
    expect(region).toHaveAttribute("aria-roledescription", "carousel");

    const slides = within(region).getAllByRole("group");
    expect(slides).toHaveLength(3);
    expect(slides[0]).toHaveAttribute("aria-label", "1 of 3");
    expect(slides[2]).toHaveAttribute("aria-roledescription", "slide");
  });

  it("uses headings one level below a section title", () => {
    renderWithTheme(<CarouselBlock block={carouselBlock()} index={0} />);

    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(3);
  });

  it("starts on the first slide with the previous control disabled", () => {
    renderWithTheme(<CarouselBlock block={carouselBlock()} index={0} />);

    expect(screen.getByRole("button", { name: "Previous slide" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next slide" })).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "Show slide 1 of 3" })
    ).toHaveAttribute("aria-current", "true");
  });

  it("advances when the next control is used", () => {
    renderWithTheme(<CarouselBlock block={carouselBlock()} index={0} />);

    fireEvent.click(screen.getByRole("button", { name: "Next slide" }));

    expect(
      screen.getByRole("button", { name: "Show slide 2 of 3" })
    ).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("button", { name: "Previous slide" })).toBeEnabled();
  });

  it("disables the next control on the last slide", () => {
    renderWithTheme(<CarouselBlock block={carouselBlock()} index={0} />);

    fireEvent.click(screen.getByRole("button", { name: "Show slide 3 of 3" }));

    expect(screen.getByRole("button", { name: "Next slide" })).toBeDisabled();
  });

  it("jumps to a slide when its indicator is used", () => {
    renderWithTheme(<CarouselBlock block={carouselBlock()} index={0} />);

    fireEvent.click(screen.getByRole("button", { name: "Show slide 3 of 3" }));

    expect(
      screen.getByRole("button", { name: "Show slide 3 of 3" })
    ).toHaveAttribute("aria-current", "true");
  });

  it("does not run past the ends of the track", () => {
    renderWithTheme(
      <CarouselBlock
        block={carouselBlock({ items: [twoColumnBlock({ id: "only" })] })}
        index={0}
      />
    );

    expect(screen.getByRole("button", { name: "Previous slide" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next slide" })).toBeDisabled();
  });

  it("renders nothing when the carousel has no slides", () => {
    const { container } = renderWithTheme(
      <CarouselBlock block={carouselBlock({ items: [] })} index={0} />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
