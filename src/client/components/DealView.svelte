<script lang="ts">
  import { playerName, type GameState } from '../../shared/game';
  import Avatar from './Avatar.svelte';
  import type { Snippet } from 'svelte';

  let { s, meId, actions }: { s: GameState; meId?: string; actions?: Snippet } = $props();
  const mine = $derived(meId ? s.deals.find((d) => d.from === meId) : undefined);
  const incoming = $derived(meId ? s.deals.find((d) => d.to === meId) : undefined);
  const av = (id: string) => s.players.find((p) => p.id === id)?.avatar ?? '🎁';
</script>

<div class="deal">
  <div class="gift" aria-hidden="true">🎁</div>
  <h2 class="title">Reparto inicial</h2>
  {#if mine}
    <div class="card big">
      <p class="lbl">Dale tu regalo a</p>
      <div class="to"><Avatar emoji={av(mine.to)} size={60} /> <strong>{playerName(s, mine.to)}</strong></div>
      {#if incoming}<p class="muted">y {playerName(s, incoming.from)} te dará el suyo.</p>{/if}
    </div>
    <p class="wait">Cuando todos tengan su regalo, el anfitrión empezará la partida.</p>
  {:else}
    <div class="card">
      <p class="muted">Cada uno le da su regalo a:</p>
      <ul class="list">
        {#each s.deals as d}
          <li>
            <Avatar emoji={av(d.from)} size={30} /> <span class="nm">{playerName(s, d.from)}</span>
            <span class="arrow" aria-label="le da su regalo a">→</span>
            <Avatar emoji={av(d.to)} size={30} /> <span class="nm">{playerName(s, d.to)}</span>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
  {#if actions}<div class="actions">{@render actions()}</div>{/if}
</div>

<style>
  .deal {
    display: flex;
    flex-direction: column;
    gap: 14px;
    text-align: center;
  }
  .gift {
    font-size: 64px;
  }
  .title {
    font-weight: 900;
    font-size: 2rem;
    color: var(--nieve);
  }
  .big {
    padding: 22px;
  }
  .lbl {
    font-family: var(--titulo);
    font-weight: 800;
    font-size: 1.2rem;
    margin: 0 0 10px;
  }
  .to {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    font-family: var(--titulo);
    font-size: 2rem;
    font-weight: 900;
    color: var(--rojo);
  }
  .wait {
    color: rgba(255, 255, 255, 0.9);
    margin: 0;
  }
  .list {
    list-style: none;
    margin: 0;
    padding: 0;
    text-align: left;
  }
  .list li {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 0;
    border-bottom: 1px solid #ecdcc6;
  }
  .nm {
    font-weight: 600;
    flex: 1;
  }
  .arrow {
    font-weight: 900;
    color: var(--rojo);
    font-size: 1.3rem;
  }
  .actions {
    display: grid;
    gap: 12px;
  }
</style>
