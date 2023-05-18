let socket;
let gameId; 
let userId = "test-id";
document.getElementById("user-id").innerText = "userID = " + userId;

function finishedGame() {
    console.log("Finishing game");

    if(socket) {
        socket.send(JSON.stringify({
            type: "FINISHED",
            userId: "test-id"
        }));
    }
}

function setUserId() {
    userId = prompt("New User ID");
    document.getElementById("user-id").innerText = "userID = " + userId;
}



function joinGame() {
    console.log("User Joining Game");

    if(socket) {
        socket.send(JSON.stringify({
            type: "JOIN",
            userId: userId
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
            userId: userId
        }));
    }
}

function startGame() {
    console.log("User starting Game");

    if(socket) {
        if(gameId) {
            socket.send(JSON.stringify({
                type: "START",
                userId: userId,
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
                case "USER-JOINED":
                    gameId = payload.gameState.id;

                    let playerStatus = new Map(payload.gameState.playerStatus);
                    let playerPlacements = new Map(payload.gameState.playerPlacements);
                    console.log(playerStatus);
                    console.log(playerPlacements);
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