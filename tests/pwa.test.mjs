import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../docs/", import.meta.url);
const read = (name) => readFileSync(new URL(name, root), "utf8");

test("PWA manifest has installable image sizes", () => {
  const manifest = JSON.parse(read("manifest.webmanifest"));
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url, "./");
  const images = manifest.icons.filter((icon) => icon.type === "image/png");
  assert.deepEqual(images.map((icon) => icon.sizes), ["192x192", "512x512"]);
  for (const icon of images) {
    assert.ok(existsSync(new URL(icon.src, root)), icon.src);
    const png = readFileSync(new URL(icon.src, root));
    assert.equal(png.subarray(1, 4).toString(), "PNG");
    const expectedSize = parseInt(icon.sizes, 10);
    assert.equal(png.readUInt32BE(16), expectedSize);
    assert.equal(png.readUInt32BE(20), expectedSize);
  }
});

test("all service worker precache files exist", () => {
  const sw = read("sw.js");
  const listText = sw.match(/const PRECACHE = \[([\s\S]*?)\];/);
  assert.ok(listText, "offline precache must exist");
  const matches = [...listText[1].matchAll(/"\.(?:\/([^"]*))?"/g)];
  assert.ok(matches.length >= 8);
  for (const match of matches) {
    const name = match[1] || "index.html";
    assert.ok(existsSync(new URL(name, root)), name);
  }
});

test("all HTML assets are local to the published directory", () => {
  const html = read("index.html");
  for (const filename of ["styles.css", "app.js", "manifest.webmanifest", "apple-touch-icon.png"]) {
    assert.ok(html.includes("./" + filename), filename);
    assert.ok(existsSync(new URL(filename, root)), filename);
  }
  assert.ok(!/<script[^>]+src=["']https?:/i.test(html), "scripts should not depend on the internet");
});
