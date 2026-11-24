export function vibrate(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {}
}

let lock: any = null;
export async function keepAwake(on: boolean) {
  try {
    if (on && !lock && 'wakeLock' in navigator) {
      lock = await (navigator as any).wakeLock.request('screen');
      lock.addEventListener?.('release', () => (lock = null));
    } else if (!on && lock) {
      await lock.release();
      lock = null;
    }
  } catch {}
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && wantAwake) keepAwake(true);
});
let wantAwake = false;
export function setAwake(on: boolean) {
  wantAwake = on;
  keepAwake(on);
}

/** Detección de agitar el móvil. Devuelve una función para dejar de escuchar. */
export async function enableShake(onShake: () => void): Promise<(() => void) | null> {
  const DM: any = (window as any).DeviceMotionEvent;
  if (!DM) return null;
  try {
    if (typeof DM.requestPermission === 'function') {
      const res = await DM.requestPermission();
      if (res !== 'granted') return null;
    }
  } catch {
    return null;
  }
  let last = 0;
  const handler = (e: DeviceMotionEvent) => {
    const a = e.accelerationIncludingGravity || e.acceleration;
    if (!a) return;
    const force = Math.abs(a.x ?? 0) + Math.abs(a.y ?? 0) + Math.abs(a.z ?? 0);
    const now = Date.now();
    if (force > 38 && now - last > 1500) {
      last = now;
      onShake();
    }
  };
  addEventListener('devicemotion', handler);
  return () => removeEventListener('devicemotion', handler);
}

export const canShake = typeof window !== 'undefined' && 'DeviceMotionEvent' in window && matchMedia('(pointer: coarse)').matches;
