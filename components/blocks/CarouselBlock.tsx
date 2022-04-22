import { useCallback, useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import type { CarouselBlock as CarouselBlockData } from "lib/cms/blocks";
import { sectionSurface } from "theme";
import TwoColumnContent from "./TwoColumnContent";
import { defineBlock, type BlockProps } from "./registry";

/**
 * A scroll-snap carousel over the block's items.
 *
 * The track is a plain horizontally scrollable element, so it works with touch,
 * a trackpad and a keyboard before any JavaScript runs; the arrows and dots
 * drive the same `scrollTo`. There is no auto-advance — content that moves on
 * its own is hostile to screen-reader and low-vision users, and the CMS gives
 * no signal about how long a slide should hold.
 */
const CarouselBlock = ({ block, index }: BlockProps<CarouselBlockData>) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const surface = sectionSurface(index);
  const slideCount = block.items.length;

  const syncActiveIndex = useCallback(() => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;

    const next = Math.round(track.scrollLeft / track.clientWidth);
    setActiveIndex(Math.max(0, Math.min(slideCount - 1, next)));
  }, [slideCount]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    track.addEventListener("scroll", syncActiveIndex, { passive: true });
    return () => track.removeEventListener("scroll", syncActiveIndex);
  }, [syncActiveIndex]);

  const scrollToSlide = useCallback(
    (target: number) => {
      const track = trackRef.current;
      const clamped = Math.max(0, Math.min(slideCount - 1, target));
      setActiveIndex(clamped);
      if (!track) return;

      const left = clamped * track.clientWidth;
      // jsdom and older browsers have no smooth `scrollTo`.
      if (typeof track.scrollTo === "function") {
        track.scrollTo({ left, behavior: "smooth" });
      } else {
        track.scrollLeft = left;
      }
    },
    [slideCount]
  );

  if (slideCount === 0) return null;

  return (
    <Box
      component="section"
      aria-roledescription="carousel"
      aria-label="Featured collections"
      sx={{ bgcolor: surface.background, py: { xs: 7, md: 12 } }}
    >
      <Container maxWidth="lg">
        <Box
          ref={trackRef}
          sx={{
            display: "flex",
            gap: { xs: 2, md: 4 },
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {block.items.map((item, slideIndex) => (
            <Box
              key={item.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${slideIndex + 1} of ${slideCount}`}
              sx={{
                flex: "0 0 100%",
                minWidth: 0,
                scrollSnapAlign: "start",
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  bgcolor: surface.card,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 4,
                  p: { xs: 3, md: 5 },
                  height: "100%",
                }}
              >
                <TwoColumnContent block={item} dense headingComponent="h3" />
              </Paper>
            </Box>
          ))}
        </Box>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mt: 3 }}
        >
          <Stack direction="row" spacing={1} component="div">
            {block.items.map((item, slideIndex) => (
              <ButtonBase
                key={item.id}
                onClick={() => scrollToSlide(slideIndex)}
                aria-label={`Show slide ${slideIndex + 1} of ${slideCount}`}
                aria-current={slideIndex === activeIndex ? "true" : undefined}
                sx={{
                  width: slideIndex === activeIndex ? 28 : 10,
                  height: 10,
                  borderRadius: 999,
                  transition: "width 200ms ease, background-color 200ms ease",
                  bgcolor:
                    slideIndex === activeIndex ? "primary.main" : "divider",
                }}
              />
            ))}
          </Stack>

          <Stack direction="row" spacing={1}>
            <IconButton
              onClick={() => scrollToSlide(activeIndex - 1)}
              disabled={activeIndex === 0}
              aria-label="Previous slide"
              sx={{ border: 1, borderColor: "divider" }}
            >
              <ChevronLeftIcon />
            </IconButton>
            <IconButton
              onClick={() => scrollToSlide(activeIndex + 1)}
              disabled={activeIndex === slideCount - 1}
              aria-label="Next slide"
              sx={{ border: 1, borderColor: "divider" }}
            >
              <ChevronRightIcon />
            </IconButton>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export const carouselBlockDefinition = defineBlock({
  typename: "ComponentCommonCarousel",
  component: CarouselBlock,
});

export default CarouselBlock;
