/**
 * Lossless PNG re-compression, used on the committed screenshots.
 *
 * Chromium encodes screenshots quickly rather than tightly, and a 1440x900
 * shot of a gradient lands around 450 kB — over the 400 kB per-file budget this
 * repository keeps for committed binaries. Re-choosing the per-row filter and
 * deflating at maximum level gets the same pixels into roughly 20% less space.
 *
 * Only the 8-bit, non-interlaced PNGs Playwright produces are handled; any
 * other input is returned untouched.
 */
import zlib from "node:zlib";

const SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const BYTES_PER_PIXEL = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };

const crcTable = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

const crc32 = (buffer) => {
  let c = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) {
    c = crcTable[(c ^ buffer[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
};

const chunk = (type, data) => {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "latin1"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
};

const paeth = (a, b, c) => {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  return pb <= pc ? b : c;
};

/** Reverses the per-row filters, producing raw pixel rows. */
const unfilter = (raw, width, height, bpp) => {
  const stride = width * bpp;
  const out = Buffer.alloc(stride * height);
  let pos = 0;

  for (let y = 0; y < height; y += 1) {
    const type = raw[pos];
    pos += 1;
    const row = out.subarray(y * stride, (y + 1) * stride);
    raw.copy(row, 0, pos, pos + stride);
    pos += stride;
    const prev = y === 0 ? null : out.subarray((y - 1) * stride, y * stride);

    for (let x = 0; x < stride; x += 1) {
      const a = x >= bpp ? row[x - bpp] : 0;
      const b = prev ? prev[x] : 0;
      const c = prev && x >= bpp ? prev[x - bpp] : 0;

      if (type === 1) row[x] = (row[x] + a) & 0xff;
      else if (type === 2) row[x] = (row[x] + b) & 0xff;
      else if (type === 3) row[x] = (row[x] + ((a + b) >> 1)) & 0xff;
      else if (type === 4) row[x] = (row[x] + paeth(a, b, c)) & 0xff;
    }
  }

  return out;
};

/**
 * Re-applies filters, picking the cheapest candidate per row with the
 * minimum-sum-of-absolute-differences heuristic libpng uses.
 */
const refilter = (pixels, width, height, bpp) => {
  const stride = width * bpp;
  const out = Buffer.alloc((stride + 1) * height);
  const candidate = Buffer.alloc(stride);
  const best = Buffer.alloc(stride);
  let outPos = 0;

  for (let y = 0; y < height; y += 1) {
    const row = pixels.subarray(y * stride, (y + 1) * stride);
    const prev = y === 0 ? null : pixels.subarray((y - 1) * stride, y * stride);

    let bestType = 0;
    let bestScore = Infinity;

    for (let type = 0; type <= 4; type += 1) {
      let score = 0;

      for (let x = 0; x < stride; x += 1) {
        const a = x >= bpp ? row[x - bpp] : 0;
        const b = prev ? prev[x] : 0;
        const c = prev && x >= bpp ? prev[x - bpp] : 0;
        let value;

        if (type === 0) value = row[x];
        else if (type === 1) value = (row[x] - a) & 0xff;
        else if (type === 2) value = (row[x] - b) & 0xff;
        else if (type === 3) value = (row[x] - ((a + b) >> 1)) & 0xff;
        else value = (row[x] - paeth(a, b, c)) & 0xff;

        candidate[x] = value;
        score += value < 128 ? value : 256 - value;
      }

      if (score < bestScore) {
        bestScore = score;
        bestType = type;
        candidate.copy(best);
      }
    }

    out[outPos] = bestType;
    outPos += 1;
    best.copy(out, outPos);
    outPos += stride;
  }

  return out;
};

export function optimisePng(input) {
  if (!input.subarray(0, 8).equals(SIGNATURE)) return input;

  let pos = 8;
  let header = null;
  let palette = null;
  const idat = [];

  while (pos < input.length) {
    const length = input.readUInt32BE(pos);
    const type = input.toString("latin1", pos + 4, pos + 8);
    const data = input.subarray(pos + 8, pos + 8 + length);
    pos += 12 + length;

    if (type === "IHDR") header = data;
    else if (type === "PLTE") palette = data;
    else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
  }

  if (!header || idat.length === 0) return input;

  const width = header.readUInt32BE(0);
  const height = header.readUInt32BE(4);
  const depth = header[8];
  const colourType = header[9];
  const interlace = header[12];
  const bpp = BYTES_PER_PIXEL[colourType];

  if (depth !== 8 || interlace !== 0 || !bpp) return input;

  const raw = zlib.inflateSync(Buffer.concat(idat));
  const pixels = unfilter(raw, width, height, bpp);
  const filtered = refilter(pixels, width, height, bpp);
  const deflated = zlib.deflateSync(filtered, { level: 9 });

  const chunks = [SIGNATURE, chunk("IHDR", header)];
  if (palette) chunks.push(chunk("PLTE", palette));
  chunks.push(chunk("IDAT", deflated), chunk("IEND", Buffer.alloc(0)));

  const output = Buffer.concat(chunks);
  return output.length < input.length ? output : input;
}

export default optimisePng;
