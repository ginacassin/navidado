<script lang="ts">
  let { size = 120 }: { size?: number } = $props();
</script>

<svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true" class="dice-hat">
  <defs>
    <linearGradient id="dh-top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" /><stop offset="1" stop-color="#f6f1ea" /></linearGradient>
  </defs>
  <ellipse cx="60" cy="110" rx="34" ry="6" fill="rgba(0,0,0,.22)" />
  <path d="M60 34 L100 51 L60 68 L20 51 Z" fill="url(#dh-top)" stroke="#d9cdbf" stroke-width="2" stroke-linejoin="round" />
  <path d="M20 51 L60 68 L60 108 L20 91 Z" fill="#efe7dd" stroke="#d9cdbf" stroke-width="2" stroke-linejoin="round" />
  <path d="M60 68 L100 51 L100 91 L60 108 Z" fill="#e0d4c6" stroke="#d9cdbf" stroke-width="2" stroke-linejoin="round" />
  <ellipse cx="60" cy="51" rx="6" ry="3.4" fill="#D62828" />
  <ellipse cx="31" cy="66" rx="4.2" ry="5.4" fill="#D62828" />
  <ellipse cx="49" cy="92" rx="4.2" ry="5.4" fill="#D62828" />
  <ellipse cx="70" cy="93" rx="4.2" ry="5.4" fill="#D62828" />
  <ellipse cx="80" cy="79" rx="4.2" ry="5.4" fill="#D62828" />
  <ellipse cx="90" cy="65" rx="4.2" ry="5.4" fill="#D62828" />
  <!-- gorro -->
  <path d="M38 42 C42 16 68 4 94 18 C86 22 82 28 80 40 Z" fill="#D62828" stroke="#a51c1c" stroke-width="2" stroke-linejoin="round" />
  <path d="M52 26 C60 18 72 14 84 16" stroke="#ef5350" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7" />
  <rect x="33" y="36" width="52" height="12" rx="6" fill="#fff" stroke="#e8e2da" stroke-width="1.5" transform="rotate(-6 59 42)" />
  <circle cx="96" cy="18" r="8" fill="#fff" stroke="#e8e2da" stroke-width="1.5" />
</svg>

<style>
  .dice-hat {
    display: block;
    filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.25));
  }
</style>
