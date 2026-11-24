/** Reloj reactivo compartido (4 veces por segundo). */
export const clock = $state({ now: Date.now() });
setInterval(() => (clock.now = Date.now()), 250);
