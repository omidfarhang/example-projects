/** Shared checkout + fault injection for fragile vs resilient side-by-side demo. */

export const FAULTS = {
  normal: {
    id: 'normal',
    label: 'Normal',
    icon: '✓',
    injectLabel: 'All systems healthy',
    hint: 'Both apps should complete checkout normally.',
    pipeline: 'payment',
    state: 'ok',
  },
  slow: {
    id: 'slow',
    label: 'Slow payment (3s)',
    icon: '⏱',
    injectLabel: 'Payment API +3s latency',
    hint: 'Click Pay — watch loading feedback vs a frozen UI.',
    pipeline: 'payment',
    state: 'warn',
  },
  error503: {
    id: 'error503',
    label: 'Payment 503',
    icon: '✕',
    injectLabel: 'Payment API returns 503',
    hint: 'Click Pay — compare crash vs retry banner.',
    pipeline: 'payment',
    state: 'fail',
  },
  emptyBody: {
    id: 'emptyBody',
    label: 'Empty response',
    icon: '∅',
    injectLabel: 'Payment API returns 200 with empty body',
    hint: 'Click Pay — see silent wrong data vs a clear error.',
    pipeline: 'payment',
    state: 'fail',
  },
  corruptCart: {
    id: 'corruptCart',
    label: 'Corrupt cart cache',
    icon: '⚠',
    injectLabel: 'localStorage cart JSON is malformed',
    hint: 'Cart loads on inject — fragile breaks, resilient resets.',
    pipeline: 'checkout',
    state: 'fail',
  },
  doubleSubmit: {
    id: 'doubleSubmit',
    label: 'Double-click Pay',
    icon: '②',
    injectLabel: 'No idempotency guard',
    hint: 'Double-click Pay quickly on both sides.',
    pipeline: 'checkout',
    state: 'warn',
  },
};

const DEFAULT_CART = {
  items: [
    { name: 'Mechanical keyboard', price: 89 },
    { name: 'USB-C hub', price: 42 },
  ],
};

const CORRUPT_CART_RAW = '{items:[broken json';

export function cartTotal(cart) {
  return cart.items.reduce((sum, item) => sum + item.price, 0);
}

export function formatMoney(amount) {
  if (typeof amount !== 'number' || Number.isNaN(amount)) {
    return '—';
  }
  return `$${amount.toFixed(2)}`;
}

export { simulatePayment } from './payment-core.js';

/** POST /api/payment — used by checkout UI (shim, MSW, or real backend). */
export async function postPayment(faultId) {
  const res = await fetch('/api/payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fault: faultId }),
  });

  if (!res.ok) {
    const err = new Error(res.statusText || 'Payment failed');
    err.status = res.status;
    throw err;
  }

  return res.json();
}

/** @deprecated Use postPayment — kept for tests importing the old name. */
export const callPaymentApi = postPayment;

export function loadCart(mode, faultId) {
  const key = `chaos-cart-${mode}`;
  if (faultId === 'corruptCart' && mode === 'fragile') {
    localStorage.setItem(key, CORRUPT_CART_RAW);
  }
  if (faultId === 'corruptCart' && mode === 'resilient') {
    localStorage.setItem(key, CORRUPT_CART_RAW);
  }
  if (faultId !== 'corruptCart') {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      /* fall through */
    }
  } else {
    try {
      return JSON.parse(localStorage.getItem(key) ?? '');
    } catch {
      /* handled per mode below */
    }
  }

  if (faultId === 'corruptCart') {
    if (mode === 'fragile') {
      return { corrupt: true, raw: CORRUPT_CART_RAW };
    }
    localStorage.removeItem(key);
    return structuredClone(DEFAULT_CART);
  }

  return structuredClone(DEFAULT_CART);
}

export function saveCart(mode, cart) {
  if (cart?.corrupt) return;
  localStorage.setItem(`chaos-cart-${mode}`, JSON.stringify(cart));
}

export function resetStorage() {
  localStorage.removeItem('chaos-cart-fragile');
  localStorage.removeItem('chaos-cart-resilient');
}
