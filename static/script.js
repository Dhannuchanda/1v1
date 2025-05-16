// const urlParams = new URLSearchParams(window.location.search);
// const mode = urlParams.get('mode');
// const username = urlParams.get('username') || 'Anonymous';
// const pin = urlParams.get('pin');

// let ws;

// if (mode === 'random') {
//   ws = new WebSocket(`ws://localhost:8000/ws/random?username=${encodeURIComponent(username)}`);
// } else {
//   ws = new WebSocket(`ws://localhost:8000/ws/private?username=${encodeURIComponent(username)}&pin=${pin}`);
// }

// const chatBox = document.getElementById('chat-box');

// ws.onmessage = (event) => {
//   const message = document.createElement('div');
//   message.textContent = event.data;
//   chatBox.appendChild(message);
//   chatBox.scrollTop = chatBox.scrollHeight;
// };

// function sendMessage() {
//   const input = document.getElementById('messageInput');
//   if (input.value.trim() !== '') {
//     ws.send(input.value);
//     input.value = '';
//   }
// }

// document.getElementById('messageInput').addEventListener('keypress', (e) => {
//   if (e.key === 'Enter') sendMessage();
// });









let socket = null;
let roomType = "random"; // default
let pin = null;

// DOM elements
const connectBtn = document.getElementById("connect");
const disconnectBtn = document.getElementById("disconnect");
const sendBtn = document.getElementById("send");
const input = document.getElementById("message");
const chat = document.getElementById("chat");
const pinInput = document.getElementById("pin");
const roomMode = document.getElementById("roomMode");
const status = document.getElementById("status");

// // Backend WebSocket URL
// const backendURL = "wss://your-backend-url/ws"; // <-- REPLACE THIS
const backendURL = "wss://1v1-chat.onrender.com/ws";

function addMessage(message, sender = "stranger") {
    const div = document.createElement("div");
    div.className = sender;
    div.textContent = message;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

function setConnectedUI(connected) {
    connectBtn.disabled = connected;
    disconnectBtn.disabled = !connected;
    sendBtn.disabled = !connected;
    input.disabled = !connected;
    pinInput.disabled = connected || roomType !== "private";
    roomMode.disabled = connected;
}

roomMode.addEventListener("change", () => {
    roomType = roomMode.value;
    if (roomType === "private") {
        pinInput.style.display = "inline-block";
    } else {
        pinInput.style.display = "none";
        pin = null;
    }
});

connectBtn.addEventListener("click", () => {
    if (roomType === "private") {
        pin = pinInput.value.trim();
        if (!pin) {
            alert("Please enter a PIN for private chat.");
            return;
        }
    }

    const url = roomType === "random" ? `${backendURL}/random` : `${backendURL}/private?pin=${pin}`;
    socket = new WebSocket(url);

    socket.onopen = () => {
        setConnectedUI(true);
        status.textContent = "🔗 Connected!";
    };

    socket.onmessage = (event) => {
        addMessage(event.data);
    };

    socket.onclose = () => {
        setConnectedUI(false);
        addMessage("Disconnected.", "system");
        status.textContent = "⚠️ Disconnected.";
    };

    socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        addMessage("An error occurred.", "system");
    };
});

disconnectBtn.addEventListener("click", () => {
    if (socket) {
        socket.close();
    }
});

sendBtn.addEventListener("click", () => {
    const text = input.value.trim();
    if (text && socket && socket.readyState === WebSocket.OPEN) {
        socket.send(text);
        addMessage(text, "you");
        input.value = "";
    }
});

input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        sendBtn.click();
    }
});
