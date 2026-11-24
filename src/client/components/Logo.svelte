<script lang="ts">
  import DiceHat from './DiceHat.svelte';
  let { size = 'lg', tagline = true, dice = true }: { size?: 'sm' | 'md' | 'lg' | 'xl'; tagline?: boolean; dice?: boolean } =
    $props();
  const px = { sm: 30, md: 48, lg: 64, xl: 110 };
</script>

<div class="logo {size}" style="--fs:{px[size]}px">
  {#if dice}
    <div class="dice"><DiceHat size={px[size] * 1.5} /></div>
  {/if}
  <h1 class="word">Navidado</h1>
  {#if tagline}
    <div class="ribbon">El juego de regalos<br />más divertido de la Navidad</div>
  {/if}
</div>

<style>
  .logo {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    position: relative;
  }
  .dice {
    margin-bottom: calc(var(--fs) * -0.42);
    margin-left: calc(var(--fs) * 0.6);
    position: relative;
    z-index: 0;
    animation: bob 3.2s ease-in-out infinite;
  }
  .word {
    position: relative;
    z-index: 1;
    font-family: var(--titulo);
    font-weight: 900;
    font-size: var(--fs);
    line-height: 1;
    color: var(--crema);
    letter-spacing: -0.01em;
    transform: rotate(-3deg);
    text-shadow:
      0 calc(var(--fs) * 0.05) 0 #b3141c,
      calc(var(--fs) * 0.05) 0 0 #b3141c,
      calc(var(--fs) * -0.05) 0 0 #b3141c,
      0 calc(var(--fs) * -0.05) 0 #b3141c,
      calc(var(--fs) * 0.035) calc(var(--fs) * 0.035) 0 #b3141c,
      calc(var(--fs) * -0.035) calc(var(--fs) * 0.035) 0 #b3141c,
      calc(var(--fs) * 0.035) calc(var(--fs) * -0.035) 0 #b3141c,
      calc(var(--fs) * -0.035) calc(var(--fs) * -0.035) 0 #b3141c,
      0 calc(var(--fs) * 0.11) 0 #7d0e14,
      0 calc(var(--fs) * 0.16) calc(var(--fs) * 0.2) rgba(0, 0, 0, 0.35);
  }
  .ribbon {
    margin-top: calc(var(--fs) * 0.32);
    background: linear-gradient(180deg, #e53935, var(--rojo) 60%, var(--rojo-osc));
    color: var(--crema);
    font-family: var(--titulo);
    font-weight: 800;
    font-size: calc(var(--fs) * 0.27);
    line-height: 1.2;
    padding: 0.45em 1.4em;
    border-radius: 10px;
    transform: rotate(-3deg);
    box-shadow: 0 4px 0 #8e1515, 0 8px 16px rgba(0, 0, 0, 0.25);
    position: relative;
  }
  .ribbon::before,
  .ribbon::after {
    content: '';
    position: absolute;
    top: 20%;
    width: 1.2em;
    height: 70%;
    background: #9c1818;
    z-index: -1;
  }
  .ribbon::before {
    left: -0.8em;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%, 40% 50%);
  }
  .ribbon::after {
    right: -0.8em;
    clip-path: polygon(0 0, 100% 0, 60% 50%, 100% 100%, 0 100%);
  }
  @keyframes bob {
    0%,
    100% {
      transform: translateY(0) rotate(-4deg);
    }
    50% {
      transform: translateY(-6px) rotate(3deg);
    }
  }
</style>
