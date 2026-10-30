import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import http from "node:http";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { once } from "node:events";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const SCENES = {
  hero: "scene hero",
  nova: "scene nova",
  tile: "scene tile-scene",
  arrow: "scene arrow-scene",
  outro: "outro",
};
export function sceneDocuments(source) {
  const css = source.match(/<style>([\s\S]*?)<\/style>/)?.[1];
  if (!css) throw new Error("Preview stylesheet is missing");
  return Object.fromEntries(
    Object.entries(SCENES).map(([name, classes]) => {
      const section = source.match(new RegExp(`<section class="${classes}">[\\s\\S]*?<\\/section>`))?.[0];
      if (!section) throw new Error(`Preview scene is missing: ${name}`);
      return [name, { css, section }];
    }),
  );
}
export async function exportArtwork(output) {
  const { chromium } = await import("playwright");
  const source = await fs.readFile(path.join(root, "preview-v2.html"), "utf8");
  const documents = sceneDocuments(source);
  const staging = await fs.mkdtemp(path.join(os.tmpdir(), "quiet-table-export-"));
  const server = http.createServer(async (req, res) => {
    try {
      if (req.url === "/") {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end('<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>');
        return;
      }
      const name = decodeURIComponent(new URL(req.url, "http://localhost").pathname).slice(1);
      if (name.split("/").some((part) => part.startsWith(".") || part.includes("\\"))) {
        res.writeHead(403);
        res.end();
        return;
      }
      const file = path.resolve(root, name);
      if (!file.startsWith(root + path.sep)) {
        res.writeHead(403);
        res.end();
        return;
      }
      const types = {
        ".webp": "image/webp",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".ttf": "font/ttf",
        ".woff2": "font/woff2",
      };
      const type = types[path.extname(file)];
      if (!type) {
        res.writeHead(404);
        res.end();
        return;
      }
      const real = await fs.realpath(file);
      if (!real.startsWith(root + path.sep)) {
        res.writeHead(403);
        res.end();
        return;
      }
      res.setHeader("Content-Type", type);
      res.end(await fs.readFile(real));
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  let browser;
  try {
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const origin = `http://127.0.0.1:${server.address().port}/`;
    browser = await chromium.launch({
      headless: true,
      ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}),
    });
    for (const mobile of [false, true]) {
      for (const [name, { css, section }] of Object.entries(documents)) {
        const page = await browser.newPage({
          viewport: { width: mobile ? 390 : 1440, height: 1200 },
          deviceScaleFactor: mobile ? 2 : 1,
          reducedMotion: "reduce",
        });
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.goto(origin);
        await page.setContent(
          `<!doctype html><html lang="en"><head><meta charset="utf-8"><base href="${origin}"><style>${css}.scene-links,.outro nav{display:none!important}</style></head><body><main>${section}</main></body></html>`,
        );
        await page.evaluate(() => document.fonts.ready);
        const fontsLoaded = await page.evaluate(
          () => document.fonts.check("16px Bricolage") && document.fonts.check("16px Mono"),
        );
        if (!fontsLoaded) throw new Error(`${name}: local fonts did not load`);
        const loaded = await page.evaluate(async () => {
          await Promise.all([...document.images].map((image) => image.decode()));
          return [...document.images].every((image) => image.naturalWidth > 0);
        });
        if (!loaded || errors.length) throw new Error(`${name}: source assets did not load`);
        const image = await page.locator("main").screenshot({ type: "png" });
        const webp = await page.evaluate(async (encoded) => {
          const source = new Image();
          source.src = "data:image/png;base64," + encoded;
          await source.decode();
          const canvas = document.createElement("canvas");
          canvas.width = source.naturalWidth;
          canvas.height = source.naturalHeight;
          canvas.getContext("2d").drawImage(source, 0, 0);
          return canvas.toDataURL("image/webp", 0.94).split(",")[1];
        }, image.toString("base64"));
        const filename = `quiet-${name}${mobile ? "-mobile" : ""}.webp`;
        await fs.writeFile(path.join(staging, filename), Buffer.from(webp, "base64"));
        console.log(`Rendered ${filename}`);
        await page.close();
      }
    }
    // Render and decode every scene before replacing any published image.
    await fs.mkdir(output, { recursive: true });
    for (const name of await fs.readdir(staging))
      await fs.copyFile(path.join(staging, name), path.join(output, name));
  } finally {
    if (browser) await browser.close();
    if (server.listening) await new Promise((resolve) => server.close(resolve));
    await fs.rm(staging, { recursive: true, force: true });
  }
}
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const { values } = parseArgs({ options: { output: { type: "string" }, help: { type: "boolean" } } });
  if (values.help)
    console.log(
      "Usage: node tools/export_v2.mjs [--output DIRECTORY]\nRun npm ci and npx playwright install chromium first.",
    );
  else await exportArtwork(path.resolve(values.output || path.join(root, "profile/assets/v2")));
}
