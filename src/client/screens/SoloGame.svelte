<script lang="ts">
  import Scene from '../components/Scene.svelte';
  import TopBar from '../components/TopBar.svelte';
  import SortableList from '../components/SortableList.svelte';
  import GameScreen from '../components/GameScreen.svelte';
  import HostMenu from '../components/HostMenu.svelte';
  import { solo, act, soloHistory, soloClear } from '../lib/solo.svelte';
  import { clock } from '../lib/clock.svelte';
  import { go } from '../lib/router.svelte';
  import * as G from '../../shared/game';

  if (!solo.s) go('/configurar?modo=solo', true);

  let name = $state('');
  let input = $state<HTMLInputElement>();
  const s = $derived(solo.s);

  function add(e?: Event) {
    e?.preventDefault();
    if (!name.trim()) return;
    if (act((st) => G.addPlayer(st, { id: 'p' + Math.random().toString(36).slice(2, 9), name }))) name = '';
    input?.focus();
  }

  function play(fn: (st: G.GameState) => G.GameState) {
    const before = solo.s ? ($state.snapshot(solo.s) as G.GameState) : null;
    if (act(fn) && before && before.phase === 'playing') {
      soloHistory.push(before);
      if (soloHistory.length > 30) soloHistory.shift();
    }
  }

  const now = $derived(clock.now);
  const rng = G.cryptoRng;
</script>

<Scene>
  {#if s && s.phase === 'lobby'}
    <TopBar title="Un solo móvil" onback={() => go('/configurar?modo=solo')} />
    <div class="card">
      <h3>Añade a los jugadores en orden de asiento</h3>
      <p class="muted small">Siguiendo la mesa en el sentido de las agujas del reloj. Así sabremos quién está a la izquierda y a la derecha de cada uno.</p>
      <SortableList players={s.players} onreorder={(ids) => act((st) => G.reorderPlayers(st, ids))} onremove={(id) => act((st) => G.removePlayer(st, id))} />
      <form class="add" onsubmit={add}>
        <input class="input" bind:this={input} bind:value={name} placeholder="Escribe un nombre…" maxlength="20" aria-label="Nombre del jugador" enterkeyhint="done" />
        <button class="btn btn-secondary btn-small" type="submit" disabled={!name.trim()}>+ Añadir jugador</button>
      </form>
    </div>
    <div class="cta">
      <button class="btn btn-primary" disabled={s.players.length < 3} onclick={() => act((st) => G.startDeal(st, rng, Date.now()))}>
        Empezar partida
      </button>
      {#if s.players.length < 3}<p class="hint">Hacen falta al menos 3 jugadores.</p>{/if}
    </div>
  {:else if s}
    <GameScreen
      {s}
      {now}
      solo
      onroll={() => play((st) => G.roll(st, st.pending!.playerId, rng, Date.now()))}
      onpass={() => play((st) => G.pass(st, st.pending!.playerId, Date.now()))}
      ontarget={(id) => play((st) => G.chooseTarget(st, st.pending!.playerId, id, Date.now()))}
      ondirection={(d) => play((st) => G.chooseDirection(st, st.pending!.playerId, d, Date.now()))}
    >
      {#snippet dealActions()}
        <button class="btn btn-primary" onclick={() => { soloHistory.length = 0; act((st) => G.startPlaying(st, rng, Date.now())); }}>¡Hecho, a jugar!</button>
      {/snippet}
      {#snippet finalActions()}
        <button class="btn btn-primary" onclick={() => act((st) => G.rematch(st))}>Revancha</button>
        <button class="btn btn-secondary" onclick={() => { soloClear(); go('/', true); }}>Volver al inicio</button>
      {/snippet}
      {#snippet footer()}
        {#if s.phase === 'playing'}
          <HostMenu
            label="Opciones"
            paused={s.paused}
            canUndo={soloHistory.length > 0}
            onpause={() => act((st) => G.pause(st, Date.now()))}
            onresume={() => act((st) => G.resume(st, Date.now()))}
            onundo={() => { const prev = soloHistory.pop(); if (prev) act((st) => G.restoreForUndo(prev, st, Date.now())); }}
            onend={() => act((st) => G.endNow(st, rng, Date.now()))}
          />
        {/if}
      {/snippet}
    </GameScreen>
  {/if}
</Scene>

<style>
  h3 {
    font-weight: 900;
    font-size: 1.15rem;
  }
  .small {
    font-size: 0.85rem;
    margin: 4px 0 10px;
  }
  .add {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 12px;
    align-items: center;
  }
  .cta {
    margin-top: 18px;
  }
  .hint {
    text-align: center;
    color: rgba(255, 255, 255, 0.85);
    margin: 8px 0 0;
  }
</style>
