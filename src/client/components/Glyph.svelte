<script lang="ts">
  import Gift from './Gift.svelte';
  import Trophy from './Trophy.svelte';
  let { name, size = 30 }: { name: 'gear' | 'gift' | 'die' | 'clock' | 'trophy'; size?: number } = $props();
  const u = 'y' + Math.random().toString(36).slice(2, 8);
</script>

{#if name === 'gift'}
  <Gift {size} />
{:else if name === 'trophy'}
  <span style="display:inline-block;width:{size}px"><Trophy size={size} /></span>
{:else}
  <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true" style="flex:none">
    <defs>
      <linearGradient id="{u}-r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff6b6b" /><stop offset="1" stop-color="#a51c1c" /></linearGradient>
    </defs>
    {#if name === 'gear'}
      <path
        d="M24 6l3.5 1 1 5 3.6 2 4.8-1.8 2.5 2.6-1.8 4.8 2 3.6 5 1 1 3.5-1 3.5-5 1-2 3.6 1.8 4.8-2.5 2.6-4.8-1.8-3.6 2-1 5-3.5 1-3.5-1-1-5-3.6-2-4.8 1.8-2.5-2.6 1.8-4.8-2-3.6-5-1-1-3.5 1-3.5 5-1 2-3.6-1.8-4.8 2.5-2.6 4.8 1.8 3.6-2 1-5z"
        fill="url(#{u}-r)"
        stroke="#7d0e14"
        stroke-width="1.2"
        stroke-linejoin="round"
      />
      <circle cx="24" cy="24" r="7" fill="#fff4e6" stroke="#7d0e14" stroke-width="1.2" />
    {:else if name === 'die'}
      <rect x="7" y="7" width="34" height="34" rx="8" fill="#fff" stroke="#d62828" stroke-width="2.4" />
      {#each [[16, 16], [32, 16], [24, 24], [16, 32], [32, 32]] as [x, y]}<circle cx={x} cy={y} r="3.4" fill="url(#{u}-r)" />{/each}
    {:else}
      <circle cx="24" cy="26" r="16" fill="#fff" stroke="url(#{u}-r)" stroke-width="4" />
      <path d="M24 17v9l6 4" stroke="#7d0e14" stroke-width="3" fill="none" stroke-linecap="round" />
      <rect x="19" y="4" width="10" height="5" rx="2" fill="url(#{u}-r)" />
    {/if}
  </svg>
{/if}
