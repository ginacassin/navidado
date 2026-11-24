<script lang="ts">
  import { ACTIONS, type GameEvent } from '../../shared/game';
  import ActionIcon from './ActionIcon.svelte';
  let { ev, instruction, onclose }: { ev: GameEvent; instruction?: string; onclose: () => void } = $props();
</script>

<div class="overlay" role="dialog" aria-modal="true" aria-label="Resultado de la tirada">
  <div class="res card">
    {#if ev.action}
      <div class="medal" aria-hidden="true">
        <div class="rays"></div>
        <div class="disc"><ActionIcon action={ev.action} size={78} /></div>
      </div>
      <h2>{ACTIONS[ev.action].name}</h2>
    {/if}
    <p class="txt">{ev.text}</p>
    {#if instruction}
      <div class="instr"><span class="lbl">Tu turno de mover regalos</span>{instruction}</div>
    {/if}
    <button class="btn btn-primary" onclick={onclose}>¡Hecho!</button>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    z-index: 40;
    background: radial-gradient(ellipse at 50% 40%, rgba(4, 40, 24, 0.55), rgba(2, 18, 10, 0.85));
    backdrop-filter: blur(7px) saturate(0.9);
    -webkit-backdrop-filter: blur(7px) saturate(0.9);
    display: grid;
    place-items: center;
    padding: 20px;
    animation: fade 0.25s ease;
  }
  .res {
    width: min(100%, 380px);
    text-align: center;
    padding: 64px 22px 22px;
    margin-top: 44px;
    position: relative;
    animation: pop 0.45s cubic-bezier(0.2, 0.9, 0.3, 1.25);
  }
  .medal {
    position: absolute;
    left: 50%;
    top: 0;
    width: 120px;
    height: 120px;
    transform: translate(-50%, -50%);
  }
  .rays {
    position: absolute;
    inset: -34px;
    border-radius: 50%;
    background: repeating-conic-gradient(from 0deg, rgba(255, 214, 102, 0.55) 0 10deg, transparent 10deg 24deg);
    mask: radial-gradient(circle, #000 30%, transparent 70%);
    -webkit-mask: radial-gradient(circle, #000 30%, transparent 70%);
    animation: spin 12s linear infinite;
  }
  .disc {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: radial-gradient(circle at 38% 30%, #ffffff 0%, #fff4e0 55%, #f1dcc0 100%);
    box-shadow:
      0 0 0 5px #f4b400,
      0 0 0 8px #fff3c4,
      0 12px 24px -6px rgba(2, 26, 15, 0.6);
  }
  h2 {
    font-weight: 900;
    font-size: 1.9rem;
    margin: 4px 0 6px;
    color: var(--rojo);
  }
  .txt {
    font-size: 1.08rem;
    font-weight: 600;
    margin: 0 0 14px;
    color: var(--tinta);
  }
  .instr {
    background: linear-gradient(180deg, #fff8dc, #ffefb8);
    border: 2px solid var(--dorado);
    border-radius: 14px;
    padding: 10px 12px 12px;
    font-family: var(--titulo);
    font-weight: 900;
    font-size: 1.2rem;
    margin: 0 0 16px;
    color: var(--tinta);
    box-shadow: inset 0 1px 0 #fff;
  }
  .lbl {
    display: block;
    font-size: 0.72rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #9a6a00;
    margin-bottom: 4px;
  }
  @keyframes fade {
    from {
      opacity: 0;
    }
  }
  @keyframes pop {
    from {
      transform: translateY(24px) scale(0.9);
      opacity: 0;
    }
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
