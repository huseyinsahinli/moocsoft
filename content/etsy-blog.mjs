import { site, escape as e } from './apps.mjs';
import { footer, head } from './components.mjs';

export const etsyShop = 'https://www.etsy.com/shop/MoocsoftPaper';

const products = {
  'missing-tree-star': {
    name: 'The Missing Tree Star',
    image: '/assets/etsy/missing-tree-star',
    alt: 'Christmas Mystery Game cover showing the case briefing and deduction grid',
    summary: 'A Christmas detective game with six witness clues, two logic grids, a letter code and a full answer key.',
    url: 'https://www.etsy.com/listing/4624416089/christmas-mystery-game-printable-the',
  },
  'cookie-exchange': {
    name: 'Christmas Cookie Exchange Kit',
    image: '/assets/etsy/cookie-exchange',
    alt: 'Cookie Exchange Kit cover showing the printable recipe cards and tent labels',
    summary: 'A baker sign-up sheet, recipe cards, fold-over labels, voting slips, take-home tags and an award.',
    url: 'https://www.etsy.com/listing/4624420958/christmas-cookie-exchange-printable-kit',
  },
  'secret-santa': {
    name: 'Secret Santa Questionnaire',
    image: '/assets/etsy/secret-santa',
    alt: 'Secret Santa cover showing the workplace and family questionnaires',
    summary: 'Separate office and family wish lists, two half-page forms, a match organizer and six gift tags.',
    url: 'https://www.etsy.com/listing/4624416235/secret-santa-questionnaire-printable-for',
  },
  'christmas-eve-box': {
    name: 'Christmas Eve Box Kit',
    image: '/assets/etsy/christmas-eve-box',
    alt: 'Christmas Eve Box Kit cover showing write-in box labels and cozy night tickets',
    summary: 'Two box labels, six tags, eight activity tickets, a family note, a checklist and a memory page.',
    url: 'https://www.etsy.com/listing/4624421462/christmas-eve-box-printable-kit-with-box',
  },
  'christmas-dinner': {
    name: 'Christmas Dinner Planner',
    image: '/assets/etsy/christmas-dinner',
    alt: 'Christmas Dinner Planner cover showing the menu and oven schedule pages',
    summary: 'A menu planner, categorized shopping list, oven schedule, serving timeline, guest list and place cards.',
    url: 'https://www.etsy.com/listing/4624420956/christmas-dinner-planner-printable-with',
  },
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
  slug: 'christmas-printables',
  title: 'Five Christmas Printables for the Table and Gift Exchange',
  description: 'Print a Christmas mystery game, cookie swap kit, Secret Santa wish lists, Christmas Eve box labels or a dinner planner.',
  published: '2026-11-24',
  products: ['cookie-exchange', 'christmas-eve-box', 'christmas-dinner', 'secret-santa', 'missing-tree-star'],
  intro: 'Set out a puzzle while dinner is in the oven, give your Secret Santa a few useful hints, or make a simple Christmas Eve box with a handwritten note. Here are five new printables from Moocsoft Paper and a way to use each one.',
  details: {
    'cookie-exchange': 'Send the sign-up sheet before the swap. At the party, put a recipe card and a fold-over label next to each plate before guests vote.',
    'christmas-eve-box': 'Wrap a box you already have, write a short note and tuck one of the tickets inside. The story ticket gives someone the job of picking the bedtime book.',
    'christmas-dinner': 'Write down your serving time, then work backward on the oven schedule. Use the timeline to give each helper a task before everyone sits down.',
    'secret-santa': 'Hand out the office questionnaire before drawing names. For a larger group, print the two-up quick form and keep the match sheet with the organizer.',
    'missing-tree-star': 'Hand each team the witness notes, worksheet and code. Keep the hints and answer key aside until the teams are ready to check their theories.',
  },
  closing: 'All five sets are paid digital downloads in English. Each includes an A4 PDF and a US Letter PDF with the same pages. Etsy shows the current prices and previews.',
}, {
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
}, {
  slug: 'host-a-christmas-cookie-exchange',
  title: 'How to Host a Christmas Cookie Exchange',
  description: 'Use a baker sign-up sheet, recipe cards and table labels to organize a small Christmas cookie swap.',
  published: '2026-11-25',
  products: ['cookie-exchange'],
  intro: 'A cookie exchange gives everyone a chance to share a recipe and take home a mixed box. Agree on the number of bakers and the size of each take-home batch so guests can decide how much to make.',
  sections: [
    ['Work out how many cookies to bring', 'Ask bakers to write their names and planned cookies on the sign-up sheet. If six bakers each bring two cookies for each of the five other bakers, that is ten per person for swapping. Ask for a few extra only if you want a separate tasting plate. Tell guests what size container to bring.'],
    ['Put a recipe card and label beside each plate', 'Give each baker a recipe card and a fold-over label. Write the cookie name on both so guests can match a favorite to its recipe. Share ingredient information directly when guests request it, and flag shared equipment or unknown ingredients if food allergies come up.'],
    ['Divide the cookies before taking them home', 'Set out six empty containers or labeled places on the table, then give each baker a turn to add their cookies. If the group wants to vote for a favorite, use the voting slips during the tasting. Use the take-home tags to keep the finished boxes easy to identify.'],
  ],
  closing: 'The Christmas Cookie Exchange Kit is a paid digital download with A4 and US Letter PDFs. Preview the sign-up sheet, recipe cards and labels on Etsy.',
}, {
  slug: 'organize-secret-santa-with-wish-lists',
  title: 'How to Organize Secret Santa with Printable Wish Lists',
  description: 'Collect useful gift ideas, set a budget and manage a private name draw with printable Secret Santa forms.',
  published: '2026-11-25',
  products: ['secret-santa'],
  intro: 'A short wish list gives a Secret Santa enough direction to shop confidently. Before sending the forms, tell participants when the exchange is happening, whether participation is optional and how much to spend.',
  sections: [
    ['Give people a few ways to answer', 'Choose the office or family questionnaire, or print the two half-page forms if you have a larger group. Ask people to name a hobby, a favorite snack or a type of gift they would use. Someone who likes puzzles might ask for a small crossword book and add that they already own a daily puzzle calendar.'],
    ['Collect forms before drawing names', 'Set a deadline and draw from the people who have opted in. Use the match organizer as the private record so you can check that each person gives and receives one gift. Send the giver only the wish list for the person they drew.'],
    ['Make the exchange easy on the day', 'Tell participants where and when to leave wrapped gifts. Write the recipient’s name clearly on the gift tag. For an office exchange, have the organizer arrange an alternate drop-off time for anyone who will be away. Decide ahead of time whether the group wants to reveal the givers after opening.'],
  ],
  closing: 'The Secret Santa Questionnaire is a paid digital download with office and family forms, a match organizer and gift tags in A4 and US Letter PDFs.',
}, {
  slug: 'print-and-send-new-year-cards',
  title: 'How to Print and Send Your 2027 New Year Cards',
  description: 'Choose the right PDF, print a test card and write a New Year message that feels personal.',
  published: '2026-11-25',
  products: ['new-year-kit'],
  intro: 'A short New Year card is a good way to thank someone who made your year easier. Set aside one evening to print your cards and write a few lines while the details are still fresh.',
  sections: [
    ['Match the file to your paper', 'The New Year kit comes with A4 and US Letter PDFs. Pick the file that matches the paper in your printer and select the card page in the print dialog. Start with a single test sheet. Use Actual Size or 100% if you want to keep the designed dimensions, and check the preview for clipping before printing the batch.'],
    ['Write one thing only you could say', 'Start with something specific the recipient did. For a friend who listened while you were changing jobs, try “I still think about our Thursday walks. Thanks for listening while I figured out my next step.” Add a wish for something they are looking forward to in 2027.'],
    ['Set aside time to finish the cards', 'Trim or fold the test sheet as the design requires and check it against your envelope before printing the rest. If you plan to post the cards, write the addresses first and check your postal service’s holiday deadlines. Keep one or two extra cards for people you remember later.'],
  ],
  closing: 'The 2027 New Year Printable Kit is a paid digital download. Preview the four card designs and check the current price on Etsy.',
}, {
  slug: 'plan-february-2027-in-four-weeks',
  title: 'How to Plan February 2027 in Four Full Weeks',
  description: 'Use the four Monday-to-Sunday weeks of February 2027 to schedule a project and leave room for changes.',
  published: '2026-11-25',
  products: ['perfect-february'],
  intro: 'February 2027 starts on Monday, February 1, and ends on Sunday, February 28. Each dated weekly sheet in the Perfect February planner covers one complete week, so you can map a month-long project and transfer one milestone to each sheet.',
  sections: [
    ['Put fixed dates on the month view', 'Start with appointments, deadlines and days you expect to be away. Then pick a project that fits the time left. If you want to organize four kitchen cupboards, start by counting the cupboards you can realistically get through in a session.'],
    ['Assign a milestone to each week', 'Use February 1–7 to sort the first cupboard, and February 8–14 to tackle the second. Plan to do the last two during February 15–21 if you have time. Keep February 22–28 open for anything you postponed and for putting aside items to donate. Write the next physical action on each weekly sheet, such as clearing the worktop before sorting.'],
    ['Close the month with a short review', 'On February 28, use the review page to note what you completed and what still needs attention. If sorting was easy but finding places for things took longer, record that. It gives you a better estimate for the next room you plan.'],
  ],
  closing: 'Perfect February 2027 is a paid digital download with a Monday-start calendar, four dated weekly pages, a habit tracker and a month-end review.',
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
  const featured = ['missing-tree-star', 'secret-santa'];
  return `<section class="block" id="etsy" aria-labelledby="etsy-title">
    <div class="section-head">
      <h2 class="section-title" id="etsy-title">Moocsoft Paper on Etsy</h2>
      <a class="section-meta" href="${etsyShop}">Shop on Etsy <span aria-hidden="true">↗</span></a>
    </div>
    <p class="guide-topic-intro">Printable games, party kits, greeting cards and planners in A4 and US Letter.</p>
    <div class="paper-grid">${featured.map(key => productCard(products[key], 'h3')).join('')}</div>
    <p class="paper-more"><a href="${blogPath}">Read the Moocsoft Paper blog <span aria-hidden="true">→</span></a></p>
  </section>`;
}

export function writeEtsyBlog(write) {
  const blogTitle = 'Moocsoft Paper Blog';
  const blogDescription = 'Printable games, party kits, cards and planners from Moocsoft Paper, with previews and links to Etsy.';
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
    ${post.sections ? `<div class="guide-article paper-post-body">
      ${post.sections.map(([heading, paragraph]) => `<section><h2>${e(heading)}</h2><p>${e(paragraph)}</p></section>`).join('\n      ')}
    </div>\n    ` : ''}<div class="paper-grid">${post.products.map(key => productCard(products[key], 'h2', post.details?.[key])).join('')}</div>
    <div class="guide-related"><p>${e(post.closing)}</p><div class="guide-hero-actions"><a href="${etsyShop}">Browse Moocsoft Paper on Etsy ↗</a><a href="/guides/">Explore the free guides →</a></div></div>
  </article>
</main>
${footer()}
</body>
</html>`, post.published, images);
  }
}
