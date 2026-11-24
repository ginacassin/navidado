<script lang="ts">
  import { giftOf, playerName, type GameState } from '../../shared/game';
  import Avatar from './Avatar.svelte';
  import Gift from './Gift.svelte';
  import Trophy from './Trophy.svelte';
  import type { Snippet } from 'svelte';

  let { s, meId, actions }: { s: GameState; meId?: string; actions?: Snippet } = $props();
  const order = $derived(s.openingOrder ?? s.players.map((p) => p.id));
  const mine = $derived(meId ? giftOf(s, meId) : undefined);
  const brought = (giftId: string) => playerName(s, s.gifts.find((g) => g.id === giftId)?.broughtBy);
  const confetti = Array.from({ length: 44 }, (_, i) => ({
    left: (i * 37 + 5) % 100,
    delay: -((i * 0.53) % 5),
    dur: 4 + ((i * 7) % 4),
    color: ['#F4B400', '#D62828', '#ffffff', '#2E9E5B', '#ffd54f'][i % 5],
    shape: ['rect', 'round', 'strip'][i % 3],
    sway: ((i % 5) - 2) * 18
  }));
</script>

<div class="final">
  <div class="confetti" aria-hidden="true">
    {#each confetti as c}<i class={c.shape} style="left:{c.left}%;animation-duration:{c.dur}s;animation-delay:{c.delay}s;--c:{c.color};--sway:{c.sway}px"></i>{/each}
  </div>
  <div class="trophy"><Trophy size={104} /></div>
  <h2 class="title">¡Se acabó!</h2>
  {#if mine && s.config.showBroughtBy}
    <p class="mine">Te quedas el regalo que trajo <strong>{brought(mine.id)}</strong></p>
  {/if}
  <div class="card">
    <h3>Así se quedan los regalos:</h3>
    <p class="muted small">Abridlos uno a uno en este orden:</p>
    <ol class="list">
      {#each order as pid, i}
        {@const p = s.players.find((x) => x.id === pid)}
        {@const g = giftOf(s, pid)}
        {#if p}
          <li class:me={pid === meId}>
            <span class="n">{i + 1}</span>
            <Avatar emoji={p.avatar} size={30} />
            <span class="nm">{p.name}{#if g && s.config.showBroughtBy}<small>&nbsp;· el regalo de {brought(g.id)}</small>{/if}</span>
            <Gift size={28} tone={i % 3 === 0 ? 'red' : i % 3 === 1 ? 'green' : 'gold'} />
          </li>
        {/if}
      {/each}
    </ol>
  </div>
  {#if s.stats && (s.stats.mostStolen || s.stats.thief || s.stats.mostTraveled)}
    <div class="card stats">
      <h3>Premios de la noche</h3>
      <ul>
        {#if s.stats.thief}<li>🦹 <strong>Ladrón del año:</strong> {playerName(s, s.stats.thief.playerId)} ({s.stats.thief.count} {s.stats.thief.count === 1 ? 'robo' : 'robos'})</li>{/if}
        {#if s.stats.mostStolen}<li>🎯 <strong>Regalo más robado:</strong> el de {brought(s.stats.mostStolen.giftId)} ({s.stats.mostStolen.count} {s.stats.mostStolen.count === 1 ? 'vez' : 'veces'})</li>{/if}
        {#if s.stats.mostTraveled}<li>🧭 <strong>Regalo más viajero:</strong> el de {brought(s.stats.mostTraveled.giftId)} ({s.stats.mostTraveled.count} {s.stats.mostTraveled.count === 1 ? 'viaje' : 'viajes'})</li>{/if}
      </ul>
    </div>
  {/if}
  {#if actions}<div class="actions">{@render actions()}</div>{/if}
</div>

<style>
  .final {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    text-align: center;
    position: relative;
  }
  .confetti {
    position: fixed;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 0;
  }
  .confetti i {
    position: absolute;
    top: -20px;
    width: 9px;
    height: 14px;
    background: var(--c);
    border-radius: 2px;
    animation: fall linear infinite;
    box-shadow: inset 0 -3px 0 rgba(0, 0, 0, 0.12);
  }
  .confetti i.round {
    width: 9px;
    height: 9px;
    border-radius: 50%;
  }
  .confetti i.strip {
    width: 5px;
    height: 18px;
  }
  @keyframes fall {
    0% {
      transform: translate(0, 0) rotateX(0) rotateZ(0);
    }
    25% {
      transform: translate(var(--sway), 27vh) rotateX(180deg) rotateZ(60deg);
    }
    50% {
      transform: translate(0, 55vh) rotateX(360deg) rotateZ(120deg);
    }
    75% {
      transform: translate(calc(var(--sway) * -1), 82vh) rotateX(540deg) rotateZ(180deg);
    }
    100% {
      transform: translate(0, 110vh) rotateX(720deg) rotateZ(240deg);
    }
  }
  .trophy {
    display: flex;
    justify-content: center;
    animation: pop 0.6s cubic-bezier(0.2, 0.9, 0.3, 1.4);
  }
  @keyframes pop {
    from {
      transform: scale(0.3);
    }
  }
  .title {
    font-weight: 900;
    font-size: 2.6rem;
    color: var(--nieve);
  }
  .mine {
    margin: 0;
    font-size: 1.1rem;
    color: var(--dorado);
    font-weight: 600;
  }
  .card {
    text-align: left;
    position: relative;
    z-index: 1;
  }
  h3 {
    font-weight: 900;
    font-size: 1.15rem;
  }
  .small {
    margin: 2px 0 8px;
    font-size: 0.85rem;
  }
  .list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .list li {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 2px;
    border-bottom: 1px solid #ecdcc6;
  }
  .list li.me {
    background: #fff3d1;
    border-radius: 10px;
  }
  .n {
    font-family: var(--titulo);
    font-weight: 900;
    width: 22px;
    color: var(--rojo);
  }
  .nm {
    flex: 1;
    font-weight: 600;
  }
  .nm small {
    font-weight: 500;
    color: var(--tinta-suave);
  }
  .stats ul {
    list-style: none;
    padding: 0;
    margin: 8px 0 0;
    display: grid;
    gap: 6px;
  }
  .actions {
    display: grid;
    gap: 12px;
    position: relative;
    z-index: 1;
  }
</style>
