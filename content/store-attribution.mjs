import { apps, escape as e } from './apps.mjs';

const packages = new Set(Object.values(apps).filter(app => app.google).map(app => new URL(app.google).searchParams.get('id')));
export const pageCampaign = path => path === '/' ? 'home' : path.replace(/^\/+|\/+$/g, '').replaceAll('/', '-');

// Static campaign labels only: no visitor IDs, inputs, cookies, scripts or requests.
// Keep schema download URLs canonical; only actual clickable app-store anchors change.
export function attributeStoreLinks(html, path) {
  return html.replace(/<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script\s*>|<a\b[^>]*>/gi, tag => {
    if (!/^<a\b/i.test(tag)) return tag;
    const href = tag.match(/(\s)href="([^"]*)"/i);
    if (!href) return tag;
    let url;
    try { url = new URL(href[2].replaceAll('&amp;', '&')); } catch { return tag; }
    if (url.origin !== 'https://play.google.com' || url.pathname !== '/store/apps/details' || !packages.has(url.searchParams.get('id'))) return tag;
    url.searchParams.set('utm_source', 'moocsoft');
    url.searchParams.set('utm_medium', 'referral');
    url.searchParams.set('utm_campaign', pageCampaign(path));
    const placement = tag.match(/\sdata-placement="([a-z0-9-]+)"/i)?.[1] || 'page';
    url.searchParams.set('utm_content', placement);
    return tag.replace(href[0], `${href[1]}href="${e(url.href)}"`);
  });
}

export function canonicalStoreUrl(value) {
  const url = new URL(value);
  for (const name of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content']) url.searchParams.delete(name);
  return url.href;
}
