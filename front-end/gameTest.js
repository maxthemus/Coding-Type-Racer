const socket = new WebSocket("ws://127.0.0.1:3052");

socket.addEventListener("open", (event) => {
    console.log("Connection to game service OPEN");
});

socket.addEventListener("close", (event) => {
    console.log("Connection to game service CLOSED");
});

socket.addEventListener("message", (event) => {
    console.log(JSON.parse(event.data));
});