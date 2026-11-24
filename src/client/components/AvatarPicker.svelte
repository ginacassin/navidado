<script lang="ts">
  import { AVATARS } from '../../shared/game';
  import Avatar from './Avatar.svelte';
  let { value = $bindable(AVATARS[0]) }: { value: string } = $props();
</script>

<div class="picker" role="radiogroup" aria-label="Elige un avatar">
  {#each AVATARS as a}
    <button type="button" role="radio" aria-checked={value === a} class:sel={value === a} onclick={() => (value = a)}>
      <Avatar emoji={a} size={46} />
    </button>
  {/each}
</div>

<style>
  .picker {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
  }
  button {
    border: none;
    background: none;
    padding: 3px;
    border-radius: 50%;
  }
  button.sel {
    box-shadow: 0 0 0 3px var(--rojo);
  }
</style>
