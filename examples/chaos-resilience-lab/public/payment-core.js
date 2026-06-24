function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Pure payment simulation — shared by fetch shim, MSW handlers, and docker payment-api. */
export async function simulatePayment(faultId) {
  if (faultId === 'slow') {
    await delay(3000);
    return { ok: true, chargeId: `ch_${Date.now()}` };
  }
  if (faultId === 'error503') {
    const err = new Error('Service Unavailable');
    err.status = 503;
    throw err;
  }
  if (faultId === 'emptyBody') {
    return { ok: true, chargeId: undefined, raw: '' };
  }
  if (faultId === 'doubleSubmit') {
    await delay(1200);
    return { ok: true, chargeId: `ch_${Date.now()}` };
  }
  await delay(400);
  return { ok: true, chargeId: `ch_${Date.now()}` };
}
