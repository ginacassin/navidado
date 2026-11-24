<script lang="ts">
  let {
    emoji,
    size = 44,
    active = false,
    dim = false,
    ring = ''
  }: { emoji: string; size?: number; active?: boolean; dim?: boolean; ring?: string } = $props();
  const colors: Record<string, string> = {
    '🎅': '#fde3e3', '🦌': '#f3e2cf', '🧝': '#dff3e5', '⛄': '#e3f0fb', '⭐': '#1f3b6b', '🍪': '#f7e1c6',
    '🎄': '#dff3e5', '🔔': '#fdf1cc', '🧦': '#fde3e3', '🐧': '#e3f0fb', '🦉': '#efe3d6', '🍬': '#fbe3f1'
  };
</script>

<span
  class="av"
  class:active
  class:dim
  style="--sz:{size}px; background:{colors[emoji] ?? '#fff4e6'}; {ring ? `box-shadow: 0 0 0 3px ${ring}` : ''}"
  aria-hidden="true">{emoji}</span
>

<style>
  .av {
    display: inline-grid;
    place-items: center;
    width: var(--sz);
    height: var(--sz);
    border-radius: 50%;
    font-size: calc(var(--sz) * 0.58);
    line-height: 1;
    flex: none;
    border: 2px solid rgba(255, 255, 255, 0.9);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
    transition: transform 0.2s;
  }
  .active {
    box-shadow:
      0 0 0 4px var(--dorado),
      0 4px 14px rgba(0, 0, 0, 0.3);
    transform: scale(1.12);
  }
  .dim {
    filter: grayscale(0.9);
    opacity: 0.55;
  }
</style>
