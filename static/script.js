const urlParams = new URLSearchParams(window.location.search);
const mode = urlParams.get('mode');
const username = urlParams.get('username') || 'Anonymous';
const pin = urlParams.get('pin');

let ws;

if (mode === 'random') {
  ws = new WebSocket(`ws://localhost:8000/ws/random?username=${encodeURIComponent(username)}`);
} else {
  ws = new WebSocket(`ws://localhost:8000/ws/private?username=${encodeURIComponent(username)}&pin=${pin}`);
}

const chatBox = document.getElementById('chat-box');

ws.onmessage = (event) => {
  const message = document.createElement('div');
  message.textContent = event.data;
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
};

function sendMessage() {
  const input = document.getElementById('messageInput');
  if (input.value.trim() !== '') {
    ws.send(input.value);
    input.value = '';
  }
}

document.getElementById('messageInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});
