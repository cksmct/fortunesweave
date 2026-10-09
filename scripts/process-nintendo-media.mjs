import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const sourceDir = 'C:/Users/CT/.gemini/antigravity-ide/brain/38ec5940-fd40-4f04-9fae-c272960080a2/scratch/nintendo_media';

const dirsToEnsure = [
  'public/images/characters',
  'public/images/gameplay',
  'public/images/official',
  'public/images/yt'
];

for (const d of dirsToEnsure) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

async function processDualWebp(inputFilename, outputBaseName, outDir, fullWidth = 1200, smWidth = 640) {
  const inputPath = path.join(sourceDir, inputFilename);
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file does not exist: ${inputPath}`);
  }

  const destFull = path.join(outDir, `${outputBaseName}.webp`);
  const destSm = path.join(outDir, `${outputBaseName}-sm.webp`);

  const meta = await sharp(inputPath).metadata();
  const aspectRatio = meta.height / meta.width;

  const fullHeight = Math.round(fullWidth * aspectRatio);
  const smHeight = Math.round(smWidth * aspectRatio);

  await sharp(inputPath)
    .resize(fullWidth, fullHeight, { fit: 'cover' })
    .webp({ quality: 82, effort: 5 })
    .toFile(destFull);

  await sharp(inputPath)
    .resize(smWidth, smHeight, { fit: 'cover' })
    .webp({ quality: 80, effort: 5 })
    .toFile(destSm);

  const statFull = fs.statSync(destFull);
  const statSm = fs.statSync(destSm);

  console.log(`✅ [${outputBaseName}] -> full: ${(statFull.size / 1024).toFixed(1)}KB, sm: ${(statSm.size / 1024).toFixed(1)}KB`);
}

async function processYouTubeThumbnail(inputFilename, videoId) {
  const inputPath = path.join(sourceDir, inputFilename);
  if (!fs.existsSync(inputPath)) return;

  const destWebp = path.join('public/images/yt', `${videoId}.webp`);
  const destJpg = path.join('public/images/yt', `${videoId}.jpg`);

  await sharp(inputPath)
    .flatten({ background: '#000000' })
    .resize(480, 270, { fit: 'cover', position: 'center' })
    .webp({ quality: 80, effort: 5 })
    .toFile(destWebp);

  await sharp(inputPath)
    .flatten({ background: '#000000' })
    .resize(480, 270, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(destJpg);

  console.log(`✅ [YT ${videoId}] -> ${destWebp} & ${destJpg}`);
}

async function main() {
  console.log('🚀 Processing Nintendo official assets into responsive WebP...');

  // 1. Flame Lords character artwork (slide07 ~ slide10)
  await processDualWebp('slide07.png', 'cai-art', 'public/images/characters', 1280, 640);
  await processDualWebp('slide08.png', 'dietrich-art', 'public/images/characters', 1280, 640);
  await processDualWebp('slide09.png', 'theodora-art', 'public/images/characters', 1280, 640);
  await processDualWebp('slide10.png', 'leda-art', 'public/images/characters', 1280, 640);

  // 2. Tactical gameplay screenshots (slide01 ~ slide06)
  await processDualWebp('slide01.jpg', 'tactical-grid-battle', 'public/images/gameplay', 1280, 640);
  await processDualWebp('slide02.jpg', 'tactical-positioning-clash', 'public/images/gameplay', 1280, 640);
  await processDualWebp('slide03.jpg', 'tactical-combat-arts', 'public/images/gameplay', 1280, 640);
  await processDualWebp('slide04.jpg', 'tactical-blaze-meter', 'public/images/gameplay', 1280, 640);
  await processDualWebp('slide05.png', 'tactical-heroic-arena', 'public/images/gameplay', 1280, 640);
  await processDualWebp('slide06.png', 'tactical-overblaze-burst', 'public/images/gameplay', 1280, 640);

  // 3. Official packaging & keyart
  await processDualWebp('package.webp', 'switch2-package', 'public/images/official', 632, 380);
  await processDualWebp('hero_square.jpg', 'official-keyart-square', 'public/images/official', 1024, 512);
  await processDualWebp('banner_sec_img.png', 'dagdan-collection-banner', 'public/images/official', 1920, 960);
  await processDualWebp('hero.jpg', 'official-hero-desktop', 'public/images/official', 1920, 960);

  // 4. Official YouTube trailers
  const trailerMap = [
    { file: 'slider-thumb06.jpg', id: 'kmF38S_0vPs' }, // Launch Trailer
    { file: 'slider-thumb05.jpg', id: 'L1gvaBYKFy8' }, // Overview Trailer
    { file: 'slider-thumb04.jpg', id: 'NtAijhTAAxo' }, // Commercial 3
    { file: 'slider-thumb03.jpg', id: 'BWvcXleNxtc' }, // Commercial 2
    { file: 'slider-thumb02.jpg', id: 'wPTS3TJVF18' }, // Commercial 1
    { file: 'slider-thumb01.jpg', id: 'Rl5_C4sc5zk' }, // Nintendo Direct 6.9.2026
  ];

  for (const t of trailerMap) {
    await processYouTubeThumbnail(t.file, t.id);
  }

  console.log('\n🎉 All official assets successfully processed and optimized!');
}

main().catch(err => {
  console.error('❌ Processing failed:', err);
  process.exit(1);
});
