# Organization profile and retained study assets

`profile/README.md` and `profile/README.zh-CN.md` publish the current bilingual
organization profile. Their images are in `assets/veryfun-20261029/`:

- `studio-{light,dark}-{desktop,mobile}.svg`: decorative studio masthead, explicitly labelled as illustration rather than gameplay.
- `{nova,tile,arrow}-feature.svg`: desktop product preview compositions retained from the published profile update.
- `{nova,tile,arrow}-gameplay.jpg`: corresponding mobile product previews.

The profile text describes their source and limitations; these are not new device
captures made during this cleanup. The source bytes and presentation are retained.
`assets-manifest.json` records their hashes and checks that both language editions
reference the same art and destinations.

`preview-v2.html` is the earlier Quiet Table study. Its sources and exporter below
remain available for reproduction, independently of the current profile.

## Source material

Game imagery comes from the existing VeryFun Studio website repository and its public store materials. No generated replacement game art is used.

- `preview-assets/nova-key-art.webp`: `public/screenshots/nova-mahjong/01-key-art.webp`.
- `preview-assets/tile-key-art.webp`: `public/screenshots/tile-journey/01-key-art.webp`.
- `preview-assets/arrow-screen.jpg`: `public/screenshots/arrow-out/02-sailboat.jpg`.
- `concept-v2-assets/tile_dragon_red.png`, `tile_bamboo_3.png`, and `tile_flower_chrysanthemum.png`: transparent mahjong-tile components from the existing game material.
- `concept-v2-assets/bricolage.ttf` and `bricolage-OFL.txt`: Bricolage Grotesque from `google/fonts/ofl/bricolagegrotesque`.
- `preview-assets/dm-mono-400.woff2` and its license record: DM Mono from the website's existing self-hosted font collection.

## Retained Quiet Table exports

`tools/export_v2.mjs` renders each scene as an independent GitHub-compatible image using this repository's pinned Playwright. Run it with Node 24.22.1 after `npm ci` and `npx playwright install chromium`. It owns an ephemeral loopback server, waits for local fonts and image decoding, and uses a fresh browser page per scene. No sibling repo or machine-specific helper is required.

- `profile/assets/v2/quiet-{hero,nova,tile,arrow,outro}{,-mobile}.webp`: composed scene images.
- Mobile artwork is laid out at 390 CSS pixels and exported at 2x resolution rather than cropped from the desktop scene.
- Buttons and navigation are removed from exported images. The README supplies actual project, Google Play, Studio Notes, and contact links.
- The profile uses a consistent brand treatment with no live activity, sales numbers, awards, or generated game screenshots.
