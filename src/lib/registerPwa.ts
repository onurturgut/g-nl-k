export async function registerPwaServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  try {
    await navigator.serviceWorker.register('/sw.js');
  } catch (error) {
    console.warn('[PWA] Service worker registration failed', error);
  }
}
