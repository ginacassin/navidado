<script lang="ts">
  import type { Snippet } from 'svelte';
  let {
    children,
    hills = false,
    lights = true,
    pad = true,
    tone = 'green',
    wide = false
  }: { children: Snippet; hills?: boolean; lights?: boolean; pad?: boolean; tone?: 'green' | 'night' | 'red'; wide?: boolean } = $props();
</script>

<div class="scene {tone}" class:pad class:wide>
  {#if lights}<div class="lights" aria-hidden="true"></div>{/if}
  <div class="sparkles" aria-hidden="true">
    <span style="left:8%;top:12%">✦</span><span style="left:88%;top:9%">✦</span><span style="left:78%;top:28%">✧</span>
    <span style="left:14%;top:38%">✧</span><span style="left:92%;top:52%">✦</span><span style="left:5%;top:64%">✦</span>
  </div>
  <div class="content">{@render children()}</div>
  {#if hills}
    <svg class="hills" viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 70 Q60 40 130 62 T260 58 T400 50 V120 H0Z" fill="#e8f1f7" />
      <path d="M0 90 Q90 64 190 86 T400 78 V120 H0Z" fill="#fff" />
      {#each [[30, 58], [62, 64], [300, 52], [338, 58], [370, 50]] as [x, y]}
        <path d="M{x} {y - 34} l12 18 h-6 l10 14 h-32 l10 -14 h-6 z" fill="#0d4a2f" />
        <rect x={x - 2} y={y - 2} width="4" height="5" fill="#5a3a1c" />
      {/each}
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
      radial-gradient(ellipse 120% 60% at 50% 0%, rgba(255, 255, 255, 0.08), transparent 60%),
      radial-gradient(ellipse at 50% 30%, #137a4e 0%, var(--verde) 45%, var(--verde-osc) 100%);
  }
  .scene.night {
    background:
      radial-gradient(ellipse at 50% 20%, #23466e 0%, #142a47 55%, #0b1830 100%);
  }
  .scene.red {
    background: radial-gradient(ellipse at 50% 30%, #c62828 0%, #8e1515 60%, #5e0d0d 100%);
  }
  .content {
    position: relative;
    z-index: 1;
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
    padding: 34px 18px calc(22px + env(safe-area-inset-bottom));
  }
  .lights {
    position: absolute;
    inset: 0 0 auto 0;
    height: 30px;
    z-index: 2;
    pointer-events: none;
    background:
      radial-gradient(circle at 17px 15px, #fff6c9 0 2.5px, #ffd54f 3.5px, rgba(244, 180, 0, 0.45) 6px, transparent 11px) 0 0 / 34px 30px repeat-x,
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='34' height='30'%3E%3Cpath d='M0 8 Q17 20 34 8' stroke='%23052b1b' stroke-width='1.6' fill='none'/%3E%3C/svg%3E")
        0 0 / 34px 30px repeat-x;
    animation: twinkle 2.4s ease-in-out infinite alternate;
  }
  .sparkles span {
    position: absolute;
    color: var(--dorado);
    opacity: 0.55;
    font-size: 14px;
    animation: twinkle 3s ease-in-out infinite alternate;
  }
  .sparkles span:nth-child(2n) {
    animation-delay: 1.1s;
    font-size: 10px;
  }
  .hills {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 130px;
    z-index: 0;
  }
  @keyframes twinkle {
    from {
      opacity: 0.55;
    }
    to {
      opacity: 1;
    }
  }
</style>
