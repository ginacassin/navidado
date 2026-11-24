<script lang="ts">
  import { DICE_MODES, STEAL_LIMITS, type GameConfig, type GameState } from '../../shared/game';
  import QrCode from './QrCode.svelte';
  import SortableList from './SortableList.svelte';
  import ConfigForm from './ConfigForm.svelte';
  import ModeFaces from './ModeFaces.svelte';
  import { host } from '../lib/net.svelte';
  import { showBanner } from '../lib/alerts.svelte';
  import { untrack } from 'svelte';

  let {
    s,
    code,
    hostToken,
    meId,
    onplayself
  }: { s: GameState; code: string; hostToken?: string; meId?: string | null; onplayself?: () => void } = $props();

  const joinUrl = $derived(`${location.origin}/s/${code}`);
  const wideScreen = typeof matchMedia !== 'undefined' && matchMedia('(min-width: 1000px)').matches;
  const hostPhoneUrl = $derived(hostToken ? `${location.origin}/s/${code}#h=${hostToken}` : '');
  let editing = $state(false);
  let draft = $state<GameConfig>(untrack(() => structuredClone($state.snapshot(s.config))));
  const safe = (p: Promise<unknown>) => p.catch((e) => showBanner(e.message, 'info', 3500));

  function openEdit() {
    draft = structuredClone($state.snapshot(s.config));
    editing = true;
  }
</script>

<div class="hl">
  <div class="card invite">
    {#if wideScreen}<h2 class="inv-title">¡Uníos a la partida!</h2>{/if}
    <QrCode text={joinUrl} size={wideScreen ? 340 : 190} label="QR para unirse a la sala {code}" />
    <div class="code-box">
      <small>Código de la sala</small>
      <div class="code">{code}</div>
      <small class="url">o entra en <strong>{location.host}/s</strong></small>
    </div>
  </div>

  <div class="card">
    <div class="row">
      <h3>Jugadores ({s.players.length})</h3>
      {#if onplayself && !meId}<button class="btn btn-secondary btn-small" onclick={onplayself}>Jugar yo también</button>{/if}
    </div>
    {#if s.players.length}
      <p class="muted small">Ordénalos como estáis sentados, en el sentido de las agujas del reloj.</p>
      <SortableList players={s.players} onreorder={(ids) => safe(host.reorder(ids))} onremove={(id) => safe(host.kick(id))} />
    {:else}
      <p class="muted">Aún no hay nadie. Que escaneen el QR con el móvil.</p>
    {/if}
  </div>

  <div class="card">
    <div class="row">
      <h3>Ajustes</h3>
      {#if !editing}<button class="btn btn-secondary btn-small" onclick={openEdit}>Cambiar</button>{/if}
    </div>
    {#if editing}
      <ConfigForm bind:config={draft} />
      <div class="row end">
        <button class="btn btn-ghost dark btn-small" onclick={() => (editing = false)}>Cancelar</button>
        <button class="btn btn-primary btn-small" onclick={() => safe(host.config($state.snapshot(draft)).then(() => (editing = false)))}>Guardar</button>
      </div>
    {:else}
      <ul class="summary">
        <li><span>Modo de dado</span><strong>{DICE_MODES[s.config.diceMode].name}</strong> <ModeFaces mode={s.config.diceMode} size={18} /></li>
        <li><span>Duración</span><strong>{s.config.durationMin} min</strong></li>
        <li><span>Para tirar / elegir</span><strong>{s.config.rollSeconds} s / {s.config.chooseSeconds} s</strong></li>
        <li><span>Límite de robos</span><strong>{STEAL_LIMITS[s.config.stealLimit]}</strong></li>
      </ul>
    {/if}
  </div>

  <button class="btn btn-primary" disabled={s.players.length < 3} onclick={() => safe(host.deal())}>Repartir regalos</button>
  {#if s.players.length < 3}<p class="hint">Hacen falta al menos 3 jugadores.</p>{/if}

  {#if hostPhoneUrl && !meId}
    <details class="card extra">
      <summary>¿Juegas desde tu móvil? Hazte anfitrión en él</summary>
      <div class="extra-body">
        <QrCode text={hostPhoneUrl} size={140} label="QR para ser anfitrión desde tu móvil" />
        <p class="muted small">Escanéalo con tu móvil: entrarás como jugador y con los controles de anfitrión. No lo enseñes al resto.</p>
      </div>
    </details>
  {/if}
  <a class="btn btn-ghost" href="/tv/{code}" target="_blank" rel="noopener">Abrir la vista de TV en otra pantalla</a>
</div>

<style>
  .hl {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .inv-title {
    width: 100%;
    text-align: center;
    font-weight: 900;
    font-size: 2rem;
    color: var(--rojo);
  }
  @media (min-width: 1000px) {
    .hl {
      display: grid;
      grid-template-columns: 1.1fr 1fr;
      align-items: start;
      column-gap: 24px;
    }
    .hl > :global(*) {
      grid-column: 2;
    }
    .hl > .invite {
      grid-column: 1;
      grid-row: 1 / span 8;
      flex-direction: column;
      padding: 32px;
      position: sticky;
      top: 20px;
    }
    .invite .code {
      font-size: 5rem;
    }
  }
  .invite {
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
  }
  .code-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
  .code {
    font-family: var(--titulo);
    font-weight: 900;
    font-size: 3.2rem;
    letter-spacing: 0.18em;
    color: var(--rojo);
    line-height: 1;
  }
  .url {
    color: var(--tinta-suave);
  }
  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }
  .row.end {
    justify-content: flex-end;
  }
  h3 {
    font-weight: 900;
  }
  .small {
    font-size: 0.85rem;
    margin: 6px 0;
  }
  .summary {
    list-style: none;
    padding: 0;
    margin: 10px 0 0;
    display: grid;
    gap: 6px;
    font-size: 0.95rem;
  }
  .summary li {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }
  .summary span {
    color: var(--tinta-suave);
    min-width: 130px;
  }
  .hint {
    text-align: center;
    color: rgba(255, 255, 255, 0.85);
    margin: -6px 0 0;
  }
  .extra summary {
    font-family: var(--titulo);
    font-weight: 800;
    cursor: pointer;
  }
  .extra-body {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-top: 10px;
  }
  .dark {
    color: var(--tinta);
  }
</style>
