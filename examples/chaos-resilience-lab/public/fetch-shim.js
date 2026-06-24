/**
 * Playground / npm start: handle POST /api/payment without MSW.
 * Loaded before client.playground.js in static deploys.
 */
import { simulatePayment } from './payment-core.js';

const originalFetch = window.fetch.bind(window);

function isPaymentRequest(input) {
  const url = typeof input === 'string' ? input : input.url;
  return url.endsWith('/api/payment') || url === '/api/payment';
}

window.fetch = async (input, init) => {
  if (!isPaymentRequest(input)) {
    return originalFetch(input, init);
  }

  const body = init?.body ? JSON.parse(init.body) : {};
  try {
    const result = await simulatePayment(body.fault ?? 'normal');
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: err.status || 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
