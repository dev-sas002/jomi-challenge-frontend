import { render, screen } from "@testing-library/react";
import HeaderBlock from "../HeaderBlock";
import type { ComponentCommonHeader } from "graphql/types";

describe("HeaderBlock", () => {
  it("renders header text and CTA button", () => {
    const data = {
      __typename: "ComponentCommonHeader",
      id: "header-1",
      Text: "Welcome back",
      ButtonText: "Get started",
      ButtonLink: "https://example.com/start",
    } as ComponentCommonHeader;

    render(<HeaderBlock data={data} />);

    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Get started" });
    expect(link).toHaveAttribute("href", "https://example.com/start");
  });
});

