<script lang="ts">
  import type { ActionId } from '../../shared/game';
  let { action, size = 32, title = '' }: { action: ActionId; size?: number; title?: string } = $props();
  const u = 'i' + Math.random().toString(36).slice(2, 8);
</script>

<svg
  viewBox="0 0 48 48"
  width={size}
  height={size}
  role={title ? 'img' : 'presentation'}
  aria-label={title || undefined}
  aria-hidden={title ? undefined : 'true'}
  class="icon"
>
  <defs>
    <linearGradient id="{u}-o" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb35c" /><stop offset=".55" stop-color="#f28c28" /><stop offset="1" stop-color="#d9670b" /></linearGradient>
    <linearGradient id="{u}-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6fb2f2" /><stop offset=".55" stop-color="#2d7dd2" /><stop offset="1" stop-color="#1b5aa3" /></linearGradient>
    <linearGradient id="{u}-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fd18d" /><stop offset=".55" stop-color="#2e9e5b" /><stop offset="1" stop-color="#1c7340" /></linearGradient>
    <linearGradient id="{u}-y" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe17a" /><stop offset=".55" stop-color="#f4b400" /><stop offset="1" stop-color="#c98d00" /></linearGradient>
    <linearGradient id="{u}-r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff6b6b" /><stop offset=".55" stop-color="#d62828" /><stop offset="1" stop-color="#9c1818" /></linearGradient>
    <linearGradient id="{u}-t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3cbf6e" /><stop offset="1" stop-color="#14653a" /></linearGradient>
  </defs>
  {#if action === 'right'}
    <path d="M7 19h19v-8l15 13-15 13v-8H7z" fill="url(#{u}-o)" stroke="#b5560a" stroke-width="1.6" stroke-linejoin="round" />
    <path d="M9 21h19v-5" stroke="#fff" stroke-opacity=".55" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" />
  {:else if action === 'left'}
    <path d="M41 19H22v-8L7 24l15 13v-8h19z" fill="url(#{u}-b)" stroke="#164a87" stroke-width="1.6" stroke-linejoin="round" />
    <path d="M39 21H20v-5" stroke="#fff" stroke-opacity=".5" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" />
  {:else if action === 'steal'}
    <circle cx="24" cy="25" r="17" fill="url(#{u}-y)" stroke="#a87600" stroke-width="1.6" />
    <path d="M7.5 20c5-3.4 10.5-4.6 16.5-4.6S35.5 16.6 40.5 20v7.5c-5 2.3-10.5 3.3-16.5 3.3S12.5 29.8 7.5 27.5z" fill="#1f1f1f" />
    <path d="M10 20.5c4-2.2 9-3.1 14-3.1" stroke="#555" stroke-width="1.4" fill="none" stroke-linecap="round" />
    <ellipse cx="17" cy="23.5" rx="3.4" ry="2.6" fill="#fff" />
    <ellipse cx="31" cy="23.5" rx="3.4" ry="2.6" fill="#fff" />
    <circle cx="17.6" cy="23.8" r="1.3" fill="#1f1f1f" />
    <circle cx="31.6" cy="23.8" r="1.3" fill="#1f1f1f" />
    <path d="M18 35c3.5 2.8 8.5 2.8 12 0" stroke="#7a4b00" stroke-width="2.4" fill="none" stroke-linecap="round" />
    <ellipse cx="17" cy="13.5" rx="5" ry="2.2" fill="#fff" opacity=".45" />
  {:else if action === 'blindSteal'}
    <rect x="7" y="7" width="34" height="34" rx="8" fill="url(#{u}-r)" stroke="#861414" stroke-width="1.6" />
    <rect x="10" y="9.5" width="28" height="9" rx="4.5" fill="#fff" opacity=".18" />
    {#each [[16, 16], [32, 16], [24, 24], [16, 32], [32, 32]] as [x, y]}
      <circle cx={x} cy={y + 0.8} r="3.4" fill="#7d1010" opacity=".5" />
      <circle cx={x} cy={y} r="3.4" fill="#fff" />
    {/each}
  {:else if action === 'allRight' || action === 'allLeft'}
    {@const g = action === 'allRight' ? `url(#${u}-g)` : `url(#${u}-o)`}
    {@const dark = action === 'allRight' ? '#155c33' : '#b5560a'}
    <g transform={action === 'allLeft' ? 'translate(48 0) scale(-1 1)' : undefined}>
      <path d="M10.84 19.21A14 14 0 0 1 37.16 19.21" fill="none" stroke={dark} stroke-width="7" stroke-linecap="round" />
      <path d="M10.84 19.21A14 14 0 0 1 37.16 19.21" fill="none" stroke={g} stroke-width="4.6" stroke-linecap="round" />
      <path d="M39.6 25.6L41.8 17.2 32.6 20.7z" fill={g} stroke={dark} stroke-width="1.4" stroke-linejoin="round" />
      <path d="M37.16 28.79A14 14 0 0 1 10.84 28.79" fill="none" stroke={dark} stroke-width="7" stroke-linecap="round" />
      <path d="M37.16 28.79A14 14 0 0 1 10.84 28.79" fill="none" stroke={g} stroke-width="4.6" stroke-linecap="round" />
      <path d="M8.4 22.4L6.2 30.8 15.4 27.3z" fill={g} stroke={dark} stroke-width="1.4" stroke-linejoin="round" />
    </g>
  {:else if action === 'whirl'}
    <path d="M24 24a3 3 0 0 1 6 0a6 6 0 0 1-12 0a9 9 0 0 1 18 0a12 12 0 0 1-24 0a15 15 0 0 1 30 0" fill="none" stroke="#164a87" stroke-width="6" stroke-linecap="round" />
    <path d="M24 24a3 3 0 0 1 6 0a6 6 0 0 1-12 0a9 9 0 0 1 18 0a12 12 0 0 1-24 0a15 15 0 0 1 30 0" fill="none" stroke="url(#{u}-b)" stroke-width="3.8" stroke-linecap="round" />
  {:else if action === 'keep'}
    <path d="M16 22v-6a8 8 0 0 1 16 0v6" fill="none" stroke="#8a6500" stroke-width="5.5" stroke-linecap="round" />
    <path d="M16 22v-6a8 8 0 0 1 16 0v6" fill="none" stroke="#d9a300" stroke-width="3" stroke-linecap="round" />
    <rect x="10" y="21" width="28" height="21" rx="5" fill="url(#{u}-y)" stroke="#a87600" stroke-width="1.6" />
    <rect x="13" y="23.5" width="22" height="5" rx="2.5" fill="#fff" opacity=".35" />
    <circle cx="24" cy="30.5" r="3.2" fill="#6b4a00" />
    <rect x="22.6" y="31" width="2.8" height="6.5" rx="1.4" fill="#6b4a00" />
  {:else}
    <path d="M24 5l9 12h-5l8 10h-6l9 11H9l9-11h-6l8-10h-5z" fill="url(#{u}-t)" stroke="#0f4f2c" stroke-width="1.5" stroke-linejoin="round" />
    <path d="M20 17l-4 5M19 27l-5 6" stroke="#fff" stroke-opacity=".35" stroke-width="1.6" stroke-linecap="round" />
    <rect x="21" y="38" width="6" height="6" rx="1" fill="#7a4a22" />
    <path d="M24 2.2l1.3 2.7 3 .4-2.2 2 .6 3-2.7-1.5-2.7 1.5.6-3-2.2-2 3-.4z" fill="url(#{u}-y)" stroke="#a87600" stroke-width=".6" />
    <circle cx="20" cy="22" r="1.8" fill="#ff5252" />
    <circle cx="28.5" cy="31" r="1.8" fill="#ffd54f" />
    <circle cx="19" cy="33" r="1.8" fill="#fff" />
    <circle cx="27" cy="19.5" r="1.5" fill="#fff" />
  {/if}
</svg>

<style>
  .icon {
    display: inline-block;
    flex: none;
    vertical-align: middle;
    overflow: visible;
  }
</style>
