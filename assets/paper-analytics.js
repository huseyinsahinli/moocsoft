// Optional Google Analytics for the printable blog. The Etsy destination opens normally.
(() => {
  const panel = document.querySelector('[data-paper-analytics]');
  if (!panel || !location.pathname.startsWith('/blog/')) return;
  const measurementId = 'G-MDJF90L54W';
  const preferenceKey = 'moocsoft-paper-analytics';
  const disableKey = 'ga-disable-' + measurementId;
  const status = panel.querySelector('[role="status"]');
  let enabled = false;
  let loaded = false;
  function tag() { window.dataLayer.push(arguments); }

  function change(enabledNow) {
    enabled = enabledNow;
    window[disableKey] = !enabled;
    status.textContent = enabled ? 'Blog analytics are on.' : 'Blog analytics are off.';
    if (!enabled || loaded) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    tag('consent', 'default', {
      analytics_storage: 'granted', ad_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied'
    });
    tag('js', new Date());
    tag('config', measurementId, {
      page_location: location.origin + location.pathname, page_referrer: '',
      cookie_domain: 'none', cookie_path: '/blog/', cookie_expires: 15552000,
      allow_google_signals: false, allow_ad_personalization_signals: false
    });
    const script = document.createElement('script');
    script.async = true;
    script.referrerPolicy = 'no-referrer';
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
    document.head.append(script);
  }
  function withdraw() {
    change(false);
    for (const pair of document.cookie.split(';')) {
      const name = pair.split('=')[0].trim();
      if (name === '_ga' || name === '_ga_MDJF90L54W') {
        document.cookie = name + '=; Max-Age=0; Path=/blog/; SameSite=Lax';
      }
    }
    if (loaded) location.reload();
  }
  panel.addEventListener('click', event => {
    const button = event.target.closest('button[data-choice]');
    if (!button) return;
    const allow = button.dataset.choice === 'allow';
    try { localStorage.setItem(preferenceKey, allow ? 'allow' : 'decline'); } catch {}
    if (allow) change(true);
    else withdraw();
  });
  window.addEventListener('storage', event => {
    if (event.key === preferenceKey || event.key === null) {
      if (event.newValue === 'allow') change(true);
      else withdraw();
    }
  });
  let allow = false;
  try { allow = localStorage.getItem(preferenceKey) === 'allow'; } catch {}
  panel.hidden = false;
  change(allow);
  document.addEventListener('click', event => {
    if (!enabled) return;
    const link = event.target.closest('a[href]');
    if (!link || link.hostname !== 'www.etsy.com') return;
    const id = link.pathname.match(/^\/listing\/(\d+)(?:\/|$)/);
    if (id) tag('event', 'etsy_listing_click', { listing_id: id[1] });
    else if (link.pathname === '/shop/MoocsoftPaper') tag('event', 'etsy_shop_click');
  });
})();
