<script lang="ts">
  import { untrack } from 'svelte';
  let { count = 26 }: { count?: number } = $props();
  const flakes = Array.from({ length: untrack(() => count) }, (_, i) => ({
    left: (i * 37 + 11) % 100,
    size: 2 + ((i * 7) % 5),
    dur: 9 + ((i * 13) % 9),
    delay: -((i * 1.7) % 14),
    drift: ((i % 5) - 2) * 14,
    op: 0.35 + ((i * 3) % 5) * 0.12
  }));
</script>

<div class="snow" aria-hidden="true">
  {#each flakes as f}
    <i style="left:{f.left}%; width:{f.size}px; height:{f.size}px; animation-duration:{f.dur}s; animation-delay:{f.delay}s; --drift:{f.drift}px; opacity:{f.op}"></i>
  {/each}
</div>

<style>
  .snow {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 0;
  }
  i {
    position: absolute;
    top: -10px;
    border-radius: 50%;
    background: radial-gradient(circle, #fff 0 40%, rgba(255, 255, 255, 0.4) 70%, transparent 72%);
    animation: fall linear infinite;
  }
  @keyframes fall {
    to {
      transform: translate(var(--drift), 105vh);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .snow {
      display: none;
    }
  }
</style>
