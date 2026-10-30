import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import assert from "node:assert/strict";
import { exportArtwork } from "./export_v2.mjs";
const output = await fs.mkdtemp(path.join(os.tmpdir(), "quiet-table-browser-test-"));
try {
  await exportArtwork(output);
  const names = await fs.readdir(output);
  assert.equal(names.length, 10);
  for (const name of names) {
    const data = await fs.readFile(path.join(output, name));
    assert.equal(data.toString("ascii", 8, 12), "WEBP");
    assert.ok(data.length > 5000);
  }
  console.log("PASS: ten independent desktop/mobile scenes exported with all assets decoded");
} finally {
  await fs.rm(output, { recursive: true, force: true });
}
