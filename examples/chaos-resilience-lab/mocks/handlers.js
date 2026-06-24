import { http, HttpResponse } from 'msw';
import { simulatePayment } from '../lib/payment.js';

export const handlers = [
  http.post('/api/payment', async ({ request }) => {
    const { fault = 'normal' } = await request.json();
    try {
      const result = await simulatePayment(fault);
      return HttpResponse.json(result);
    } catch (err) {
      return HttpResponse.json({ error: err.message }, { status: err.status || 500 });
    }
  }),
];
