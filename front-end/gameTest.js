let socket;
let gameId; 

function finishedGame() {
    console.log("Finishing game");

    if(socket) {
        socket.send(JSON.stringify({
            type: "FINISHED",
            userId: "test-id"
        }));
    }
}




function joinGame() {
    console.log("User Joining Game");

    if(socket) {
        socket.send(JSON.stringify({
            type: "JOIN",
            userId: "test-id"
        }));
    } else {
        console.log("SOCKET IS NOT OPEN");
    }
}

function leaveGame() {
    console.log("User leaving Game");

    if(socket) {
        socket.send(JSON.stringify({
            type: "LEAVE",
            userId: "test-id"
        }));
    }
}

function startGame() {
    console.log("User starting Game");

    if(socket) {
        if(gameId) {
            socket.send(JSON.stringify({
                type: "START",
                userId: "test-id",
                gameId: gameId 
            }));
        } else {
            console.log("Not in a game");
        }
   }
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
        const payload = JSON.parse(event.data);
        console.log(JSON.parse(event.data));

        if("type" in payload) {
            switch(payload.type) {
                case "JOINED-GAME":
                    gameId = payload.gameState.id;
                    break;
                case "START-GAME":
                    startTime = payload.timeToStart;
                    setTimeout(startTyping, (startTime * 1000));

                    break;
            }
        }
    });
}

function closeSocket() {
    socket.close();
}

function startTyping() {
    alert("Game has started");
}