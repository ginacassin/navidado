<script lang="ts">
  import { DICE_MODES, STEAL_LIMITS, type DiceModeId, type GameConfig, type StealLimit } from '../../shared/game';
  import ModeFaces from './ModeFaces.svelte';
  import ActionIcon from './ActionIcon.svelte';

  let { config = $bindable() }: { config: GameConfig } = $props();
  let picking = $state(false);
  const modes = Object.entries(DICE_MODES) as [DiceModeId, (typeof DICE_MODES)[DiceModeId]][];
</script>

<div class="card form">
  <div class="field">
    <span>Modo de dado</span>
    <button class="mode-row" type="button" onclick={() => (picking = !picking)} aria-expanded={picking}>
      <span class="mode-icon"><ActionIcon action="blindSteal" size={30} /></span>
      <span class="mode-txt">
        <strong>{DICE_MODES[config.diceMode].name}</strong>
        {#if config.diceMode === 'clasico'}<small>(predeterminado)</small>{/if}
        <ModeFaces mode={config.diceMode} size={20} />
      </span>
      <svg class="chev" class:open={picking} viewBox="0 0 24 24" width="22" height="22"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" /></svg>
    </button>
    {#if picking}
      <div class="modes" role="radiogroup" aria-label="Modo de dado">
        {#each modes as [id, m]}
          <button
            type="button"
            class="mode-card"
            class:sel={config.diceMode === id}
            role="radio"
            aria-checked={config.diceMode === id}
            onclick={() => {
              config.diceMode = id;
              picking = false;
            }}
          >
            <span class="mc-head"><strong>{m.name}</strong>{#if id === 'clasico'}<small>predeterminado</small>{/if}</span>
            <ModeFaces mode={id} size={24} />
            <small class="muted">{m.desc}</small>
          </button>
        {/each}
      </div>
    {/if}
  </div>

  <label class="field">
    <span>Duración de la partida</span>
    <select bind:value={config.durationMin}>
      {#each [5, 10, 15, 20, 25, 30, 45] as v}<option value={v}>{v} minutos</option>{/each}
    </select>
  </label>
  <label class="field">
    <span>Tiempo para elegir</span>
    <select bind:value={config.chooseSeconds}>
      {#each [5, 10, 15, 20, 30] as v}<option value={v}>{v} segundos</option>{/each}
    </select>
  </label>
  <label class="field">
    <span>Límite de robos</span>
    <select bind:value={config.stealLimit}>
      {#each Object.entries(STEAL_LIMITS) as [v, label]}<option value={v as StealLimit}>{label}</option>{/each}
    </select>
  </label>
  <label class="switch-row">
    <span>Mostrar al final quién trajo cada regalo</span>
    <input type="checkbox" class="switch" bind:checked={config.showBroughtBy} />
  </label>
</div>

<style>
  .form {
    padding: 18px 16px 8px;
  }
  .mode-row {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px 12px;
    border-radius: 12px;
    border: 1.5px solid #e2d3bd;
    background: var(--nieve);
    text-align: left;
    color: var(--tinta);
  }
  .mode-txt {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .mode-txt strong {
    font-family: var(--titulo);
    font-weight: 800;
  }
  .mode-txt small {
    color: var(--tinta-suave);
    margin-top: -4px;
  }
  .chev {
    transition: transform 0.2s;
    color: var(--tinta-suave);
  }
  .chev.open {
    transform: rotate(90deg);
  }
  .modes {
    display: grid;
    gap: 8px;
    margin-top: 8px;
  }
  .mode-card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    padding: 10px 12px;
    border-radius: 12px;
    border: 2px solid #e2d3bd;
    background: var(--nieve);
    color: var(--tinta);
    text-align: left;
  }
  .mode-card.sel {
    border-color: var(--verde);
    background: var(--verde-claro);
  }
  .mc-head {
    display: flex;
    gap: 8px;
    align-items: baseline;
    font-family: var(--titulo);
  }
  .mc-head small {
    color: var(--verde);
    font-weight: 800;
  }
  .switch-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    font-family: var(--titulo);
    font-weight: 800;
    font-size: 0.95rem;
    padding: 4px 0 12px;
  }
  .switch {
    appearance: none;
    width: 52px;
    height: 30px;
    border-radius: 999px;
    background: #cfc2b0;
    position: relative;
    flex: none;
    transition: background 0.2s;
    cursor: pointer;
  }
  .switch::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    transition: transform 0.2s;
  }
  .switch:checked {
    background: #2e9e5b;
  }
  .switch:checked::after {
    transform: translateX(22px);
  }
</style>
