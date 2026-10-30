# VeryFun Studio organization profile

`profile/README.md` is the published English organization landing page, with
`profile/README.zh-CN.md` beside it. Its ten responsive light/dark and game-preview
assets live in `assets/veryfun-20261029/`. These newer remote profile commits are
preserved unchanged. Text links remain native, accessible GitHub links.

`preview-v2.html` and `profile/assets/v2/` retain the earlier Quiet Table visual
study. Its exporter is independent from the current bilingual profile; running
it does not replace the current profile artwork.

## Verify and export

Node is pinned in `.nvmrc`. Asset and source checks need no npm install:

```sh
npm run check
```

Export uses the repository's own pinned Playwright, with no sibling repository
or fixed local port. Install its browser once:

```sh
npm ci
npx playwright install chromium
npm run test:browser                 # export all ten scenes into a temporary directory
npm run export -- --output /tmp/quiet-table-review
```

Review desktop and mobile study scenes before using `npm run export` to replace
only the retained `profile/assets/v2/` study images. `CHROME_PATH` can select an existing Chrome installation.
The exporter loads local fonts and decodes every image, renders all scenes in
isolation, and only copies results after every scene succeeds. Temporary files,
servers and browser sessions are closed on completion or failure.

`assets-manifest.json` records the current source and published artwork hashes;
it is an inventory, not a claim that an older image was rendered by a newer tool.
After intentional changes and visual review, refresh it with:

```sh
node tools/check.mjs --write-manifest
npm run check
```

CI checks both profile languages and the committed inventory, then independently exports all ten study scenes into
temporary storage. It never overwrites published artwork during tests. Source
material and licences are described in [ASSETS.md](ASSETS.md).

`SECURITY.md` supplies the organization's existing default reporting policy.
This cleanup does not change organization settings or other repositories.
