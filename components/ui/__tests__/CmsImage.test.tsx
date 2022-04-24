import { screen } from "@testing-library/react";
import CmsImage from "components/ui/CmsImage";
import { renderWithTheme } from "test-utils/render";
import { cmsImage } from "test-utils/blocks";

const boxOf = (container: HTMLElement) =>
  container.firstElementChild as HTMLElement;

describe("CmsImage", () => {
  it("renders the media with the alt text the CMS supplied", () => {
    renderWithTheme(<CmsImage image={cmsImage({ alt: "A wide shot" })} />);

    expect(screen.getByAltText("A wide shot")).toBeInTheDocument();
  });

  it("reserves the box using the intrinsic aspect ratio, so nothing reflows", () => {
    const { container } = renderWithTheme(
      <CmsImage image={cmsImage({ width: 1600, height: 800 })} />
    );

    // 2:1 source -> 50% of the width in padding.
    expect(getComputedStyle(boxOf(container)).paddingTop).toBe("50%");
  });

  it("falls back to a 3:2 box when the CMS reports no dimensions", () => {
    const { container } = renderWithTheme(
      <CmsImage image={cmsImage({ width: null, height: null })} />
    );

    expect(getComputedStyle(boxOf(container)).paddingTop).toBe("66.6667%");
  });

  it("ignores a zero height rather than dividing by it", () => {
    const { container } = renderWithTheme(
      <CmsImage image={cmsImage({ width: 100, height: 0 })} />
    );

    expect(getComputedStyle(boxOf(container)).paddingTop).toBe("66.6667%");
  });

  it("shows a skeleton until the image has decoded", () => {
    renderWithTheme(<CmsImage image={cmsImage()} />);

    expect(screen.getByTestId("cms-image-skeleton")).toBeInTheDocument();
  });

  it("serves a resized source set through the Next image optimiser", () => {
    renderWithTheme(<CmsImage image={cmsImage()} />);

    const img = screen.getByRole("img");
    const srcSet = img.getAttribute("srcset") ?? "";

    expect(img).toHaveAttribute(
      "src",
      expect.stringContaining("/_next/image?url=")
    );
    expect(srcSet.split(",").length).toBeGreaterThan(3);
    expect(srcSet).toContain("w=640");
  });

  it("routes CMS-hosted media through the optimiser too", () => {
    renderWithTheme(
      <CmsImage image={cmsImage({ url: "https://cms.test/uploads/a.jpg" })} />
    );

    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      expect.stringContaining(encodeURIComponent("https://cms.test/uploads/a.jpg"))
    );
  });

  it("passes the responsive sizes hint through to next/image", () => {
    renderWithTheme(
      <CmsImage image={cmsImage()} sizes="(max-width: 600px) 100vw, 33vw" />
    );

    expect(screen.getByRole("img")).toHaveAttribute(
      "sizes",
      "(max-width: 600px) 100vw, 33vw"
    );
  });
});
