import type {
  ComponentCommonCarousel,
  ComponentCommonHeader,
  ComponentCommonTwoColumnBlock,
  HomePageSectionsDynamicZone,
} from "graphql/types";
import CarouselBlock from "./common/CarouselBlock";
import HeaderBlock from "./common/HeaderBlock";
import TwoColumnBlock from "./common/TwoColumnBlock";

type Props = {
  data: HomePageSectionsDynamicZone | null | undefined;
};

const HomePageSections = ({ data }: Props) => {
  if (!data?.__typename) return null;

  switch (data.__typename) {
    case "ComponentCommonCarousel":
      return <CarouselBlock data={data as ComponentCommonCarousel} />;
    case "ComponentCommonHeader":
      return <HeaderBlock data={data as ComponentCommonHeader} />;
    case "ComponentCommonTwoColumnBlock":
      return <TwoColumnBlock data={data as ComponentCommonTwoColumnBlock} />;
    case "Error":
    default:
      return null;
  }
};

export default HomePageSections;
