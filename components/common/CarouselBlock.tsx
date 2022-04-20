import { Box, Stack } from "@mui/material";
import type {
  ComponentCommonCarousel,
  ComponentCommonTwoColumnBlock,
} from "graphql/types";
import TwoColumnBlock from "./TwoColumnBlock";

type Props = {
  data: ComponentCommonCarousel;
};

const CarouselBlock = ({ data }: Props) => {
  const items = (data.Item ?? []).filter(
    (item): item is ComponentCommonTwoColumnBlock => Boolean(item)
  );

  if (items.length === 0) return null;

  // Simple server-driven "carousel": render blocks in order. Real carousel
  // behavior (sliding/auto-play) can be layered on later without changing
  // the data contract.
  return (
    <Box my={4}>
      <Stack spacing={3}>
        {items.map((item) => (
          <TwoColumnBlock key={item.id} data={item} />
        ))}
      </Stack>
    </Box>
  );
};

export default CarouselBlock;
