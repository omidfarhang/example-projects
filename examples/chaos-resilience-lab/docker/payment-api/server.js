import http from 'node:http';

const PORT = Number(process.env.PORT || 3001);

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function handleCharge(fault) {
  if (fault === 'slow') {
    await delay(3000);
    return { status: 200, body: { ok: true, chargeId: `ch_${Date.now()}` } };
  }
  if (fault === 'error503') {
    return { status: 503, body: { error: 'Service Unavailable' } };
  }
  if (fault === 'emptyBody') {
    return { status: 200, body: { ok: true, chargeId: undefined, raw: '' } };
  }
  if (fault === 'doubleSubmit') {
    await delay(1200);
    return { status: 200, body: { ok: true, chargeId: `ch_${Date.now()}` } };
  }
  await delay(400);
  return { status: 200, body: { ok: true, chargeId: `ch_${Date.now()}` } };
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (req.method === 'POST' && req.url === '/charge') {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const payload = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
    const { status, body } = await handleCharge(payload.fault ?? 'normal');
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`payment-api listening on :${PORT}`);
});
