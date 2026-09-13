# Moocsoft website

Static HTML deployed from this repository to GitHub Pages. Existing legal-policy URLs and app import pages are consumed by published apps; preserve their contents and routes when editing marketing pages.

## Editorial content

- Edit articles in `content/*.mjs`, then run `node scripts/build-guides.mjs`.
- Commit both source modules and generated HTML/sitemap changes.
- Each new article should specify its actual `published` date (`YYYY-MM-DD`). Set `modified` only for a substantive article revision; older articles retain their original publication date.
- The build refreshes guide totals, QuitBit reading lists and marketing-page favicon links. It does not edit legal pages.
- Update non-guide sitemap dates only when those pages change meaningfully.
- Health content must distinguish record-keeping from treatment, link to primary sources where appropriate, and avoid promising medical outcomes. Store links must reflect verified platform availability.

## Brand assets

The website favicon is an original small-size Moocsoft monogram in `assets/brand/favicon.svg`. The full wordmark is intentionally not compressed into a tiny browser-tab icon.

To regenerate its PNG and ICO exports, make the development-only `sharp` package available, then run `node scripts/build-brand.cjs`. The outputs are the 16/32/48px root ICO, 96px PNG and 180px Apple touch icon. No image library is loaded by the deployed website.

## Local checks

Serve the repository with a static HTTP server. Check mobile and desktop layouts, top download buttons, local links, canonical URLs and structured data before pushing.

With a local server running on port 4183 and the development-only `playwright` package plus Chrome available, run `node scripts/test-quitbit.cjs`. Set `MOOCSOFT_TEST_URL` for a different local port. The test uses an isolated browser profile and fixed time to check arithmetic, validation, stale results, article metadata and favicon responses.

The quit-smoking calculator uses elapsed time and the previous smoking-cost baseline. Seven-, 30-, 90- and 365-day figures are complete-period projections, not additions to savings so far. Inputs stay in the browser and are not stored or synced to QuitBit. Editing an input hides the previous result until recalculation.
