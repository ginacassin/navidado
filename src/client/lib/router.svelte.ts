export const route = $state({ path: location.pathname, search: location.search, hash: location.hash });

function sync() {
  route.path = location.pathname;
  route.search = location.search;
  route.hash = location.hash;
  window.scrollTo(0, 0);
}

export function go(path: string, replace = false) {
  if (replace) history.replaceState(null, '', path);
  else history.pushState(null, '', path);
  sync();
}

export function back(fallback = '/') {
  if (history.length > 1) history.back();
  else go(fallback, true);
}

addEventListener('popstate', sync);

export function query(name: string): string | null {
  return new URLSearchParams(route.search).get(name);
}
