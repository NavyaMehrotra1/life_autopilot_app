import { Platform } from 'react-native';

/**
 * Register the service worker so the app is installable + works offline on
 * the web. No-op on native (where the file path doesn't exist anyway).
 */
export function registerServiceWorker() {
  if (Platform.OS !== 'web') return;
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // silent — the app still works without SW, just no offline cache.
    });
  });
}
