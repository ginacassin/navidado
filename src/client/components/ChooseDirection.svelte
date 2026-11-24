<script lang="ts">
  import { pendingRemainingMs, type Direction, type GameState } from '../../shared/game';
  import ActionIcon from './ActionIcon.svelte';
  let { s, now, actorName, onpick }: { s: GameState; now: number; actorName?: string; onpick: (d: Direction) => void } = $props();
  const secs = $derived(Math.ceil(pendingRemainingMs(s, now) / 1000));
</script>

<div class="dir">
  <h2 class="head"><ActionIcon action="whirl" size={34} /> Remolino</h2>
  <div class="card">
    <div class="center"><ActionIcon action="whirl" size={72} /></div>
    <p class="lead">{actorName ? `${actorName}, elige` : 'Elige'} hacia dónde pasan todos su regalo.</p>
    <div class="two">
      <button class="btn btn-secondary big" disabled={s.paused} onclick={() => onpick('left')}><ActionIcon action="left" size={30} /> Izquierda</button>
      <button class="btn btn-secondary big" disabled={s.paused} onclick={() => onpick('right')}>Derecha <ActionIcon action="right" size={30} /></button>
    </div>
    <p class="time" class:hurry={secs <= 5}>⏱ Quedan {secs} s</p>
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
  .center {
    display: flex;
    justify-content: center;
  }
  .lead {
    text-align: center;
    font-weight: 600;
  }
  .two {
    display: grid;
    gap: 12px;
  }
  .big {
    min-height: 64px;
    font-size: 1.25rem;
  }
  .time {
    text-align: center;
    font-weight: 800;
    font-family: var(--titulo);
    margin: 14px 0 4px;
  }
  .time.hurry {
    color: var(--rojo);
  }
</style>
