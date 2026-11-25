import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dist = path.join(root, "dist");
const ogDir = path.join(dist, "og");
const archiveUrl =
  process.env.OG_IMAGES_URL ||
  "https://github.com/gre/gl-transition-libs/releases/download/og-images/og-images.tar.gz";
const site = "https://gl-transitions.com";
const transitions = createRequire(import.meta.url)(
  "gl-transitions/gl-transitions.json"
);

const START = "<!-- og:start -->";
const END = "<!-- og:end -->";

const html = fs.readFileSync(path.join(dist, "index.html"), "utf8");
const start = html.indexOf(START);
const end = html.indexOf(END);
if (start === -1 || end === -1 || end < start) {
  console.error(`og-pages: ${START} / ${END} markers missing in dist/index.html`);
  process.exit(1);
}
const before = html.slice(0, start);
const after = html.slice(end + END.length);

const ATTEMPTS = 4;
const RETRY_DELAY = 10000;

async function fetchImages() {
  const archive = path.join(dist, "og-images.tar.gz");
  try {
    const res = await fetch(archiveUrl, { signal: AbortSignal.timeout(60000) });
    if (!res.ok) {
      throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status });
    }
    fs.writeFileSync(archive, Buffer.from(await res.arrayBuffer()));
    fs.mkdirSync(ogDir, { recursive: true });
    execFileSync("tar", ["-xzf", archive, "-C", ogDir]);
  } catch (e) {
    fs.rmSync(ogDir, { recursive: true, force: true });
    throw e;
  } finally {
    fs.rmSync(archive, { force: true });
  }
}

// the workflow replaces the archive by deleting it first, so a 404 is retried too
async function fetchImagesWithRetry() {
  const attempts = process.env.VERCEL_ENV === "production" ? ATTEMPTS : 1;
  for (let i = 1; ; i++) {
    try {
      return await fetchImages();
    } catch (e) {
      console.warn(`og-pages: no images from ${archiveUrl}: ${e.message}`);
      if (i < attempts) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      } else if (process.env.VERCEL_ENV === "production" && e.status !== 404) {
        process.exit(1);
      } else {
        return;
      }
    }
  }
}

const hasImage = (name) => fs.existsSync(path.join(ogDir, name + ".jpg"));

// images rendered locally were already copied from public/og by vite
if (!hasImage("default")) await fetchImagesWithRetry();
const hasDefault = hasImage("default");

const escape = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// same as authorDisplayName in src/TransitionAuthorAndName.jsx
const authorDisplayName = (author) =>
  (author || "").replace(/[<(].*$/, "").trim() || author || "";

function block(t) {
  const author = authorDisplayName(t.author);
  const title = `${t.name} by ${author} – GL Transitions`;
  const description =
    t.description ||
    `A GL Transition by ${author}, free to use (${t.license}).`;
  const url = `${site}/transition/${t.name}`;
  const hasOwn = hasImage(t.name);
  const image = `${site}/og/${hasOwn ? t.name : "default"}.jpg`;
  const meta = (attr, key, value) =>
    `<meta ${attr}="${key}" content="${escape(value)}">`;
  return [
    `<title>${escape(title)}</title>`,
    meta("name", "description", description),
    `<link rel="canonical" href="${escape(url)}">`,
    meta("property", "og:site_name", "GL Transitions"),
    meta("property", "og:type", "website"),
    meta("property", "og:title", title),
    meta("property", "og:description", description),
    meta("property", "og:url", url),
    ...(hasOwn || hasDefault
      ? [
          meta("property", "og:image", image),
          meta("property", "og:image:width", "1200"),
          meta("property", "og:image:height", "630"),
          meta(
            "property",
            "og:image:alt",
            hasOwn ? `${t.name} transition` : "A GL Transition between two photos"
          ),
          meta("name", "twitter:card", "summary_large_image"),
        ]
      : [meta("name", "twitter:card", "summary")]),
  ].join("\n    ");
}

if (!hasDefault) {
  const shared = html
    .slice(start, end)
    .replace(/\s*<meta property="og:image[^>]*>/g, "")
    .replace("summary_large_image", "summary");
  fs.writeFileSync(path.join(dist, "index.html"), before + shared + END + after);
}

let count = 0;
for (const t of transitions) {
  if (!/^[A-Za-z0-9_]+$/.test(t.name)) {
    console.warn(`og-pages: skipping unsafe transition name "${t.name}"`);
    continue;
  }
  const page = before + block(t) + after;
  for (const dir of ["transition", "editor"]) {
    fs.mkdirSync(path.join(dist, dir), { recursive: true });
    fs.writeFileSync(path.join(dist, dir, t.name + ".html"), page);
  }
  count++;
}
console.log(`og-pages: wrote ${count} transition and editor pages`);
