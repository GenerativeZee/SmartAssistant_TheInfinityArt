// Renders public/icons/icon.svg to the PNG sizes the PWA manifest needs.
//   node scripts/gen-icons.mjs
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const root = path.dirname(fileURLToPath(import.meta.url));
const iconsDir = path.join(root, "..", "public", "icons");
const svg = await readFile(path.join(iconsDir, "icon.svg"));

const maskableSvg = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
     <rect width="512" height="512" fill="#0F1518"/>
     <g transform="translate(64 64) scale(0.75)">${svg.toString().replace(/<\/?svg[^>]*>/g, "")}</g>
   </svg>`,
);

const targets = [
  { name: "icon-192.png", size: 192, src: svg },
  { name: "icon-512.png", size: 512, src: svg },
  { name: "icon-maskable-512.png", size: 512, src: maskableSvg },
  { name: "apple-touch-icon.png", size: 180, src: svg },
];

for (const { name, size, src } of targets) {
  const out = await sharp(src, { density: 384 }).resize(size, size).png().toBuffer();
  await writeFile(path.join(iconsDir, name), out);
  console.log("wrote", name, size);
}
