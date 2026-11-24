<script lang="ts">
  import Scene from '../components/Scene.svelte';
  import TopBar from '../components/TopBar.svelte';
  import ActionIcon from '../components/ActionIcon.svelte';
  import { ACTIONS, DICE_MODES, type ActionId, type DiceModeId } from '../../shared/game';
  import { go } from '../lib/router.svelte';

  const steps = [
    ['⚙️', 'Configuración', 'Elige el modo de dado y los ajustes.'],
    ['🎁', 'Reparto inicial', 'La app dice a cada uno a quién darle su regalo.'],
    ['🎲', 'Turnos', 'Por turnos, tirad el dado y haced la acción… o pulsad «Paso».'],
    ['⏱️', 'Temporizador', 'Jugad hasta que se acabe el tiempo (por defecto, 15 min).'],
    ['🏆', 'Final', 'Revelación de quién se queda qué regalo.']
  ];
  const actions = Object.keys(ACTIONS) as ActionId[];
</script>

<Scene>
  <TopBar title="Cómo se juega" />
  <section class="card">
    <ol class="steps">
      {#each steps as [icon, title, text], i}
        <li>
          <span class="num">{i + 1}</span>
          <span class="ico" aria-hidden="true">{icon}</span>
          <span><strong>{title}</strong><br /><small>{text}</small></span>
        </li>
      {/each}
    </ol>
  </section>

  <section class="card">
    <h3>Acciones del dado</h3>
    <ul class="acts">
      {#each actions as a}
        <li><ActionIcon action={a} size={28} /><span><strong>{ACTIONS[a].name}:</strong> {ACTIONS[a].desc.charAt(0).toLowerCase() + ACTIONS[a].desc.slice(1)}</span></li>
      {/each}
    </ul>
  </section>

  <section class="card">
    <h3>Modos de dado <small class="muted">(6 caras)</small></h3>
    <table class="modes">
      <tbody>
        {#each Object.entries(DICE_MODES) as [id, m]}
          <tr>
            <th>{m.name}{#if id === 'clasico'}<small>predeterminado</small>{/if}</th>
            {#each m.faces as f}<td><ActionIcon action={f} size={22} /></td>{/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </section>

  <section class="card">
    <h3>Temporizador de partida</h3>
    <ul class="timer">
      <li><span class="t normal">Más de 3 min</span>Solo minutos, estilo normal.</li>
      <li><span class="t warn">De 3 a 1 min</span>Aviso con vibración y mensaje a los 3 y a los 2 min.</li>
      <li><span class="t last">Último minuto</span>En rojo y con segundos. Vibración al entrar.</li>
      <li><span class="t over">0:00</span>Campanada. Termina la tirada en curso y se pasa al final.</li>
    </ul>
  </section>

  <button class="btn btn-primary" onclick={() => go('/jugar')}>¡A jugar!</button>
</Scene>

<style>
  section {
    margin-bottom: 14px;
  }
  h3 {
    font-weight: 900;
    font-size: 1.15rem;
    margin-bottom: 10px;
    color: var(--rojo);
  }
  .steps {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 12px;
  }
  .steps li {
    display: grid;
    grid-template-columns: 30px 30px 1fr;
    align-items: center;
    gap: 10px;
  }
  .num {
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: var(--rojo);
    color: #fff;
    font-family: var(--titulo);
    font-weight: 900;
  }
  .ico {
    font-size: 24px;
  }
  .steps strong {
    font-family: var(--titulo);
  }
  .acts {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 8px;
    font-size: 0.95rem;
  }
  .acts li {
    display: flex;
    gap: 10px;
    align-items: center;
  }
  .modes {
    width: 100%;
    border-collapse: collapse;
  }
  .modes th {
    text-align: left;
    font-family: var(--titulo);
    font-weight: 800;
    padding: 6px 4px;
  }
  .modes th small {
    display: block;
    font-weight: 600;
    color: var(--tinta-suave);
  }
  .modes td {
    text-align: center;
  }
  .modes tr + tr {
    border-top: 1px solid #ecdcc6;
  }
  .timer {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 8px;
    font-size: 0.92rem;
  }
  .timer li {
    display: grid;
    grid-template-columns: 112px 1fr;
    gap: 10px;
    align-items: center;
  }
  .t {
    border-radius: 10px;
    padding: 8px 6px;
    text-align: center;
    font-family: var(--titulo);
    font-weight: 900;
    color: #fff;
    font-size: 0.9rem;
  }
  .t.normal {
    background: var(--verde);
  }
  .t.warn {
    background: var(--dorado);
    color: #3a2a00;
  }
  .t.last {
    background: var(--rojo);
  }
  .t.over {
    background: #141414;
  }
</style>
