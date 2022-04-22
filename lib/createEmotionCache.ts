import createCache from "@emotion/cache";
import type { EmotionCache } from "@emotion/cache";

/**
 * One Emotion cache per render.
 *
 * `pages/_document.tsx` uses a fresh cache to extract MUI's styles into the
 * static HTML; without that the prerendered page ships unstyled and only
 * gains its layout once React hydrates. `prepend` keeps MUI's generated rules
 * ahead of anything else so application styles can override them.
 */
export default function createEmotionCache(): EmotionCache {
  return createCache({ key: "css", prepend: true });
}
