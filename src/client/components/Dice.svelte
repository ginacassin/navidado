<script lang="ts">
  import type { ActionId } from '../../shared/game';
  import ActionIcon from './ActionIcon.svelte';
  import { untrack } from 'svelte';

  /**
   * Dado vectorial en vista 3/4 con luz desde arriba a la izquierda.
   * - variant "actions": las caras muestran las acciones del modo; `face` es la que queda delante.
   * - variant "pips": dado clásico de puntos (logo).
   * Cada cambio de `rollKey` lanza la animación de tirada y termina en `face`.
   */
  let {
    faces = [],
    face = 5,
    rollKey = 0,
    size = 170,
    variant = 'actions',
    hat = false,
    glow = false,
    onclick
  }: {
    faces?: ActionId[];
    face?: number;
    rollKey?: number;
    size?: number;
    variant?: 'actions' | 'pips';
    hat?: boolean;
    glow?: boolean;
    onclick?: () => void;
  } = $props();

  const uid = 'd' + Math.random().toString(36).slice(2, 8);
  type P = [number, number];
  // vértices del cubo (vista 3/4)
  const A: P = [34, 70], B: P = [134, 80], C: P = [130, 180], D: P = [30, 170];
  const A2: P = [72, 40], B2: P = [170, 50], C2: P = [166, 148];

  function shrink(pts: P[], k: number): P[] {
    const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
    const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
    return pts.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k]);
  }
  const pts = (ps: P[]) => ps.map((p) => p.join(',')).join(' ');
  // caras con un pequeño margen: el hueco deja ver el bisel
  const top = shrink([A2, B2, B, A], 0.9);
  const right = shrink([B, B2, C2, C], 0.86);
  const front = shrink([A, B, C, D], 0.93);
  /** Matriz que lleva el cuadrado 0..48 del icono a la cara (p0 arriba-izq, p1 arriba-dcha, p3 abajo-izq). */
  function faceMatrix(f: P[]) {
    const [p0, p1, , p3] = f;
    return `matrix(${(p1[0] - p0[0]) / 48} ${(p1[1] - p0[1]) / 48} ${(p3[0] - p0[0]) / 48} ${(p3[1] - p0[1]) / 48} ${p0[0]} ${p0[1]})`;
  }
  const mTop = faceMatrix(top);
  const mRight = faceMatrix(right);
  const mFront = faceMatrix(front);

  // posiciones de puntos (en el cuadrado 0..48)
  const PIPS: Record<number, [number, number][]> = {
    1: [[24, 24]],
    2: [[13, 13], [35, 35]],
    3: [[12, 12], [24, 24], [36, 36]],
    4: [[13, 13], [35, 13], [13, 35], [35, 35]],
    5: [[12, 12], [36, 12], [24, 24], [12, 36], [36, 36]],
    6: [[13, 11], [35, 11], [13, 24], [35, 24], [13, 37], [35, 37]]
  };

  // contenido visible de cada cara
  let shown = $state<{ front: ActionId; top: ActionId; right: ActionId }>(untrack(() => pick(face)));
  let rolling = $state(false);
  let landed = $state(false);
  let lastKey = untrack(() => rollKey);

  function pick(f: number) {
    const list = faces.length ? faces : (['nothing', 'right', 'left', 'steal', 'allRight', 'allLeft'] as ActionId[]);
    const fr = list[f] ?? list[0];
    const others = list.filter((a) => a !== fr);
    const t = others[(f + 1) % Math.max(1, others.length)] ?? fr;
    const r = others.find((a) => a !== t) ?? fr;
    return { front: fr, top: t, right: r };
  }

  $effect(() => {
    const f = face;
    if (!rolling) untrack(() => (shown = pick(f)));
  });

  $effect(() => {
    const k = rollKey;
    untrack(() => {
      if (k === lastKey) return;
      lastKey = k;
      rolling = true;
      landed = false;
      const list = faces.length ? faces : (['nothing'] as ActionId[]);
      const rnd = () => list[Math.floor(Math.random() * list.length)];
      const spin = setInterval(() => (shown = { front: rnd(), top: rnd(), right: rnd() }), 80);
      const t1 = setTimeout(() => {
        clearInterval(spin);
        shown = pick(face);
      }, 620);
      const t2 = setTimeout(() => (landed = true), 680);
      const t3 = setTimeout(() => (rolling = false), 1150);
      const t4 = setTimeout(() => (landed = false), 1500);
      return () => [t1, t2, t3, t4].forEach(clearTimeout);
    });
  });
</script>

<!-- svelte-ignore a11y_no_static_element_interactions, a11y_no_noninteractive_tabindex -->
<div
  class="die"
  class:rolling
  class:glow
  class:clickable={!!onclick}
  style="--s:{size}px"
  onclick={onclick}
  onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && onclick?.()}
  role={onclick ? 'button' : 'img'}
  tabindex={onclick ? 0 : undefined}
  aria-label={onclick ? 'Tirar el dado' : 'Dado'}
>
  {#if glow}<div class="halo" aria-hidden="true"></div>{/if}
  <svg class="shadow" viewBox="0 0 200 40" aria-hidden="true">
    <defs>
      <filter id="{uid}-sb" x="-30%" y="-100%" width="160%" height="300%"><feGaussianBlur stdDeviation="5" /></filter>
      <filter id="{uid}-sc" x="-30%" y="-100%" width="160%" height="300%"><feGaussianBlur stdDeviation="2" /></filter>
    </defs>
    <ellipse cx="108" cy="20" rx="80" ry="10" fill="#021a0f" opacity=".45" filter="url(#{uid}-sb)" />
    <ellipse cx="100" cy="17" rx="62" ry="5" fill="#021a0f" opacity=".45" filter="url(#{uid}-sc)" />
  </svg>
  <div class="body">
    <svg viewBox={hat ? '0 -52 200 238' : '0 22 200 164'} aria-hidden="true">
      <defs>
        <linearGradient id="{uid}-rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#ffffff" /><stop offset=".55" stop-color="#ece3d7" /><stop offset="1" stop-color="#b9a993" />
        </linearGradient>
        <linearGradient id="{uid}-top" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stop-color="#ffffff" /><stop offset="1" stop-color="#f6f0e8" />
        </linearGradient>
        <linearGradient id="{uid}-front" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#fffdfa" /><stop offset=".6" stop-color="#f5eee5" /><stop offset="1" stop-color="#e6dbcd" />
        </linearGradient>
        <linearGradient id="{uid}-right" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#e2d6c6" /><stop offset="1" stop-color="#c2b29d" />
        </linearGradient>
        <radialGradient id="{uid}-pip" cx=".38" cy=".32" r=".7">
          <stop offset="0" stop-color="#ff6b6b" /><stop offset=".55" stop-color="#d62828" /><stop offset="1" stop-color="#8e1515" />
        </radialGradient>
        <linearGradient id="{uid}-hat" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#ff5a5a" /><stop offset=".5" stop-color="#d62828" /><stop offset="1" stop-color="#8e1515" />
        </linearGradient>
        <radialGradient id="{uid}-fur" cx=".4" cy=".3" r=".8">
          <stop offset="0" stop-color="#ffffff" /><stop offset=".7" stop-color="#f3eee8" /><stop offset="1" stop-color="#d9d0c5" />
        </radialGradient>
      </defs>

      <!-- silueta redondeada (bisel) -->
      <polygon points={pts([A2, B2, C2, C, D, A])} fill="url(#{uid}-rim)" stroke="url(#{uid}-rim)" stroke-width="16" stroke-linejoin="round" />
      <!-- caras -->
      <polygon points={pts(top)} fill="url(#{uid}-top)" stroke="url(#{uid}-top)" stroke-width="6" stroke-linejoin="round" />
      <polygon points={pts(right)} fill="url(#{uid}-right)" stroke="url(#{uid}-right)" stroke-width="6" stroke-linejoin="round" />
      <polygon points={pts(front)} fill="url(#{uid}-front)" stroke="url(#{uid}-front)" stroke-width="6" stroke-linejoin="round" />
      <!-- brillos de arista -->
      <path d="M{A[0] + 6} {A[1] - 3} L{B[0] - 6} {B[1] - 2}" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".9" />
      <path d="M{A2[0] + 4} {A2[1] + 1} L{A[0] + 3} {A[1] - 6}" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".8" />
      <ellipse cx="96" cy="58" rx="34" ry="7" fill="#fff" opacity=".55" transform="rotate(4 96 58)" />

      {#if variant === 'pips'}
        <g transform={mFront}>{#each PIPS[3] as [x, y]}<circle cx={x} cy={y} r="5.6" fill="url(#{uid}-pip)" />{/each}</g>
        <g transform={mRight} opacity=".9">{#each PIPS[2] as [x, y]}<circle cx={x} cy={y} r="5.6" fill="url(#{uid}-pip)" />{/each}</g>
        {#if !hat}<g transform={mTop}>{#each PIPS[1] as [x, y]}<circle cx={x} cy={y} r="6" fill="url(#{uid}-pip)" />{/each}</g>{/if}
      {:else}
        <g transform={mTop} opacity=".95"><g transform="translate(10 10) scale(.58)"><ActionIcon action={shown.top} size={48} /></g></g>
        <g transform={mRight} opacity=".82"><g transform="translate(9 9) scale(.62)"><ActionIcon action={shown.right} size={48} /></g></g>
        <g transform={mFront}><g transform="translate(7 7) scale(.71)"><ActionIcon action={shown.front} size={48} /></g></g>
        <!-- sombreado de la cara lateral sobre el icono -->
        <polygon points={pts(right)} fill="#5a4630" opacity=".08" />
      {/if}

      {#if hat}
        <g class="hat">
          <path d="M58 54 C60 8 112 -36 166 -18 C150 -8 146 10 144 50 Z" fill="url(#{uid}-hat)" />
          <path d="M84 30 C100 2 128 -16 156 -16" stroke="#ff8a8a" stroke-width="5" fill="none" stroke-linecap="round" opacity=".55" />
          <path d="M120 46 C122 18 132 0 150 -10" stroke="#7d0e14" stroke-width="6" fill="none" stroke-linecap="round" opacity=".35" />
          <rect x="44" y="40" width="114" height="24" rx="12" fill="url(#{uid}-fur)" transform="rotate(5 101 52)" />
          <circle cx="168" cy="-18" r="15" fill="url(#{uid}-fur)" />
          <circle cx="163" cy="-23" r="5" fill="#fff" opacity=".9" />
        </g>
      {/if}
    </svg>
  </div>
  {#if landed}
    <div class="burst" aria-hidden="true">
      {#each Array(10) as _, i}<i style="--a:{i * 36}deg; --d:{0.75 + (i % 3) * 0.18}"></i>{/each}
    </div>
  {/if}
</div>

<style>
  .die {
    position: relative;
    width: var(--s);
    height: calc(var(--s) * 1.02);
    display: flex;
    justify-content: center;
    align-items: flex-end;
    outline: none;
  }
  .clickable {
    cursor: pointer;
  }
  .clickable:focus-visible .body {
    filter: drop-shadow(0 0 0 4px #fff);
  }
  .body {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 10%;
    transform-origin: 50% 70%;
  }
  .body svg {
    display: block;
    width: 100%;
    height: auto;
    overflow: visible;
  }
  .shadow {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: auto;
    overflow: visible;
    transform-origin: 50% 50%;
  }
  .halo {
    position: absolute;
    inset: 4% 0 14%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 214, 102, 0.55) 0%, rgba(244, 180, 0, 0.18) 40%, transparent 68%);
    animation: halo 2.2s ease-in-out infinite;
  }
  .glow .body {
    animation: float 2.6s ease-in-out infinite;
  }
  .rolling .body {
    animation: tumble 1.15s cubic-bezier(0.25, 0.7, 0.35, 1) both;
  }
  .rolling .shadow {
    animation: shadow 1.15s cubic-bezier(0.25, 0.7, 0.35, 1) both;
  }
  .rolling .halo {
    opacity: 0;
  }
  @keyframes tumble {
    0% {
      transform: translateY(0) rotate(0) scale(1);
      filter: blur(0);
    }
    12% {
      transform: translateY(4%) rotate(8deg) scale(1.04, 0.94);
    }
    32% {
      transform: translateY(-58%) rotate(-210deg) scale(0.9);
      filter: blur(1.2px);
    }
    52% {
      transform: translateY(-14%) rotate(-330deg) scale(0.96);
      filter: blur(0.6px);
    }
    60% {
      transform: translateY(2%) rotate(-360deg) scale(1.08, 0.88);
      filter: blur(0);
    }
    72% {
      transform: translateY(-9%) rotate(-364deg) scale(0.98, 1.03);
    }
    84% {
      transform: translateY(1%) rotate(-360deg) scale(1.03, 0.96);
    }
    100% {
      transform: translateY(0) rotate(-360deg) scale(1);
    }
  }
  @keyframes shadow {
    0%,
    100% {
      transform: scale(1);
      opacity: 1;
    }
    32% {
      transform: scale(0.55);
      opacity: 0.45;
    }
    60% {
      transform: scale(1.06);
      opacity: 1;
    }
    72% {
      transform: scale(0.88);
    }
  }
  @keyframes float {
    50% {
      transform: translateY(-4%);
    }
  }
  @keyframes halo {
    50% {
      transform: scale(1.08);
      opacity: 0.75;
    }
  }
  .burst {
    position: absolute;
    left: 50%;
    top: 55%;
    width: 0;
    height: 0;
    pointer-events: none;
  }
  .burst i {
    position: absolute;
    width: calc(var(--s) * 0.07);
    height: calc(var(--s) * 0.07);
    margin: calc(var(--s) * -0.035);
    background: radial-gradient(circle, #fff7d1 0 25%, #f4b400 60%, transparent 70%);
    clip-path: polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%);
    animation: spark calc(var(--d) * 1s) ease-out forwards;
  }
  @keyframes spark {
    0% {
      transform: rotate(var(--a)) translateY(0) scale(0.4);
      opacity: 1;
    }
    100% {
      transform: rotate(var(--a)) translateY(calc(var(--s) * -0.75)) scale(1.1) rotate(90deg);
      opacity: 0;
    }
  }
</style>
