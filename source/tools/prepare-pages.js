/**
 * GitHub Pages에 올릴 공개 파일만 _site 로 모읍니다.
 * web 페이지는 사이트 루트로, collections 사진은 /collections 로 둡니다.
 */

const fs = require("fs");
const path = require("path");
const { WEB, COLLECTIONS_DIR, CONTACT_RTF, CONTACT_TXT, SITE_OUT } = require("./paths");
const { buildGridThumbs } = require("./build-grid-thumbs");

const dest = SITE_OUT;

async function preparePages() {
  await buildGridThumbs();
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(WEB, dest, { recursive: true });
  if (fs.existsSync(COLLECTIONS_DIR)) {
    fs.cpSync(COLLECTIONS_DIR, path.join(dest, "collections"), { recursive: true });
  }
  for (const file of [CONTACT_RTF, CONTACT_TXT]) {
    if (fs.existsSync(file)) fs.copyFileSync(file, path.join(dest, path.basename(file)));
  }
  console.log("📦 GitHub Pages 준비:", dest);
}

if (require.main === module) {
  preparePages().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { preparePages };
