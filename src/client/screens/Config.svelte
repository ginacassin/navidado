<script lang="ts">
  import Scene from '../components/Scene.svelte';
  import TopBar from '../components/TopBar.svelte';
  import ConfigForm from '../components/ConfigForm.svelte';
  import { go, query } from '../lib/router.svelte';
  import { loadConfig, saveConfig } from '../lib/config';
  import { createRoom } from '../lib/net.svelte';
  import { soloNew } from '../lib/solo.svelte';

  const modo = query('modo') === 'sala' ? 'sala' : 'solo';
  let config = $state(loadConfig());
  let busy = $state(false);
  let error = $state('');

  async function next() {
    saveConfig($state.snapshot(config));
    if (modo === 'solo') {
      soloNew($state.snapshot(config));
      go('/solo', true);
      return;
    }
    busy = true;
    error = '';
    try {
      const code = await createRoom($state.snapshot(config));
      go(`/sala/${code}`, true);
    } catch (e: any) {
      error = e?.message ?? 'No se pudo crear la sala. ¿Hay conexión?';
    } finally {
      busy = false;
    }
  }
</script>

<Scene>
  <TopBar title="Crear partida" />
  <ConfigForm bind:config />
  {#if error}<p class="error" role="alert">{error}</p>{/if}
  <div class="cta">
    <button class="btn btn-primary" onclick={next} disabled={busy}>
      {modo === 'sala' ? (busy ? 'Creando sala…' : 'Crear sala') : 'Siguiente: jugadores'}
    </button>
  </div>
</Scene>

<style>
  .cta {
    margin-top: 18px;
  }
  .error {
    background: #fff;
    color: var(--rojo);
    border-radius: 12px;
    padding: 10px 14px;
    font-weight: 600;
  }
</style>
