import test from "node:test";
import assert from "node:assert/strict";
import { sceneDocuments } from "./export_v2.mjs";
import { localReferences, inventory } from "./check.mjs";
test("export fails before opening a browser when a source scene is missing", () => {
  assert.throws(
    () => sceneDocuments('<style>body{}</style><section class="scene hero"></section>'),
    /missing: nova/,
  );
  assert.throws(() => sceneDocuments("<section></section>"), /stylesheet/);
});
test("asset references cover HTML images and local font files", () => {
  assert.deepEqual(
    localReferences(
      '<img src="image.webp"><style>src:url(\'font.woff2\')</style><img src="https://example.com/remote.png">',
    ),
    ["image.webp", "font.woff2"],
  );
});
test("published bilingual art and retained study exports remain portable", async () => {
  const files = await inventory();
  assert.equal(Object.keys(files).filter((name) => name.startsWith("profile/assets/")).length, 10);
});
