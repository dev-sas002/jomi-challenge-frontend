/**
 * Regenerates the seed artwork in `public/seed/`.
 *
 * The fixture homepage needs media, and a take-home should not ship stock
 * photography it has no licence for. These are abstract, generated pieces in
 * the theme palette: deterministic, small, and obviously illustrative rather
 * than pretending to be clinical photography.
 *
 *   node scripts/generate-seed-art.mjs
 *
 * Requires Playwright's Chromium, which is a dev-only dependency of the
 * screenshot script. The committed JPEGs are the source of truth for a normal
 * build; nothing at runtime calls this.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const WIDTH = 1200;
const HEIGHT = 800;
const OUT_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "public",
  "seed"
);

const DEEP = "#082F55";
const BLUE = "#0E5FA4";
const TEAL = "#0F8F8F";
const LIGHT = "#3E8FD4";

const frame = (body, background) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${background[0]}"/>
      <stop offset="1" stop-color="${background[1]}"/>
    </linearGradient>
    <filter id="soft"><feGaussianBlur stdDeviation="26"/></filter>
    <filter id="haze"><feGaussianBlur stdDeviation="70"/></filter>
  </defs>
  <rect width="1200" height="800" fill="url(#bg)"/>
  ${body}
</svg>`;

/** Evenly spaced parallel strokes, used as a shared texture. */
const rays = (count, opacity) =>
  Array.from({ length: count }, (_, i) => {
    const x = (1200 / count) * i;
    return `<path d="M${x} 800 L${x + 260} 0" stroke="#FFFFFF" stroke-opacity="${opacity}" stroke-width="2" fill="none"/>`;
  }).join("");

const pieces = [
  {
    file: "operating-room.jpg",
    svg: frame(
      `
      ${rays(18, 0.05)}
      <ellipse cx="600" cy="250" rx="430" ry="300" fill="#FFFFFF" opacity="0.22" filter="url(#haze)"/>
      <circle cx="600" cy="250" r="150" fill="#FFFFFF" opacity="0.85" filter="url(#soft)"/>
      <circle cx="600" cy="250" r="96" fill="#FFFFFF" opacity="0.95"/>
      <path d="M0 620 Q300 520 600 600 T1200 560 L1200 800 L0 800 Z" fill="${TEAL}" opacity="0.5"/>
      <path d="M0 690 Q320 620 640 680 T1200 650 L1200 800 L0 800 Z" fill="${DEEP}" opacity="0.65"/>
      `,
      [DEEP, BLUE]
    ),
  },
  {
    file: "general-surgery.jpg",
    svg: frame(
      `
      <circle cx="620" cy="400" r="300" fill="#FFFFFF" opacity="0.14" filter="url(#haze)"/>
      <circle cx="620" cy="400" r="252" fill="none" stroke="#FFFFFF" stroke-opacity="0.35" stroke-width="3"/>
      <path d="M120 720 L700 300" stroke="#FFFFFF" stroke-opacity="0.9" stroke-width="16" stroke-linecap="round"/>
      <path d="M700 300 L790 236 L812 268 L724 332 Z" fill="#FFFFFF" opacity="0.95"/>
      <path d="M1090 700 L560 340" stroke="${LIGHT}" stroke-opacity="0.95" stroke-width="14" stroke-linecap="round"/>
      <circle cx="560" cy="340" r="26" fill="${TEAL}"/>
      <path d="M0 640 Q300 700 600 650 T1200 690 L1200 800 L0 800 Z" fill="${DEEP}" opacity="0.6"/>
      `,
      [BLUE, DEEP]
    ),
  },
  {
    file: "orthopaedics.jpg",
    svg: frame(
      `
      ${rays(14, 0.045)}
      <g stroke="#FFFFFF" fill="none" stroke-linecap="round">
        <path d="M360 120 Q300 300 380 420 Q460 540 400 700" stroke-opacity="0.9" stroke-width="34"/>
        <path d="M820 120 Q880 300 800 420 Q720 540 780 700" stroke-opacity="0.55" stroke-width="34"/>
      </g>
      <circle cx="590" cy="410" r="128" fill="${TEAL}" opacity="0.85"/>
      <circle cx="590" cy="410" r="128" fill="none" stroke="#FFFFFF" stroke-opacity="0.8" stroke-width="5"/>
      <rect x="566" y="180" width="48" height="230" rx="24" fill="#FFFFFF" opacity="0.92"/>
      <rect x="566" y="410" width="48" height="230" rx="24" fill="#FFFFFF" opacity="0.6"/>
      `,
      [DEEP, "#0B4C86"]
    ),
  },
  {
    file: "otolaryngology.jpg",
    svg: frame(
      `
      <g transform="translate(600 400)">
        ${[340, 285, 232, 182, 136, 96, 62, 34]
          .map(
            (r, i) =>
              `<ellipse rx="${r * 1.25}" ry="${r}" fill="none" stroke="#FFFFFF" stroke-opacity="${(0.12 + i * 0.09).toFixed(2)}" stroke-width="${3 + i}" transform="rotate(-12)"/>`
          )
          .join("")}
        <ellipse rx="30" ry="24" fill="#FFFFFF" opacity="0.95" transform="rotate(-12)"/>
      </g>
      <circle cx="600" cy="400" r="420" fill="${DEEP}" opacity="0.28" filter="url(#haze)"/>
      `,
      ["#0A3C68", TEAL]
    ),
  },
  {
    file: "teaching.jpg",
    svg: frame(
      `
      <rect x="180" y="110" width="840" height="420" rx="18" fill="#FFFFFF" opacity="0.95"/>
      <rect x="180" y="110" width="840" height="420" rx="18" fill="none" stroke="${DEEP}" stroke-opacity="0.25" stroke-width="4"/>
      <rect x="228" y="158" width="744" height="292" rx="10" fill="${DEEP}" opacity="0.88"/>
      <path d="M552 244 L688 304 L552 364 Z" fill="#FFFFFF" opacity="0.95"/>
      <rect x="560" y="530" width="80" height="54" fill="#FFFFFF" opacity="0.7"/>
      <rect x="470" y="584" width="260" height="16" rx="8" fill="#FFFFFF" opacity="0.7"/>
      <g fill="${DEEP}" opacity="0.75">
        ${[180, 340, 500, 700, 860, 1020]
          .map(
            (x, i) =>
              `<circle cx="${x}" cy="${690 + (i % 2) * 18}" r="44"/><rect x="${x - 62}" y="${744 + (i % 2) * 18}" width="124" height="90" rx="46"/>`
          )
          .join("")}
      </g>
      `,
      [LIGHT, BLUE]
    ),
  },
];

const main = async () => {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  });

  for (const piece of pieces) {
    const html = `<style>html,body{margin:0;padding:0;overflow:hidden}svg{display:block;width:100vw;height:100vh}</style>${piece.svg}`;
    await page.setContent(html, { waitUntil: "load" });
    const buffer = await page.screenshot({ type: "jpeg", quality: 78 });
    await writeFile(path.join(OUT_DIR, piece.file), buffer);
    process.stdout.write(
      `${piece.file}  ${(buffer.length / 1024).toFixed(0)} kB\n`
    );
  }

  await browser.close();
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
