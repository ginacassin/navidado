<script lang="ts">
  /** Ramas de abeto con bolas para las esquinas superiores. */
  let { side = 'left', size = 180 }: { side?: 'left' | 'right'; size?: number } = $props();
  const u = 'f' + Math.random().toString(36).slice(2, 8);
  type Branch = { x: number; y: number; a: number; len: number; w: number };
  const branches: Branch[] = [
    { x: -10, y: 14, a: 18, len: 230, w: 1 },
    { x: -14, y: 62, a: 28, len: 170, w: 0.9 },
    { x: 30, y: -12, a: 62, len: 150, w: 0.85 },
    { x: -12, y: 108, a: 40, len: 110, w: 0.75 },
    { x: 96, y: -10, a: 84, len: 80, w: 0.7 }
  ];
  function needles(b: Branch) {
    const out: { x1: number; y1: number; x2: number; y2: number; c: number }[] = [];
    const rad = (b.a * Math.PI) / 180;
    const dx = Math.cos(rad), dy = Math.sin(rad);
    const n = Math.floor(b.len / 5);
    for (let i = 2; i < n; i++) {
      const t = i / n;
      const px = b.x + dx * b.len * t, py = b.y + dy * b.len * t;
      const L = (24 * (1 - t * 0.6) + ((i * 7) % 5)) * b.w;
      for (const s of [-1, 1]) {
        const na = rad + s * (0.95 - t * 0.25);
        out.push({ x1: px, y1: py, x2: px + Math.cos(na) * L, y2: py + Math.sin(na) * L, c: (i + (s > 0 ? 1 : 0)) % 3 });
      }
    }
    return out;
  }
  const all = branches.flatMap((b) => needles(b));
  const colors = ['#0b4f30', '#136b40', '#1d8550'];
  const balls = [
    { x: 150, y: 96, r: 15, c: 'r', s: 42 },
    { x: 78, y: 128, r: 12, c: 'g', s: 66 },
    { x: 214, y: 46, r: 11, c: 'r', s: 30 }
  ];
</script>

<svg
  class="fir {side}"
  viewBox="0 0 300 220"
  width={size}
  height={(size * 220) / 300}
  aria-hidden="true"
  style={side === 'right' ? 'transform: scaleX(-1)' : ''}
>
  <defs>
    <radialGradient id="{u}-r" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#ff8a80" /><stop offset=".45" stop-color="#d62828" /><stop offset="1" stop-color="#6d0b10" /></radialGradient>
    <radialGradient id="{u}-g" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#fff3b0" /><stop offset=".45" stop-color="#f4b400" /><stop offset="1" stop-color="#8a5a00" /></radialGradient>
    <filter id="{u}-sh" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="2" dy="6" stdDeviation="5" flood-color="#021a0f" flood-opacity=".5" /></filter>
  </defs>
  <g filter="url(#{u}-sh)">
    {#each branches as b}
      <line x1={b.x} y1={b.y} x2={b.x + Math.cos((b.a * Math.PI) / 180) * b.len} y2={b.y + Math.sin((b.a * Math.PI) / 180) * b.len} stroke="#4a2e16" stroke-width={3 * b.w} stroke-linecap="round" />
    {/each}
    {#each all as n}
      <line x1={n.x1} y1={n.y1} x2={n.x2} y2={n.y2} stroke={colors[n.c]} stroke-width="3.2" stroke-linecap="round" />
    {/each}
    {#each balls as b}
      <line x1={b.x} y1={b.y - b.s} x2={b.x} y2={b.y - b.r} stroke="#d9b45a" stroke-width="1.2" />
      <rect x={b.x - 4} y={b.y - b.r - 5} width="8" height="6" rx="1.5" fill="#c9a24a" />
      <circle cx={b.x} cy={b.y} r={b.r} fill="url(#{u}-{b.c})" />
      <ellipse cx={b.x - b.r * 0.35} cy={b.y - b.r * 0.4} rx={b.r * 0.28} ry={b.r * 0.18} fill="#fff" opacity=".75" transform="rotate(-30 {b.x - b.r * 0.35} {b.y - b.r * 0.4})" />
    {/each}
  </g>
</svg>

<style>
  .fir {
    position: absolute;
    top: 0;
    z-index: 2;
    pointer-events: none;
    overflow: visible;
  }
  .left {
    left: 0;
  }
  .right {
    right: 0;
  }
</style>
