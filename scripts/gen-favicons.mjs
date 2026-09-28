#!/usr/bin/env node
/**
 * gen-favicons.mjs - 生成 favicon 矩阵与 OG 图（纯 Node，无外部工具依赖）
 *
 * 为什么自己生成：本机没有 cwebp/magick/imagemagick，而 favicon 矩阵是 Google 明确要求的
 * 48px 倍数（首选 96x96 PNG），缺失会让图标在 SERP 被静默丢弃。OG 图必须 1200x630。
 *
 * 设计：深色渐变底 + 琥珀色交叉斜纹（织纹 motif，呼应 "Weave"），程序化绘制、无版权素材。
 * 产物：public/favicon-96x96.png / public/apple-touch-icon.png / public/favicon.ico / public/og-default.png
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const OUT_DIR = path.join(process.cwd(), "public");

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePNG(width, height, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const stride = width * 4 + 1;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    raw[y * stride] = 0;
    rgba.copy(raw, y * stride + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function encodeICO(png, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  const entry = Buffer.alloc(16);
  entry[0] = size >= 256 ? 0 : size;
  entry[1] = size >= 256 ? 0 : size;
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(22, 12);
  return Buffer.concat([header, entry, png]);
}

function draw(width, height, opts) {
  const buf = Buffer.alloc(width * height * 4);
  const band = Math.max(2, Math.round(Math.min(width, height) * opts.band));
  const cx = width / 2;
  const cy = height / 2;
  const maxD = Math.hypot(cx, cy);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const d = Math.hypot(x - cx, y - cy) / maxD;
      let r = Math.round(15 + 20 * (1 - d));
      let g = Math.round(23 + 28 * (1 - d));
      let b = Math.round(42 + 44 * (1 - d));
      const d1 = Math.abs(y - x);
      const d2 = Math.abs(y - (height - 1 - x * (height / width)));
      if (d1 < band || d2 < band) {
        const shade = 1 - 0.25 * (y / height);
        r = Math.round(245 * shade);
        g = Math.round(158 * shade);
        b = Math.round(11 * shade);
      }
      buf[i] = r;
      buf[i + 1] = g;
      buf[i + 2] = b;
      buf[i + 3] = 255;
    }
  }
  return buf;
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const icon96 = encodePNG(96, 96, draw(96, 96, { band: 0.075 }));
fs.writeFileSync(path.join(OUT_DIR, "favicon-96x96.png"), icon96);

const apple = encodePNG(180, 180, draw(180, 180, { band: 0.075 }));
fs.writeFileSync(path.join(OUT_DIR, "apple-touch-icon.png"), apple);

const icon32 = encodePNG(32, 32, draw(32, 32, { band: 0.08 }));
fs.writeFileSync(path.join(OUT_DIR, "favicon.ico"), encodeICO(icon32, 32));

const og = encodePNG(1200, 630, draw(1200, 630, { band: 0.05 }));
fs.writeFileSync(path.join(OUT_DIR, "og-default.png"), og);

for (const name of ["favicon-96x96.png", "apple-touch-icon.png", "favicon.ico", "og-default.png"]) {
  const full = path.join(OUT_DIR, name);
  console.log("  " + name + "  " + fs.statSync(full).size + " bytes");
}
console.log("favicons + OG image generated");
