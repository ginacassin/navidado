<script lang="ts">
  import { leftOf, rightOf, type GameState } from '../../shared/game';
  import Avatar from './Avatar.svelte';
  import Logo from './Logo.svelte';

  let { s, meId, onwarn, onleave }: { s: GameState; meId: string; onwarn: () => void; onleave: () => void } = $props();
  const me = $derived(s.players.find((p) => p.id === meId));
  const left = $derived(s.players.length > 1 ? leftOf(s, meId) : undefined);
  const right = $derived(s.players.length > 2 ? rightOf(s, meId) : undefined);
</script>

<div class="lobby">
  <Logo size="md" tagline={false} />
  {#if me}
    <div class="card me">
      <Avatar emoji={me.avatar} size={64} />
      <h2>¡Estás dentro, {me.name}!</h2>
      <p class="muted">Esperando a que el anfitrión empiece la partida…</p>
    </div>
    {#if left && right}
      <div class="card seats">
        <div><small>A tu izquierda</small><strong>{left.avatar} {left.name}</strong></div>
        <div><small>A tu derecha</small><strong>{right.avatar} {right.name}</strong></div>
      </div>
      {#if me.seatWarning}
        <p class="note">Hemos avisado al anfitrión para que revise los asientos.</p>
      {:else}
        <button class="btn btn-ghost" onclick={onwarn}>No es así</button>
      {/if}
    {/if}
  {/if}
  <div class="card players">
    <small class="muted">{s.players.length} {s.players.length === 1 ? 'jugador' : 'jugadores'} en la sala</small>
    <div class="avs">{#each s.players as p (p.id)}<Avatar emoji={p.avatar} size={36} dim={!p.connected} />{/each}</div>
  </div>
  <button class="btn btn-ghost" onclick={onleave}>Salir de la sala</button>
</div>

<style>
  .lobby {
    display: flex;
    flex-direction: column;
    gap: 14px;
    text-align: center;
  }
  .me {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  h2 {
    font-weight: 900;
    font-size: 1.5rem;
  }
  .me p {
    margin: 0;
  }
  .seats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .seats div {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .seats small {
    color: var(--tinta-suave);
  }
  .seats strong {
    font-family: var(--titulo);
    font-size: 1.1rem;
  }
  .note {
    color: var(--dorado);
    margin: 0;
  }
  .avs {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    justify-content: center;
    margin-top: 8px;
  }
</style>
