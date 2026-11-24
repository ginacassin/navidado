<script lang="ts">
  import Scene from '../components/Scene.svelte';
  import Logo from '../components/Logo.svelte';
  import { go } from '../lib/router.svelte';
  import { hasSoloGame } from '../lib/solo.svelte';
</script>

<Scene hills>
  <div class="home">
    <div class="logo-wrap">
      <Logo size="lg" />
      <span class="gift g1" aria-hidden="true">🎁</span>
      <span class="gift g2" aria-hidden="true">🎁</span>
    </div>
    <div class="actions">
      <button class="btn btn-primary" onclick={() => go('/jugar')}>
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M7 4.5v15l12-7.5z" fill="currentColor" /></svg>
        Jugar
      </button>
      {#if hasSoloGame()}
        <button class="btn btn-secondary" onclick={() => go('/solo')}>Seguir la partida de un solo móvil</button>
      {/if}
      <button class="btn btn-secondary" onclick={() => go('/como-se-juega')}>Cómo se juega</button>
      <button class="btn btn-ghost" onclick={() => go('/s/')}>Tengo un código de sala</button>
    </div>
  </div>
</Scene>

<style>
  .home {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    gap: 64px;
    padding-bottom: 110px;
  }
  .logo-wrap {
    margin-top: 5vh;
    position: relative;
    transform: scale(1.12);
    transform-origin: top center;
  }
  .gift {
    position: absolute;
    bottom: -34px;
    font-size: 42px;
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.35));
  }
  @media (max-width: 370px) {
    .logo-wrap {
      transform: none;
    }
  }
  .g1 {
    left: -18px;
    transform: rotate(-10deg);
  }
  .g2 {
    right: -14px;
    font-size: 34px;
    transform: rotate(8deg);
  }
  .actions {
    width: 100%;
    max-width: 320px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    position: relative;
    z-index: 2;
  }
</style>
