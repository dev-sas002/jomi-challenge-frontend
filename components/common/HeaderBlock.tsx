import { Box, Button, Typography } from "@mui/material";
import type { ComponentCommonHeader } from "graphql/types";

type Props = {
  data: ComponentCommonHeader;
};

const HeaderBlock = ({ data }: Props) => {
  return (
    <Box my={4} textAlign="center">
      {data.Text ? (
        <Typography variant="h4" component="h1" gutterBottom>
          {data.Text}
        </Typography>
      ) : null}

      {data.ButtonText && data.ButtonLink ? (
        <Button
          variant="contained"
          component="a"
          href={data.ButtonLink}
        >
          {data.ButtonText}
        </Button>
      ) : null}
    </Box>
  );
};

export default HeaderBlock;
