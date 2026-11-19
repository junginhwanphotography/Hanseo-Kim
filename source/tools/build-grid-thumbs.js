/**
 * 그리드 스크롤용 미리보기를 web/thumbs 에 만듭니다.
 * 화면에는 칸 너비의 두 배 정도만 필요해서, 원본 대신 이 파일을 먼저 받습니다.
 */

const fs = require("fs");
const path = require("path");
const { WEB, COLLECTIONS_DIR } = require("./paths");

const THUMB_WIDTH = 1000;
const JPEG_QUALITY = 68;

function loadSharp() {
  try {
    return require("sharp");
  } catch {
    return null;
  }
}

function isHiddenCollection(id) {
  return String(id || "").replace(/^_/, "").toUpperCase() === "WALL";
}

function filenameOf(src) {
  return String(src || "").split("/").pop();
}

async function mapPool(items, limit, worker) {
  const queue = items.slice();
  const runners = Array.from({ length: Math.min(limit, queue.length) }, async () => {
    while (queue.length) {
      const item = queue.shift();
      await worker(item);
    }
  });
  await Promise.all(runners);
}

async function buildGridThumbs() {
  const sharp = loadSharp();
  if (!sharp) {
    console.warn("sharp 가 없어 그리드 미리보기를 만들지 않습니다.");
    return { written: 0, skipped: 0 };
  }

  const listPath = path.join(WEB, "collections.json");
  const collections = JSON.parse(fs.readFileSync(listPath, "utf8"));
  const manifest = {};
  const jobs = [];

  for (const collection of collections) {
    if (!collection || !collection.id || isHiddenCollection(collection.id)) continue;
    const jsonPath = path.join(COLLECTIONS_DIR, collection.id, "images.json");
    if (!fs.existsSync(jsonPath)) continue;
    const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    const images = Array.isArray(data) ? data : data.images || [];
    for (const item of images) {
      const filename = filenameOf(item && item.src);
      if (!filename) continue;
      const stem = filename.replace(/\.[^.]+$/, "").toLowerCase();
      if (stem === "background" || stem === "bsckground" || stem.startsWith("bg-")) continue;
      const src = path.join(COLLECTIONS_DIR, collection.id, filename);
      if (!fs.existsSync(src)) continue;
      jobs.push({ collectionId: collection.id, filename, src });
    }
  }

  const outRoot = path.join(WEB, "thumbs");
  fs.mkdirSync(outRoot, { recursive: true });
  let written = 0;
  let skipped = 0;

  await mapPool(jobs, 4, async (job) => {
    const destDir = path.join(outRoot, job.collectionId);
    fs.mkdirSync(destDir, { recursive: true });
    const stem = job.filename.replace(/\.[^.]+$/, "");
    const dest = path.join(destDir, stem + ".jpg");
    const srcStat = fs.statSync(job.src);
    const meta = await sharp(job.src).rotate().metadata();
    const width = meta.width || 0;
    const height = meta.height || 0;
    manifest[job.collectionId + "/" + job.filename] = [width, height];
    if (fs.existsSync(dest) && fs.statSync(dest).mtimeMs >= srcStat.mtimeMs) {
      skipped += 1;
      return;
    }
    await sharp(job.src)
      .rotate()
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      .toFile(dest);
    written += 1;
  });

  fs.writeFileSync(path.join(outRoot, "manifest.json"), JSON.stringify(manifest));
  console.log(`🖼 그리드 미리보기 ${written}장 생성, ${skipped}장 유지`);
  return { written, skipped };
}

if (require.main === module) {
  buildGridThumbs().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { buildGridThumbs };
