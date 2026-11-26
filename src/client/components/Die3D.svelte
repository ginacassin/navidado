<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import type { ActionId } from '../../shared/game';
  import Dice from './Dice.svelte';

  /**
   * Dado 3D real (WebGL). Si el dispositivo no tiene WebGL, usa el dado vectorial.
   * Cada cambio de `rollKey` lanza la tirada y termina mostrando `face` de frente.
   */
  let {
    faces = [],
    face = 5,
    rollKey = 0,
    size = 200,
    variant = 'actions',
    hat = false,
    glow = false,
    bob = false,
    onclick,
    label = 'Dado'
  }: {
    faces?: ActionId[];
    face?: number;
    rollKey?: number;
    size?: number;
    variant?: 'actions' | 'pips';
    hat?: boolean;
    glow?: boolean;
    bob?: boolean;
    onclick?: () => void;
    label?: string;
  } = $props();

  let canvas = $state<HTMLCanvasElement>();
  let wrap = $state<HTMLDivElement>();
  let fallback = $state(false);
  let ready = $state(false);
  let landed = $state(0);
  let renderer: import('../lib/die3d').DieRenderer | null = null;
  let lastKey = untrack(() => rollKey);
  /** Hueco que ocupa en la página; el lienzo es más alto (CANVAS_K) y sobresale por arriba. */
  const height = $derived(Math.round(size * (hat ? 1.25 : 1.0)));
  const CANVAS_K = 1.52;
  const canvasH = $derived(Math.round(size * CANVAS_K));

  onMount(() => {
    let alive = true;
    let io: IntersectionObserver | undefined;
    (async () => {
      try {
        const mod = await import('../lib/die3d');
        if (!alive || !canvas) return;
        if (!mod.webglAvailable()) {
          fallback = true;
          return;
        }
        renderer = new mod.DieRenderer(canvas, { hat, onLand: () => (landed += 1) });
        renderer.resize(size, canvasH);
        renderer.show(face);
        await renderer.setFaces(contents());
        if (!alive) return;
        renderer.setIdle(glow);
        renderer.setBob(bob);
        ready = true;
        io = new IntersectionObserver(([e]) => renderer?.setVisible(e.isIntersecting));
        if (wrap) io.observe(wrap);
      } catch (e) {
        console.warn('Dado 3D no disponible', e);
        fallback = true;
      }
    })();
    return () => {
      alive = false;
      io?.disconnect();
      renderer?.dispose();
      renderer = null;
    };
  });

  function contents() {
    if (variant === 'pips') return [3, 2, 4, 5, 1, 6].map((n) => ({ kind: 'pips' as const, n }));
    const list = faces.length ? faces : (['nothing', 'right', 'left', 'steal', 'allRight', 'allLeft'] as ActionId[]);
    return list.map((action) => ({ kind: 'action' as const, action }));
  }

  // caras nuevas si cambia el modo
  $effect(() => {
    const key = faces.join(',');
    untrack(() => {
      if (renderer && ready && key) renderer.setFaces(contents());
    });
  });
  $effect(() => {
    const k = rollKey;
    const f = face;
    untrack(() => {
      if (!renderer) return;
      if (k !== lastKey) {
        lastKey = k;
        renderer.roll(f);
      } else renderer.show(f);
    });
  });
  $effect(() => {
    const g = glow;
    untrack(() => renderer?.setIdle(g));
  });
  $effect(() => {
    const s = size;
    const h = canvasH;
    untrack(() => renderer?.resize(s, h));
  });
</script>

{#if fallback}
  <Dice {faces} {face} {rollKey} {size} {variant} {hat} {glow} {onclick} />
{:else}
  <!-- svelte-ignore a11y_no_static_element_interactions, a11y_no_noninteractive_tabindex -->
  <div
    class="die3d"
    class:ready
    class:clickable={!!onclick}
    class:glow
    bind:this={wrap}
    style="width:{size}px;height:{height}px"
    onclick={onclick}
    onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && onclick?.()}
    role={onclick ? 'button' : 'img'}
    tabindex={onclick ? 0 : undefined}
    aria-label={onclick ? 'Tirar el dado' : label}
  >
    {#if glow}<div class="halo" aria-hidden="true"></div>{/if}
    <canvas bind:this={canvas} style="width:{size}px;height:{canvasH}px;top:{height - canvasH}px"></canvas>
    {#key landed}
      {#if landed}
        <div class="burst" aria-hidden="true">
          {#each Array(12) as _, i}<i style="--a:{i * 30}deg; --d:{0.7 + (i % 3) * 0.16}"></i>{/each}
        </div>
      {/if}
    {/key}
  </div>
{/if}

<style>
  .die3d {
    position: relative;
    display: block;
    opacity: 0;
    transition: opacity 0.35s ease;
    outline: none;
    --s: 200px;
  }
  .die3d.ready {
    opacity: 1;
  }
  .clickable {
    cursor: pointer;
  }
  canvas {
    position: absolute;
    left: 0;
    display: block;
    pointer-events: none;
  }
  .halo {
    position: absolute;
    inset: 8% 6% 4%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 220, 120, 0.5) 0%, rgba(244, 180, 0, 0.16) 42%, transparent 68%);
    animation: halo 2.2s ease-in-out infinite;
    pointer-events: none;
  }
  @keyframes halo {
    50% {
      transform: scale(1.08);
      opacity: 0.7;
    }
  }
  .burst {
    position: absolute;
    left: 50%;
    top: 58%;
    width: 0;
    height: 0;
    pointer-events: none;
  }
  .burst i {
    position: absolute;
    width: 16px;
    height: 16px;
    margin: -8px;
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
      transform: rotate(var(--a)) translateY(-120px) scale(1.1) rotate(90deg);
      opacity: 0;
    }
  }
</style>
