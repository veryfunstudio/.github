# The Quiet Table assets

`profile/README.md` is the published organization profile. `preview-v2.html` is its complete visual study, including navigation and links supplied as text in the README.

## Source material

Game imagery comes from the existing VeryFun Studio website repository and its public store materials. No generated replacement game art is used.

- `preview-assets/nova-key-art.webp`: `public/screenshots/nova-mahjong/01-key-art.webp`.
- `preview-assets/tile-key-art.webp`: `public/screenshots/tile-journey/01-key-art.webp`.
- `preview-assets/arrow-screen.jpg`: `public/screenshots/arrow-out/02-sailboat.jpg`.
- `concept-v2-assets/tile_dragon_red.png`, `tile_bamboo_3.png`, and `tile_flower_chrysanthemum.png`: transparent mahjong-tile components from the existing game material.
- `concept-v2-assets/bricolage.ttf` and `bricolage-OFL.txt`: Bricolage Grotesque from `google/fonts/ofl/bricolagegrotesque`.
- `preview-assets/dm-mono-400.woff2` and its license record: DM Mono from the website's existing self-hosted font collection.

## Publication artwork

`tools/export_v2.mjs` renders each scene as an independent GitHub-compatible image using the zero-dependency CDP helper from `033_zcode-inspector`. Run it with Node 24.22.1. It starts its own local servers, verifies image decoding, and uses unique page URLs to avoid navigation-cache mixing.

- `profile/assets/v2/quiet-{hero,nova,tile,arrow,outro}{,-mobile}.webp`: composed scene images.
- Mobile artwork is laid out at 390 CSS pixels and exported at 2x resolution rather than cropped from the desktop scene.
- Buttons and navigation are removed from exported images. The README supplies actual project, Google Play, Studio Notes, and contact links.
- The profile uses a consistent brand treatment with no live activity, sales numbers, awards, or generated game screenshots.
