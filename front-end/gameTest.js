let socket;




function joinGame() {
    console.log("User Joining Game");
}

function leaveGame() {
    console.log("User leaving Game");
}

function startGame() {
    console.log("User starting Game");
}



function openSocket() {
    socket = new WebSocket("ws://127.0.0.1:3052"); 

    socket.addEventListener("open", (event) => {
        console.log("Connection to game service OPEN");
    });

    //ADDING LISTENERES 
    socket.addEventListener("close", (event) => {
        console.log("Connection to game service CLOSED");
    });

    socket.addEventListener("message", (event) => {
        console.log(JSON.parse(event.data));
    });
}

function closeSocket() {
    socket.close();
}