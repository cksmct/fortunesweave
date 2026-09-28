import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

function scanVideoIdsFromSrc(dir, ids = new Set()) {
  if (!fs.existsSync(dir)) return ids;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      scanVideoIdsFromSrc(fullPath, ids);
    } else if (/\.(tsx?|jsx?|mjs|json)$/.test(file)) {
      const content = fs.readFileSync(fullPath, "utf8");
      // ① Full YouTube URLs
      const ytUrlRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/g;
      // ② tsx literals: videoId="..."
      const tsxIdRegex = /videoId\s*=\s*["']([\w-]{11})["']/g;
      // ③ json videoId: "videoId": "..."
      const jsonIdRegex = /["']?videoId["']?\s*:\s*["']([\w-]{11})["']/g;
      let m;
      while ((m = ytUrlRegex.exec(content)) !== null) ids.add(m[1]);
      while ((m = tsxIdRegex.exec(content)) !== null) ids.add(m[1]);
      while ((m = jsonIdRegex.exec(content)) !== null) ids.add(m[1]);
    }
  }
  return ids;
}

const ytDir = path.resolve("public/images/yt");
if (!fs.existsSync(ytDir)) fs.mkdirSync(ytDir, { recursive: true });

async function fetchAndOptimize(videoId) {
  const destWebp = path.join(ytDir, `${videoId}.webp`);
  const destJpg = path.join(ytDir, `${videoId}.jpg`);
  if (fs.existsSync(destWebp) && fs.existsSync(destJpg)) return;

  const urls = [
    `https://i.ytimg.com/vi_webp/${videoId}/maxresdefault.webp`,
    `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
    `https://i.ytimg.com/vi_webp/${videoId}/hqdefault.webp`,
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
  ];

  let buffer = null;
  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length > 1000) {
          buffer = buf;
          break;
        }
      }
    } catch {
      // try next
    }
  }

  if (!buffer) {
    console.warn(`[optimize-media] ⚠️ Failed to fetch thumbnail for ${videoId}`);
    return;
  }

  await sharp(buffer)
    .flatten({ background: "#000000" })
    .resize(480, 270, { fit: "cover", position: "center" })
    .webp({ quality: 75, effort: 6 })
    .toFile(destWebp);

  await sharp(buffer)
    .flatten({ background: "#000000" })
    .resize(480, 270, { fit: "cover", position: "center" })
    .jpeg({ quality: 78, mozjpeg: true })
    .toFile(destJpg);

  console.log(`✅ [optimize-media] ${videoId} -> ${destWebp}`);
}

async function run() {
  const videoIds = Array.from(scanVideoIdsFromSrc(path.resolve("src")));
  console.log(`[optimize-media] Discovered ${videoIds.length} video IDs in src/`);
  for (const id of videoIds) {
    await fetchAndOptimize(id);
  }
}

run().catch(console.error);
