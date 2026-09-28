import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const masterPath = path.join(ROOT, 'public', 'master-icon-transparent-512.png');
const publicDir = path.join(ROOT, 'public');
const appDir = path.join(ROOT, 'src', 'app');

async function buildFavicons() {
  console.log('--- 🎨 Generating Complete Favicon & Icon System ---');

  if (!fs.existsSync(masterPath)) {
    console.error('❌ Master icon not found at:', masterPath);
    process.exit(1);
  }

  // 1. Googlebot Favicon 96x96 (48px multiple rule)
  await sharp(masterPath)
    .resize(96, 96, { kernel: 'lanczos3' })
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, 'favicon-96x96.png'));
  console.log('✅ Generated public/favicon-96x96.png (Google 48px multiple rule compliant)');

  // 2. Apple Touch Icon 180x180 (with 10% breathing room on dark obsidian background)
  const appleInner = await sharp(masterPath)
    .resize(150, 150, { kernel: 'lanczos3' })
    .toBuffer();
  
  await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: { r: 9, g: 13, b: 22, alpha: 1 } // #090d16
    }
  })
    .composite([{ input: appleInner, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✅ Generated public/apple-touch-icon.png (180x180 iOS breathing room mask compliant)');

  // 3. PWA Web App Manifest Icons: 192x192 & 512x512
  await sharp(masterPath)
    .resize(192, 192, { kernel: 'lanczos3' })
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, 'web-app-manifest-192x192.png'));
  
  await sharp(masterPath)
    .resize(512, 512, { kernel: 'lanczos3' })
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, 'web-app-manifest-512x512.png'));
  console.log('✅ Generated public/web-app-manifest-192x192.png & 512x512.png');

  // 4. Dedicated UI Brand Logo 64x64 WebP (sub-1.5KB, Decoupled from Favicon)
  const imagesDir = path.join(publicDir, 'images');
  if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
  await sharp(masterPath)
    .resize(64, 64, { kernel: 'lanczos3' })
    .webp({ quality: 85 })
    .toFile(path.join(imagesDir, 'logo.webp'));
  console.log('✅ Generated public/images/logo.webp (UI Decoupled WebP)');

  // 5. Multi-Resolution Legacy ICO (16, 32, 48) for Bing & Yandex
  const sizes = [16, 32, 48];
  const pngBuffers = [];
  for (const s of sizes) {
    const buf = await sharp(masterPath).resize(s, s, { kernel: 'lanczos3' }).png().toBuffer();
    pngBuffers.push({ size: s, buf });
  }

  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  const dirEntrySize = 16;
  let offset = 6 + count * dirEntrySize;
  const dirEntries = [];

  for (const item of pngBuffers) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(item.size === 256 ? 0 : item.size, 0);
    entry.writeUInt8(item.size === 256 ? 0 : item.size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(item.buf.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += item.buf.length;
    dirEntries.push(entry);
  }

  const icoBuffer = Buffer.concat([header, ...dirEntries, ...pngBuffers.map(p => p.buf)]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  console.log('✅ Generated public/favicon.ico (Multi-size 16/32/48 ICO)');

  // 6. Dual-Directory Sync to src/app/ (Next.js App Router Priority Override Defense)
  fs.copyFileSync(path.join(publicDir, 'favicon.ico'), path.join(appDir, 'favicon.ico'));
  fs.copyFileSync(path.join(publicDir, 'favicon-96x96.png'), path.join(appDir, 'icon.png'));
  fs.copyFileSync(path.join(publicDir, 'apple-touch-icon.png'), path.join(appDir, 'apple-icon.png'));
  
  // Ensure no Fake SVG exists in src/app or public
  if (fs.existsSync(path.join(appDir, 'favicon.svg'))) fs.unlinkSync(path.join(appDir, 'favicon.svg'));
  if (fs.existsSync(path.join(publicDir, 'favicon.svg'))) fs.unlinkSync(path.join(publicDir, 'favicon.svg'));
  console.log('✅ Completed Dual-Directory Sync to src/app/ (icon.png, favicon.ico, apple-icon.png)');

  // 7. Update site.webmanifest with clean real brand values
  const manifest = {
    name: "Fire Emblem: Fortune's Weave Wiki",
    short_name: "Fortune's Weave",
    description: "Tactical Archives, Character Recruitment, Class Solvers & Paralogues for Fire Emblem: Fortune's Weave.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#d3b475",
    icons: [
      {
        src: "/favicon-96x96.png",
        sizes: "96x96",
        type: "image/png"
      },
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png"
      }
    ]
  };

  fs.writeFileSync(path.join(publicDir, 'site.webmanifest'), JSON.stringify(manifest, null, 2));
  console.log('✅ Updated public/site.webmanifest with verified brand & manifest icons');
}

buildFavicons().catch(err => {
  console.error('Error generating favicons:', err);
  process.exit(1);
});
