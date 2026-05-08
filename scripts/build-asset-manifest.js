const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const roots = [
  "data",
  "maps_textures",
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
const outputFile = path.join("data", "asset-manifest.json");

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

if (fs.existsSync(outputFile)) {
  try {
    const current = JSON.parse(fs.readFileSync(outputFile, "utf8").replace(/^\uFEFF/, ""));
    if (
      current.version === version &&
      JSON.stringify(current.files) === JSON.stringify(hashes)
    ) {
      console.log(`Unchanged ${outputFile}, version ${version.slice(0, 12)}`);
      process.exit(0);
    }
  } catch {
    // Regenerate the manifest if the existing file cannot be parsed.
  }
}

fs.writeFileSync(outputFile, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Wrote ${outputFile} with ${files.length} files, version ${version.slice(0, 12)}`);
