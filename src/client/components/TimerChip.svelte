<script lang="ts">
  import { timerLabel, timerState } from '../../shared/game';
  let { ms, paused = false, big = false }: { ms: number; paused?: boolean; big?: boolean } = $props();
  const st = $derived(timerState(ms));
</script>

<div class="chip {st}" class:big role="timer" aria-live="off">
  <svg viewBox="0 0 24 24" width="1.1em" height="1.1em" aria-hidden="true">
    <circle cx="12" cy="13" r="8" fill="none" stroke="currentColor" stroke-width="2.4" />
    <path d="M12 9v4.5l3 2M9.5 2.5h5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" fill="none" />
  </svg>
  {#if paused}
    <span>En pausa · {timerLabel(ms)}</span>
  {:else if st === 'last'}
    <span class="lbl">Último minuto</span><span class="num">{timerLabel(ms)}</span>
  {:else}
    <span>{timerLabel(ms)}</span>
  {/if}
</div>

<style>
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 999px;
    font-family: var(--titulo);
    font-weight: 800;
    font-size: 0.95rem;
    background: var(--crema);
    color: var(--verde);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
    white-space: nowrap;
  }
  .chip.normal {
    background: var(--crema);
    color: var(--verde);
  }
  .chip.warn {
    background: var(--dorado);
    color: #3a2a00;
    animation: pulse 1.6s ease-in-out infinite;
  }
  .chip.last {
    background: var(--rojo);
    color: var(--nieve);
    animation: pulse 1s ease-in-out infinite;
  }
  .chip.over {
    background: #141414;
    color: var(--nieve);
  }
  .lbl {
    font-size: 0.85em;
    opacity: 0.95;
  }
  .num {
    font-variant-numeric: tabular-nums;
    font-size: 1.1em;
  }
  .big {
    font-size: 1.5rem;
    padding: 10px 24px;
  }
  @keyframes pulse {
    50% {
      transform: scale(1.05);
    }
  }
</style>
