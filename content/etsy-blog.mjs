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
  title: "5 Printable Christmas Activities for Your Holiday Gathering",
  description: "Choose a Christmas activity by the job you need to do, from labeling a cookie swap to giving dinner guests a mystery to solve.",
  published: '2026-11-24',
  products: ['cookie-exchange', 'christmas-eve-box', 'christmas-dinner', 'secret-santa', 'missing-tree-star'],
  intro: "If your guests arrive at four and dinner starts at six, what happens in between? A mystery gives early arrivals something to solve together. A cookie swap works better when everyone has agreed to bake ahead. Start with the part of the gathering you want help with, then choose a set below.",
  details: {
    'cookie-exchange': 'Send the sign-up sheet before the swap. At the party, put a recipe card and a fold-over label next to each plate before guests vote.',
    'christmas-eve-box': 'Wrap a box you already have, write a short note and tuck one of the tickets inside. The story ticket gives someone the job of picking the bedtime book.',
    'christmas-dinner': 'Write down your serving time, then work backward on the oven schedule. Use the timeline to give each helper a task before everyone sits down.',
    'secret-santa': 'Hand out the office questionnaire before drawing names. For a larger group, print the two-up quick form and keep the match sheet with the organizer.',
    'missing-tree-star': 'Hand each team the witness notes, worksheet and code. Keep the hints and answer key aside until the teams are ready to check their theories.',
  },
  modified: "2026-11-25",
  sections: [
    ["For guests who arrive at different times", "Set a small table for The Missing Tree Star. Put the briefing, clues and a pencil there, and keep the answer key with the host. If people arrive halfway through, one player can bring them up to speed using the deduction grid."],
    ["For a gathering built around food", "Choose the cookie exchange kit when guests are bringing the treats. Send the sign-up before anyone shops. For a sit-down dinner, start with the dinner planner instead. Write the serving time first, then work backward to the dishes that share the oven."],
    ["For the gift exchange or Christmas Eve", "Use the Secret Santa forms before you draw names so each giver gets a few useful clues. For a quieter evening at home, put one activity ticket in a Christmas Eve box with a handwritten note. Let the person opening it choose when the activity starts."],
  ],
  closing: 'All five sets are paid digital downloads in English. Each includes an A4 PDF and a US Letter PDF with the same pages. Etsy shows the current prices and previews.',
}, {
  slug: 'moocsoft-paper-on-etsy',
  title: "2027 Printable Calendars, New Year Cards and Goal Sheets",
  description: "Compare two Moocsoft Paper PDF sets for 2027. See which pages suit a New Year greeting, an annual goal or a four-week February plan.",
  published: '2026-11-22',
  products: ['new-year-kit', 'perfect-february'],
  intro: "To send a January greeting, choose the New Year kit. To see all four weeks of February on dated planning pages, choose Perfect February. Both sets come in A4 and US Letter. The difference is what you want to have on your desk once the page comes out of the printer.",
  details: {
    'new-year-kit': 'Set aside a card for someone you want to thank or catch up with. Keep the year calendar nearby, then use the goals page to write down a few priorities and a first step for each.',
    'perfect-february': 'February 2027 starts on Monday the 1st and ends on Sunday the 28th. That gives the month four complete Monday-to-Sunday weeks. The weekly sheets follow those dates, and the tracker has room for three habits.',
  },
  modified: "2026-11-25",
  sections: [
    ["For a note that turns into a plan", "The New Year kit pairs four greeting cards with a year calendar, a goals page and four cut-out goal cards. You might send a card to the friend who taught you to knit, then use a goal card of your own to schedule an evening to finish the scarf."],
    ["For a month you can see week by week", "Perfect February works well for a project with several steps. Keep the monthly page on the fridge for shared dates and the current weekly page on your desk for tasks. The 28-day tracker gives you a separate place to record a recurring action."],
    ["What to check before you print", "Both are paid digital downloads. Check the Etsy preview for the layout you want, choose the PDF matching the paper already in your printer, and select one page for a test. If you only need a weekly sheet today, enter its page number in the print dialog."],
  ],
  closing: 'Both sets are paid digital downloads in English, with A4 and US Letter PDFs. You can preview the pages and see the current price on Etsy.',
}, {
  slug: 'host-a-christmas-cookie-exchange',
  title: "Christmas Cookie Exchange Rules and How Many Cookies to Bring",
  description: "Calculate cookies per baker, copy an invitation and set up a swap table where everyone leaves with a share of each batch.",
  published: '2026-11-25',
  products: ['cookie-exchange'],
  intro: "For a Christmas cookie exchange with eight bakers, ask each person to bring 21 cookies if everyone takes home three from each of the seven other bakers. Add eight more per baker if you want everyone to taste one of every kind at the party.",
  modified: "2026-11-25",
  sections: [
    ["Calculate the batch before sending invitations", "Multiply the number of other bakers by the cookies you want from each batch. For six bakers taking two of each other’s cookies, each baker brings 5 × 2 = 10. Count a couple baking one recipe together as one baker. If someone cancels after baking day, divide the spare portions at the table."],
    ["An invitation you can copy", "“Cookie swap at my place on December 12 at 3 p.m.! We have eight bakers. Bring 21 cookies of one kind, packed in seven groups of three, and an empty container for the trip home. Tell me what you’re baking by December 5 so I can make the table labels.” Add tasting quantities if you plan to serve samples."],
    ["Set up a table guests can navigate", "Put the cookie name and the baker’s recipe card beside each batch. Place tasting samples on a separate plate so nobody eats a portion meant for the swap. Invite guests with ingredient questions to speak to the baker directly. When everyone is ready, walk around the table once, picking up one packet from each of the other bakers."],
  ],
  closing: 'The Christmas Cookie Exchange Kit is a paid digital download with A4 and US Letter PDFs. Preview the sign-up sheet, recipe cards and labels on Etsy.',
}, {
  slug: 'organize-secret-santa-with-wish-lists',
  title: "Secret Santa Questionnaire Ideas for Work and Family",
  description: "Get sample Secret Santa questions, a filled-in wish list and a simple way to match gifts to people within the agreed budget.",
  published: '2026-11-25',
  products: ['secret-santa'],
  intro: "The most useful Secret Santa question is one a giver can shop from. “What do you reach for on a rainy afternoon?” might get you “crosswords and ginger tea.” That gives the giver two affordable ideas and leaves the surprise intact.",
  modified: "2026-11-25",
  sections: [
    ["Three prompts that give a shopper a starting point", "Ask “What small treat do you buy for yourself?”, “What hobby could always use fresh supplies?” and “Is there anything you’d prefer to skip?” A reply like “dark chocolate, black sketch pens, and please skip scented candles” gives the shopper room to choose. Share the budget before people fill in their forms."],
    ["Adjust the questions for an office or a family", "For an office draw, make it easy to opt in privately and keep the prompts about everyday tastes. For family, try one question about a shared memory. A cousin who remembers making popcorn on movie nights has a gift idea even if the recipient leaves the rest blank."],
    ["Keep the matches private through gift day", "Collect forms, draw names and check the organizer sheet for self-matches or anyone assigned twice. Send each giver their recipient’s form. Put the exchange date and drop-off location in the same message. On the day, label packages with the recipient’s name so the organizer can spot a missing gift before people leave."],
  ],
  closing: 'The Secret Santa Questionnaire is a paid digital download with office and family forms, a match organizer and gift tags in A4 and US Letter PDFs.',
}, {
  slug: 'print-and-send-new-year-cards',
  title: "What to Write in a 2027 New Year Card, Plus Printing Tips",
  description: "Adapt three New Year card messages for a friend, a colleague or someone far away, then print a test card that fits your envelope.",
  published: '2026-11-25',
  products: ['new-year-kit'],
  intro: "A good New Year note can be two sentences long. Name a moment from the year you shared, then offer one wish for the year ahead. If you can picture the recipient recognizing the memory, you already have enough to write.",
  modified: "2026-11-25",
  sections: [
    ["Three New Year messages to make your own", "For a friend: “Those rainy Thursday walks got me through the autumn. Here’s to a few sunny ones in 2027.” For a colleague: “Thanks for taking my first client call with me. I hope January brings you time for that trip you’ve been planning.” For someone far away: “I made your lemon cake last weekend and thought of you. I hope we can share a slice in 2027.”"],
    ["Get the size right on a test sheet", "Open the A4 file for A4 paper or the US Letter file for Letter paper. Select just the greeting-card page. Start with Actual Size or 100%, check the print preview, and run one plain-paper copy. Fold or trim it as shown and slip it into an envelope before committing your card stock."],
    ["Leave space for handwriting", "Try your longest message on the plain-paper copy first. Leave room for your signature and a date. If several people are signing, have the first person write near the top. A child’s drawing or a last-minute line from a friend can then fit at the bottom."],
  ],
  closing: 'The 2027 New Year Printable Kit is a paid digital download. Preview the four card designs and check the current price on Etsy.',
}, {
  slug: 'plan-february-2027-in-four-weeks',
  title: "February 2027 Calendar and Four-Week Project Planner",
  description: "See the exact dates of February 2027’s four Monday-start weeks and a sample project plan you can adapt to your own calendar.",
  published: '2026-11-25',
  products: ['perfect-february'],
  intro: "February 1, 2027 falls on a Monday, and February 28 falls on a Sunday. The month fits on four complete weekly sheets. Here is how to use those weeks to finish a family photo album, with a spare week for late photos and corrections.",
  modified: "2026-11-25",
  sections: [
    ["February 1–7 | Gather the photos", "Choose the album’s scope before you open your camera roll. One summer trip is easier to finish than an entire family history. Put your photos in one folder and ask relatives for their favorites by Sunday the 7th. On the monthly calendar, circle the date you want the album ready."],
    ["February 8–14 and 15–21 | Select and arrange", "During the second week, pick one strong photo for each place you visited and move duplicates aside. Use the third week to put the selections in order and add names or captions while you remember them. On each weekly sheet write one small job for your next free evening, such as checking the spelling of a place name."],
    ["February 22–28 | Review and finish", "Give someone who took the trip a chance to spot missing people or mixed-up dates. Reserve a second evening for corrections. On the month-end page, record how many evenings the album took. That estimate will help you decide how large your next photo project can be."],
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
  const blogDescription = 'Plan a cookie exchange, find the words for a New Year card or map out February 2027 with practical guides to Moocsoft Paper printables.';
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
      ${picture(products[post.products[0]])}
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
      '@type': 'Article', headline: post.title, description: post.description, datePublished: post.published, dateModified: post.modified || post.published,
      url: site + path, mainEntityOfPage: site + path, inLanguage: 'en', image: images,
      author: { '@type': 'Organization', name: 'Moocsoft', url: site },
    };
    write(path, `${head(post.title, post.description, path, [article], undefined, [], cover(selected.at(-1)), options)}
<main id="main-content" class="guide-shell paper-blog">
  <nav class="guide-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="${blogPath}">Blog</a><span aria-hidden="true">/</span><span aria-current="page">${e(post.title)}</span></nav>
  <article>
    <header class="guide-hero">By Moocsoft Paper · Updated <time datetime="${post.modified || post.published}">${dateLabel(post.modified || post.published)}</time><h1>${e(post.title)}</h1><p>${e(post.intro)}</p></header>
    ${post.sections ? `<div class="guide-article paper-post-body">
      ${post.sections.map(([heading, paragraph]) => `<section><h2>${e(heading)}</h2><p>${e(paragraph)}</p></section>`).join('\n      ')}
    </div>\n    ` : ''}<div class="paper-grid">${post.products.map(key => productCard(products[key], 'h2', post.details?.[key])).join('')}</div>
    <div class="guide-related"><p>${e(post.closing)}</p><div class="guide-hero-actions"><a href="${etsyShop}">Browse Moocsoft Paper on Etsy ↗</a>${posts.filter(other => other !== post && other.products.some(key => post.products.includes(key))).map(other => `<a href="${postPath(other)}">${e(other.title)} →</a>`).join('')}</div></div>
  </article>
</main>
${footer()}
</body>
</html>`, post.modified || post.published, images);
  }
}
