import { vibrate } from './device';
import { bell, ding } from './sound';

export type BannerKind = 'info' | 'warn' | 'last' | 'over' | 'instr';
export const banner = $state({ text: '', kind: 'info' as BannerKind, id: 0 });

let hideTimer: ReturnType<typeof setTimeout> | undefined;
export function showBanner(text: string, kind: BannerKind = 'info', ms = 4000) {
  banner.text = text;
  banner.kind = kind;
  banner.id += 1;
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => (banner.text = ''), ms);
}

/** Dispara los avisos de fin al cruzar 3 min, 2 min, 1 min y 0. */
export class TimerAlerts {
  private last = Number.POSITIVE_INFINITY;
  check(ms: number, active: boolean) {
    if (!active) {
      this.last = Number.POSITIVE_INFINITY;
      return;
    }
    if (this.last === Number.POSITIVE_INFINITY) {
      this.last = ms; // primera lectura (o reconexión): no avisamos de lo ya pasado
      return;
    }
    const crossed = (t: number) => this.last > t && ms <= t;
    if (crossed(180_000)) {
      showBanner('¡Quedan 3 minutos!', 'warn', 5000);
      vibrate([200, 100, 200]);
      ding();
    } else if (crossed(120_000)) {
      showBanner('¡Quedan 2 minutos!', 'warn', 5000);
      vibrate([200, 100, 200]);
      ding();
    } else if (crossed(60_000)) {
      showBanner('¡Último minuto!', 'last', 5000);
      vibrate([400, 120, 400]);
      ding();
    }
    this.last = ms;
  }
}

export function endAlert() {
  vibrate([300, 100, 300, 100, 600]);
  bell();
}
