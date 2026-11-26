<script lang="ts">
  import Scene from '../components/Scene.svelte';
  import Logo from '../components/Logo.svelte';
  import Gift from '../components/Gift.svelte';
  import { go } from '../lib/router.svelte';
  import { hasSoloGame } from '../lib/solo.svelte';
  const big = typeof matchMedia !== 'undefined' && matchMedia('(min-width: 900px) and (min-height: 700px)').matches;
</script>

<Scene hills branches>
  <div class="home">
    <div class="logo-wrap">
      <Logo size={big ? 'xl' : 'lg'} />
      <div class="gifts" aria-hidden="true">
        <span class="g1"><Gift size={big ? 74 : 54} /></span>
        <span class="g2"><Gift size={big ? 56 : 40} tone="green" /></span>
        <span class="g3"><Gift size={big ? 64 : 46} tone="gold" /></span>
      </div>
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
    gap: 28px;
    padding-bottom: 120px;
  }
  .logo-wrap {
    margin-top: 4vh;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .gifts {
    display: flex;
    align-items: flex-end;
    gap: 6px;
    margin-top: 6px;
    filter: drop-shadow(0 6px 8px rgba(2, 26, 15, 0.35));
  }
  .g1 {
    transform: rotate(-6deg);
  }
  .g2 {
    transform: translateY(-2px);
  }
  .g3 {
    transform: rotate(7deg);
  }
  @media (min-width: 900px) and (min-height: 700px) {
    .home {
      justify-content: center;
      gap: 40px;
      padding-bottom: 140px;
    }
    .logo-wrap {
      margin-top: 0;
    }
  }
  .actions {
    width: 100%;
    max-width: 340px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    position: relative;
    z-index: 2;
  }
</style>
