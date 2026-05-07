const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const roots = [
  "data",
  "images",
  "maps",
  "vehicles_textures",
  "weapons_textures"
];

const rootFiles = [
  "index.html",
  "sw.js",
  "ico.webp"
];

const includeExt = new Set([".html", ".js", ".json", ".webp", ".ico"]);
const outputFile = "asset-manifest.json";

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    if (!entry.isFile()) return [];
    return includeExt.has(path.extname(entry.name).toLowerCase()) ? [fullPath] : [];
  });
}

function fileHash(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

const files = [
  ...rootFiles.filter((file) => fs.existsSync(file)),
  ...roots.flatMap(walk)
]
  .filter((file) => path.normalize(file) !== path.normalize(outputFile))
  .map((file) => file.split(path.sep).join("/"))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

const hashes = Object.fromEntries(files.map((file) => [file, fileHash(file)]));
const version = crypto
  .createHash("sha256")
  .update(files.map((file) => `${file}:${hashes[file]}`).join("\n"))
  .digest("hex");

const manifest = {
  version,
  generatedAt: new Date().toISOString(),
  files: hashes
};

fs.writeFileSync(outputFile, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Wrote ${outputFile} with ${files.length} files, version ${version.slice(0, 12)}`);
