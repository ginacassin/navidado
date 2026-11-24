<script lang="ts">
  /** Guirnalda de luces cálidas con brillo. */
  let { height = 46 }: { height?: number } = $props();
  const u = 'w' + Math.random().toString(36).slice(2, 8);
  const N = 36;
  const step = 60;
  const bulbs = Array.from({ length: N }, (_, i) => {
    const x = 30 + i * step;
    return { x, y: 19, warm: i % 3 !== 1, delay: (i * 0.37) % 2.4 };
  });
  const wire = 'M0 8' + Array.from({ length: N }, (_, i) => ` Q${30 + i * step} 30 ${(i + 1) * step} 8`).join('');
</script>

<svg class="lights" viewBox="0 0 {N * step} 50" preserveAspectRatio="xMidYMin slice" style="height:{height}px" aria-hidden="true">
  <defs>
    <radialGradient id="{u}-warm" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#fffbe6" /><stop offset=".45" stop-color="#ffe082" /><stop offset="1" stop-color="#f4a300" /></radialGradient>
    <radialGradient id="{u}-white" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#ffffff" /><stop offset=".5" stop-color="#fff3d6" /><stop offset="1" stop-color="#ffcf70" /></radialGradient>
    <radialGradient id="{u}-glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffd54f" stop-opacity=".75" /><stop offset="1" stop-color="#ffd54f" stop-opacity="0" /></radialGradient>
  </defs>
  <path d={wire} stroke="#04291a" stroke-width="2" fill="none" />
  {#each bulbs as b}
    <g transform="translate({b.x} {b.y + 8})">
      <circle r="16" fill="url(#{u}-glow)" class="glow" style="animation-delay:{b.delay}s" />
      <rect x="-3" y="-11" width="6" height="6" rx="1.2" fill="#0c3b25" />
      <ellipse cy="0" rx="4.6" ry="6.4" fill="url(#{u}-{b.warm ? 'warm' : 'white'})" />
      <ellipse cx="-1.4" cy="-2" rx="1.2" ry="2" fill="#fff" opacity=".85" />
    </g>
  {/each}
</svg>

<style>
  .lights {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 3;
    pointer-events: none;
    overflow: visible;
  }
  .glow {
    animation: twinkle 2.4s ease-in-out infinite;
    transform-origin: center;
  }
  @keyframes twinkle {
    0%,
    100% {
      opacity: 0.9;
    }
    50% {
      opacity: 0.35;
    }
  }
</style>
