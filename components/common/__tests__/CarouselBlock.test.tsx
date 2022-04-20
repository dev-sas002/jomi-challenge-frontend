import { render, screen } from "@testing-library/react";
import CarouselBlock from "../CarouselBlock";
import type {
  ComponentCommonCarousel,
  ComponentCommonTwoColumnBlock,
} from "graphql/types";

describe("CarouselBlock", () => {
  it("renders child TwoColumnBlocks in order", () => {
    const items = [
      {
        __typename: "ComponentCommonTwoColumnBlock",
        id: "child-1",
        TitleText: "First card",
      },
      {
        __typename: "ComponentCommonTwoColumnBlock",
        id: "child-2",
        TitleText: "Second card",
      },
    ] as unknown as ComponentCommonTwoColumnBlock[];

    const data = {
      __typename: "ComponentCommonCarousel",
      id: "carousel-1",
      Item: items,
    } as unknown as ComponentCommonCarousel;

    render(<CarouselBlock data={data} />);

    expect(screen.getByText("First card")).toBeInTheDocument();
    expect(screen.getByText("Second card")).toBeInTheDocument();
  });
});

