export const languagePath = '/gta-6-ps5-languages/';
const title = 'GTA 6 PS5 languages: voice acting and on-screen text';
const description = 'Which languages can you hear or read in GTA 6 on PS5? Check the English audio, Spanish text variants and whether Turkish is listed.';
const url = 'https://moocsoft.net' + languagePath;

export function languagePage() {
  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    datePublished: '2026-11-18',
    mainEntityOfPage: url,
    author: {'@type': 'Organization', name: 'Moocsoft', url: 'https://moocsoft.net/'}
  };
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} | Moocsoft</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${url}">
<link rel="stylesheet" href="/assets/gta6-controls.css">
<script type="application/ld+json">${JSON.stringify(article)}</script>
</head><body>
<a class="skip" href="#main">Skip to language list</a>
<header><a class="brand" href="/">moocsoft</a><a href="/gta-6-controls/">GTA 6 player guide</a></header>
<main id="main"><article>
<h1>Which languages does GTA 6 support on PS5?</h1>
<p class="intro">English is the only voice language in PlayStation’s US support table. The table lists 12 on-screen text options, counting the two Spanish variants and the two Chinese scripts separately.</p>
<dl class="places">
<div><dt>Voice and text</dt><dd>English</dd></div>
<div><dt>Other Latin and Cyrillic text options</dt><dd>French, German, Italian, Polish, Russian, Brazilian Portuguese, Spanish (Mexico) and Spanish (Spain).</dd></div>
<div><dt>East Asian text options</dt><dd>Korean, Simplified Chinese and Traditional Chinese.</dd></div>
</dl>
<h2>Can I hear Spanish dialogue?</h2>
<p>If you want to follow the story in Spanish, look for your preferred written variant. Both Mexican Spanish and European Spanish appear in the text column. For either choice, expect English voice acting.</p>
<h2>Does GTA 6 have Turkish subtitles?</h2>
<p>Turkish is absent from both columns of the US PS5 list. If Turkish subtitles matter to your purchase, check the language details for the specific edition in your regional PlayStation Store before buying.</p>
<h2>What does “text” cover?</h2>
<p>PlayStation groups written language support under one heading. Its table does not break out menus, dialogue subtitles and captions for sound effects individually. If you need captions for a particular sound cue, the language list alone cannot confirm that feature.</p>
<p>Source checked November 18, 2026. <a href="https://www.playstation.com/en-us/support/games/gta-vi-support/">See PlayStation’s GTA VI language table</a>.</p>
<p><a href="/gta-6-controls/">Next: find the PS5 map, pause and driving controls →</a></p>
</article></main><footer><a href="/editorial-policy/">Editorial policy</a><a href="/contact/">Suggest a correction</a></footer>
</body></html>`;
}
