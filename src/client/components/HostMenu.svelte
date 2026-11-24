<script lang="ts">
  let {
    paused,
    canUndo,
    onpause,
    onresume,
    onundo,
    onend,
    label = 'Anfitrión'
  }: {
    paused: boolean;
    canUndo: boolean;
    onpause: () => void;
    onresume: () => void;
    onundo: () => void;
    onend?: () => void;
    label?: string;
  } = $props();
  let open = $state(false);
</script>

<div class="host">
  <button class="toggle" onclick={() => (open = !open)} aria-expanded={open}>⚙️ {label}</button>
  {#if open}
    <div class="menu">
      {#if paused}
        <button class="btn btn-primary btn-small" onclick={onresume}>▶ Seguir</button>
      {:else}
        <button class="btn btn-secondary btn-small" onclick={onpause}>⏸ Pausar</button>
      {/if}
      <button class="btn btn-secondary btn-small" disabled={!canUndo} onclick={onundo}>↶ Deshacer última acción</button>
      {#if onend}
        <button
          class="btn btn-secondary btn-small"
          onclick={() => {
            if (confirm('¿Terminar la partida ahora? Cada uno se queda con el regalo que tiene.')) onend();
          }}>Terminar ya</button
        >
      {/if}
    </div>
  {/if}
</div>

<style>
  .host {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
  .toggle {
    background: rgba(0, 0, 0, 0.2);
    color: #fff;
    border: none;
    border-radius: 999px;
    padding: 8px 16px;
    font-weight: 600;
    min-height: 40px;
  }
  .menu {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
  }
</style>
