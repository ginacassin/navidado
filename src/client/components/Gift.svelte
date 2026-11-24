<script lang="ts">
  let { size = 48, tone = 'red' }: { size?: number; tone?: 'red' | 'green' | 'gold' } = $props();
  const u = 'g' + Math.random().toString(36).slice(2, 8);
  const tones = {
    red: ['#ff5a5a', '#d62828', '#8e1515'],
    green: ['#4cc47c', '#1f8a4c', '#0f5a30'],
    gold: ['#ffe17a', '#f4b400', '#b07c00']
  };
  const c = $derived(tones[tone]);
  const rib = $derived(tone === 'gold' ? ['#ff6b6b', '#d62828', '#8e1515'] : ['#fff3b0', '#f4b400', '#a87600']);
</script>

<svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" class="gift">
  <defs>
    <linearGradient id="{u}-box" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color={c[0]} /><stop offset=".55" stop-color={c[1]} /><stop offset="1" stop-color={c[2]} /></linearGradient>
    <linearGradient id="{u}-lid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color={c[0]} /><stop offset="1" stop-color={c[1]} /></linearGradient>
    <linearGradient id="{u}-rib" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color={rib[0]} /><stop offset=".5" stop-color={rib[1]} /><stop offset="1" stop-color={rib[2]} /></linearGradient>
  </defs>
  <ellipse cx="32" cy="60" rx="22" ry="3" fill="#000" opacity=".22" />
  <rect x="10" y="28" width="44" height="30" rx="3" fill="url(#{u}-box)" />
  <rect x="10" y="28" width="44" height="6" fill="#000" opacity=".15" />
  <rect x="7" y="20" width="50" height="11" rx="3" fill="url(#{u}-lid)" />
  <rect x="9" y="21.5" width="46" height="3" rx="1.5" fill="#fff" opacity=".3" />
  <rect x="28" y="20" width="8" height="38" fill="url(#{u}-rib)" />
  <path d="M32 20 C24 8 12 10 16 17 C18 21 26 21 32 20 Z" fill="url(#{u}-rib)" stroke={rib[2]} stroke-width="1" />
  <path d="M32 20 C40 8 52 10 48 17 C46 21 38 21 32 20 Z" fill="url(#{u}-rib)" stroke={rib[2]} stroke-width="1" />
  <path d="M20 14 C23 13 27 15 29 18" stroke="#fff" stroke-width="1.4" fill="none" opacity=".6" stroke-linecap="round" />
  <circle cx="32" cy="19.5" r="3.6" fill={rib[1]} stroke={rib[2]} stroke-width="1" />
</svg>

<style>
  .gift {
    display: inline-block;
    flex: none;
    vertical-align: middle;
  }
</style>
