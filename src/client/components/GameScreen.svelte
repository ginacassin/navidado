<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';
  import { remainingMs, type Direction, type GameEvent, type GameState } from '../../shared/game';
  import TurnPanel from './TurnPanel.svelte';
  import ChooseTarget from './ChooseTarget.svelte';
  import ChooseDirection from './ChooseDirection.svelte';
  import FinalReveal from './FinalReveal.svelte';
  import DealView from './DealView.svelte';
  import ResultCard from './ResultCard.svelte';
  import Feed from './Feed.svelte';
  import { TimerAlerts, endAlert, showBanner } from '../lib/alerts.svelte';
  import { setAwake, vibrate } from '../lib/device';
  import { ding, rattle } from '../lib/sound';

  let {
    s,
    now,
    meId = null,
    solo = false,
    onroll,
    ontarget,
    ondirection,
    dealActions,
    finalActions,
    footer
  }: {
    s: GameState;
    now: number;
    meId?: string | null;
    solo?: boolean;
    onroll: () => void;
    ontarget: (id: string) => void;
    ondirection: (d: Direction) => void;
    dealActions?: Snippet;
    finalActions?: Snippet;
    footer?: Snippet;
  } = $props();

  const ROLL_MS = 1300;
  let rollingUntil = $state(0);
  let result = $state<{ ev: GameEvent; instruction?: string } | null>(null);
  let lastSeq = untrack(() => s.seq);
  let lastRollSeq = untrack(() => s.lastRoll?.seq ?? 0);
  let lastTurnKey = '';
  let lastPhase = untrack(() => s.phase);
  const alerts = new TimerAlerts();
  let timers: ReturnType<typeof setTimeout>[] = [];

  const rolling = $derived(now < rollingUntil);
  const myTurn = $derived(!!s.pending && (solo || s.pending.playerId === meId));

  // Nuevos eventos: animación de dado, resultados e instrucciones
  $effect(() => {
    const seq = s.seq;
    untrack(() => {
      if (seq === lastSeq) return;
      const fresh = s.events.filter((e) => e.seq > lastSeq);
      lastSeq = seq;
      let delay = 0;
      if (s.lastRoll && s.lastRoll.seq !== lastRollSeq) {
        lastRollSeq = s.lastRoll.seq;
        rollingUntil = Date.now() + ROLL_MS;
        delay = ROLL_MS;
        rattle();
      }
      for (const ev of fresh) {
        if (ev.kind !== 'action') {
          if (ev.kind === 'pass') showBanner(ev.text, 'info', 2500);
          continue;
        }
        const instruction = meId ? ev.instructions[meId] : undefined;
        const mineOrSolo = solo || ev.playerId === meId || !!instruction;
        timers.push(
          setTimeout(() => {
            if (mineOrSolo) {
              result = { ev, instruction };
              if (instruction) vibrate([250, 100, 250]);
            } else showBanner(ev.text, 'info', 3000);
          }, delay)
        );
      }
    });
  });

  // Aviso de turno
  $effect(() => {
    const key = s.pending?.kind === 'roll' ? `${s.turnCount}:${s.pending.playerId}` : '';
    untrack(() => {
      if (key && key !== lastTurnKey && s.pending?.playerId === meId && !solo) {
        vibrate([150, 80, 150]);
        ding();
      }
      lastTurnKey = key;
    });
  });

  // Avisos del temporizador y fin de partida
  $effect(() => {
    const ms = remainingMs(s, now);
    const active = s.phase === 'playing' && !s.paused;
    untrack(() => alerts.check(ms, active));
  });
  $effect(() => {
    const ph = s.phase;
    untrack(() => {
      if (ph === 'finished' && lastPhase === 'playing') {
        endAlert();
        showBanner('¡Se acabó!', 'over', 3500);
        result = null;
      }
      lastPhase = ph;
      setAwake(ph === 'playing' || ph === 'deal');
    });
  });

  $effect(() => () => {
    timers.forEach(clearTimeout);
    setAwake(false);
  });

  const actorName = $derived(s.pending ? s.players.find((p) => p.id === s.pending!.playerId)?.name : undefined);
</script>

{#if s.phase === 'deal'}
  <DealView {s} meId={meId ?? undefined} actions={dealActions} />
{:else if s.phase === 'finished'}
  <FinalReveal {s} meId={meId ?? undefined} actions={finalActions} />
{:else if s.phase === 'playing'}
  {#if !rolling && myTurn && s.pending?.kind === 'chooseTarget'}
    <ChooseTarget {s} {now} actorId={s.pending.playerId} onconfirm={ontarget} />
  {:else if !rolling && myTurn && s.pending?.kind === 'chooseDirection'}
    <ChooseDirection {s} {now} actorName={solo ? actorName : undefined} onpick={ondirection} />
  {:else}
    <TurnPanel {s} {now} myTurn={myTurn && s.pending?.kind === 'roll'} {solo} {rolling} {onroll} />
    <div class="feed"><Feed {s} /></div>
  {/if}
{/if}

{#if footer}<div class="footer">{@render footer()}</div>{/if}

{#if result}
  <ResultCard ev={result.ev} instruction={result.instruction} onclose={() => (result = null)} />
{/if}

<style>
  .feed {
    margin-top: 16px;
  }
  .footer {
    margin-top: 18px;
  }
</style>
