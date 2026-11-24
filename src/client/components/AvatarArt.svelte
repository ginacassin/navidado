<script lang="ts">
  /** Avatares ilustrados. La clave es el emoji guardado en la partida. */
  let { emoji }: { emoji: string } = $props();
  const u = 'a' + Math.random().toString(36).slice(2, 8);
  const bg: Record<string, [string, string]> = {
    '🎅': ['#ffe9e9', '#f7b9b9'],
    '🦌': ['#fbeedd', '#e8c9a4'],
    '🧝': ['#e7f7ec', '#a9dcb9'],
    '⛄': ['#eaf4fd', '#b8d6f2'],
    '⭐': ['#2b4f8a', '#14284a'],
    '🍪': ['#fdf0dc', '#ecc99c'],
    '🐧': ['#e6f2fb', '#a9cbe8'],
    '🎄': ['#fff6dc', '#f3d98f']
  };
  const known = $derived(emoji in bg);
</script>

{#if known}
  <svg viewBox="0 0 64 64" class="art" aria-hidden="true">
    <defs>
      <radialGradient id="{u}-bg" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color={bg[emoji][0]} /><stop offset="1" stop-color={bg[emoji][1]} /></radialGradient>
      <radialGradient id="{u}-skin" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#ffe1cc" /><stop offset="1" stop-color="#f1b893" /></radialGradient>
      <linearGradient id="{u}-red" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff5a5a" /><stop offset="1" stop-color="#a51c1c" /></linearGradient>
      <linearGradient id="{u}-green" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4cc47c" /><stop offset="1" stop-color="#14653a" /></linearGradient>
      <radialGradient id="{u}-white" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#fff" /><stop offset="1" stop-color="#dfe7ee" /></radialGradient>
      <radialGradient id="{u}-brown" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#c98a52" /><stop offset="1" stop-color="#8a5428" /></radialGradient>
      <radialGradient id="{u}-gold" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#fff0a0" /><stop offset="1" stop-color="#f0a800" /></radialGradient>
      <clipPath id="{u}-c"><circle cx="32" cy="32" r="32" /></clipPath>
    </defs>
    <circle cx="32" cy="32" r="32" fill="url(#{u}-bg)" />
    <g clip-path="url(#{u}-c)">
      {#if emoji === '🎅'}
        <path d="M14 70 C14 50 22 44 32 44 C42 44 50 50 50 70Z" fill="url(#{u}-red)" />
        <circle cx="32" cy="36" r="13" fill="url(#{u}-skin)" />
        <path d="M17 38 C17 52 25 58 32 58 C39 58 47 52 47 38 C43 44 38 42 32 44 C26 42 21 44 17 38Z" fill="url(#{u}-white)" />
        <path d="M25 44 C28 41 36 41 39 44 C36 45 28 45 25 44Z" fill="#fff" stroke="#e1e6ea" stroke-width=".8" />
        <circle cx="27" cy="34" r="1.8" fill="#3b2a20" /><circle cx="37" cy="34" r="1.8" fill="#3b2a20" />
        <circle cx="32" cy="38.5" r="2.4" fill="#f08a8a" />
        <circle cx="23.5" cy="38" r="2.4" fill="#ff9c9c" opacity=".6" /><circle cx="40.5" cy="38" r="2.4" fill="#ff9c9c" opacity=".6" />
        <path d="M17 28 C18 12 34 6 46 14 C44 18 46 22 47 28Z" fill="url(#{u}-red)" />
        <rect x="15" y="25" width="34" height="7" rx="3.5" fill="url(#{u}-white)" />
        <circle cx="48" cy="14" r="4.5" fill="url(#{u}-white)" />
      {:else if emoji === '🦌'}
        <path d="M22 22 C18 14 14 12 10 12 M16 15 C15 11 16 8 18 6 M42 22 C46 14 50 12 54 12 M48 15 C49 11 48 8 46 6" stroke="#8a5428" stroke-width="3.2" fill="none" stroke-linecap="round" />
        <ellipse cx="18" cy="30" rx="6" ry="3.5" fill="#a86a38" transform="rotate(-25 18 30)" />
        <ellipse cx="46" cy="30" rx="6" ry="3.5" fill="#a86a38" transform="rotate(25 46 30)" />
        <path d="M20 32 C20 22 26 18 32 18 C38 18 44 22 44 32 C44 46 40 54 32 54 C24 54 20 46 20 32Z" fill="url(#{u}-brown)" />
        <ellipse cx="32" cy="45" rx="9" ry="7" fill="#e8c39a" />
        <circle cx="26.5" cy="33" r="2.2" fill="#2b1a10" /><circle cx="37.5" cy="33" r="2.2" fill="#2b1a10" />
        <circle cx="27.2" cy="32.3" r=".7" fill="#fff" /><circle cx="38.2" cy="32.3" r=".7" fill="#fff" />
        <circle cx="32" cy="42" r="4.2" fill="#e53935" /><circle cx="30.6" cy="40.8" r="1.2" fill="#fff" opacity=".8" />
        <path d="M28.5 48 C30.5 50 33.5 50 35.5 48" stroke="#7a4b2a" stroke-width="1.4" fill="none" stroke-linecap="round" />
      {:else if emoji === '🧝'}
        <path d="M14 70 C14 52 22 46 32 46 C42 46 50 52 50 70Z" fill="url(#{u}-green)" />
        <path d="M17 36 L8 30 L18 40Z M47 36 L56 30 L46 40Z" fill="#f1b893" />
        <circle cx="32" cy="38" r="13" fill="url(#{u}-skin)" />
        <circle cx="27" cy="37" r="1.8" fill="#3b2a20" /><circle cx="37" cy="37" r="1.8" fill="#3b2a20" />
        <path d="M27 43 C30 46 34 46 37 43" stroke="#a0522d" stroke-width="1.6" fill="none" stroke-linecap="round" />
        <circle cx="23.5" cy="41" r="2.2" fill="#ff9c9c" opacity=".6" /><circle cx="40.5" cy="41" r="2.2" fill="#ff9c9c" opacity=".6" />
        <path d="M18 31 C20 18 30 8 50 4 C44 12 44 22 46 31Z" fill="url(#{u}-green)" />
        <rect x="16" y="28" width="32" height="6" rx="3" fill="#f4b400" />
        <circle cx="50" cy="4.5" r="3.5" fill="#d62828" />
      {:else if emoji === '⛄'}
        <path d="M12 70 C12 54 20 48 32 48 C44 48 52 54 52 70Z" fill="url(#{u}-white)" />
        <circle cx="32" cy="36" r="14" fill="url(#{u}-white)" />
        <path d="M18 46 C24 50 40 50 46 46 L46 52 C40 55 24 55 18 52Z" fill="url(#{u}-red)" />
        <path d="M38 50 L42 62 L36 61Z" fill="#a51c1c" />
        <circle cx="27" cy="33" r="2" fill="#1f1f1f" /><circle cx="37" cy="33" r="2" fill="#1f1f1f" />
        <path d="M32 37 L42 40 L32 40Z" fill="#f28c28" />
        {#each [[26, 43], [29, 44.5], [32, 45], [35, 44.5], [38, 43]] as [x, y]}<circle cx={x} cy={y} r="1" fill="#1f1f1f" />{/each}
        <rect x="21" y="20" width="22" height="4" rx="1.5" fill="#1f1f1f" />
        <rect x="24" y="6" width="16" height="15" rx="2" fill="#2a2a2a" />
        <rect x="24" y="16" width="16" height="3" fill="#d62828" />
      {:else if emoji === '⭐'}
        {#each [[12, 14], [52, 12], [10, 46], [54, 50], [20, 56]] as [x, y]}<circle cx={x} cy={y} r="1.2" fill="#fff" opacity=".8" />{/each}
        <path d="M32 9 l6.8 14 15.4 2.2-11.1 10.8 2.6 15.3L32 44l-13.7 7.3 2.6-15.3L9.8 25.2l15.4-2.2z" fill="url(#{u}-gold)" stroke="#c98d00" stroke-width="1.4" stroke-linejoin="round" />
        <circle cx="27.5" cy="30" r="1.9" fill="#3b2a20" /><circle cx="36.5" cy="30" r="1.9" fill="#3b2a20" />
        <path d="M28 35 C30.5 37.5 33.5 37.5 36 35" stroke="#7a4b00" stroke-width="1.6" fill="none" stroke-linecap="round" />
        <circle cx="24.5" cy="34" r="2" fill="#ff8a65" opacity=".55" /><circle cx="39.5" cy="34" r="2" fill="#ff8a65" opacity=".55" />
        <path d="M26 18 L29 15" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7" />
      {:else if emoji === '🍪'}
        <circle cx="32" cy="18" r="9" fill="url(#{u}-brown)" />
        <path d="M22 26 H42 L52 34 C54 36 52 40 49 39 L42 36 L44 52 L52 60 C54 62 51 66 48 64 L32 56 L16 64 C13 66 10 62 12 60 L20 52 L22 36 L15 39 C12 40 10 36 12 34Z" fill="url(#{u}-brown)" />
        <circle cx="28.5" cy="17" r="1.6" fill="#2b1a10" /><circle cx="35.5" cy="17" r="1.6" fill="#2b1a10" />
        <path d="M28 21 C30 23 34 23 36 21" stroke="#fff" stroke-width="1.5" fill="none" stroke-linecap="round" />
        <circle cx="32" cy="34" r="2" fill="#d62828" /><circle cx="32" cy="41" r="2" fill="#2e9e5b" /><circle cx="32" cy="48" r="2" fill="#d62828" />
        <path d="M14 36 C16 35 18 35 20 36 M44 36 C46 35 48 35 50 36" stroke="#fff" stroke-width="1.4" stroke-linecap="round" fill="none" />
      {:else if emoji === '🐧'}
        <path d="M14 70 C12 46 20 36 32 36 C44 36 52 46 50 70Z" fill="#232c3a" />
        <ellipse cx="32" cy="34" rx="15" ry="14" fill="#232c3a" />
        <path d="M21 36 C21 28 26 26 32 30 C38 26 43 28 43 36 C43 44 38 48 32 48 C26 48 21 44 21 36Z" fill="url(#{u}-white)" />
        <circle cx="27.5" cy="35" r="1.9" fill="#1f1f1f" /><circle cx="36.5" cy="35" r="1.9" fill="#1f1f1f" />
        <path d="M29 39 L35 39 L32 43Z" fill="#f4a100" />
        <circle cx="24.5" cy="40" r="2" fill="#ff9c9c" opacity=".6" /><circle cx="39.5" cy="40" r="2" fill="#ff9c9c" opacity=".6" />
        <path d="M18 26 C18 14 46 14 46 26Z" fill="url(#{u}-red)" />
        <rect x="16" y="24" width="32" height="5" rx="2.5" fill="url(#{u}-white)" />
        <circle cx="32" cy="12" r="4" fill="url(#{u}-white)" />
      {:else}
        <path d="M32 8 L44 26 H38 L48 40 H40 L52 56 H12 L24 40 H16 L26 26 H20Z" fill="url(#{u}-green)" stroke="#0f4f2c" stroke-width="1.2" stroke-linejoin="round" />
        <rect x="28" y="56" width="8" height="7" fill="#7a4a22" />
        <path d="M32 2.5 l2 4 4.4.6-3.2 3.1.8 4.4-4-2.1-4 2.1.8-4.4-3.2-3.1 4.4-.6z" fill="url(#{u}-gold)" />
        <circle cx="27.5" cy="38" r="1.8" fill="#1f1f1f" /><circle cx="36.5" cy="38" r="1.8" fill="#1f1f1f" />
        <path d="M28.5 43 C30.5 45 33.5 45 35.5 43" stroke="#fff" stroke-width="1.5" fill="none" stroke-linecap="round" />
        <circle cx="24" cy="29" r="2" fill="#ff5252" /><circle cx="41" cy="48" r="2.2" fill="#ffd54f" /><circle cx="22" cy="50" r="2" fill="#fff" />
      {/if}
    </g>
    <ellipse cx="22" cy="14" rx="10" ry="5" fill="#fff" opacity=".18" transform="rotate(-25 22 14)" />
  </svg>
{:else}
  <span class="emoji">{emoji}</span>
{/if}

<style>
  .art {
    width: 100%;
    height: 100%;
    display: block;
  }
  .emoji {
    font-size: 0.58em;
  }
</style>
