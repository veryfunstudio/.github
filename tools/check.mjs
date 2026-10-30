import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { SCENES, sceneDocuments } from "./export_v2.mjs";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const sha = (data) => createHash("sha256").update(data).digest("hex");
export function localReferences(text) {
  return [...text.matchAll(/(?:src|srcset)="([^"]+)"|url\(['"]?([^)'"\s]+)['"]?\)/g)]
    .map((match) => match[1] || match[2])
    .filter((value) => !/^(?:https?:|data:)/.test(value));
}
export async function inventory() {
  const english = await fs.readFile(path.join(root, "profile/README.md"), "utf8");
  const chinese = await fs.readFile(path.join(root, "profile/README.zh-CN.md"), "utf8");
  const preview = await fs.readFile(path.join(root, "preview-v2.html"), "utf8");
  sceneDocuments(preview);
  const assetsFor = (text) => localReferences(text).sort();
  if (JSON.stringify(assetsFor(english)) !== JSON.stringify(assetsFor(chinese)))
    throw new Error("Bilingual profiles must use the same artwork");
  const destinations = (text) =>
    [...text.matchAll(/(?:href="|\]\()((?:https:|mailto:)[^"\s)]+)/g)].map((match) => match[1]).sort();
  if (JSON.stringify(destinations(english)) !== JSON.stringify(destinations(chinese)))
    throw new Error("Bilingual profile destinations have drifted");
  for (const text of [english, chinese])
    for (const match of text.matchAll(/<img\b([^>]+)>/g))
      if (!/alt="[^"]+"/.test(match[1])) throw new Error("Profile image needs descriptive alt text");
  const paths = new Set([
    "preview-v2.html",
    "profile/README.md",
    "profile/README.zh-CN.md",
    "concept-v2-assets/bricolage-OFL.txt",
    "preview-assets/dm-mono-400-license.txt",
  ]);
  for (const [text, base] of [
    [english, "profile"],
    [chinese, "profile"],
    [preview, ""],
  ])
    for (const name of localReferences(text)) {
      const target = path.resolve(root, base, name);
      if (!target.startsWith(root + path.sep)) throw new Error(`External local asset: ${name}`);
      paths.add(path.relative(root, target));
    }
  // Quiet Table is a retained visual study, independent from the current bilingual profile.
  for (const name of Object.keys(SCENES))
    for (const suffix of ["", "-mobile"]) paths.add(`profile/assets/v2/quiet-${name}${suffix}.webp`);
  if (assetsFor(english).length !== 10)
    throw new Error("Expected ten responsive assets in the current profile");
  const result = {};
  for (const name of [...paths].sort()) {
    const file = path.join(root, name),
      data = await fs.readFile(file);
    if ((await fs.lstat(file)).isSymbolicLink()) throw new Error(`Linked asset is not portable: ${name}`);
    if (!data.length) throw new Error(`Empty asset: ${name}`);
    if (
      name.endsWith(".webp") &&
      (data.toString("ascii", 0, 4) !== "RIFF" || data.toString("ascii", 8, 12) !== "WEBP")
    )
      throw new Error(`Invalid WebP: ${name}`);
    result[name] = sha(data);
  }
  return result;
}
export async function check() {
  const actual = await inventory();
  const saved = JSON.parse(await fs.readFile(path.join(root, "assets-manifest.json"), "utf8"));
  if (JSON.stringify(actual) !== JSON.stringify(saved))
    throw new Error(
      "Artwork/source inventory changed. Review the files, then run node tools/check.mjs --write-manifest.",
    );
  console.log(
    `PASS: ${Object.keys(actual).length} source/artwork files, bilingual profile links, current artwork, retained study images and font licences`,
  );
}
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  if (process.argv.includes("--write-manifest"))
    await fs.writeFile(
      path.join(root, "assets-manifest.json"),
      JSON.stringify(await inventory(), null, 2) + "\n",
    );
  else await check();
}
