import { coverFigure, coverMeta, coverPath } from './gta-art.mjs';
const support = 'https://www.playstation.com/en-us/support/games/gta-vi-support/';
const voucher = 'https://www.playstation.com/en-us/support/store/redeem-ps-store-voucher-code/';
const people = 'https://www.rockstargames.com/VI/only-in-leonida';

export const playerGuides = [
  {
    path: '/gta-6-download-time/',
    title: 'GTA 6 download time calculator',
    description: 'Estimate your remaining GTA 6 download time using the progress on your own console. Compare a speed estimate with a timed sample.',
    body: `<p>Use the amount left in the download queue. A console showing 80 GB of 120 GB has 40 GB left. At a steady 50 Mbps, that takes about 1 hour 47 minutes. Those figures are an example. Use the size your console reports for your edition and update.</p>
<h2>Estimate from your download speed</h2>
<form id="estimate"><label>Remaining download (GB) <input name="remaining" type="number" min="0" max="100000" step="any" value="40" required></label>
<label>Download speed (Mbps) <input name="speed" type="number" min="0.001" max="100000" step="any" value="50" required></label>
<button type="submit">Estimate time</button><output aria-live="polite">About 1 h 47 min</output></form>
<noscript>Multiply remaining GB by 8,000, then divide by Mbps and by 60 to get minutes.</noscript>
<h2>What if the speed keeps changing?</h2>
<p>Write down the progress twice, five minutes apart. Suppose it moves from 80 to 82 GB out of 120. That is 2 GB per five minutes, or 0.4 GB per minute. The remaining 38 GB would take about 95 minutes at that pace. This method uses the rate your console actually sustained over the sample.</p>
<h2>Why can the console finish later?</h2><p>Internet plans usually quote megabits per second. Download queues often show gigabytes. Eight bits make one byte, and the estimate uses decimal GB. Shared Wi-Fi, changing server speeds and pauses affect the transfer. Installation time comes afterward. If the queue stops moving, check <a href="${support}">PlayStation’s GTA VI download help</a>.</p>
<script>
const form = document.querySelector('#estimate');
form.addEventListener('submit', event => {
  event.preventDefault();
  const minutes = Math.ceil(form.elements.remaining.valueAsNumber * 8000 / form.elements.speed.valueAsNumber / 60);
  form.querySelector('output').value = minutes === 0 ? 'Download complete' : 'About ' + Math.floor(minutes / 60) + ' h ' + minutes % 60 + ' min';
});
</script>`
  },
  {
    path: '/gta-6-ps5-code-in-box/',
    title: 'GTA 6 on PS5: what to do with a code-in-box copy',
    description: 'Find the download code, redeem it on the right PlayStation account, and troubleshoot a missing voucher or game.',
    body: `<p>If your package says <strong>Code-In-Box</strong>, look for a PlayStation Store voucher. Sony says this GTA VI edition includes a download code and no disc. Have the account that will own the game ready before redeeming it.</p>
<h2>Check three things before redemption</h2><ol><li><strong>Edition.</strong> Read the wording on your package or receipt. These steps cover the PS5 Code-In-Box edition.</li><li><strong>Region.</strong> Compare the voucher region with the region of your PlayStation account. A voucher must match the account region.</li><li><strong>Owner.</strong> On a shared PS5, check the signed-in account. The redemption is tied to that account.</li></ol>
<h2>Redeem and find the game</h2><p>Open PlayStation Store on the PS5, open its menu and choose <strong>Redeem Code</strong>. Enter the 12-digit voucher and review what the confirmation screen offers. After redemption, open Game Library on that account and select GTA VI to download.</p>
<h2>What does your screen show?</h2>
<details><summary>The code is missing or unreadable</summary><p>Keep the packaging and proof of purchase. Contact the retailer about a missing insert. For a damaged voucher, follow PlayStation’s voucher support steps. Keep the full code private.</p></details>
<details><summary>The voucher says it has already been used</summary><p>Check the transaction history of the account used for redemption, then its library. On a family console, check which account was active at the time. If nobody in the household redeemed it, use voucher support with your receipt.</p></details>
<details><summary>I can see the game, but it hasn’t started downloading</summary><p>Select it in Game Library, then look in Downloads/Uploads. If the transfer is queued, inspect free storage and queue progress before attempting another redemption.</p></details>
<p><a href="${support}">GTA VI edition and installation details</a> · <a href="${voucher}">PlayStation voucher instructions</a></p>`
  },
  {
    path: '/gta-6-character-guide/',
    title: 'GTA 6 character guide: Jason, Lucia and their connections',
    description: 'Trace Jason and Lucia’s starting points, Jason’s connections in the Keys and the people behind Only Raw Records in Vice City.',
    body: `<p>Start with two names: <strong>Jason Duval and Lucia Caminos</strong>. Then follow two smaller circles, Jason’s connections in the Keys and the musicians around Only Raw Records. This guide uses Rockstar’s character introductions and leaves mission outcomes out.</p>
<h2>Jason and Lucia</h2><p>Jason has a military background and works in the Keys. Lucia wants a fresh start after leaving prison. When you read their profiles, notice what each expects from their partnership. Jason wants life to get easier. Lucia already has a plan.</p>
<h2>Three connections that make the cast easier to remember</h2><dl class="places"><div><dt>Jason ↔ Cal Hampton</dt><dd>Cal is Jason’s friend and also knows Brian. Hearing Cal’s name puts you in Jason’s local circle.</dd></div><div><dt>Jason ↔ Brian Heder</dt><dd>Brian runs a boatyard and gives Jason a place to live in return for work. That explains the link between Jason’s home and his obligations in the Keys.</dd></div><div><dt>Boobie Ike ↔ Dre’Quan Priest ↔ Real Dimez</dt><dd>Boobie and Dre’Quan are business partners. Dre’Quan signed Real Dimez. When Only Raw Records comes up, think of this music connection.</dd></div></dl>
<h2>Can you place the names?</h2><details><summary>Who connects Jason’s housing to his work?</summary><p>Brian Heder. Cal is the friend in this circle.</p></details><details><summary>Is Real Dimez the name of the record label?</summary><p>Real Dimez is the act. Only Raw Records is the label.</p></details>
<p><a href="${people}">See Rockstar’s character portraits and full introductions</a>.</p>
<aside class="puzzle-ad"><img src="/assets/apps/math-riddles/icon.png" alt="" width="64" height="64"><div><small>Advertisement · A Moocsoft app</small><p>Enjoy a quick puzzle between sessions? <a href="/math-riddles/">Try Math Riddles</a>.</p></div></aside>`
  }
];

export function renderPlayerGuide(guide) {
  const related = playerGuides.filter(item => item !== guide);
  const url = 'https://moocsoft.net' + guide.path;
  const article = {'@context':'https://schema.org','@type':'Article',headline:guide.title,image:"https://moocsoft.net"+coverPath(guide.path),datePublished:'2026-11-18',mainEntityOfPage:url,author:{'@type':'Organization',name:'Moocsoft'}};
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${guide.title} | Moocsoft</title><meta name="description" content="${guide.description}">
<link rel="canonical" href="${url}"><link rel="stylesheet" href="/assets/gta6-controls.css">
<style>article{max-width:850px;margin:auto}form{display:grid;gap:1rem;padding:1.4rem;background:#292840;border-radius:1rem}input,button{font:inherit;padding:.5rem;border-radius:.5rem}label,input{display:block}input{max-width:100%}button{width:fit-content;cursor:pointer}output{font-size:1.4rem;color:#b9eedf}</style>
<script type="application/ld+json">${JSON.stringify(article)}</script>${coverMeta(guide.path, guide.title, guide.description)}</head><body>
<header><a class="brand" href="/">moocsoft</a><a href="/gta-6-controls/">GTA 6 guides</a></header>
<main><article><h1>${guide.title}</h1>${guide.body.replace('</p>', '</p>' + coverFigure(guide.path))}<nav aria-label="More GTA 6 guides"><h2>More GTA 6 guides</h2><ul>${related.map(item => `<li><a href="${item.path}">${item.title}</a></li>`).join('')}<li><a href="/gta-6-ps5-languages/">PS5 voice and text languages</a></li></ul></nav></article></main>
<footer><a href="/editorial-policy/">Editorial policy</a><a href="/contact/">Corrections</a></footer></body></html>`;
}
