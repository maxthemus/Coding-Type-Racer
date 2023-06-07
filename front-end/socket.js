const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0YjllMmRjNC0xOWQ0LTRiMTgtODVlZS0xNGEyYTM1NmJlMGIiLCJpYXQiOjE2ODQwMDIzMzN9.smUSMtzzWPggwK6LfI-AvC2UcSZYnOqxTTm-hh0V5Xw";
const userID = "6fe5bacc-f1bf-11ed-a05b-0242ac120003";
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhMTMzZTljZS00ZTNkLTQ4ZjktYjhjNy1jNDRmNDhjMWViZTMiLCJpYXQiOjE2ODU3NzQ0OTV9.bTLKQxGEWmPSuKcI9npdZJwmQ9G7PPoRFK4NnRUVVe4
let socket; 
let state = 0;
let text = "";
let textLength = 0;

function addEventHandlers() {
    socket.addEventListener('open', (event) => {
        console.log("Socket has been open");
    });

    socket.addEventListener("close", (event) => {
        console.log(event);

        switch (event.code) {
            case 3000: //Invalid Payload
                console.log("Invalid Payload");
                break;
            case 3001: //Failed AUTH
                console.log("Authentication failed");
                break;
        }
        console.log("Socket has been closed");
    });

    socket.addEventListener("message", (event) => {
        console.log(event.data);
        const message = JSON.parse(event.data);
        console.log(message);

        if("type" in message) {
            switch(message.type) { 
                case "USER-LEAVE":
                    handleLeaveGame();
                    return;            
                case "GAME-START":
                    text = message.gameState.text;
                    textLength = calculateGameTextLength(message.gameState.text);
                    handleGameStart(message.gameState);
                    return;
                case "USER-FINISHED":
                    const userId = message.gameState.userId;
                    const placement = message.gameState.placement;
                    alert(`${userId} has placed ${placement}`);
                    return;
            }
        }

        if("gameState" in message) {
            updateGameState(message.gameState);
        }
    });
}

//FUNCTIONS 
async function sendAuthentication(tempToken) {
    if(socket.readyState == WebSocket.OPEN) {
        const messageStr = JSON.stringify({
            type: "AUTH",
            token: tempToken
        });

        socket.send(messageStr);
        console.log("Auth Sent"); 
    } else {
        console.log("Socket is not open");
    }
}


//HANDLING OPEN
function openConnection() {
    console.log("Opening socket");
    socket = new WebSocket('ws://127.0.0.1:3053');

    addEventHandlers();
}

//HANDLE CLOSE 
function closeConnection() {
    console.log("Closing Socket");
    socket.close();
}

//HANDLE AUTHENTICATION
function authenticateSocket() {
    let tempToken = prompt("Token", token); //By default its a preset token

    sendAuthentication(tempToken); 
}


//GAME FUNCTIONS
//HANDLE JOIN GAME
function joinGame() {
    if(socket.readyState == WebSocket.OPEN) {
        const message = JSON.stringify({
            type:"JOIN",
        });

        socket.send(message);
        console.log("Joining game");
    } else {
        console.log("Socket isn't open");
    }
}

function leaveGame() {
    console.log("Leaving Game");
    if(socket.readyState == WebSocket.OPEN) {
        const message = JSON.stringify({
            type:"LEAVE"
        });

        socket.send(message);
    } else {
        console.log("Socket isn't open");
    }
}

function startGame() {
    if(socket.readyState == WebSocket.OPEN) {
        const messgae = JSON.stringify({
            type: "START"
        });

        socket.send(messgae);
    } else {
        console.log("Socket isn't open");
    }
}


//Replicates call from user typing word
function typedWord() {
    sendUpdate(++state);

    //Checking if game is done
    if(state >= textLength) {
        sendFinishedGame(); 
    }
}

function sendUpdate(state) {
    if(socket.readyState == WebSocket.OPEN) {
        //If game has started
        if(true) {
            const message = JSON.stringify({
                type:"UPDATE",
                userState: state
            });

            socket.send(message);
        }
    }
}


//Function to update the gameState information
function updateGameState(gameState) {
    if("id" in gameState) {
        document.getElementById("game-id").innerHTML = gameState.id;
    }
    if("state" in gameState) {
        document.getElementById("game-state").innerHTML = gameState.state;
    }
    if("text" in gameState) {
        document.getElementById("game-text").innerHTML = gameState.text;
    }

    if(textLength) {
        console.log("Updating text length");
        document.getElementById("game-text-length").innerHTML = textLength;
    }


    if("players" in gameState && "playerStatus" in gameState) {
        const players = gameState.players;
        const userMap = new Map(gameState.playerStatus);
        const tableBody = document.getElementById("table-body")
        clearPlayerTable();
        
        for(let index in players) {
            const tempRow = document.createElement("tr");
            const playerId = document.createElement("td");
            const playerStatus = document.createElement("td");

            playerId.innerText = players[index];
            playerStatus.innerText = userMap.get(players[index]);

            tempRow.appendChild(playerId);
            tempRow.appendChild(playerStatus);

            tableBody.appendChild(tempRow);
        }
    }
}

function clearPlayerTable() {
    const tableBody = document.getElementById("table-body");
    tableBody.innerHTML = "";
}

function handleLeaveGame() {
    document.getElementById("table-body").innerHTML = "";
    document.getElementById("game-id").innerHTML = "";
    document.getElementById("game-state").innerHTML = "";
    document.getElementById("game-text").innerHTML = "";
}


function handleGameStart(gameState) {
    alert("Game is starting!");
    updateGameState(gameState);
}


//Returns int value of text length
function calculateGameTextLength(text) {
   let splits = text.split(" ");
   return splits.length;
}

function sendFinishedGame() {
    console.log("Sending game finished");
    if(socket.readyState == WebSocket.OPEN) {
        const messgae = JSON.stringify({
            type: "FINISHED"
        });

        socket.send(messgae);
    }
}