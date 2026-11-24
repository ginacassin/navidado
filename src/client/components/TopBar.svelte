<script lang="ts">
  import { back } from '../lib/router.svelte';
  let { title, onback, dark = false }: { title: string; onback?: () => void; dark?: boolean } = $props();
</script>

<header class="bar" class:dark>
  <button class="back" onclick={() => (onback ? onback() : back())} aria-label="Volver">
    <svg viewBox="0 0 24 24" width="26" height="26"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" /></svg>
  </button>
  <h2>{title}</h2>
</header>

<style>
  .bar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: -8px 0 16px;
    color: var(--nieve);
  }
  .dark {
    color: var(--tinta);
  }
  .back {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: none;
    background: rgba(255, 255, 255, 0.12);
    color: inherit;
  }
  h2 {
    font-weight: 900;
    font-size: 1.45rem;
  }
</style>
