// Native details remain usable without JavaScript. No storage, tracking or network calls.
(() => {
  const menus = document.querySelectorAll('.guide-toc-menu');
  if (!menus.length) return;
  const desktop = window.matchMedia('(min-width: 901px)');
  const fitLayout = () => menus.forEach(menu => { menu.open = desktop.matches; });
  fitLayout();
  desktop.addEventListener('change', fitLayout);
})();
