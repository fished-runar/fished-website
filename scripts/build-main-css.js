// One-off migration script: wraps the existing global.css (verbatim) inside
// a Tailwind v4 `@layer components` block, fronted by a `@theme` block that
// exposes the same design tokens as real Tailwind utility classes.
// Run once with: node scripts/build-main-css.js
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const legacyCssPath = path.join(root, "global.css");
const outPath = path.join(root, "styles", "main.css");

let legacy = fs.readFileSync(legacyCssPath, "utf8");
// Strip a leading BOM if present, plus a literal "&#65279;" HTML-entity
// artifact that ended up embedded as raw (invalid) CSS text at the very
// start of the legacy file from an earlier bad copy/paste.
legacy = legacy.replace(/^\uFEFF/, "");
legacy = legacy.replace(/^&#65279;/, "");
// The legacy file already declares `:root { ... }` with the design tokens;
// keep it as-is for backward compatibility with existing `var(--blue)` etc.

const header = `@import "tailwindcss";

/* Design tokens — exposed as real Tailwind utility classes (bg-blue, text-navy, etc.)
   Values are kept in sync with the :root block below (legacy custom properties used
   throughout the ported component CSS). */
@theme {
  --color-blue: #5060db;
  --color-blue-dark: #3a4bbf;
  --color-blue-light: #DDE1F8;
  --color-navy: #1a2340;
  --color-text: #1a1a2e;
  --color-text-muted: #555555;
  --font-head: "Barlow Condensed", sans-serif;
  --font-body: "Epilogue", sans-serif;
}

/* ============================================================
   Legacy component CSS (ported verbatim from global.css)
   Kept as hand-written CSS per the hybrid Tailwind approach —
   Tailwind utilities are used for new/CMS-driven spacing & color
   overrides, while these bespoke, heavily-iterated components
   (story card, marquee, testimonial carousel/modal, feature tabs,
   offices map, etc.) keep their existing custom classes.
   ============================================================ */
@layer components {
`;

const footer = `\n}\n`;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, header + legacy + footer, "utf8");
console.log(`Wrote ${outPath} (${(header + legacy + footer).length} bytes)`);
