//Opening socket connection
const socket = new WebSocket('ws://127.0.0.1:3053');


socket.addEventListener('open', (event) => {
    console.log("Socket has been open");
});

socket.addEventListener("close", (event) => {
    console.log("Socket has been closed");
})
