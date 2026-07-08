// One-off check: verify every image path referenced in _data/*.json exists on
// disk with an EXACT case match. Windows/macOS filesystems are case-insensitive
// by default so this can silently pass locally but 404 on Cloudflare Pages
// (Linux, case-sensitive).
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const dataDir = path.join(root, "_data");

function collectPaths(value, out) {
  if (typeof value === "string" && /^\/assets\//.test(value)) {
    out.push(value);
  } else if (Array.isArray(value)) {
    value.forEach((v) => collectPaths(v, out));
  } else if (value && typeof value === "object") {
    Object.values(value).forEach((v) => collectPaths(v, out));
  }
}

let missing = [];
let checked = 0;
for (const file of fs.readdirSync(dataDir)) {
  if (!file.endsWith(".json")) continue;
  const data = JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf8"));
  const refs = [];
  collectPaths(data, refs);
  for (const ref of refs) {
    checked++;
    const rel = ref.replace(/^\//, "");
    const abs = path.join(root, rel);
    const dir = path.dirname(abs);
    const base = path.basename(abs);
    let exists = false;
    if (fs.existsSync(dir)) {
      const entries = fs.readdirSync(dir);
      exists = entries.includes(base);
    }
    if (!exists) missing.push(`${file}: ${ref}`);
  }
}

console.log(`Checked ${checked} asset references.`);
if (missing.length) {
  console.log(`MISSING / CASE MISMATCH (${missing.length}):`);
  missing.forEach((m) => console.log("  " + m));
  process.exitCode = 1;
} else {
  console.log("All asset paths match exactly (case-sensitive).");
}
