<script lang="ts">
  import { DICE_MODES, pendingRemainingMs, playerName, remainingMs, type GameState } from '../../shared/game';
  import Die3D from './Die3D.svelte';
  import TimerChip from './TimerChip.svelte';
  import Logo from './Logo.svelte';
  import Avatar from './Avatar.svelte';
  import { canShake, enableShake } from '../lib/device';
  import { onDestroy } from 'svelte';

  let {
    s,
    now,
    myTurn,
    solo = false,
    rolling = false,
    onroll
  }: {
    s: GameState;
    now: number;
    myTurn: boolean;
    solo?: boolean;
    rolling?: boolean;
    onroll: () => void;
  } = $props();

  const faces = $derived(DICE_MODES[s.config.diceMode].faces);
  const current = $derived(s.pending ? s.players.find((p) => p.id === s.pending!.playerId) : undefined);
  const face = $derived(s.lastRoll?.face ?? Math.max(0, faces.indexOf('nothing')));
  const secs = $derived(Math.ceil(pendingRemainingMs(s, now) / 1000));
  const canAct = $derived(myTurn && !rolling && s.pending?.kind === 'roll' && !s.paused);

  let stopShake: (() => void) | null = null;
  let shakeOn = $state(false);
  async function toggleShake() {
    if (stopShake) {
      stopShake();
      stopShake = null;
      shakeOn = false;
      return;
    }
    stopShake = await enableShake(() => {
      if (canAct) onroll();
    });
    shakeOn = !!stopShake;
  }
  onDestroy(() => stopShake?.());
</script>

<div class="turn">
  <div class="top">
    <Logo size="sm" tagline={false} dice={false} />
    <TimerChip ms={remainingMs(s, now)} paused={s.paused} />
  </div>

  {#if rolling}
    <h2 class="title">¡Rodando!</h2>
  {:else if myTurn}
    <h2 class="title">{solo ? `¡Te toca, ${current?.name}!` : '¡Te toca!'}</h2>
    {#if solo}<p class="sub">Pásale el móvil a {current?.name}</p>{/if}
  {:else if current}
    <div class="who">
      <Avatar emoji={current.avatar} size={56} active />
      <h2 class="title small">Le toca a {current.name}</h2>
    </div>
  {/if}

  <div class="dice"><Die3D {faces} {face} rollKey={s.lastRoll?.seq ?? 0} size={250} glow={canAct} onclick={canAct ? onroll : undefined} /></div>

  {#if myTurn}
    <div class="btns" class:hidden={rolling}>
      <button class="btn btn-primary" disabled={!canAct} onclick={onroll}>Tirar el dado</button>
    </div>
    {#if s.paused}<p class="count">Partida en pausa</p>{/if}
    {#if canShake}
      <button class="shake" onclick={toggleShake}>
        {shakeOn ? '📳 Agitar activado: agita el móvil para tirar' : 'También puedes agitar el móvil (toca para activarlo)'}
      </button>
    {:else}
      <p class="hint">También puedes agitar el móvil</p>
    {/if}
  {:else if s.paused}
    <p class="count">Partida en pausa</p>
  {:else if s.pending && s.pending.kind !== 'roll' && !rolling}
    <p class="count">{playerName(s, s.pending.playerId)} está eligiendo… ({secs} s)</p>
  {/if}
</div>

<style>
  .turn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    text-align: center;
  }
  .top {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }
  .title {
    font-weight: 900;
    font-size: 2.4rem;
    color: var(--nieve);
    text-shadow: 0 3px 0 rgba(0, 0, 0, 0.2);
    line-height: 1.1;
  }
  .title.small {
    font-size: 1.7rem;
  }
  .sub {
    margin: -2px 0 0;
    font-family: var(--titulo);
    font-weight: 800;
    font-size: 1.1rem;
    color: var(--dorado);
  }
  .who {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  .dice {
    margin: 6px 0 10px;
  }
  .btns {
    width: 100%;
    max-width: 300px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .btns.hidden {
    visibility: hidden;
  }
  .count {
    margin: 4px 0 0;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }
  .hint,
  .shake {
    margin: 0;
    font-size: 0.92rem;
    color: rgba(255, 255, 255, 0.85);
    background: none;
    border: none;
  }
  .shake {
    text-decoration: underline;
    text-underline-offset: 3px;
    min-height: 40px;
  }
</style>
