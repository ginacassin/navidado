<script lang="ts">
  import AvatarArt from './AvatarArt.svelte';
  let {
    emoji,
    size = 44,
    active = false,
    dim = false
  }: { emoji: string; size?: number; active?: boolean; dim?: boolean } = $props();
</script>

<span class="av" class:active class:dim style="--sz:{size}px; font-size:{size}px" aria-hidden="true"><AvatarArt {emoji} /></span>

<style>
  .av {
    display: inline-grid;
    place-items: center;
    width: var(--sz);
    height: var(--sz);
    border-radius: 50%;
    flex: none;
    background: #fff4e6;
    box-shadow:
      0 0 0 calc(var(--sz) * 0.05) #fff,
      0 calc(var(--sz) * 0.06) calc(var(--sz) * 0.14) rgba(2, 26, 15, 0.35);
    overflow: hidden;
    transition:
      transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1.3),
      box-shadow 0.25s,
      filter 0.25s;
  }
  .active {
    box-shadow:
      0 0 0 calc(var(--sz) * 0.05) #fff,
      0 0 0 calc(var(--sz) * 0.1) var(--dorado),
      0 0 calc(var(--sz) * 0.35) rgba(244, 180, 0, 0.7);
    transform: scale(1.1);
  }
  .dim {
    filter: grayscale(0.85) brightness(0.9);
    opacity: 0.6;
  }
</style>
