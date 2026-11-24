<script lang="ts">
  import { DICE_MODES, giftOf, playerName, remainingMs, timerLabel, timerState, type GameState } from '../../shared/game';
  import Logo from './Logo.svelte';
  import Dice from './Dice.svelte';
  import TimerChip from './TimerChip.svelte';
  import Avatar from './Avatar.svelte';
  import QrCode from './QrCode.svelte';
  import Feed from './Feed.svelte';
  import ActionIcon from './ActionIcon.svelte';

  let { s, now, code }: { s: GameState; now: number; code: string } = $props();
  const ms = $derived(remainingMs(s, now));
  const tst = $derived(timerState(ms));
  const faces = $derived(DICE_MODES[s.config.diceMode].faces);
  const current = $derived(s.pending ? s.players.find((p) => p.id === s.pending!.playerId) : undefined);
  const face = $derived(s.lastRoll?.face ?? Math.max(0, faces.indexOf('nothing')));
  const joinUrl = $derived(`${location.origin}/s/${code}`);
  const lastAction = $derived([...s.events].reverse().find((e) => e.kind === 'action'));
  const brought = (giftId: string) => playerName(s, s.gifts.find((g) => g.id === giftId)?.broughtBy);
</script>

<div class="tv {s.phase} t-{tst}" class:lastmin={s.phase === 'playing' && tst === 'last'}>
  <div class="lights" aria-hidden="true"></div>

  {#if s.phase === 'lobby'}
    <div class="lobby">
      <Logo size="xl" />
      <div class="join card">
        <QrCode text={joinUrl} size={340} label="QR para unirse" />
        <div>
          <p class="big">Escanea el QR para jugar</p>
          <p class="muted">o entra en <strong>{location.host}/s</strong> y escribe</p>
          <div class="code">{code}</div>
        </div>
      </div>
      <div class="row-avs">
        {#each s.players as p (p.id)}<div class="pl"><Avatar emoji={p.avatar} size={96} dim={!p.connected} /><span>{p.name}</span></div>{/each}
        {#if !s.players.length}<p class="wait">Esperando jugadores…</p>{/if}
      </div>
    </div>
  {:else if s.phase === 'deal'}
    <div class="deal">
      <Logo size="lg" tagline={false} />
      <h2>🎁 Reparto inicial</h2>
      <p class="sub">Mira tu móvil: te dice a quién darle tu regalo.</p>
      <div class="deal-grid">
        {#each s.deals as d}
          <div class="deal-item"><Avatar emoji={s.players.find((p) => p.id === d.from)?.avatar ?? ''} size={44} /> {playerName(s, d.from)} <span>→</span> {playerName(s, d.to)}</div>
        {/each}
      </div>
    </div>
  {:else if s.phase === 'playing' && tst === 'last'}
    <svg class="village" viewBox="0 0 1600 300" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 150 Q300 90 640 140 T1600 120 V300 H0Z" fill="#dce8f2" />
      {#each [[180, 150], [330, 140], [1180, 128], [1330, 120]] as [x, y]}
        <rect x={x} y={y - 46} width="70" height="50" fill="#5b3a2a" />
        <path d="M{x - 10} {y - 44} L{x + 35} {y - 84} L{x + 80} {y - 44} Z" fill="#fff" />
        <rect x={x + 26} y={y - 30} width="16" height="18" fill="#ffd54f" />
      {/each}
      {#each [[520, 140], [600, 146], [980, 132], [1460, 118]] as [x, y]}
        <path d="M{x} {y - 70} l26 38 h-12 l20 30 h-68 l20 -30 h-12 z" fill="#0d4a2f" />
      {/each}
      <path d="M0 210 Q400 170 820 205 T1600 190 V300 H0Z" fill="#fff" />
    </svg>
    <div class="last">
      <div class="pill">Último minuto</div>
      <div class="huge">{timerLabel(ms)}</div>
      {#if current}<p class="turn">Le toca a <strong>{current.name}</strong></p>{/if}
      <div class="row-avs small">
        {#each s.players as p (p.id)}<Avatar emoji={p.avatar} size={76} active={p.id === current?.id} dim={!p.connected} />{/each}
      </div>
    </div>
  {:else if s.phase === 'playing'}
    <div class="play">
      <header>
        <Logo size="md" tagline={false} dice={false} />
        <TimerChip {ms} paused={s.paused} big />
      </header>
      <div class="stage">
        <div class="side left">
          {#if s.events.some((e) => e.kind === 'action' || e.kind === 'pass' || e.kind === 'timeout')}
            <h3>Últimas jugadas</h3>
            <Feed {s} max={5} />
          {/if}
        </div>
        <div class="dice"><Dice {faces} {face} rollKey={s.lastRoll?.seq ?? 0} size={380} /></div>
        <div class="side right">
          {#if current}
            <div class="card whose">
              <small>Le toca a</small>
              <strong>{current.name}</strong>
              <Avatar emoji={current.avatar} size={150} />
              {#if s.pending?.kind !== 'roll'}<em>Está eligiendo…</em>{/if}
            </div>
          {/if}
          {#if lastAction?.action}
            <div class="card last-act"><ActionIcon action={lastAction.action} size={40} /> <span>{lastAction.text}</span></div>
          {/if}
        </div>
      </div>
      <footer class="row-avs">
        {#each s.players as p (p.id)}
          <div class="pl" class:cur={p.id === current?.id}>
            <Avatar emoji={p.avatar} size={88} active={p.id === current?.id} dim={!p.connected} />
            <span>{p.name}{p.isProtected ? ' 🔒' : ''}</span>
          </div>
        {/each}
      </footer>
      {#if s.paused}<div class="paused">⏸ Partida en pausa</div>{/if}
    </div>
  {:else if s.phase === 'finished'}
    <div class="fin">
      <div class="trophy">🏆</div>
      <h2>¡Se acabó!</h2>
      <p class="sub">Así se quedan los regalos. Abridlos en este orden:</p>
      <div class="fin-grid">
        {#each s.openingOrder ?? [] as pid, i}
          {@const p = s.players.find((x) => x.id === pid)}
          {@const g = giftOf(s, pid)}
          {#if p}
            <div class="fin-item"><b>{i + 1}</b><Avatar emoji={p.avatar} size={48} /><span>{p.name}{#if g && s.config.showBroughtBy}<small>el regalo de {brought(g.id)}</small>{/if}</span>🎁</div>
          {/if}
        {/each}
      </div>
      {#if s.stats?.thief}<p class="sub">🦹 Ladrón del año: <strong>{playerName(s, s.stats.thief.playerId)}</strong></p>{/if}
    </div>
  {/if}
</div>

<style>
  .tv {
    position: relative;
    min-height: 100dvh;
    color: #fff;
    overflow: hidden;
    padding: 3vh 3vw;
    background: radial-gradient(ellipse at 50% 30%, #137a4e 0%, var(--verde) 45%, var(--verde-osc) 100%);
    display: flex;
    flex-direction: column;
    font-size: clamp(14px, 1.15vw, 26px);
  }
  .tv.lastmin {
    background: radial-gradient(ellipse at 50% 20%, #23466e 0%, #142a47 55%, #0b1830 100%);
  }
  .village {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 30vh;
    pointer-events: none;
  }
  .lights {
    position: absolute;
    inset: 0 0 auto 0;
    height: 40px;
    background:
      radial-gradient(circle at 22px 20px, #fff6c9 0 3.5px, #ffd54f 5px, rgba(244, 180, 0, 0.45) 9px, transparent 15px) 0 0 / 44px 40px repeat-x;
  }
  .tv :global(.chip.big) {
    font-size: 1.5em;
  }
  .tv :global(.feed) {
    font-size: 1em;
  }
  .card {
    background: var(--crema);
    color: var(--tinta);
    border-radius: 22px;
    box-shadow: var(--sombra);
    padding: 1.2em;
  }
  .muted {
    color: var(--tinta-suave);
  }
  .lobby {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3vh;
  }
  .join {
    display: flex;
    align-items: center;
    gap: 2em;
  }
  .big {
    font-family: var(--titulo);
    font-weight: 900;
    font-size: 1.8em;
    margin: 0;
  }
  .code {
    font-family: var(--titulo);
    font-weight: 900;
    font-size: 4.5em;
    letter-spacing: 0.2em;
    color: var(--rojo);
    line-height: 1;
  }
  .row-avs {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1.2em;
  }
  .pl {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    font-family: var(--titulo);
    font-weight: 800;
  }
  .wait {
    font-size: 1.4em;
    opacity: 0.85;
  }
  .play {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2vh;
  }
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 2vh;
  }
  .stage {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 3vw;
  }
  .side h3 {
    font-weight: 900;
    margin-bottom: 0.6em;
  }
  .side.right {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5em;
  }
  .whose {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4em;
    min-width: 14em;
    text-align: center;
    font-size: 1.2em;
  }
  .whose strong {
    font-family: var(--titulo);
    font-weight: 900;
    font-size: 2.2em;
    color: var(--rojo);
  }
  .last-act {
    display: flex;
    align-items: center;
    gap: 0.8em;
    font-weight: 600;
    max-width: 22em;
  }
  footer.row-avs {
    padding-bottom: 1vh;
  }
  .pl.cur span {
    color: var(--dorado);
  }
  .paused {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    background: rgba(0, 0, 0, 0.55);
    font-family: var(--titulo);
    font-weight: 900;
    font-size: 4em;
  }
  .last {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2vh;
    position: relative;
    z-index: 1;
    padding-bottom: 6vh;
  }
  .pill {
    background: var(--rojo);
    padding: 0.4em 1.6em;
    border-radius: 999px;
    font-family: var(--titulo);
    font-weight: 900;
    font-size: 2.6em;
    box-shadow: 0 6px 0 #8e1515;
  }
  .huge {
    font-family: var(--titulo);
    font-weight: 900;
    font-size: 16em;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    text-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
    animation: beat 1s ease-in-out infinite;
  }
  .turn {
    font-size: 1.8em;
    margin: 0;
  }
  .row-avs.small {
    margin-top: 2vh;
  }
  @keyframes beat {
    50% {
      transform: scale(1.04);
    }
  }
  .deal,
  .fin {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2vh;
    text-align: center;
  }
  .deal h2,
  .fin h2 {
    font-weight: 900;
    font-size: 3.4em;
  }
  .sub {
    font-size: 1.5em;
    margin: 0;
  }
  .deal-grid,
  .fin-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(18em, 1fr));
    gap: 0.8em;
    width: 100%;
    max-width: 90vw;
  }
  .deal-item,
  .fin-item {
    display: flex;
    align-items: center;
    gap: 0.6em;
    background: var(--crema);
    color: var(--tinta);
    border-radius: 16px;
    padding: 0.6em 1em;
    font-weight: 700;
    font-size: 1.15em;
    text-align: left;
  }
  .deal-item span {
    color: var(--rojo);
  }
  .fin-item b {
    font-family: var(--titulo);
    color: var(--rojo);
    font-size: 1.3em;
  }
  .fin-item span {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .fin-item small {
    font-weight: 500;
    color: var(--tinta-suave);
  }
  .trophy {
    font-size: 7em;
  }
  @media (max-width: 900px) {
    .tv {
      font-size: 14px;
    }
    .stage {
      grid-template-columns: 1fr;
    }
    .side.left {
      order: 3;
    }
    .join {
      flex-direction: column;
    }
    .huge {
      font-size: 9em;
    }
  }
</style>
