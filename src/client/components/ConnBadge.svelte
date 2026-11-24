<script lang="ts">
  import { net } from '../lib/net.svelte';
</script>

{#if net.everConnected && !net.connected}
  <div class="conn" role="status">Reconectando…</div>
{/if}

<style>
  .conn {
    position: fixed;
    bottom: calc(12px + env(safe-area-inset-bottom));
    left: 50%;
    transform: translateX(-50%);
    z-index: 60;
    background: #141414;
    color: #fff;
    padding: 8px 16px;
    border-radius: 999px;
    font-weight: 600;
    font-size: 0.9rem;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
  }
</style>
