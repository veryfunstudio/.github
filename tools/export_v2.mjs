import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { launch } from '../../033_zcode-inspector/scripts/cdp.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'profile/assets/v2');
const source = await fs.readFile(path.join(root, 'preview-v2.html'), 'utf8');
const css = source.match(/<style>([\s\S]*?)<\/style>/)[1];
const sections = {
  hero: source.match(/<section class="scene hero">[\s\S]*?<\/section>/)[0],
  nova: source.match(/<section class="scene nova">[\s\S]*?<\/section>/)[0],
  tile: source.match(/<section class="scene tile-scene">[\s\S]*?<\/section>/)[0],
  arrow: source.match(/<section class="scene arrow-scene">[\s\S]*?<\/section>/)[0],
  outro: source.match(/<section class="outro">[\s\S]*?<\/section>/)[0],
};
const documentFor = (body, id = '') => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="http://127.0.0.1:9766/020_veryfunstudio-dotgithub/"><style>${css}.scene-links,.outro nav{display:none!important}</style></head><body><main data-export="${id}">${body}</main></body></html>`;

const sourceServer = spawn('python3', ['-m', 'http.server', '9766', '--bind', '127.0.0.1', '--directory', path.resolve(root, '..')], { stdio: 'ignore' });
const previewServer = spawn('python3', ['-m', 'http.server', '9476', '--bind', '127.0.0.1', '--directory', '/tmp'], { stdio: 'ignore' });
const servers = [sourceServer, previewServer];
const onExit = () => servers.forEach(server => server.kill());
process.once('exit', onExit);
try {
  for (const url of ['http://127.0.0.1:9766/020_veryfunstudio-dotgithub/preview-v2.html', 'http://127.0.0.1:9476/quiet-table-v2-export.html']) {
    for (let attempt = 0; attempt < 30; attempt += 1) {
      try { if ((await fetch(url)).ok) break; } catch { /* wait for the local server */ }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  const browser = await launch({ port: 9473, profile: 'quiet-table-v2-export', size: [1440, 1000] });
  try {
  await fs.mkdir(out, { recursive: true });
  for (const mobile of [false, true]) {
    const layoutWidth = mobile ? 390 : 1440;
    for (const [name, section] of Object.entries(sections)) {
      await browser.send('Emulation.setDeviceMetricsOverride', { width: layoutWidth, height: 1200, deviceScaleFactor: mobile ? 2 : 1, mobile: false });
      const documentId = `${name}${mobile ? '-mobile' : ''}`;
      await fs.writeFile('/tmp/quiet-table-v2-export.html', documentFor(section, documentId));
      await browser.goto(`http://127.0.0.1:9476/quiet-table-v2-export.html?${documentId}`, `main[data-export="${documentId}"]`);
      await browser.evaluate('document.fonts.ready');
      const imageState = await browser.evaluate('Promise.all([...document.images].map(async img => {try { await img.decode(); } catch (error) { return {src: img.currentSrc, error: String(error)}; } return {src: img.currentSrc, loaded: img.complete && img.naturalWidth > 0}; }))');
      if (imageState.some(img => !img.loaded)) throw new Error(`${name}${mobile ? ' mobile' : ''}: ${JSON.stringify(imageState)}`);
      await browser.evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
      const height = await browser.evaluate('Math.ceil(document.querySelector("main").getBoundingClientRect().height)');
      await browser.send('Emulation.setDeviceMetricsOverride', { width: layoutWidth, height, deviceScaleFactor: mobile ? 2 : 1, mobile: false });
      const capture = await browser.send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: layoutWidth, height, scale: 1 }, captureBeyondViewport: true });
      const shot = Buffer.from(capture.data, 'base64');
      const webp = await browser.evaluate(`(async()=>{const img=new Image();img.src='data:image/png;base64,${shot.toString('base64')}';await img.decode();const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;c.getContext('2d').drawImage(img,0,0);return c.toDataURL('image/webp',0.94).split(',')[1]})()`);
      const filename = `quiet-${name}${mobile ? '-mobile' : ''}.webp`;
      await fs.writeFile(path.join(out, filename), Buffer.from(webp, 'base64'));
      console.log(filename, (await fs.stat(path.join(out, filename))).size);
    }
  }
} finally {
  await browser.close();
}
} finally {
  servers.forEach(server => server.kill());
  process.off('exit', onExit);
}
