import '@fontsource/nunito/600.css';
import '@fontsource/nunito/800.css';
import '@fontsource/nunito/900.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import './app.css';
import { mount } from 'svelte';
import App from './App.svelte';

declare const __BUILD_ID__: string;

mount(App, { target: document.getElementById('app')! });

// Cache bust: cada build registra su propio service worker; cuando hay uno nuevo, se recarga una vez.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  addEventListener('load', async () => {
    try {
      const hadController = !!navigator.serviceWorker.controller;
      let reloaded = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (hadController && !reloaded) {
          reloaded = true;
          location.reload();
        }
      });
      const reg = await navigator.serviceWorker.register(`/sw.js?v=${__BUILD_ID__}`, { updateViaCache: 'none' });
      // comprobar si hay versión nueva al volver a la pestaña
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') reg.update().catch(() => {});
      });
    } catch {}
  });
}
console.info(`Navidado ${__BUILD_ID__}`);
