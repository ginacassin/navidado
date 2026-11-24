<script lang="ts">
  import type { Snippet } from 'svelte';
  import Lights from './Lights.svelte';
  import Snow from './Snow.svelte';
  let {
    children,
    hills = false,
    lights = true,
    snow = true,
    pad = true,
    tone = 'green',
    wide = false
  }: {
    children: Snippet;
    hills?: boolean;
    lights?: boolean;
    snow?: boolean;
    pad?: boolean;
    tone?: 'green' | 'night' | 'red';
    wide?: boolean;
  } = $props();
</script>

<div class="scene {tone}" class:pad class:wide>
  <div class="bokeh" aria-hidden="true"></div>
  {#if snow}<Snow />{/if}
  {#if lights}<Lights />{/if}
  <div class="content">{@render children()}</div>
  {#if hills}
    <svg class="hills" viewBox="0 0 400 140" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="sc-snow1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f9fd" /><stop offset="1" stop-color="#d3e3f0" /></linearGradient>
        <linearGradient id="sc-snow2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" /><stop offset="1" stop-color="#e6eff7" /></linearGradient>
        <linearGradient id="sc-tree" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0f5a36" /><stop offset="1" stop-color="#073b22" /></linearGradient>
      </defs>
      <path d="M0 78 Q70 48 140 70 T280 64 T400 56 V140 H0Z" fill="url(#sc-snow1)" />
      {#each [[34, 70, 1], [58, 74, 0.8], [312, 62, 1.1], [344, 66, 0.85], [372, 58, 0.95]] as [x, y, k]}
        <g transform="translate({x} {y}) scale({k})">
          <path d="M0 -40 l13 20 h-6 l11 16 h-36 l11 -16 h-6 z" fill="url(#sc-tree)" />
          <path d="M0 -40 l5 8 h-10z M-9 -18 h18 l-3 -3 h-12z" fill="#fff" opacity=".85" />
          <rect x="-2" y="-4" width="4" height="6" fill="#4a2e16" />
        </g>
      {/each}
      <path d="M0 100 Q100 72 200 96 T400 88 V140 H0Z" fill="url(#sc-snow2)" />
    </svg>
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
  .hills {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 150px;
    z-index: 1;
  }
</style>
