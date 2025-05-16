from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import uuid

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Track users for random and private chats
random_waiting_user = None
private_rooms = {}

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.websocket("/ws/random")
async def websocket_random(websocket: WebSocket):
    global random_waiting_user
    await websocket.accept()
    try:
        if random_waiting_user is None:
            random_waiting_user = websocket
            await websocket.send_text("Waiting for a user to join...")
        else:
            await random_waiting_user.send_text("User connected. Start chatting!")
            await websocket.send_text("User connected. Start chatting!")
            user1, user2 = random_waiting_user, websocket
            random_waiting_user = None
            while True:
                data1 = await user1.receive_text()
                await user2.send_text(data1)
                data2 = await user2.receive_text()
                await user1.send_text(data2)
    except WebSocketDisconnect:
        if random_waiting_user == websocket:
            random_waiting_user = None

@app.websocket("/ws/private/{pin}")
async def websocket_private(websocket: WebSocket, pin: str):
    await websocket.accept()
    try:
        if pin not in private_rooms:
            private_rooms[pin] = websocket
            await websocket.send_text("Waiting for user to join with pin: " + pin)
        else:
            other = private_rooms.pop(pin)
            await other.send_text("User joined. Start chatting!")
            await websocket.send_text("User joined. Start chatting!")
            while True:
                data1 = await websocket.receive_text()
                await other.send_text(data1)
                data2 = await other.receive_text()
                await websocket.send_text(data2)
    except WebSocketDisconnect:
        if pin in private_rooms:
            del private_rooms[pin]
