<script lang="ts">
  import { onMount } from 'svelte';
  import Scene from '../components/Scene.svelte';
  import TopBar from '../components/TopBar.svelte';
  import CodeInput from '../components/CodeInput.svelte';
  import AvatarPicker from '../components/AvatarPicker.svelte';
  import GameScreen from '../components/GameScreen.svelte';
  import PlayerLobby from '../components/PlayerLobby.svelte';
  import HostLobby from '../components/HostLobby.svelte';
  import HostMenu from '../components/HostMenu.svelte';
  import ConnBadge from '../components/ConnBadge.svelte';
  import { AVATARS } from '../../shared/game';
  import { route, go } from '../lib/router.svelte';
  import { net, join, resume, send, host, serverNow, session, forgetPlayer, reset } from '../lib/net.svelte';
  import { showBanner } from '../lib/alerts.svelte';
  import { clock } from '../lib/clock.svelte';

  const pathCode = (route.path.split('/')[2] ?? '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
  const hashHost = new URLSearchParams(route.hash.slice(1)).get('h') ?? undefined;

  let code = $state(pathCode);
  let name = $state(localStorage.getItem('navidado:name') ?? '');
  let avatar = $state(localStorage.getItem('navidado:avatar') ?? AVATARS[Math.floor(Math.random() * AVATARS.length)]);
  let stage = $state<'form' | 'loading' | 'in'>(pathCode && session(pathCode).token ? 'loading' : 'form');
  let error = $state('');
  let busy = $state(false);

  onMount(async () => {
    reset();
    if (pathCode && session(pathCode).token) {
      stage = (await resume(pathCode)) ? 'in' : 'form';
      if (stage === 'in') cleanHash();
    }
  });

  function cleanHash() {
    if (location.hash) history.replaceState(null, '', `/s/${code}`);
  }

  async function submit(e: Event) {
    e.preventDefault();
    error = '';
    if (code.length !== 4) return (error = 'El código tiene 4 letras');
    if (!name.trim()) return (error = 'Escribe tu nombre');
    busy = true;
    try {
      await join(code, name.trim(), avatar, hashHost);
      localStorage.setItem('navidado:name', name.trim());
      localStorage.setItem('navidado:avatar', avatar);
      history.replaceState(null, '', `/s/${code}`);
      stage = 'in';
    } catch (err: any) {
      error = err.message;
    } finally {
      busy = false;
    }
  }

  const safe = (p: Promise<unknown>) => p.catch((e) => showBanner(e.message, 'info', 3000));
  const s = $derived(net.snap?.code === code ? net.snap.state : null);
  const now = $derived(clock.now + net.offset);

  function leave() {
    safe(send.leave());
    forgetPlayer(code);
    reset();
    go('/', true);
  }

  $effect(() => {
    if (net.kicked && stage === 'in') {
      stage = 'form';
      error = 'El anfitrión te ha quitado de la sala.';
    }
  });
</script>

<Scene>
  {#if stage === 'form'}
    <TopBar title="Unirse a una sala" onback={() => go('/')} />
    <form class="card join" onsubmit={submit}>
      <div class="scan" aria-hidden="true">
        <svg viewBox="0 0 64 64" width="70" height="70"><path d="M6 20V8a2 2 0 0 1 2-2h12M44 6h12a2 2 0 0 1 2 2v12M58 44v12a2 2 0 0 1-2 2H44M20 58H8a2 2 0 0 1-2-2V44" stroke="#2b2320" stroke-width="4" fill="none" stroke-linecap="round" /><rect x="16" y="16" width="12" height="12" fill="#2b2320" /><rect x="36" y="16" width="12" height="12" fill="#2b2320" /><rect x="16" y="36" width="12" height="12" fill="#2b2320" /><rect x="38" y="38" width="4" height="4" fill="#2b2320" /><rect x="44" y="44" width="4" height="4" fill="#2b2320" /><rect x="38" y="46" width="4" height="4" fill="#2b2320" /></svg>
      </div>
      <p class="lead">Escanea el QR o escribe el código de 4 letras</p>
      <CodeInput bind:value={code} />
      <label class="field"><span>Tu nombre</span><input bind:value={name} maxlength="20" autocomplete="nickname" placeholder="Marta" /></label>
      <div class="field"><span>Elige un avatar</span><AvatarPicker bind:value={avatar} /></div>
      {#if error}<p class="error" role="alert">{error}</p>{/if}
      <button class="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Entrando…' : 'Unirme'}</button>
    </form>
  {:else if stage === 'loading' || !s || !net.me}
    <div class="loading"><div class="spin">🎲</div><p>Entrando en la sala…</p></div>
  {:else if s.phase === 'lobby'}
    {#if net.isHost}
      <TopBar title="Tu sala" onback={() => go('/')} />
      <HostLobby {s} {code} meId={net.me} />
    {:else}
      <PlayerLobby {s} meId={net.me} onwarn={() => safe(send.seatWarning())} onleave={leave} />
    {/if}
  {:else}
    <GameScreen
      {s}
      {now}
      meId={net.me}
      onroll={() => safe(send.roll())}
      ontarget={(id) => safe(send.target(id))}
      ondirection={(d) => safe(send.direction(d))}
    >
      {#snippet dealActions()}
        {#if net.isHost}<button class="btn btn-primary" onclick={() => safe(host.start())}>¡Todos tienen su regalo, a jugar!</button>{/if}
      {/snippet}
      {#snippet finalActions()}
        {#if net.isHost}<button class="btn btn-primary" onclick={() => safe(host.rematch())}>Revancha</button>{/if}
        <button class="btn btn-secondary" onclick={() => go('/')}>Salir</button>
      {/snippet}
      {#snippet footer()}
        {#if net.isHost && s.phase === 'playing'}
          <HostMenu
            paused={s.paused}
            canUndo={!!net.snap?.canUndo}
            onpause={() => safe(host.pause())}
            onresume={() => safe(host.resume())}
            onundo={() => safe(host.undo())}
            onend={() => safe(host.end())} onskip={() => safe(host.skip())} skipName={s.pending?.kind === 'roll' ? s.players.find((p) => p.id === s.pending?.playerId)?.name : undefined}
          />
        {/if}
      {/snippet}
    </GameScreen>
  {/if}
</Scene>
<ConnBadge />

<style>
  .join {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .scan {
    display: flex;
    justify-content: center;
  }
  .lead {
    text-align: center;
    font-weight: 600;
    margin: 4px 0 12px;
  }
  .join .field {
    margin-top: 12px;
  }
  .error {
    color: var(--rojo);
    font-weight: 600;
    margin: 4px 0;
  }
  .loading {
    flex: 1;
    display: grid;
    place-content: center;
    text-align: center;
    font-weight: 600;
  }
  .spin {
    font-size: 54px;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
