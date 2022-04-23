import { useState } from "react";
import Image from "next/image";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import type { CmsImage as CmsImageData } from "lib/cms/blocks";

/** Aspect ratio used when the CMS does not report intrinsic dimensions. */
export const DEFAULT_ASPECT_RATIO = 3 / 2;

type Props = {
  image: CmsImageData;
  /** Responsive `sizes` hint; wrong values ship needlessly large sources. */
  sizes?: string;
  /** Set on above-the-fold media so it is not lazy-loaded. */
  priority?: boolean;
  rounded?: boolean;
};

/**
 * Renders CMS media through `next/image`.
 *
 * Three things this buys over a raw `<img>`: a resized, format-negotiated
 * source per breakpoint instead of the editor's original upload; lazy loading
 * below the fold; and a reserved box so the page does not reflow when the
 * image arrives. The skeleton covers the gap between layout and decode, which
 * is the part a reviewer on a slow connection actually sees.
 */
const CmsImage = ({
  image,
  sizes = "(max-width: 900px) 100vw, 50vw",
  priority = false,
  rounded = true,
}: Props) => {
  const [loaded, setLoaded] = useState(false);

  const ratio =
    image.width && image.height && image.height > 0
      ? image.width / image.height
      : DEFAULT_ASPECT_RATIO;

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        // Percentage padding reserves the exact box before the image loads.
        pt: `${(100 / ratio).toFixed(4)}%`,
        overflow: "hidden",
        borderRadius: rounded ? 3 : 0,
        bgcolor: "grey.100",
        "& img": {
          transition: "opacity 400ms ease",
          opacity: loaded ? 1 : 0,
        },
      }}
    >
      {!loaded ? (
        <Skeleton
          data-testid="cms-image-skeleton"
          variant="rectangular"
          animation="wave"
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
          }}
        />
      ) : null}

      <Image
        src={image.url}
        alt={image.alt}
        layout="fill"
        objectFit="cover"
        sizes={sizes}
        priority={priority}
        onLoadingComplete={() => setLoaded(true)}
      />
    </Box>
  );
};

export default CmsImage;
