/**
 * Captures the screenshots used in the README.
 *
 *   yarn build && yarn screenshots
 *
 * Runs the production server against the bundled fixture content
 * (`CMS_SOURCE=fixture`), so the shots are deterministic and need no CMS. The
 * page is fully static, so there is no loading state to wait out — the script
 * still waits for every image to decode before it shoots, which is the only
 * thing that is genuinely asynchronous.
 */
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { optimisePng } from "./lib/optimise-png.mjs";

const PORT = Number(process.env.SCREENSHOT_PORT ?? 8261);
const ORIGIN = `http://127.0.0.1:${PORT}`;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "docs", "screenshots");

const DESKTOP = { width: 1440, height: 900 };

/** Per-file ceiling for a screenshot committed to the repository. */
const MAX_BYTES = 400 * 1024;

/**
 * Viewport-sized shots rather than one tall full-page capture: they stay well
 * under the README's weight budget and each one frames a single block type.
 */
const SHOTS = [
  { file: "home-desktop.png", viewport: DESKTOP, anchor: "top" },
  {
    file: "home-two-column.png",
    viewport: DESKTOP,
    anchor: "section:nth-of-type(2)",
  },
  {
    file: "home-carousel.png",
    viewport: DESKTOP,
    anchor: "[aria-roledescription='carousel']",
  },
  {
    file: "home-mobile.png",
    viewport: { width: 390, height: 844 },
    anchor: "top",
    isMobile: true,
  },
];

const waitForServer = async (timeoutMs = 60_000) => {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(ORIGIN, { method: "GET" });
      if (response.ok) return;
    } catch {
      // Not listening yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  throw new Error(`${ORIGIN} did not come up within ${timeoutMs}ms`);
};

const main = async () => {
  await mkdir(OUT_DIR, { recursive: true });

  const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
    cwd: ROOT,
    env: { ...process.env, CMS_SOURCE: "fixture", NODE_ENV: "production" },
    stdio: "ignore",
  });

  let browser;
  try {
    await waitForServer();
    browser = await chromium.launch();

    for (const shot of SHOTS) {
      const context = await browser.newContext({
        viewport: shot.viewport,
        deviceScaleFactor: 1,
        isMobile: Boolean(shot.isMobile),
        hasTouch: Boolean(shot.isMobile),
      });
      const page = await context.newPage();

      await page.goto(ORIGIN, { waitUntil: "networkidle" });

      // `next/image` lazy-loads below the fold and the carousel keeps two of
      // its slides outside the viewport horizontally, so nothing is on screen
      // until the page is walked. `IntersectionObserver` occasionally misses a
      // target on the first pass, hence the retry.
      const sweep = () =>
        page.evaluate(async () => {
          const pause = () => new Promise((resolve) => setTimeout(resolve, 150));

          const step = window.innerHeight / 2;
          for (let y = 0; y < document.body.scrollHeight; y += step) {
            window.scrollTo(0, y);
            await pause();
          }
          window.scrollTo(0, 0);
          await pause();

          const tracks = Array.from(
            document.querySelectorAll("[aria-roledescription='carousel'] *")
          ).filter(
            (el) => el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 1
          );

          for (const track of tracks) {
            const slides = Math.ceil(track.scrollWidth / track.clientWidth);
            for (let slide = 0; slide < slides; slide += 1) {
              track.scrollLeft = slide * track.clientWidth;
              await pause();
            }
            track.scrollLeft = 0;
            await pause();
          }
        });

      // A page with no media means the server rendered the empty state (a
      // stale ISR entry, or CMS_SOURCE not reaching the child process).
      // Failing here beats shipping a screenshot of an empty page.
      const imageCount = await page.evaluate(() => document.images.length);
      if (imageCount === 0) {
        throw new Error(
          "the page rendered no images - rebuild with `yarn build` before capturing"
        );
      }

      // Every image must have actually decoded, not merely be "complete" with
      // the lazy placeholder still in place.
      const pendingImages = () =>
        page.evaluate(() =>
          Array.from(document.images)
            .filter((img) => !img.complete || img.naturalWidth <= 1)
            .map((img) => img.currentSrc || img.src)
        );

      let pending = [];
      for (let attempt = 0; attempt < 5; attempt += 1) {
        await sweep();
        await page.waitForTimeout(500);
        pending = await pendingImages();
        if (pending.length === 0) break;
      }

      if (pending.length > 0) {
        throw new Error(`images never decoded: ${pending.join(", ")}`);
      }

      if (shot.anchor !== "top") {
        await page.locator(shot.anchor).first().scrollIntoViewIfNeeded();
      }
      await page.waitForTimeout(800);

      const buffer = optimisePng(await page.screenshot());
      if (buffer.length > MAX_BYTES) {
        throw new Error(
          `${shot.file} is ${(buffer.length / 1024).toFixed(0)} kB, over the ` +
            `${MAX_BYTES / 1024} kB budget for a committed screenshot`
        );
      }

      await writeFile(path.join(OUT_DIR, shot.file), buffer);
      process.stdout.write(
        `${shot.file}  ${(buffer.length / 1024).toFixed(0)} kB\n`
      );

      await context.close();
    }
  } finally {
    await browser?.close();
    server.kill("SIGTERM");
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
