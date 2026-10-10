# Moocsoft website

Static HTML deployed from this repository to GitHub Pages. Existing legal-policy URLs and app import pages are consumed by published apps; preserve their contents and routes when editing marketing pages.

## Editorial content

- Edit articles in `content/*.mjs`, then run `node scripts/build-guides.mjs`.
- Commit both source modules and generated HTML/sitemap changes.
- Each new article should specify its actual `published` date (`YYYY-MM-DD`). Set `modified` only for a substantive article revision; older articles retain their original publication date.
- The build refreshes guide totals, QuitBit reading lists and marketing-page favicon links. It does not edit legal pages.
- Update non-guide sitemap dates only when those pages change meaningfully.
- Health content must distinguish record-keeping from treatment, link to primary sources where appropriate, and avoid promising medical outcomes. Store links must reflect verified platform availability.
- High-intent guides may set `appPreview: true` to show the matching conversion block from `content/app-previews.mjs`. Use real public app screenshots, accurate captions and current purchase boundaries; do not imply unsupported features.
- `content/guide-media.mjs` registers original diagrams displayed in selected articles. The build uses each diagram consistently for Article, Open Graph, Twitter and image-sitemap metadata. Only images actually shown in an article belong in its sitemap entry.
- Link to trustworthy primary references in the paragraph they support, with descriptive anchor text and original explanations rather than copied passages. Editorial references are not paid links; do not mark all of them `nofollow`. References and images help readers, but do not guarantee search rankings, clicks or app installs.
- Add three deliberately chosen same-topic next reads in `content/related-guides.mjs` whenever publishing a guide. The build rejects missing, stale, self-linked or duplicate recommendations; the full topic hub remains accessible. Publication order must not decide the recommended reading path.
- `content/topics.mjs` separates editorial topics from the six-app catalogue. Development guides use a real service CTA and `/guides/development/`, not a fabricated app or store link. Their next steps may use the explicit development resources in `content/related-guides.mjs`; use `guideHref` for guide/resource cards and keep app-topic recommendations unchanged in meaning.
- A guide with an app preview may set `previewCopy: { heading, description }` to connect its task to the app. Screenshot assets, store destinations and purchase notes remain shared. Do not imply automatic imports from free web tools into the app.
- Article section navigation is a compact native menu before the answer on mobile and a sidebar on desktop. The small navigation script only sets its default when crossing the layout breakpoint; links and native expansion work without JavaScript. Layout changes alone do not reset article publication or revision dates.

## Free printable worksheets

The reverse 52-week chart, 100-envelope checklist and missing-number question sheet are free static website outputs in `assets/worksheets/`, separate from paid app features. Printable HTML is intentionally `noindex, follow`; the corresponding guide is the search destination. Browser printing needs no account, library or network request. Checkboxes are temporary and are not saved or imported into an app.

Edit `scripts/build-search-assets.mjs` (puzzle values live in `content/puzzle-worksheet.mjs`), make the development-only `sharp` package available, and run `node scripts/build-search-assets.mjs` before `node scripts/build-guides.mjs`. It emits deterministic CSV/HTML/native SVG files, 1200×675 PNG diagrams and 480/800/1200px WebP variants. No image library is loaded on the deployed site. Commit sources and generated outputs together.

Seven guides display original diagrams. Their `<picture>` elements use width-based WebP `srcset` and layout-matched `sizes`, with a crawlable PNG fallback, explicit dimensions, descriptive alt text and visible explanatory captions. PNG remains the representative Article/social/sitemap image; the browser chooses a smaller WebP when appropriate. These are illustrations and worked examples, not invented app screenshots. Keep below-the-fold images lazy-loaded; do not apply that rule blindly to above-the-fold or largest-content images.

## Free browser challenges and savings plans

The tools directory contains six free website tools. The math challenge's five original questions, hints and explanations live in `content/math-challenge.mjs`; `scripts/build-math-challenge.mjs` is included in the normal guide build. Questions and native answer disclosures work without JavaScript. The optional answer checker runs locally, keeps no saved score and sends no answers to Moocsoft. These exercises are not screenshots or levels from Math Riddles. Keep the current app store destinations and optional purchase boundaries explicit.

The 52-week calculator supports standard and reverse 13/26/52-week plans. In reverse mode the starting input means the final, smallest deposit; the displayed first deposit, cumulative chart, print view and CSV all use the same selected order. `?order=reverse` selects the public mode without putting private amounts in a URL. Changing any input invalidates the old export. Calculator outputs are planning examples, not bank transfers or automatic imports into Frugal.

## Brand assets

Frugal is the current name of the savings app (`com.moocsoft.goal_tracker`, App Store ID `6450431254`). Marketing copy, previews and store links use Frugal; the established `/savings-goal-tracker/` page, article slugs and public attribution labels remain stable. Current official artwork and its provenance are in `assets/apps/frugal/`. Do not use the previous icon/screenshots for new marketing copy or change historical legal routes as part of a rebrand.

Run `node scripts/test-frugal-brand.mjs` after rebuilding to check the current name, artwork, store identity, purchase boundaries and retained SEO routes across marketing pages and worksheets.

The website favicon is an original small-size Moocsoft monogram in `assets/brand/favicon.svg`. The full wordmark is intentionally not compressed into a tiny browser-tab icon.

To regenerate its PNG and ICO exports, make the development-only `sharp` package available, then run `node scripts/build-brand.cjs`. The outputs are the 16/32/48px root ICO, 96px PNG and 180px Apple touch icon. No image library is loaded by the deployed website.

## Local checks

Serve the repository with a static HTTP server. Check mobile and desktop layouts, top download buttons, local links, canonical URLs and structured data before pushing.

Run `node scripts/build-guides.mjs` followed by `node scripts/test-marketing.mjs` to check generated guide metadata, download links, preview assets and sitemap coverage without installing dependencies.

Run `node scripts/test-related-guides.mjs` for curated-reading coverage and invalid-configuration checks. With development-only Playwright, Chrome and a static server on port 4197, run `node scripts/test-guide-navigation.cjs` for mobile/desktop, no-JavaScript navigation, next reads, verified app previews and calculator quick answers. `MOOCSOFT_TEST_URL` overrides the port; `MOOCSOFT_QA_DIR` saves screenshots outside the public repository.

Run `node scripts/test-service-guides.mjs` to check that app guides retain their install headers and download blocks while development articles/hubs have service-only CTAs, real resource destinations, reciprocal links and sitemap entries.

Run `node scripts/test-search-assets.mjs` to verify exact worksheet arithmetic, CSV rows, privacy boundaries and diagram dimensions. With development-only Playwright plus Chrome and a local server on port 4195, run `node scripts/test-search-worksheets.cjs` for mobile/desktop, no-JavaScript and print-mode checks. `MOOCSOFT_TEST_URL` overrides the port; optional `MOOCSOFT_QA_DIR` saves screenshots outside the repository.

Run `node scripts/test-guide-images.cjs` with the same development-only browser setup and a server on port 4196 to check all seven diagrams at mobile/desktop widths and 1×/2× pixel densities, PNG fallback, no-JavaScript rendering and top store buttons. `MOOCSOFT_TEST_URL` overrides the server; `MOOCSOFT_QA_DIR` keeps screenshots outside the public repository. Static image tests check every WebP's file header, dimensions and size against the PNG fallback.

Run `node scripts/test-store-attribution.mjs` for static Google Play campaign labels. The builder tags only known app-store anchors with the public source (`moocsoft`), page and placement; canonical/schema store URLs remain unchanged. No cookies, visitor IDs, calculator inputs or new analytics requests are added. In Play Console, use the Ads and referrals traffic source and UTM source/campaign filters. Store-page visits and Install/Open button clicks are not completed installs; review acquisition reports separately.

Run `node scripts/test-click-calculations.cjs` for exact-cent savings plans and CSV values. With a local static server on port 4193 and development-only `playwright` plus Chrome available, run `node scripts/test-click-tools.cjs` for mobile/desktop calculator, download, print and timer checks. Set `MOOCSOFT_TEST_URL` to use another local port. These tests add no browser library to the deployed website.

Run `node scripts/test-math-challenge.mjs` to independently verify the five answers, input parsing and static page boundaries. With the same local browser setup, run `node scripts/test-math-challenge-browser.cjs` for answer checks, reset, no-JavaScript answers and narrow-screen layouts. `MOOCSOFT_QA_DIR` stores optional screenshots outside the public repository.

Run `node scripts/test-round-robin.mjs` after the guide build to independently enumerate the match-count examples and check the six-player schedule, original question answers, product boundaries and incoming reading link.

Run `node scripts/test-discovery.cjs` with the same development-only browser setup and a server on port 4194 to check all six app choices/store directories, product headers, real Did You Lift screens, Habit Tracker check-ins, macro validation and static attribution. Set `MOOCSOFT_TEST_URL` for another port; optional `MOOCSOFT_QA_DIR` saves visual checks outside the published repository.

With a local server running on port 4183 and the development-only `playwright` package plus Chrome available, run `node scripts/test-quitbit.cjs`. Set `MOOCSOFT_TEST_URL` for a different local port. The test uses an isolated browser profile and fixed time to check arithmetic, validation, stale results, article metadata and favicon responses.

The quit-smoking calculator uses elapsed time and the previous smoking-cost baseline. Seven-, 30-, 90- and 365-day figures are complete-period projections, not additions to savings so far. Inputs stay in the browser and are not stored or synced to QuitBit. Editing an input hides the previous result until recalculation.

The cigarette-cost guide also has a quick calculator that needs no quit date. Its month/year labels mean 30/365 days, and longer-period totals use unrounded daily costs. Savings charts and workout CSV downloads are free web-tool outputs, separate from paid app features. Editing calculator inputs invalidates the previous output before export.
