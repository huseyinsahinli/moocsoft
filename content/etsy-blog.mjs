import { site, escape as e } from './apps.mjs';
import { footer, head } from './components.mjs';

export const etsyShop = 'https://www.etsy.com/shop/MoocsoftPaper';

const products = {
  'perfect-february': {
    name: 'Perfect February 2027',
    image: '/assets/etsy/perfect-february',
    alt: 'Perfect February cover showing the monthly calendar, weekly planner and habit tracker',
    summary: 'A Monday-start calendar, four dated weekly pages, a 28-day habit tracker and a month-end review.',
    url: 'https://www.etsy.com/listing/4623183132/february-2027-calendar-and-4-week',
  },
  'new-year-kit': {
    name: '2027 New Year Printable Kit',
    image: '/assets/etsy/new-year-kit',
    alt: 'New Year kit cover showing two greeting cards, a 2027 calendar and a goals page',
    summary: 'Four greeting cards, a year-at-a-glance calendar, a goals page and four cut-out goal cards.',
    url: 'https://www.etsy.com/listing/4623143251/2027-new-year-printable-kit-with',
  },
};

const posts = [{
  slug: 'moocsoft-paper-on-etsy',
  title: 'Introducing Moocsoft Paper on Etsy',
  description: 'Meet our first two printable PDF sets: New Year cards and goals for 2027, and a February planner built around four full weeks.',
  published: '2026-11-22',
  products: ['new-year-kit', 'perfect-february'],
  intro: 'Moocsoft Paper is our Etsy shop for printable cards, calendars and planners. The first two sets are designed for different moments: sending a New Year note, and putting the next four weeks on paper.',
  details: {
    'new-year-kit': 'Set aside a card for someone you want to thank or catch up with. Keep the year calendar nearby, then use the goals page to write down a few priorities and a first step for each.',
    'perfect-february': 'February 2027 starts on Monday the 1st and ends on Sunday the 28th. That gives the month four complete Monday-to-Sunday weeks. The weekly sheets follow those dates, and the tracker has room for three habits.',
  },
  closing: 'Both sets are paid digital downloads in English, with A4 and US Letter PDFs. You can preview the pages and see the current price on Etsy.',
}];

const newestFirst = [...posts].sort((a, b) => b.published.localeCompare(a.published));
export const latestEtsyPostDate = newestFirst[0].published;
const blogPath = '/blog/';
const postPath = post => blogPath + post.slug + '/';
const dateLabel = value => new Intl.DateTimeFormat('en', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(value + 'T00:00:00Z'));
const cover = product => ({ src: product.image + '-1200.jpg', alt: product.alt, width: 1200, height: 900 });

function picture(product) {
  const {src, alt, width, height} = cover(product);
  return `<picture>
    <source type="image/webp" srcset="${product.image}-640.webp 640w, ${product.image}-1200.webp 1200w" sizes="(max-width: 680px) calc(100vw - 32px), 540px">
    <img src="${src}" width="${width}" height="${height}" alt="${e(alt)}" decoding="async" loading="lazy">
  </picture>`;
}

function productCard(product, heading, detail = '') {
  return `<article class="paper-product">
    ${picture(product)}
    <div class="paper-product-copy">
      <${heading}>${e(product.name)}</${heading}>
      <p>${e(product.summary)}</p>
${detail ? `      <p>${e(detail)}</p>\n` : ''}      <a class="paper-link" href="${e(product.url)}" aria-label="View ${e(product.name)} on Etsy">View on Etsy <span aria-hidden="true">↗</span></a>
    </div>
  </article>`;
}

export function etsyHomeSection() {
  const featured = [...new Set(newestFirst.flatMap(post => [...post.products].reverse()))].slice(0, 2);
  return `<section class="block" id="etsy" aria-labelledby="etsy-title">
    <div class="section-head">
      <h2 class="section-title" id="etsy-title">Moocsoft Paper on Etsy</h2>
      <a class="section-meta" href="${etsyShop}">Shop on Etsy <span aria-hidden="true">↗</span></a>
    </div>
    <p class="guide-topic-intro">Printable greeting cards, calendars and planners in A4 and US Letter.</p>
    <div class="paper-grid">${featured.map(key => productCard(products[key], 'h3')).join('')}</div>
    <p class="paper-more"><a href="${blogPath}">Read the Moocsoft Paper blog <span aria-hidden="true">→</span></a></p>
  </section>`;
}

export function writeEtsyBlog(write) {
  const blogTitle = 'Moocsoft Paper Blog';
  const blogDescription = 'New printable cards, calendars and planners from Moocsoft Paper, with previews and links to Etsy.';
  const collection = {
    '@type': 'CollectionPage', name: blogTitle, description: blogDescription, url: site + blogPath,
    mainEntity: { '@type': 'ItemList', itemListElement: newestFirst.map((post, index) => ({
      '@type': 'ListItem', position: index + 1, name: post.title, url: site + postPath(post),
    })) },
  };
  const options = { stylesheets: ['etsy-blog'] };
  write(blogPath, `${head(blogTitle, blogDescription, blogPath, [collection], undefined, [], undefined, options)}
<main id="main-content" class="guide-shell paper-blog">
  <nav class="guide-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span aria-current="page">Blog</span></nav>
  <div class="guide-hero"><h1>${blogTitle}</h1><p>${blogDescription}</p><div class="guide-hero-actions"><a href="${etsyShop}">Visit the Etsy shop ↗</a></div></div>
  <div class="guide-card-grid">
    ${newestFirst.map(post => `<a class="guide-card paper-post-card" href="${postPath(post)}">
      <time datetime="${post.published}">${dateLabel(post.published)}</time>
      <h2>${e(post.title)}</h2><p>${e(post.description)}</p><span>Read the post <span aria-hidden="true">→</span></span>
    </a>`).join('')}
  </div>
</main>
${footer()}
</body>
</html>`, latestEtsyPostDate);

  for (const post of newestFirst) {
    const path = postPath(post);
    const selected = post.products.map(key => products[key]);
    const images = selected.map(product => site + cover(product).src);
    const article = {
      '@type': 'Article', headline: post.title, description: post.description, datePublished: post.published,
      url: site + path, mainEntityOfPage: site + path, inLanguage: 'en', image: images,
      author: { '@type': 'Organization', name: 'Moocsoft', url: site },
    };
    write(path, `${head(post.title, post.description, path, [article], undefined, [], cover(selected.at(-1)), options)}
<main id="main-content" class="guide-shell paper-blog">
  <nav class="guide-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="${blogPath}">Blog</a><span aria-hidden="true">/</span><span aria-current="page">${e(post.title)}</span></nav>
  <article>
    <header class="guide-hero"><time datetime="${post.published}">${dateLabel(post.published)}</time><h1>${e(post.title)}</h1><p>${e(post.intro)}</p></header>
    <div class="paper-grid">${post.products.map(key => productCard(products[key], 'h2', post.details[key])).join('')}</div>
    <div class="guide-related"><p>${e(post.closing)}</p><div class="guide-hero-actions"><a href="${etsyShop}">Browse Moocsoft Paper on Etsy ↗</a><a href="/guides/">Explore the free guides →</a></div></div>
  </article>
</main>
${footer()}
</body>
</html>`, post.published, images);
  }
}
