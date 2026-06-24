import {
  FAULTS,
  postPayment,
  cartTotal,
  formatMoney,
  loadCart,
  resetStorage,
  saveCart,
} from './app.js';

const $ = (sel, root = document) => root.querySelector(sel);

let activeFault = 'normal';

const els = {
  faultButtons: $('#fault-buttons'),
  pipelinePayment: $('#pipeline-payment'),
  pipelineCheckout: $('#pipeline-checkout'),
  injectLabel: $('#inject-label'),
  hint: $('#hint'),
  verdict: $('#verdict'),
  fragile: {
    root: $('#fragile-app'),
    items: $('#fragile-items'),
    total: $('#fragile-total'),
    status: $('#fragile-status'),
    pay: $('#fragile-pay'),
    badge: $('#fragile-badge'),
  },
  resilient: {
    root: $('#resilient-app'),
    items: $('#resilient-items'),
    total: $('#resilient-total'),
    status: $('#resilient-status'),
    pay: $('#resilient-pay'),
    badge: $('#resilient-badge'),
  },
};

function renderFaultButtons() {
  els.faultButtons.innerHTML = Object.values(FAULTS)
    .map(
      (fault) => `
    <button
      type="button"
      class="fault-btn${fault.id === activeFault ? ' fault-btn--active' : ''}"
      data-fault="${fault.id}"
      aria-pressed="${fault.id === activeFault}"
    >
      <span class="fault-btn__icon" aria-hidden="true">${fault.icon}</span>
      <span class="fault-btn__label">${fault.label}</span>
    </button>`,
    )
    .join('');
}

function setPipeline(fault) {
  els.pipelinePayment.classList.toggle('pipeline__node--hot', fault.pipeline === 'payment');
  els.pipelineCheckout.classList.toggle('pipeline__node--hot', fault.pipeline === 'checkout');
  els.pipelinePayment.dataset.state = fault.pipeline === 'payment' ? fault.state : 'ok';
  els.pipelineCheckout.dataset.state = fault.pipeline === 'checkout' ? fault.state : 'ok';
}

function setVerdict(kind, title, detail) {
  els.verdict.dataset.kind = kind;
  els.verdict.innerHTML = `
    <span class="verdict__tag">${title}</span>
    <p class="verdict__detail">${detail}</p>`;
}

function resetApps() {
  resetStorage();
  els.fragile.root.classList.remove('checkout--crash');
  els.fragile.pay.dataset.charges = '0';
  els.resilient.pay.dataset.charges = '0';
  initCheckout('fragile', els.fragile);
  initCheckout('resilient', els.resilient);
}

function resetCheckout() {
  resetApps();
  const fault = FAULTS[activeFault];
  if (activeFault === 'corruptCart') {
    setVerdict(
      'warn',
      'Fault injected',
      'Cart reloaded — fragile still breaks, resilient still recovers.',
    );
  } else if (activeFault === 'normal') {
    setVerdict('idle', 'Ready', 'Checkout reset — pick a fault or click Pay to try again.');
  } else {
    setVerdict('warn', 'Fault injected', `${fault.hint} Checkout reset — click Pay to re-run.`);
  }
  els.hint.textContent = fault.hint;
  els.fragile.root.classList.add('checkout--flash');
  els.resilient.root.classList.add('checkout--flash');
  window.setTimeout(() => {
    els.fragile.root.classList.remove('checkout--flash');
    els.resilient.root.classList.remove('checkout--flash');
  }, 700);
}

function initCheckout(mode, ui) {
  const cart = loadCart(mode, activeFault);
  ui.pay.disabled = false;
  ui.pay.textContent = 'Pay now';
  ui.status.className = 'checkout-status';
  ui.status.textContent = '';
  ui.badge.textContent = mode === 'fragile' ? 'No guards' : 'Resilient';

  if (mode === 'fragile' && cart.corrupt) {
    ui.items.innerHTML = `<li class="checkout-item checkout-item--broken">${cart.raw}</li>`;
    ui.total.textContent = '[object Object]';
    ui.status.className = 'checkout-status checkout-status--fail';
    ui.status.textContent = 'TypeError: Cannot read properties of undefined';
    setVerdict(
      'fail',
      'Hypothesis failed (fragile)',
      'Corrupt cache crashed the cart render — users see garbage or a blank screen.',
    );
    return;
  }

  ui.items.innerHTML = cart.items
    .map(
      (item) =>
        `<li class="checkout-item"><span>${item.name}</span><strong>${formatMoney(item.price)}</strong></li>`,
    )
    .join('');
  ui.total.textContent = formatMoney(cartTotal(cart));
  saveCart(mode, cart);

  if (mode === 'resilient' && activeFault === 'corruptCart') {
    ui.status.className = 'checkout-status checkout-status--warn';
    ui.status.textContent = 'Recovered from corrupt cache — loaded a safe default cart.';
    setVerdict(
      'pass',
      'Hypothesis held (resilient)',
      'Invalid storage was detected and replaced — checkout still usable.',
    );
  }
}

function applyFault(faultId) {
  activeFault = faultId;
  const fault = FAULTS[faultId];
  renderFaultButtons();
  setPipeline(fault);
  els.injectLabel.textContent = fault.injectLabel;
  els.hint.textContent = fault.hint;
  resetApps();

  if (faultId === 'normal') {
    setVerdict('idle', 'Ready', 'Pick a fault, then interact with both checkout panels.');
  } else if (faultId !== 'corruptCart') {
    setVerdict('warn', 'Fault injected', fault.hint);
  }
}

async function payFragile() {
  const ui = els.fragile;
  const chargeCount = Number(ui.pay.dataset.charges || 0) + 1;
  ui.pay.dataset.charges = String(chargeCount);

  try {
    const result = await postPayment(activeFault);
    if (activeFault === 'emptyBody' || !result.chargeId) {
      ui.total.textContent = '$0.00';
      ui.status.className = 'checkout-status checkout-status--fail';
      ui.status.textContent = 'Payment succeeded (?!) — total cleared with no receipt.';
      setVerdict(
        'fail',
        'Hypothesis failed (fragile)',
        'Empty API body was treated as success — user sees wrong confirmation state.',
      );
      return;
    }
    ui.status.className = 'checkout-status checkout-status--ok';
    ui.status.textContent = `Paid — ${result.chargeId}`;

    if (activeFault === 'doubleSubmit' && chargeCount > 1) {
      ui.status.className = 'checkout-status checkout-status--fail';
      ui.status.textContent = `Charged twice — ${result.chargeId} (duplicate)`;
      setVerdict(
        'fail',
        'Hypothesis failed (fragile)',
        'No debounce or idempotency key — double-click created duplicate charges.',
      );
      return;
    }

    if (activeFault === 'slow') {
      setVerdict(
        'fail',
        'Hypothesis failed (fragile)',
        'Payment took 3 seconds with zero feedback — users assume the app froze.',
      );
      return;
    }

    if (activeFault === 'normal') {
      setVerdict('pass', 'Hypothesis held', 'Checkout completed under normal conditions.');
    }
  } catch (err) {
    ui.root.classList.add('checkout--crash');
    ui.status.className = 'checkout-status checkout-status--fail';
    ui.status.innerHTML = `<strong>Unhandled exception</strong><br>${err.message}`;
    setVerdict(
      'fail',
      'Hypothesis failed (fragile)',
      'Error bubbled up uncaught — the panel breaks instead of degrading gracefully.',
    );
  }
}

async function payResilient() {
  const ui = els.resilient;
  if (ui.pay.disabled) return;

  ui.pay.disabled = true;
  ui.pay.textContent = 'Processing…';

  if (activeFault === 'slow') {
    ui.status.className = 'checkout-status checkout-status--loading';
    ui.status.innerHTML = '<span class="spinner" aria-hidden="true"></span> Payment service is slow — still working…';
  }

  try {
    const result = await postPayment(activeFault);

    if (activeFault === 'emptyBody' || !result.chargeId) {
      ui.status.className = 'checkout-status checkout-status--warn';
      ui.status.textContent = 'Could not verify payment — nothing was charged. Retry when ready.';
      ui.pay.disabled = false;
      ui.pay.textContent = 'Retry payment';
      setVerdict(
        'pass',
        'Hypothesis held (resilient)',
        'Invalid response handled safely — user gets a clear message and can retry.',
      );
      return;
    }

    ui.status.className = 'checkout-status checkout-status--ok';
    ui.status.textContent = `Payment confirmed — ${result.chargeId}`;
    ui.pay.textContent = 'Paid';
    if (activeFault === 'slow') {
      setVerdict(
        'pass',
        'Hypothesis held (resilient)',
        'Slow API showed loading state — UI stayed responsive for 3 seconds.',
      );
    } else if (activeFault === 'normal' || activeFault === 'doubleSubmit') {
      setVerdict(
        'pass',
        'Hypothesis held (resilient)',
        activeFault === 'doubleSubmit'
          ? 'Button disabled after first click — duplicate charge prevented.'
          : 'Checkout completed under normal conditions.',
      );
    }
  } catch (err) {
    ui.status.className = 'checkout-status checkout-status--warn';
    ui.status.textContent =
      err.status === 503
        ? 'Payment service unavailable — your cart is saved. Try again in a moment.'
        : 'Something went wrong — no charge was made.';
    ui.pay.disabled = false;
    ui.pay.textContent = 'Retry payment';
    setVerdict(
      'pass',
      'Hypothesis held (resilient)',
      '503 returned a recoverable error state — rest of the app remains usable.',
    );
  }
}

els.faultButtons.addEventListener('click', (event) => {
  const btn = event.target.closest('[data-fault]');
  if (!btn) return;
  els.fragile.root.classList.remove('checkout--crash');
  applyFault(btn.dataset.fault);
});

els.fragile.pay.addEventListener('click', () => {
  if (activeFault === 'corruptCart') return;
  payFragile();
});

els.resilient.pay.addEventListener('click', () => {
  if (activeFault === 'corruptCart') return;
  payResilient();
});

$('#reset-demo')?.addEventListener('click', () => {
  resetCheckout();
});

applyFault('normal');
