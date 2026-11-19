export const covers = {
  '/gta-6-save-gameplay-clips-ps5/': ['controls', 'A white controller on a convertible beside the beach'],
  '/gta-6-ps5-storage-usb-m2/': ['download', 'A network cable and router on a neon-lit desk'],
  '/gta-6-controls/': ['controls', 'A white controller on a convertible beside the beach'],
  '/gta-6-ps5-languages/': ['languages', 'Headphones and a phrasebook in a coastal recording studio'],
  '/gta-6-download-time/': ['download', 'A network cable and router on a neon-lit desk'],
  '/gta-6-ps5-code-in-box/': ['voucher', 'A voucher insert inside an open game case'],
  '/gta-6-character-guide/': ['characters', 'An imagined waterfront music scene in a Florida marina']
};

export function coverPath(path) {
  return '/assets/gta-covers/' + covers[path][0] + '.webp';
}

export function coverFigure(path) {
  const [key, alt] = covers[path];
  return `<figure class="field-cover"><img src="${coverPath(path)}" srcset="/assets/gta-covers/${key}-640.webp 640w, ${coverPath(path)} 1200w" sizes="(max-width: 800px) 95vw, 850px" width="1200" height="800" fetchpriority="high" alt="${alt}"><figcaption>Moocsoft · AI-assisted editorial illustration</figcaption></figure>`;
}

export function coverMeta(path, title, description) {
  return `<link rel="stylesheet" href="/assets/gta-field.css">
<meta property="og:image" content="https://moocsoft.net${coverPath(path)}">
<meta property="og:image:alt" content="${covers[path][1]}">
<meta name="twitter:card" content="summary_large_image">
${path === '/gta-6-controls/' ? '' : `<meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:type" content="article"><meta property="og:url" content="https://moocsoft.net${path}">`}`;
}
