import { appendLog, setStatus } from './log-ui.js';

const wsStatus = document.getElementById('ws-status');
const wsLog = document.getElementById('ws-log');
const wsInput = document.getElementById('ws-input');
const wsForm = document.getElementById('ws-form');

const sseStatus = document.getElementById('sse-status');
const sseLog = document.getElementById('sse-log');

const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
const socket = new WebSocket(`${protocol}://${location.host}/ws`);

socket.onopen = () => {
  setStatus(wsStatus, 'connected', 'Connected');
};

socket.onmessage = (event) => {
  appendLog(wsLog, event.data);
};

socket.onclose = () => {
  setStatus(wsStatus, 'disconnected', 'Disconnected');
};

function sendWsMessage() {
  if (socket.readyState === WebSocket.OPEN && wsInput.value.trim()) {
    socket.send(wsInput.value.trim());
    wsInput.value = '';
  }
}

wsForm.addEventListener('submit', (event) => {
  event.preventDefault();
  sendWsMessage();
});

const source = new EventSource('/events');

source.onopen = () => {
  setStatus(sseStatus, 'connected', 'Connected');
};

source.onmessage = (event) => {
  appendLog(sseLog, event.data);
};

source.onerror = () => {
  setStatus(sseStatus, 'reconnecting', 'Reconnecting');
};
