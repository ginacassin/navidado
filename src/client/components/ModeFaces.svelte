<script lang="ts">
  import { DICE_MODES, ACTIONS, type DiceModeId } from '../../shared/game';
  import ActionIcon from './ActionIcon.svelte';
  let { mode, size = 22 }: { mode: DiceModeId; size?: number } = $props();
</script>

<span class="faces" aria-label="Caras: {DICE_MODES[mode].faces.map((a) => ACTIONS[a].name).join(', ')}">
  {#each DICE_MODES[mode].faces as a}
    <ActionIcon action={a} {size} />
  {/each}
</span>

<style>
  .faces {
    display: inline-flex;
    gap: 4px;
    align-items: center;
  }
</style>
