<script lang="ts">
  import { ACTIONS, type GameEvent } from '../../shared/game';
  import ActionIcon from './ActionIcon.svelte';
  let { ev, instruction, onclose }: { ev: GameEvent; instruction?: string; onclose: () => void } = $props();
</script>

<div class="overlay" role="dialog" aria-modal="true" aria-label="Resultado de la tirada">
  <div class="card res">
    {#if ev.action}
      <div class="ico"><ActionIcon action={ev.action} size={84} /></div>
      <h2>{ACTIONS[ev.action].name}</h2>
    {/if}
    <p class="txt">{ev.text}</p>
    {#if instruction}<p class="instr">{instruction}</p>{/if}
    <button class="btn btn-primary" onclick={onclose}>¡Hecho!</button>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    z-index: 40;
    background: rgba(4, 30, 18, 0.7);
    display: grid;
    place-items: center;
    padding: 20px;
    animation: fade 0.2s ease;
  }
  .res {
    width: min(100%, 380px);
    text-align: center;
    padding: 24px 20px;
    animation: pop 0.35s cubic-bezier(0.2, 0.9, 0.3, 1.3);
  }
  .ico {
    display: flex;
    justify-content: center;
  }
  h2 {
    font-weight: 900;
    font-size: 1.9rem;
    margin: 6px 0;
    color: var(--rojo);
  }
  .txt {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0 0 12px;
  }
  .instr {
    background: #fff3d1;
    border: 2px solid var(--dorado);
    border-radius: 12px;
    padding: 12px;
    font-family: var(--titulo);
    font-weight: 900;
    font-size: 1.2rem;
    margin: 0 0 14px;
  }
  @keyframes fade {
    from {
      opacity: 0;
    }
  }
  @keyframes pop {
    from {
      transform: scale(0.85);
      opacity: 0;
    }
  }
</style>
