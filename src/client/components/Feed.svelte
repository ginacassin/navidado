<script lang="ts">
  import type { GameState } from '../../shared/game';
  import ActionIcon from './ActionIcon.svelte';
  let { s, max = 3, light = false }: { s: GameState; max?: number; light?: boolean } = $props();
  const items = $derived(s.events.filter((e) => e.kind === 'action' || e.kind === 'pass' || e.kind === 'timeout').slice(-max).reverse());
</script>

{#if items.length}
  <ul class="feed" class:light aria-label="Últimas jugadas">
    {#each items as e (e.seq)}
      <li>
        {#if e.action}<ActionIcon action={e.action} size={20} />{:else}<span class="dot" aria-hidden="true">{e.kind === 'pass' ? '⏭' : '⏱'}</span>{/if}
        <span>{e.text}</span>
      </li>
    {/each}
  </ul>
{/if}

<style>
  .feed {
    list-style: none;
    margin: 0;
    padding: 10px 12px;
    border-radius: 14px;
    background: rgba(0, 0, 0, 0.18);
    color: rgba(255, 255, 255, 0.92);
    display: grid;
    gap: 6px;
    font-size: 0.9rem;
    text-align: left;
  }
  .feed.light {
    background: var(--crema);
    color: var(--tinta);
  }
  li {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  li:first-child {
    font-weight: 600;
  }
  .dot {
    width: 20px;
    text-align: center;
  }
</style>
