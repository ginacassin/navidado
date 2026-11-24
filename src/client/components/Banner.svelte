<script lang="ts">
  import { banner } from '../lib/alerts.svelte';
</script>

{#if banner.text}
  {#key banner.id}
    <div class="banner {banner.kind}" role="status" aria-live="assertive">{banner.text}</div>
  {/key}
{/if}

<style>
  .banner {
    position: fixed;
    left: 50%;
    top: calc(14px + env(safe-area-inset-top));
    transform: translateX(-50%);
    z-index: 50;
    max-width: min(92vw, 520px);
    padding: 14px 22px;
    border-radius: 18px;
    font-family: var(--titulo);
    font-weight: 900;
    font-size: 1.25rem;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
    animation: drop 0.35s cubic-bezier(0.2, 0.9, 0.3, 1.3);
    background: var(--crema);
    color: var(--tinta);
  }
  .warn {
    background: var(--dorado);
    color: #3a2a00;
  }
  .last {
    background: var(--rojo);
    color: #fff;
  }
  .over {
    background: #141414;
    color: #fff;
  }
  .instr {
    background: var(--nieve);
    color: var(--tinta);
    border: 3px solid var(--dorado);
  }
  @keyframes drop {
    from {
      transform: translate(-50%, -30px);
      opacity: 0;
    }
  }
</style>
