<script lang="ts">
  import { route } from './lib/router.svelte';
  import Banner from './components/Banner.svelte';
  import Home from './screens/Home.svelte';
  import HowTo from './screens/HowTo.svelte';
  import ModeChoice from './screens/ModeChoice.svelte';
  import Config from './screens/Config.svelte';
  import SoloGame from './screens/SoloGame.svelte';
  import PlayerRoom from './screens/PlayerRoom.svelte';
  import HostRoom from './screens/HostRoom.svelte';
  import TvRoom from './screens/TvRoom.svelte';

  const view = $derived.by(() => {
    const p = route.path;
    if (p === '/como-se-juega') return HowTo;
    if (p === '/jugar') return ModeChoice;
    if (p === '/configurar') return Config;
    if (p === '/solo') return SoloGame;
    if (/^\/s(\/[A-Za-z]{0,4})?\/?$/.test(p)) return PlayerRoom;
    if (/^\/sala\/[A-Za-z]{4}\/?$/.test(p)) return HostRoom;
    if (/^\/tv\/[A-Za-z]{4}\/?$/.test(p)) return TvRoom;
    return Home;
  });
</script>

{#key route.path}
  {@const View = view}
  <View />
{/key}
<Banner />
