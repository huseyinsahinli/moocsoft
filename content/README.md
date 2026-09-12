# English guides

The site is static and remains compatible with GitHub Pages. Generated HTML is committed so visitors and crawlers receive all article text, internal links and store links without JavaScript.

- `apps.mjs`: verified app/store destinations, topic copy and reference URLs.
- `nutrition.mjs`, `savings.mjs`, `quitting.mjs`, `training.mjs`, `habits.mjs`: original English articles, examples, tables and visible FAQs.
- `components.mjs`: shared navigation, install links, article cards and metadata.
- `../assets/content.css`: marketing-only styles; legal and workout import pages do not include this stylesheet.
- `../scripts/build-guides.mjs`: produces `/guides/`, five topic pages, twenty articles and their sitemap entries.

Regenerate from the repository root with `node scripts/build-guides.mjs`. No third-party packages are required. Re-running the command without changes produces the same files. The original app and tool landing pages remain ordinary HTML; their related-guide sections should be updated if the reading lists change.

Use unique article slugs and a specific reader task for each article. Keep calculations labeled as examples, distinguish app features from free-tool behavior, and verify store availability before changing platform claims. Publication dates should change only when the relevant content actually changes; when adding future editions, extend the generator to carry per-article publication and modification dates.

Privacy policies, terms, account deletion pages, `.well-known` files and workout import behavior are outside this content generator. No tracking scripts, cookies or redirects are added by these components.
