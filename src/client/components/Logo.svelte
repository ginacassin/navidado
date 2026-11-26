<script lang="ts">
  import Die3D from './Die3D.svelte';
  let { size = 'lg', tagline = true, dice = true }: { size?: 'sm' | 'md' | 'lg' | 'xl'; tagline?: boolean; dice?: boolean } =
    $props();
  const width = { sm: 150, md: 230, lg: 320, xl: 520 };
  const u = 'l' + Math.random().toString(36).slice(2, 8);
</script>

<div class="logo" style="--w:{width[size]}px">
  {#if dice}
    <div class="die"><Die3D variant="pips" hat bob face={0} size={Math.round(width[size] * 0.42)} label="Dado con gorro de Papá Noel" /></div>
  {/if}
  <svg class="word" viewBox="0 0 520 150" role="img" aria-label="Navidado">
    <defs>
      <linearGradient id="{u}-fill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffffff" /><stop offset=".55" stop-color="#fff6e8" /><stop offset="1" stop-color="#ffe3b8" />
      </linearGradient>
      <linearGradient id="{u}-edge" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#e53935" /><stop offset="1" stop-color="#a51c1c" />
      </linearGradient>
      <filter id="{u}-sh" x="-10%" y="-20%" width="120%" height="150%">
        <feDropShadow dx="0" dy="10" stdDeviation="8" flood-color="#021a0f" flood-opacity=".45" />
      </filter>
    </defs>
    <g transform="rotate(-4 260 80)" filter="url(#{u}-sh)" font-family="Nunito, system-ui, sans-serif" font-weight="900" font-size="122" text-anchor="middle" letter-spacing="-2">
      <!-- relieve -->
      <text x="260" y="122" fill="#6d0b10" stroke="#6d0b10" stroke-width="26" stroke-linejoin="round">Navidado</text>
      <!-- contorno -->
      <text x="260" y="112" fill="url(#{u}-edge)" stroke="url(#{u}-edge)" stroke-width="22" stroke-linejoin="round">Navidado</text>
      <!-- letras -->
      <text x="260" y="112" fill="url(#{u}-fill)">Navidado</text>
    </g>
  </svg>
  {#if tagline}
    <svg class="ribbon" viewBox="0 0 440 108" role="img" aria-label="El juego de regalos más divertido de la Navidad">
      <defs>
        <linearGradient id="{u}-band" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ef4444" /><stop offset=".5" stop-color="#d62828" /><stop offset="1" stop-color="#a51c1c" />
        </linearGradient>
        <filter id="{u}-rs" x="-10%" y="-20%" width="120%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#021a0f" flood-opacity=".4" />
        </filter>
        <path id="{u}-l1" d="M70 47 Q220 28 370 47" />
        <path id="{u}-l2" d="M50 75 Q220 56 390 75" />
      </defs>
      <g filter="url(#{u}-rs)" transform="rotate(-3 220 54)">
        <path d="M6 42 L54 36 L58 94 L10 100 L28 70 Z" fill="#9c1818" />
        <path d="M434 42 L386 36 L382 94 L430 100 L412 70 Z" fill="#9c1818" />
        <path d="M54 36 L42 32 L46 88 L58 94 Z" fill="#5e0d0d" />
        <path d="M386 36 L398 32 L394 88 L382 94 Z" fill="#5e0d0d" />
        <path d="M40 24 Q220 -4 400 24 L396 86 Q220 60 44 86 Z" fill="url(#{u}-band)" />
        <path d="M46 30 Q220 3 394 30" stroke="#ff8a8a" stroke-width="2.5" fill="none" opacity=".6" />
        <path d="M46 80 Q220 54 394 80" stroke="#6d0b10" stroke-width="2" fill="none" opacity=".45" />
        <g font-family="Nunito, system-ui, sans-serif" font-weight="900" fill="#fff4e6" text-anchor="middle" font-size="23">
          <text><textPath href="#{u}-l1" startOffset="50%">El juego de regalos</textPath></text>
          <text><textPath href="#{u}-l2" startOffset="50%">más divertido de la Navidad</textPath></text>
        </g>
      </g>
    </svg>
  {/if}
</div>

<style>
  .logo {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: var(--w);
    max-width: 100%;
    position: relative;
  }
  .die {
    align-self: flex-start;
    margin-left: 4%;
    margin-bottom: calc(var(--w) * -0.11);
    position: relative;
    z-index: 0;
  }
  .word {
    width: 100%;
    height: auto;
    position: relative;
    z-index: 1;
    overflow: visible;
  }
  .ribbon {
    width: 108%;
    height: auto;
    margin-top: calc(var(--w) * -0.02);
    overflow: visible;
  }
</style>
