<script lang="ts">
  let { size = 96 }: { size?: number } = $props();
  const u = 't' + Math.random().toString(36).slice(2, 8);
</script>

<svg viewBox="0 0 100 110" width={size} height={size * 1.1} aria-hidden="true" class="trophy">
  <defs>
    <linearGradient id="{u}-g" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ffe08a" /><stop offset=".35" stop-color="#ffd54f" /><stop offset=".6" stop-color="#f4b400" /><stop offset="1" stop-color="#b07c00" />
    </linearGradient>
    <linearGradient id="{u}-base" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8b5a2b" /><stop offset="1" stop-color="#5a3518" /></linearGradient>
    <radialGradient id="{u}-glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff2b3" stop-opacity=".9" /><stop offset="1" stop-color="#fff2b3" stop-opacity="0" /></radialGradient>
  </defs>
  <circle cx="50" cy="40" r="46" fill="url(#{u}-glow)" />
  <path d="M26 16 C8 16 8 42 30 46" fill="none" stroke="#c98d00" stroke-width="7" stroke-linecap="round" />
  <path d="M74 16 C92 16 92 42 70 46" fill="none" stroke="#c98d00" stroke-width="7" stroke-linecap="round" />
  <path d="M26 16 C8 16 8 42 30 46" fill="none" stroke="#ffd54f" stroke-width="3.5" stroke-linecap="round" />
  <path d="M74 16 C92 16 92 42 70 46" fill="none" stroke="#ffd54f" stroke-width="3.5" stroke-linecap="round" />
  <path d="M22 10 H78 V26 C78 46 66 60 50 60 C34 60 22 46 22 26 Z" fill="url(#{u}-g)" stroke="#a87600" stroke-width="1.5" />
  <ellipse cx="50" cy="10" rx="28" ry="4" fill="#ffe9a8" stroke="#a87600" stroke-width="1.2" />
  <path d="M30 16 C30 36 36 48 44 54" stroke="#fff" stroke-width="3" fill="none" opacity=".55" stroke-linecap="round" />
  <path d="M50 24 l3.8 7.7 8.5 1.2-6.2 6 1.5 8.4-7.6-4-7.6 4 1.5-8.4-6.2-6 8.5-1.2z" fill="#fff6d1" stroke="#c98d00" stroke-width="1" />
  <rect x="44" y="60" width="12" height="14" fill="url(#{u}-g)" />
  <path d="M34 74 H66 L70 84 H30 Z" fill="url(#{u}-g)" stroke="#a87600" stroke-width="1.2" />
  <rect x="26" y="84" width="48" height="16" rx="3" fill="url(#{u}-base)" />
  <rect x="38" y="88" width="24" height="7" rx="1.5" fill="#f4b400" opacity=".85" />
  <ellipse cx="50" cy="104" rx="30" ry="3.5" fill="#000" opacity=".25" />
</svg>

<style>
  .trophy {
    display: block;
    filter: drop-shadow(0 8px 14px rgba(0, 0, 0, 0.3));
  }
</style>
