<script lang="ts">
  import { onMount } from 'svelte';
  import TvView from '../components/TvView.svelte';
  import Scene from '../components/Scene.svelte';
  import ConnBadge from '../components/ConnBadge.svelte';
  import { route } from '../lib/router.svelte';
  import { net, watch } from '../lib/net.svelte';
  import { clock } from '../lib/clock.svelte';

  const code = (route.path.split('/')[2] ?? '').toUpperCase();
  let error = $state('');
  onMount(() => {
    watch(code, false).catch((e) => (error = e.message));
  });
  const s = $derived(net.snap?.code === code ? net.snap.state : null);
</script>

{#if s}
  <TvView {s} now={clock.now + net.offset} {code} />
{:else}
  <Scene><div class="c">{error || 'Conectando con la sala…'}</div></Scene>
{/if}
<ConnBadge />

<style>
  .c {
    flex: 1;
    display: grid;
    place-content: center;
    font-weight: 600;
    font-size: 1.3rem;
  }
</style>
