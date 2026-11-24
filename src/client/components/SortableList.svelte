<script lang="ts">
  import type { Player } from '../../shared/game';
  import Avatar from './Avatar.svelte';

  let {
    players,
    onreorder,
    onremove,
    editable = true
  }: {
    players: Player[];
    onreorder: (ids: string[]) => void;
    onremove?: (id: string) => void;
    editable?: boolean;
  } = $props();

  let dragId = $state<string | null>(null);
  let order = $state<string[]>([]);
  let listEl: HTMLOListElement;
  $effect(() => {
    if (!dragId) order = players.map((p) => p.id);
  });
  const view = $derived(order.map((id) => players.find((p) => p.id === id)).filter((p): p is Player => !!p));

  function down(e: PointerEvent, id: string) {
    if (!editable) return;
    e.preventDefault();
    dragId = id;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function move(e: PointerEvent) {
    if (!dragId) return;
    const rows = [...listEl.querySelectorAll<HTMLElement>('li')];
    let target = rows.length - 1;
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i].getBoundingClientRect();
      if (e.clientY < r.top + r.height / 2) {
        target = i;
        break;
      }
    }
    const from = order.indexOf(dragId);
    if (from !== target) {
      const next = order.slice();
      next.splice(from, 1);
      next.splice(target, 0, dragId);
      order = next;
    }
  }
  function up() {
    if (!dragId) return;
    dragId = null;
    onreorder(order.slice());
  }
  function nudge(id: string, d: number) {
    const i = order.indexOf(id);
    const j = i + d;
    if (j < 0 || j >= order.length) return;
    const next = order.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onreorder(next);
  }
</script>

<ol class="list" bind:this={listEl}>
  {#each view as p, i (p.id)}
    <li class:dragging={dragId === p.id} class:warn={p.seatWarning}>
      <span class="n">{i + 1}</span>
      <Avatar emoji={p.avatar} size={34} dim={!p.connected} />
      <span class="name">{p.name}{#if p.seatWarning}<em> · dice que no está bien sentado</em>{/if}</span>
      {#if editable}
        {#if onremove}
          <button class="icon-btn" aria-label="Quitar a {p.name}" onclick={() => onremove(p.id)}>✕</button>
        {/if}
        <button class="icon-btn sr-move" aria-label="Subir a {p.name}" onclick={() => nudge(p.id, -1)}>▲</button>
        <button
          class="handle"
          aria-label="Arrastrar a {p.name}"
          onpointerdown={(e) => down(e, p.id)}
          onpointermove={move}
          onpointerup={up}
          onpointercancel={up}
          onkeydown={(e) => {
            if (e.key === 'ArrowUp') nudge(p.id, -1);
            if (e.key === 'ArrowDown') nudge(p.id, 1);
          }}
        >
          <svg viewBox="0 0 24 24" width="22" height="22"><path d="M5 8h14M5 12h14M5 16h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" /></svg>
        </button>
      {/if}
    </li>
  {/each}
</ol>

<style>
  .list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
  }
  li {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 4px;
    border-bottom: 1px solid #ecdcc6;
    background: var(--crema);
    touch-action: pan-y;
    transition: background 0.15s;
  }
  li.dragging {
    background: #fff;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    border-radius: 12px;
    position: relative;
    z-index: 2;
  }
  li.warn {
    background: #fff3d1;
  }
  .n {
    display: grid;
    place-items: center;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: #efe2cf;
    font-family: var(--titulo);
    font-weight: 900;
    font-size: 0.9rem;
    flex: none;
  }
  .name {
    flex: 1;
    font-weight: 600;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .name em {
    font-weight: 500;
    color: #9a6a00;
    font-size: 0.85em;
  }
  .icon-btn,
  .handle {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border: none;
    background: transparent;
    color: var(--tinta-suave);
    border-radius: 10px;
    flex: none;
  }
  .handle {
    touch-action: none;
    cursor: grab;
  }
  .sr-move {
    display: none;
  }
  @media (pointer: fine) {
    .sr-move {
      display: grid;
    }
  }
</style>
