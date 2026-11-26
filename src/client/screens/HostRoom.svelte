<script lang="ts">
  import { onMount } from 'svelte';
  import Scene from '../components/Scene.svelte';
  import TopBar from '../components/TopBar.svelte';
  import HostLobby from '../components/HostLobby.svelte';
  import TvView from '../components/TvView.svelte';
  import GameScreen from '../components/GameScreen.svelte';
  import HostMenu from '../components/HostMenu.svelte';
  import AvatarPicker from '../components/AvatarPicker.svelte';
  import ConnBadge from '../components/ConnBadge.svelte';
  import { AVATARS } from '../../shared/game';
  import { route, go } from '../lib/router.svelte';
  import { net, watch, join, host, send, session } from '../lib/net.svelte';
  import { showBanner } from '../lib/alerts.svelte';
  import { clock } from '../lib/clock.svelte';

  const code = (route.path.split('/')[2] ?? '').toUpperCase();
  let stage = $state<'loading' | 'ok' | 'notHost' | 'missing'>('loading');
  let joining = $state(false);
  let name = $state(localStorage.getItem('navidado:name') ?? '');
  let avatar = $state(localStorage.getItem('navidado:avatar') ?? AVATARS[0]);
  let tvMode = $state(false);

  onMount(async () => {
    try {
      const isHost = await watch(code, true);
      stage = isHost ? 'ok' : 'notHost';
    } catch {
      stage = 'missing';
    }
  });

  const safe = (p: Promise<unknown>) => p.catch((e) => showBanner(e.message, 'info', 3500));
  const s = $derived(net.snap?.code === code ? net.snap.state : null);
  const now = $derived(clock.now + net.offset);
  const hostToken = session(code).hostToken;

  async function playSelf(e: Event) {
    e.preventDefault();
    try {
      await join(code, name.trim(), avatar);
      localStorage.setItem('navidado:name', name.trim());
      localStorage.setItem('navidado:avatar', avatar);
      joining = false;
    } catch (err: any) {
      showBanner(err.message, 'info', 3500);
    }
  }
</script>

{#if stage === 'loading' || (stage === 'ok' && !s)}
  <Scene><div class="center">Abriendo la sala…</div></Scene>
{:else if stage === 'missing'}
  <Scene>
    <TopBar title="Sala no encontrada" onback={() => go('/')} />
    <div class="card"><p>No existe ninguna sala con el código <strong>{code}</strong>. Puede que haya caducado.</p></div>
    <button class="btn btn-primary" onclick={() => go('/jugar')}>Crear otra partida</button>
  </Scene>
{:else if stage === 'notHost'}
  <Scene>
    <TopBar title="Sala {code}" onback={() => go('/')} />
    <div class="card"><p>Este dispositivo no es el anfitrión de esta sala.</p></div>
    <div class="stack">
      <button class="btn btn-primary" onclick={() => go(`/s/${code}`)}>Unirme como jugador</button>
      <button class="btn btn-secondary" onclick={() => go(`/tv/${code}`)}>Ver la sala en esta pantalla</button>
    </div>
  </Scene>
{:else if s && s.phase === 'lobby'}
  <Scene wide>
    <TopBar title="Sala {code}" onback={() => go('/')} />
    {#if net.me}
      <p class="me-chip">Juegas como <strong>{s.players.find((p) => p.id === net.me)?.name}</strong> desde este dispositivo</p>
    {/if}
    <HostLobby {s} {code} {hostToken} meId={net.me} onplayself={() => (joining = true)} />
    {#if joining}
      <div class="overlay" role="dialog" aria-modal="true" aria-label="Jugar desde este dispositivo">
        <form class="card sheet" onsubmit={playSelf}>
          <h3>Jugar desde este dispositivo</h3>
          <label class="field"><span>Tu nombre</span><input bind:value={name} maxlength="20" placeholder="Ana" /></label>
          <div class="field"><span>Elige un avatar</span><AvatarPicker bind:value={avatar} /></div>
          <button class="btn btn-primary" type="submit" disabled={!name.trim()}>Entrar</button>
          <button class="btn btn-ghost dark" type="button" onclick={() => (joining = false)}>Cancelar</button>
        </form>
      </div>
    {/if}
  </Scene>
{:else if s && net.me && !tvMode}
  <Scene>
    <GameScreen
      {s}
      {now}
      meId={net.me}
      onroll={() => safe(send.roll())}
      ontarget={(id) => safe(send.target(id))}
      ondirection={(d) => safe(send.direction(d))}
    >
      {#snippet dealActions()}
        <button class="btn btn-primary" onclick={() => safe(host.start())}>¡Todos tienen su regalo, a jugar!</button>
      {/snippet}
      {#snippet finalActions()}
        <button class="btn btn-primary" onclick={() => safe(host.rematch())}>Revancha</button>
        <button class="btn btn-secondary" onclick={() => go('/')}>Salir</button>
      {/snippet}
      {#snippet footer()}
        <div class="stack">
          {#if s.phase === 'playing'}
            <HostMenu paused={s.paused} canUndo={!!net.snap?.canUndo} onpause={() => safe(host.pause())} onresume={() => safe(host.resume())} onundo={() => safe(host.undo())} onend={() => safe(host.end())} onskip={() => safe(host.skip())} skipName={s.pending?.kind === 'roll' ? s.players.find((p) => p.id === s.pending?.playerId)?.name : undefined} />
          {/if}
          <button class="btn btn-ghost" onclick={() => (tvMode = true)}>Ver la mesa en grande</button>
        </div>
      {/snippet}
    </GameScreen>
  </Scene>
{:else if s}
  <TvView {s} {now} {code} />
  <div class="host-bar">
    {#if s.phase === 'deal'}
      <button class="btn btn-primary btn-small" onclick={() => safe(host.start())}>¡Todos tienen su regalo, a jugar!</button>
    {:else if s.phase === 'playing'}
      <HostMenu paused={s.paused} canUndo={!!net.snap?.canUndo} onpause={() => safe(host.pause())} onresume={() => safe(host.resume())} onundo={() => safe(host.undo())} onend={() => safe(host.end())} onskip={() => safe(host.skip())} skipName={s.pending?.kind === 'roll' ? s.players.find((p) => p.id === s.pending?.playerId)?.name : undefined} />
    {:else if s.phase === 'finished'}
      <button class="btn btn-primary btn-small" onclick={() => safe(host.rematch())}>Revancha</button>
    {/if}
    {#if net.me}<button class="btn btn-secondary btn-small" onclick={() => (tvMode = false)}>Volver a mi turno</button>{/if}
  </div>
{/if}
<ConnBadge />

<style>
  .center {
    flex: 1;
    display: grid;
    place-content: center;
    font-weight: 600;
  }
  .stack {
    display: grid;
    gap: 12px;
    margin-top: 14px;
  }
  .me-chip {
    margin: -6px 0 12px;
    color: var(--dorado);
  }
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    display: grid;
    place-items: end center;
    z-index: 30;
    padding: 16px;
  }
  .sheet {
    width: min(100%, 460px);
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .sheet h3 {
    font-weight: 900;
    margin-bottom: 8px;
  }
  .dark {
    color: var(--tinta);
  }
  .host-bar {
    position: fixed;
    right: 16px;
    bottom: 16px;
    z-index: 20;
    display: flex;
    gap: 10px;
    align-items: flex-end;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
</style>
