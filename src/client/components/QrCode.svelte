<script lang="ts">
  import QRCode from 'qrcode';
  let { text, size = 200, label = 'Código QR' }: { text: string; size?: number; label?: string } = $props();
  let svg = $state('');
  $effect(() => {
    QRCode.toString(text, { type: 'svg', margin: 1, errorCorrectionLevel: 'M', color: { dark: '#1b1b1b', light: '#ffffff' } })
      .then((s) => (svg = s))
      .catch(() => (svg = ''));
  });
</script>

<div class="qr" style="width:{size}px;height:{size}px" role="img" aria-label={label}>{@html svg}</div>

<style>
  .qr {
    background: #fff;
    border-radius: 14px;
    padding: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
  }
  .qr :global(svg) {
    width: 100%;
    height: 100%;
    display: block;
  }
</style>
