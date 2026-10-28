# Preview asset provenance

`preview.html` is a local visual study for the organization profile, not the published GitHub README.

All game imagery and the studio monogram were copied from the existing VeryFun Studio website repository. The website documents the game images as public Google Play store assets; no replacement or generated game art is used.

Source root: `/Users/advance/Documents/020_veryfunstudio.github.io/public/`

- `studio-mark.png`: `brand/veryfun-studio-avatar-v2.png`.
- `nova-key-art.webp`, `tile-key-art.webp`, `arrow-key-art.webp`: the corresponding `screenshots/<game>/01-key-art.webp` files.
- `nova-screen.jpg`: `screenshots/nova-mahjong/02-felt-board.jpg`.
- `tile-screen.jpg`: `screenshots/tile-journey/02-fruit-valley.jpg`.
- `arrow-screen.jpg`: `screenshots/arrow-out/02-sailboat.jpg`.
- Only the images referenced by the current preview are retained; unused duplicates from the source gallery are not copied into this study.
- Space Grotesk, DM Sans, DM Mono and Instrument Serif font files come from `public/fonts/` in the same source repository. Their embedded license records are included beside each font file; retain the upstream copyright and license notices when promoting these files to permanent assets.

The Google Play developer URL in the preview is the verified `Veryfun+Studio` destination. The previous `songxugang` destination returned 404 on 2026-10-28.

## The Quiet Table / v2

`preview-v2.html` is the complete visual study. `profile/README.v2.md` is the proposed GitHub release draft, not the published organization profile. `tools/export_v2.mjs` renders each scene as an independent GitHub-compatible image using the zero-dependency CDP helper from `033_zcode-inspector`. It starts its own local servers, verifies image decoding, and uses unique page URLs to avoid navigation-cache mixing.

- `concept-v2-assets/bricolage.ttf` and `bricolage-OFL.txt`: Bricolage Grotesque from `google/fonts/ofl/bricolagegrotesque`, under the included OFL license.
- `concept-v2-assets/tile_dragon_red.png`, `tile_character_5.png`, `tile_bamboo_3.png`, `tile_dot_6.png`, `tile_flower_chrysanthemum.png`, and `tile_flower_orchid.png`: real transparent mahjong-tile components from the existing game material, not replacement illustrations.
- `profile/assets/v2/quiet-{hero,nova,tile,arrow,outro}{,-mobile}.webp`: composed scene images. Mobile artwork is laid out at 390 CSS pixels and exported at 2x resolution, rather than cropping the desktop scene.
- Buttons and navigation are removed from exported images. The release draft supplies actual project, Google Play, Studio Notes, and contact links as accessible text.
- The profile remains fixed-dark; no fake live activity, sales numbers, awards, or generated game screenshots are included.

Regenerate with `tools/export_v2.mjs` using Node 24.22.1; no separately started asset server is required.
