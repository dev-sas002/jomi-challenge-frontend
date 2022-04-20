import { render, screen } from "@testing-library/react";
import HomePageSections from "../HomePageSections";
import type { HomePageSectionsDynamicZone } from "graphql/types";

describe("HomePageSections", () => {
  it("dispatches ComponentCommonHeader to HeaderBlock", () => {
    const data = {
      __typename: "ComponentCommonHeader",
      id: "header-1",
      Text: "Hello from CMS",
      ButtonText: "Learn more",
      ButtonLink: "https://example.com/learn-more",
    } as unknown as HomePageSectionsDynamicZone;

    render(<HomePageSections data={data} />);

    expect(screen.getByText("Hello from CMS")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Learn more" })).toBeInTheDocument();
  });

  it("renders nothing for Error sections", () => {
    const data = {
      __typename: "Error",
      code: "GENERIC",
      message: "Something went wrong",
    } as unknown as HomePageSectionsDynamicZone;

    const { container } = render(<HomePageSections data={data} />);
    expect(container).toBeEmptyDOMElement();
  });
});

