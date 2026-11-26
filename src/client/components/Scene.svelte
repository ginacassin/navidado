<script lang="ts">
  import type { Snippet } from 'svelte';
  import Lights from './Lights.svelte';
  import Snow from './Snow.svelte';
  import FirCorner from './FirCorner.svelte';
  let {
    children,
    hills = false,
    lights = true,
    snow = true,
    pad = true,
    tone = 'green',
    wide = false,
    branches = false
  }: {
    children: Snippet;
    hills?: boolean;
    lights?: boolean;
    snow?: boolean;
    pad?: boolean;
    tone?: 'green' | 'night' | 'red';
    wide?: boolean;
    branches?: boolean;
  } = $props();
  const firSize = typeof innerWidth !== 'undefined' && innerWidth > 900 ? 300 : 150;
</script>

<div class="scene {tone}" class:pad class:wide>
  <div class="bokeh" aria-hidden="true"></div>
  <div class="grain" aria-hidden="true"></div>
  {#if snow}<Snow />{/if}
  {#if lights}<Lights />{/if}
  <div class="content">{@render children()}</div>
  {#if branches}
    <FirCorner side="left" size={firSize} />
    <FirCorner side="right" size={firSize} />
  {/if}
  {#if hills}
    <div class="ground" aria-hidden="true">
      <svg class="snow-back" viewBox="0 0 400 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="sc-snow1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef5fb" /><stop offset="1" stop-color="#cfdfec" /></linearGradient>
          <linearGradient id="sc-snow2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" /><stop offset="1" stop-color="#e3edf6" /></linearGradient>
        </defs>
        <path d="M0 44 Q70 18 140 36 T280 30 T400 24 V100 H0Z" fill="url(#sc-snow1)" />
        <path d="M0 70 Q100 46 200 64 T400 56 V100 H0Z" fill="url(#sc-snow2)" />
      </svg>
      {#each [['left', [[30, 1], [62, 0.78], [96, 0.6]]], ['right', [[30, 1.05], [64, 0.8], [100, 0.62]]]] as [side, trees]}
        <svg class="trees {side}" viewBox="0 0 140 90" aria-hidden="true">
          <defs><linearGradient id="sc-tree-{side}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#11633b" /><stop offset="1" stop-color="#063a22" /></linearGradient></defs>
          {#each trees as [x, k]}
            <g transform="translate({side === 'right' ? 140 - Number(x) : x} 84) scale({k})">
              <path d="M0 -76 l20 30 h-9 l17 24 h-10 l15 20 h-66 l15 -20 h-10 l17 -24 h-9 z" fill="url(#sc-tree-{side})" />
              <path d="M0 -76 l7 10 h-14z M-11 -46 h22 l-4 -5 h-14z M-17 -22 h34 l-4 -5 h-26z" fill="#fff" opacity=".9" />
              <rect x="-3" y="-2" width="6" height="7" fill="#4a2e16" />
            </g>
          {/each}
        </svg>
      {/each}
    </div>
  {/if}
</div>

<style>
  .scene {
    position: relative;
    min-height: 100dvh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    color: var(--nieve);
    background:
      radial-gradient(ellipse 130% 55% at 50% -5%, rgba(255, 255, 255, 0.1), transparent 60%),
      radial-gradient(ellipse at 50% 35%, #157f51 0%, var(--verde) 42%, #063722 100%);
  }
  .bokeh {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(circle at 12% 22%, rgba(255, 214, 102, 0.12) 0 18px, transparent 40px),
      radial-gradient(circle at 86% 16%, rgba(255, 214, 102, 0.1) 0 24px, transparent 52px),
      radial-gradient(circle at 92% 58%, rgba(255, 255, 255, 0.06) 0 30px, transparent 60px),
      radial-gradient(circle at 6% 70%, rgba(255, 214, 102, 0.08) 0 26px, transparent 56px),
      radial-gradient(ellipse at 50% 120%, rgba(0, 0, 0, 0.35), transparent 60%);
  }
  .scene.night {
    background: radial-gradient(ellipse at 50% 20%, #23466e 0%, #142a47 55%, #0b1830 100%);
  }
  .scene.red {
    background: radial-gradient(ellipse at 50% 30%, #c62828 0%, #8e1515 60%, #5e0d0d 100%);
  }
  .content {
    position: relative;
    z-index: 2;
    flex: 1;
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 520px;
    margin: 0 auto;
  }
  .wide .content {
    max-width: 1280px;
  }
  .pad .content {
    padding: 40px 18px calc(22px + env(safe-area-inset-bottom));
  }
  .ground {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 130px;
    z-index: 1;
    pointer-events: none;
  }
  .snow-back {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
  .trees {
    position: absolute;
    bottom: 34px;
    width: 140px;
    height: 90px;
  }
  .trees.left {
    left: 0;
  }
  .trees.right {
    right: 0;
  }
  .grain {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.07;
    mix-blend-mode: overlay;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }
</style>
