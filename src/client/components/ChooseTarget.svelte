<script lang="ts">
  import { ACTIONS, blockedReason, eligibleTargets, pendingRemainingMs, type GameState } from '../../shared/game';
  import ActionIcon from './ActionIcon.svelte';
  import Avatar from './Avatar.svelte';

  let { s, now, actorId, onconfirm }: { s: GameState; now: number; actorId: string; onconfirm: (id: string) => void } = $props();
  let sel = $state<string | null>(null);
  const eligible = $derived(eligibleTargets(s, actorId));
  const others = $derived(s.players.filter((p) => p.id !== actorId));
  const secs = $derived(Math.ceil(pendingRemainingMs(s, now) / 1000));
  const actor = $derived(s.players.find((p) => p.id === actorId));
</script>

<div class="choose">
  <h2 class="head"><ActionIcon action="steal" size={34} /> {ACTIONS.steal.name}</h2>
  <div class="card">
    <div class="mask"><ActionIcon action="steal" size={64} /></div>
    <p class="lead">{actor?.name ? `${actor.name}, elige` : 'Elige'} a un jugador para intercambiar vuestros regalos.</p>
    <ul class="opts" role="radiogroup" aria-label="Jugadores">
      {#each others as p (p.id)}
        {@const reason = blockedReason(s, actorId, p.id)}
        {@const ok = eligible.includes(p.id)}
        <li>
          <button
            class="opt"
            class:sel={sel === p.id}
            disabled={!ok}
            role="radio"
            aria-checked={sel === p.id}
            onclick={() => (sel = p.id)}
          >
            <Avatar emoji={p.avatar} size={32} />
            <span class="nm">{p.name}</span>
            {#if reason}<span class="why">{reason === 'Protegido' ? '🔒 ' : ''}{reason}</span>{/if}
            <span class="radio" aria-hidden="true">{#if sel === p.id}✓{/if}</span>
          </button>
        </li>
      {/each}
    </ul>
    <p class="time" class:hurry={secs <= 5}>⏱ Quedan {secs} s</p>
    <button class="btn btn-primary" disabled={!sel || s.paused} onclick={() => sel && onconfirm(sel)}>Confirmar</button>
  </div>
</div>

<style>
  .head {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--nieve);
    font-weight: 900;
    font-size: 1.8rem;
    margin-bottom: 14px;
  }
  .mask {
    display: flex;
    justify-content: center;
    margin-top: -4px;
  }
  .lead {
    text-align: center;
    font-weight: 600;
    margin: 8px 0 14px;
  }
  .opts {
    list-style: none;
    padding: 0;
    margin: 0 0 12px;
    display: grid;
    gap: 6px;
    max-height: 46vh;
    overflow-y: auto;
  }
  .opt {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    min-height: 50px;
    border-radius: 12px;
    border: 1.5px solid #e6d6c0;
    background: var(--nieve);
    color: var(--tinta);
    text-align: left;
  }
  .opt.sel {
    background: #d9efe0;
    border-color: #2e9e5b;
  }
  .opt:disabled {
    opacity: 0.55;
  }
  .nm {
    flex: 1;
    font-weight: 600;
  }
  .why {
    font-size: 0.8rem;
    color: #8a6a00;
  }
  .radio {
    display: grid;
    place-items: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid #c9b9a2;
    color: #fff;
    font-weight: 900;
    font-size: 0.8rem;
  }
  .sel .radio {
    background: #2e9e5b;
    border-color: #2e9e5b;
  }
  .time {
    text-align: center;
    font-weight: 800;
    font-family: var(--titulo);
    color: var(--tinta);
    margin: 4px 0 12px;
  }
  .time.hurry {
    color: var(--rojo);
  }
</style>
