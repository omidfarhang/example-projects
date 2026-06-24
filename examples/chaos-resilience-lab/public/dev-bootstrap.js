import { worker } from '../mocks/browser.js';

await worker.start({
  onUnhandledRequest: 'bypass',
  serviceWorker: { url: '/mockServiceWorker.js' },
});

await import('./client.playground.js');
