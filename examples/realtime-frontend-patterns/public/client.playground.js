import { appendLog, setStatus } from './log-ui.js';

const wsStatus = document.getElementById('ws-status');
const wsLog = document.getElementById('ws-log');
const wsInput = document.getElementById('ws-input');
const wsForm = document.getElementById('ws-form');

const sseStatus = document.getElementById('sse-status');
const sseLog = document.getElementById('sse-log');

function nowIso() {
  return new Date().toISOString();
}

function formatPayload(data) {
  return JSON.stringify(data);
}

// Simulated WebSocket — mirrors server/index.js message shapes.
const wsChannel = new BroadcastChannel('realtime-patterns-ws');

wsChannel.onmessage = (event) => {
  if (event.data?.text) {
    appendLog(wsLog, event.data.text);
  }
};

function shareWsMessage(data) {
  const text = formatPayload(data);
  appendLog(wsLog, text);
  wsChannel.postMessage({ text });
}

setStatus(wsStatus, 'connected', 'Connected');
appendLog(wsLog, formatPayload({ type: 'status', message: 'WebSocket connected' }));

setInterval(() => {
  appendLog(
    wsLog,
    formatPayload({ type: 'broadcast', message: 'Server push', at: nowIso() }),
  );
}, 3000);

function sendWsMessage() {
  const text = wsInput.value.trim();
  if (!text) {
    return;
  }
  shareWsMessage({ type: 'echo', message: text, at: nowIso() });
  wsInput.value = '';
}

wsForm.addEventListener('submit', (event) => {
  event.preventDefault();
  sendWsMessage();
});

// Simulated SSE — mirrors /events stream (2s counter ticks).
let sseCounter = 0;

setStatus(sseStatus, 'connected', 'Connected');

setInterval(() => {
  sseCounter += 1;
  appendLog(sseLog, formatPayload({ type: 'sse', counter: sseCounter, at: nowIso() }));
}, 2000);
