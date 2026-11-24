<script lang="ts">
  let { value = $bindable('') }: { value: string } = $props();
  let inputs: HTMLInputElement[] = [];
  const letters = $derived(Array.from({ length: 4 }, (_, i) => value[i] ?? ''));
  const clean = (v: string) => v.toUpperCase().replace(/[^A-Z]/g, '');

  function onInput(i: number, e: Event) {
    const el = e.target as HTMLInputElement;
    const v = clean(el.value);
    if (v.length > 1) {
      value = (value.slice(0, i) + v).slice(0, 4);
      inputs[Math.min(3, value.length)]?.focus();
      return;
    }
    const arr = letters.slice();
    arr[i] = v;
    value = arr.join('').slice(0, 4);
    if (v && i < 3) inputs[i + 1]?.focus();
  }
  function onKey(i: number, e: KeyboardEvent) {
    if (e.key === 'Backspace' && !letters[i] && i > 0) inputs[i - 1]?.focus();
  }
</script>

<div class="code" role="group" aria-label="Código de 4 letras">
  {#each letters as l, i}
    <input
      bind:this={inputs[i]}
      value={l}
      oninput={(e) => onInput(i, e)}
      onkeydown={(e) => onKey(i, e)}
      autocapitalize="characters"
      autocomplete="off"
      spellcheck="false"
      inputmode="text"
      maxlength="4"
      aria-label="Letra {i + 1}"
    />
  {/each}
</div>

<style>
  .code {
    display: flex;
    gap: 10px;
    justify-content: center;
  }
  input {
    width: 54px;
    height: 62px;
    border-radius: 12px;
    border: 2px solid #e2d3bd;
    background: #fff;
    text-align: center;
    font-family: var(--titulo);
    font-weight: 900;
    font-size: 1.8rem;
    color: var(--tinta);
    text-transform: uppercase;
  }
  input:focus {
    outline: 3px solid rgba(214, 40, 40, 0.35);
    border-color: var(--rojo);
  }
</style>
