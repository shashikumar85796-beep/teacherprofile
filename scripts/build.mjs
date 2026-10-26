// Inlines local CSS/JS into one self-contained HTML file.
//   node scripts/build.mjs                 -> dist/index.html (deployable single file)
//   node scripts/build.mjs --fragment out  -> head+body content only (for hosts that supply the skeleton)
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

let html = read("index.html")
  .replace(/<link rel="stylesheet" href="(assets\/[^"]+)">/g, (_, p) => `<style>\n${read(p)}</style>`)
  .replace(/<script src="(assets\/[^"]+)"><\/script>/g, (_, p) => `<script>\n${read(p).replace(/<\/script/gi, "<\\/script")}</script>`);

const i = process.argv.indexOf("--fragment");
if (i !== -1) {
  const between = (a, b) => html.slice(html.indexOf(a) + a.length, html.indexOf(b));
  const out = resolve(process.argv[i + 1] || join(root, "dist/fragment.html"));
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, between("<!-- head:start -->", "<!-- head:end -->") + between("<!-- body:start -->", "<!-- body:end -->"));
  console.log("fragment ->", out);
} else {
  mkdirSync(join(root, "dist"), { recursive: true });
  writeFileSync(join(root, "dist/index.html"), html);
  console.log("built -> dist/index.html", (html.length / 1024).toFixed(1) + " KB");
}
