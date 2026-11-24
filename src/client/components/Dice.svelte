<script lang="ts">
  import type { ActionId } from '../../shared/game';
  import ActionIcon from './ActionIcon.svelte';
  import { untrack } from 'svelte';

  /**
   * Dado 3D. `faces` son las 6 acciones del modo; `face` la cara que debe quedar delante.
   * Cada vez que cambia `rollKey` hace la animación de tirada y se detiene en `face`.
   */
  let {
    faces,
    face = 5,
    rollKey = 0,
    size = 170
  }: { faces: ActionId[]; face?: number; rollKey?: number; size?: number } = $props();

  // orientación que deja cada cara de frente
  const base: [number, number][] = [
    [0, 0],
    [0, -90],
    [0, 180],
    [0, 90],
    [-90, 0],
    [90, 0]
  ];
  let spins = $state(0);
  let rolling = $state(false);
  let lastKey = untrack(() => rollKey);

  $effect(() => {
    if (rollKey !== lastKey) {
      lastKey = rollKey;
      spins += 1;
      rolling = true;
      const t = setTimeout(() => (rolling = false), 1250);
      return () => clearTimeout(t);
    }
  });

  const rx = $derived(base[face]?.[0] + spins * 720);
  const ry = $derived(base[face]?.[1] + spins * 360);
  const transforms = ['rotateY(0deg)', 'rotateY(90deg)', 'rotateY(180deg)', 'rotateY(-90deg)', 'rotateX(90deg)', 'rotateX(-90deg)'];
</script>

<div class="wrap" class:rolling style="--s:{size}px">
  <div class="tilt">
    <div class="cube" style="transform: rotateX({rx}deg) rotateY({ry}deg)">
      {#each faces as a, i}
        <div class="face" style="transform: {transforms[i]} translateZ(calc(var(--s) / 2))">
          <ActionIcon action={a} size={size * 0.56} />
        </div>
      {/each}
    </div>
  </div>
  <div class="shadow"></div>
</div>

<style>
  .wrap {
    width: var(--s);
    height: calc(var(--s) * 1.25);
    perspective: calc(var(--s) * 5);
    position: relative;
    display: flex;
    justify-content: center;
  }
  .tilt {
    width: var(--s);
    height: var(--s);
    transform-style: preserve-3d;
    transform: rotateX(-16deg) rotateY(-24deg);
    margin-top: calc(var(--s) * 0.06);
  }
  .rolling .tilt {
    animation: hop 1.2s cubic-bezier(0.3, 0.7, 0.4, 1);
  }
  .cube {
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 1.2s cubic-bezier(0.2, 0.75, 0.25, 1);
  }
  .face {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    border-radius: 20%;
    background: radial-gradient(circle at 35% 30%, #ffffff 0%, #f7f2ec 55%, #e7ddd1 100%);
    box-shadow:
      inset 0 0 0 2px #e6dccf,
      inset 0 -8px 14px rgba(0, 0, 0, 0.08);
    backface-visibility: hidden;
  }
  .shadow {
    position: absolute;
    bottom: 0;
    width: 70%;
    height: 12%;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.28);
    filter: blur(6px);
  }
  .rolling .shadow {
    animation: shadow 1.2s cubic-bezier(0.3, 0.7, 0.4, 1);
  }
  @keyframes hop {
    0% {
      translate: 0 0;
    }
    35% {
      translate: 0 calc(var(--s) * -0.35);
    }
    70% {
      translate: 0 0;
    }
    82% {
      translate: 0 calc(var(--s) * -0.06);
    }
    100% {
      translate: 0 0;
    }
  }
  @keyframes shadow {
    35% {
      transform: scale(0.6);
      opacity: 0.4;
    }
  }
</style>
