<script lang="ts">
  import type { ActionId } from '../../shared/game';
  let { action, size = 32, title = '' }: { action: ActionId; size?: number; title?: string } = $props();
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
  {#if action === 'right'}
    <path d="M7 19h19v-8l15 13-15 13v-8H7z" fill="#F28C28" stroke="#c96a12" stroke-width="2" stroke-linejoin="round" />
  {:else if action === 'left'}
    <path d="M41 19H22v-8L7 24l15 13v-8h19z" fill="#2D7DD2" stroke="#1d5ea6" stroke-width="2" stroke-linejoin="round" />
  {:else if action === 'steal'}
    <circle cx="24" cy="25" r="17" fill="#F4B400" stroke="#c78f00" stroke-width="2" />
    <path d="M7.5 20c5-3.4 10.5-4.6 16.5-4.6S35.5 16.6 40.5 20v7.5c-5 2.3-10.5 3.3-16.5 3.3S12.5 29.8 7.5 27.5z" fill="#1f1f1f" />
    <ellipse cx="17" cy="23.5" rx="3.4" ry="2.6" fill="#fff" />
    <ellipse cx="31" cy="23.5" rx="3.4" ry="2.6" fill="#fff" />
    <path d="M18 35c3.5 2.8 8.5 2.8 12 0" stroke="#7a4b00" stroke-width="2.5" fill="none" stroke-linecap="round" />
  {:else if action === 'blindSteal'}
    <rect x="7" y="7" width="34" height="34" rx="8" fill="#D62828" stroke="#a51c1c" stroke-width="2" />
    <circle cx="16" cy="16" r="3.4" fill="#fff" />
    <circle cx="32" cy="16" r="3.4" fill="#fff" />
    <circle cx="24" cy="24" r="3.4" fill="#fff" />
    <circle cx="16" cy="32" r="3.4" fill="#fff" />
    <circle cx="32" cy="32" r="3.4" fill="#fff" />
  {:else if action === 'allRight' || action === 'allLeft'}
    <g
      transform={action === 'allLeft' ? 'translate(48 0) scale(-1 1)' : undefined}
      stroke={action === 'allRight' ? '#2E9E5B' : '#F28C28'}
      fill={action === 'allRight' ? '#2E9E5B' : '#F28C28'}
    >
      <path d="M10.84 19.21A14 14 0 0 1 37.16 19.21" fill="none" stroke-width="5" stroke-linecap="round" />
      <path d="M39.6 25.6L41.5 17.6 32.8 20.9z" stroke-width="1.5" stroke-linejoin="round" />
      <path d="M37.16 28.79A14 14 0 0 1 10.84 28.79" fill="none" stroke-width="5" stroke-linecap="round" />
      <path d="M8.4 22.4L6.5 30.4 15.2 27.1z" stroke-width="1.5" stroke-linejoin="round" />
    </g>
  {:else if action === 'whirl'}
    <path
      d="M24 24a3 3 0 0 1 6 0a6 6 0 0 1-12 0a9 9 0 0 1 18 0a12 12 0 0 1-24 0a15 15 0 0 1 30 0"
      fill="none"
      stroke="#2D7DD2"
      stroke-width="4.2"
      stroke-linecap="round"
    />
  {:else if action === 'keep'}
    <path d="M16 22v-6a8 8 0 0 1 16 0v6" fill="none" stroke="#9a7000" stroke-width="4.5" stroke-linecap="round" />
    <rect x="10" y="21" width="28" height="21" rx="5" fill="#F4B400" stroke="#c78f00" stroke-width="2" />
    <circle cx="24" cy="29.5" r="3.2" fill="#7a5600" />
    <rect x="22.6" y="30" width="2.8" height="6.5" rx="1.4" fill="#7a5600" />
  {:else}
    <path d="M24 5l9 12h-5l8 10h-6l9 11H9l9-11h-6l8-10h-5z" fill="#1F8A4C" stroke="#14653a" stroke-width="1.6" stroke-linejoin="round" />
    <rect x="21" y="38" width="6" height="6" rx="1" fill="#7a4a22" />
    <circle cx="24" cy="5.5" r="2.6" fill="#F4B400" />
    <circle cx="20" cy="22" r="1.6" fill="#D62828" />
    <circle cx="28" cy="31" r="1.6" fill="#F4B400" />
    <circle cx="19" cy="33" r="1.6" fill="#fff" />
  {/if}
</svg>

<style>
  .icon {
    display: inline-block;
    flex: none;
    vertical-align: middle;
  }
</style>
