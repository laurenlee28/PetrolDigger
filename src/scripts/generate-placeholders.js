/**
 * Generate placeholder images for development.
 * Run: node scripts/generate-placeholders.js
 *
 * This creates simple colored PNG placeholders so the app can run
 * without the original Figma assets.
 */

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(__dirname, "..", "public", "assets");

if (!existsSync(assetsDir)) {
  mkdirSync(assetsDir, { recursive: true });
}

// Minimal 1x1 pixel PNG (transparent)
const TRANSPARENT_1PX = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);

// Minimal 1x1 pixel PNG (dark)
const DARK_1PX = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNgYPj/HwADBwIAMCbHYQAAAABJRU5ErkJggg==",
  "base64"
);

const assets = [
  {
    filename: "d01da901e5c1c7618944cece1ace6b251fdce852.png",
    desc: "Mory character",
    data: TRANSPARENT_1PX,
  },
  {
    filename: "d049f74cec0e01585373c8b511ded7575708ff00.png",
    desc: "Background image",
    data: DARK_1PX,
  },
  {
    filename: "21359fd9394536664e108bb65e37f9e02c167f36.png",
    desc: "Logo icon",
    data: TRANSPARENT_1PX,
  },
  {
    filename: "6ea28a4603314189a47e9d3e85374d505ac2cf63.png",
    desc: "Tunnel background",
    data: DARK_1PX,
  },
];

for (const asset of assets) {
  const filepath = join(assetsDir, asset.filename);
  if (!existsSync(filepath)) {
    writeFileSync(filepath, asset.data);
    console.log(`  Created placeholder: ${asset.filename} (${asset.desc})`);
  } else {
    console.log(`  Skipped (exists):    ${asset.filename}`);
  }
}

console.log("\nDone! Replace these with real assets when available.");
