const wsStatus = document.getElementById('ws-status');
const wsLog = document.getElementById('ws-log');
const wsInput = document.getElementById('ws-input');
const wsSend = document.getElementById('ws-send');

const sseStatus = document.getElementById('sse-status');
const sseLog = document.getElementById('sse-log');

function appendLog(list, text) {
  const item = document.createElement('li');
  item.textContent = text;
  list.prepend(item);
}

const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
const socket = new WebSocket(`${protocol}://${location.host}/ws`);

socket.onopen = () => {
  wsStatus.textContent = 'Connected';
};

socket.onmessage = (event) => {
  appendLog(wsLog, event.data);
};

socket.onclose = () => {
  wsStatus.textContent = 'Disconnected';
};

wsSend.addEventListener('click', () => {
  if (socket.readyState === WebSocket.OPEN && wsInput.value.trim()) {
    socket.send(wsInput.value.trim());
    wsInput.value = '';
  }
});

const source = new EventSource('/events');

source.onopen = () => {
  sseStatus.textContent = 'Connected';
};

source.onmessage = (event) => {
  appendLog(sseLog, event.data);
};

source.onerror = () => {
  sseStatus.textContent = 'Error / reconnecting';
};
