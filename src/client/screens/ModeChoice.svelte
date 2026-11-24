<script lang="ts">
  import Scene from '../components/Scene.svelte';
  import TopBar from '../components/TopBar.svelte';
  import { go } from '../lib/router.svelte';
</script>

<Scene>
  <TopBar title="¿Cómo jugáis?" />
  <button class="choice card" onclick={() => go('/configurar?modo=solo')}>
    <span class="pic" aria-hidden="true">
      <svg viewBox="0 0 64 64" width="56" height="56"><rect x="18" y="6" width="28" height="52" rx="6" fill="#fff" stroke="#2b2320" stroke-width="3" /><circle cx="32" cy="51" r="2.5" fill="#2b2320" /></svg>
    </span>
    <span class="txt">
      <strong>Un solo móvil</strong>
      <small>Un único teléfono hace de dado y de mesa. Escribe los nombres en orden de asiento y pásalo de mano en mano. Funciona sin wifi.</small>
    </span>
  </button>
  <button class="choice card sala" onclick={() => go('/configurar?modo=sala')}>
    <span class="pic" aria-hidden="true">
      <svg viewBox="0 0 64 64" width="56" height="56"><rect x="4" y="8" width="44" height="30" rx="4" fill="#fff" stroke="#D62828" stroke-width="3" /><path d="M18 46h16" stroke="#D62828" stroke-width="3" stroke-linecap="round" /><rect x="38" y="24" width="20" height="34" rx="4" fill="#fff" stroke="#D62828" stroke-width="3" /><rect x="20" y="16" width="12" height="12" rx="2" fill="#D62828" opacity=".25" /></svg>
    </span>
    <span class="txt">
      <strong>Sala tipo Jackbox (multijugador)</strong>
      <small>Crea una sala desde una TV, un portátil o tu móvil. El resto se une con un QR o un código de 4 letras y cada uno tira desde su móvil. El anfitrión también juega.</small>
    </span>
  </button>
  <button class="btn btn-ghost" onclick={() => go('/s/')}>Unirme a una sala con código</button>
</Scene>

<style>
  .choice {
    display: flex;
    gap: 14px;
    align-items: center;
    text-align: left;
    border: none;
    width: 100%;
    margin-bottom: 14px;
    padding: 18px 16px;
    background: #eef6ef;
  }
  .choice.sala {
    background: #fdeeee;
  }
  .choice:active {
    transform: scale(0.98);
  }
  .txt {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  strong {
    font-family: var(--titulo);
    font-weight: 900;
    font-size: 1.2rem;
  }
  small {
    color: var(--tinta-suave);
    line-height: 1.35;
  }
</style>
