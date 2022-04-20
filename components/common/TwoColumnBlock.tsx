import { Box, Button, Grid, Typography } from "@mui/material";
import type {
  ComponentCommonTwoColumnBlock,
  Enum_Componentcommontwocolumnblock_Imageposition,
} from "graphql/types";
import {
  Enum_Componentcommontwocolumnblock_Imageposition as ImagePositionEnum,
} from "graphql/types";

type Props = {
  data: ComponentCommonTwoColumnBlock;
};

const TwoColumnBlock = ({ data }: Props) => {
  const imageUrl = data.Image?.data?.url ?? data.Image?.data?.previewUrl;
  const imageAlt =
    data.Image?.data?.alternativeText ?? data.TitleText ?? "Section image";

  const imagePosition = data.ImagePosition as
    | Enum_Componentcommontwocolumnblock_Imageposition
    | undefined;

  const isImageLeft =
    imagePosition !== ImagePositionEnum.Right && imageUrl !== undefined;

  return (
    <Box my={4}>
      <Grid
        container
        spacing={2}
        alignItems="center"
        direction={isImageLeft ? "row" : "row-reverse"}
      >
        <Grid item xs={12} md={6}>
          {imageUrl ? (
            <Box
              component="img"
              src={imageUrl}
              alt={imageAlt}
              sx={{ width: "100%", height: "auto", display: "block" }}
            />
          ) : null}
        </Grid>

        <Grid item xs={12} md={6}>
          {data.TitleText ? (
            <Typography variant="h5" gutterBottom>
              {data.TitleText}
            </Typography>
          ) : null}

          {data.Description ? (
            <Typography variant="body1" paragraph>
              {data.Description}
            </Typography>
          ) : null}

          {data.ButtonText && data.ButtonUrl ? (
            <Button
              variant="contained"
              component="a"
              href={data.ButtonUrl}
            >
              {data.ButtonText}
            </Button>
          ) : null}
        </Grid>
      </Grid>
    </Box>
  );
};

export default TwoColumnBlock;
