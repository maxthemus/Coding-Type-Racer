//VARIABLES
const USER_SERVICE = "http://localhost:3051/api/user/";
const LOGIN_PAGE = "./login.html";
const MAIN_PAGE = "./index.html";
const SOCKET_SERVER = "ws://127.0.0.1:3053";
let socket; //Socket for connecting to game server
let inGame;
let countFunc; //For canceling interval
let countValue; //For game start countdown interval reference
let startTime;
let state;

//Event listener for 
window.addEventListener("load", () => {
    //Checking if user is logged in
    if(!getUserInformation()) { 
        window.location.href = LOGIN_PAGE; //Reddirection to login page || Could be main page 
    }
    openSocketConnection(); //Opening socket connection

    inGame = false; //setting in game to false
});


//Functions
function openSocketConnection() {
    socket = new WebSocket(SOCKET_SERVER); //Opening socket connection

    //Handling connection error
    socket.addEventListener("error", handleConnectionError);

    //Handling connection opening
    socket.addEventListener("open", authenticateSocket);

    //Handling socket closing
    socket.addEventListener("close", handleSocketClose);

    //Handling socket message
    socket.addEventListener("message", handleSocketMessage);
}

//Function for handling connection error
function handleConnectionError() {
    console.log("Error connecting to web socket service");

    //Error Message Handling
    const errorMsg = document.createElement("p");
    errorMsg.innerText = "Unable to connect to Game Servers!";
    errorMsg.id = "error-message";
    document.getElementById("queue-menu").appendChild(errorMsg);
}

//Handling incomming messages from socket
function handleSocketMessage(event) {
    const message = JSON.parse(event.data);
    console.log(message);

    if("type" in message) {
        switch(message.type) {
            case "AUTH":
                //On auth we want to enable game menu 
                displayGameMenu();
                return;
            case "USER-JOIN":
                console.log(message);
                handleJoinGame(message.gameState); 
                return;
            case "USER-LEAVE":
                return;
            case "USER-FINISHED":
                handleUserFinished(message.gameState);
                return;
            case "GAME-START":
                handleGameStart(message.gameState);
                return;
            case "GAME-UPDATE":
                updateGameStateDisplay(message.gameState);
                return;
        }
    }
}

//Function handle closing socket
function handleSocketClose() {
    window.location.href = MAIN_PAGE;
}

//Function handles user joining a game
function handleJoinGame(gameState) {
    if(!inGame) {
        //Close the menu
        removeGameMenu();
    
        //Open up game view
        displayGameView();

        if(gameState.state == "WAITING") {
            displayStartButton();
        }
        
        //Display the text for the game
        displayGameText(gameState.text);
        
        inGame = true; //Setting in game 
    }
        
    //Adding player to the 
    updatePlayerData(gameState);
}

//Function handles game start
function handleGameStart(gameState) {
    removeStartButton(); //Removing the start button from the game

    countValue = 10; //10 Seconds
    countFunc = setInterval(countDown, 1000); 
}

function handleUserFinished(message) {
    console.log("User has finished");

    updatePlayerPlacement(message.userId, message.placement);
}

function updatePlayerStatus() {
    console.log("sending update");
    console.log(state);

    if(socket.readyState == WebSocket.OPEN) {
        socket.send(JSON.stringify({
            type: "UPDATE",
            userState: state
        }));
    } else {
        console.log("Socket not open || ERROR");
    }
}

//Function for handling socket authentication
function authenticateSocket() {
    if(socket.readyState == WebSocket.OPEN) {
        socket.send(JSON.stringify({
            type:"AUTH",
            token: getUserInformation()
        }));
    } else {
        console.log("Socket is not open || Handle this error");
    }
}

//Function for getting user login information
function getUserInformation() {
    return sessionStorage.getItem("token");
}


//Function for displaying game menu
function displayGameMenu() {
    console.log("Displaying game");
    document.getElementById("queue-menu").style.display = "block";
    document.getElementById("game-main").style.display = "none";

    //Adding event listeners to buttons
    document.getElementById("queue-button").addEventListener("click", joinQueue);

    document.getElementById("game-display").style.display = "block";
}

//Function for removing game menu
function removeGameMenu() {
    //Removing event listeneres .. Clean up
    document.getElementById("queue-button").removeEventListener("click", joinQueue);


    document.getElementById("queue-menu").style.display = "none";
    document.getElementById("game-main").style.display = "block";
}

//Function for displaying game view
function displayGameView() {
    //removeGameMenu(); //Removing game menu

    document.getElementById("game-main").style.display = "block"; //Displaying the game state

    //Adding event listener to the game view input
    document.getElementById("user-input").addEventListener("input", handleUserCharacterInput);
}

//Function for removing game view
function removeGameView() {


}


//FUNCITON FOR GAME 
function updateGameStateDisplay(gameState) {
    //Updating text 
    const stateMap = new Map(gameState.playerStatus);
    for(const [key, value] of stateMap) {
        const stateTag = document.getElementById(key +"-state");
        if(stateTag != null) {
            let state = "";
            for(let i = 0; i < value; i++) {
                state += "1010";
            }
            stateTag.innerText = state;
        }
    }
}

function joinQueue() {
    console.log("Joining game queue");

    if(socket.readyState == WebSocket.OPEN) {
        socket.send(JSON.stringify({
            type: "JOIN" 
        }));
    } else {
        console.log("Socket isn't open || Handle this error");
    }
}


//Updated the text in span
function displayGameText(text) {
    const displayArea = document.getElementById("text-display");
    text.split('').forEach(character => {
        const spanTag = document.createElement("span");
        spanTag.innerText = character;
        displayArea.appendChild(spanTag);
    });
}


//Function displays all the player information in the game table
async function updatePlayerData(gameState) {
    const gameTable = document.getElementById("info-table");

    //Upating user information
    for(let index in gameState.players) {
        //Checking if player information is already created
        if(!document.getElementById(gameState.players[index])) {
            //If it isn't created then we want to add a new row
            const userRow = document.createElement("tr"); 
            userRow.id = gameState.players[index];

            let username = await fetch(USER_SERVICE+"info/username?id="+gameState.players[index]).then((res) => {
                return res.json();
            }).then((data) => {
                console.log(data);
                if("username" in data) {
                    return data.username;
                } else {
                    return "...";
                }
            });

            const userNameCol = document.createElement("td");
            userNameCol.innerText = username; //Setting name as player ID <-- FOR NOW
            userNameCol.id = gameState.players[index] + "-name";
        
            const userStateCol = document.createElement("td");
            userStateCol.id = gameState.players[index] + "-state";

            const userPlacementCol = document.createElement("td");
            userPlacementCol.id = gameState.players[index] + "-placement";

            //Now we want to add append all the information to the row
            //And then add the row to the game table
            userRow.appendChild(userNameCol);
            userRow.appendChild(userStateCol);
            userRow.appendChild(userPlacementCol);

            //Appending row to table
            gameTable.appendChild(userRow); 
        } else {
            //We can assume that the name is already setup and just update the status 
            document.getElementById(gameState.players[index] + "-state").in
        }
    }
}



//Function to handle user input for game 
let indexPtr = 0; //Variable for current index of character in typing
function handleUserCharacterInput(event) {
    const arrayQuote = document.getElementById("text-display").querySelectorAll("span"); //Getting all the span tags
    const arrayValue = document.getElementById("user-input").value.split('');

    let valid = true; 
    for(let index = indexPtr; index < (indexPtr + arrayValue.length); index++) {
        if(arrayValue[index - indexPtr] == arrayQuote[index].innerText && valid) {
            //Setting span tag as correct
            arrayQuote[index].classList.remove("incorrect");
            arrayQuote[index].classList.add("correct");

        } else {
            valid = false; //typing is invalid
        
            arrayQuote[index].classList.remove("correct");
            arrayQuote[index].classList.add("incorrect");
        }
    }

    if(valid) {
        if(indexPtr + arrayValue.length >= arrayQuote.length) {
            state++;
            updatePlayerStatus();
            gameFinished();

            state = 0; //reset state
            
        } else {
            switch(event.data) {
                case " ":
                    //Reset input because new word
                    indexPtr = (indexPtr + arrayValue.length);
                    document.getElementById("user-input").value = "";
                    
                    state++; //incrementing state
                    updatePlayerStatus();
                   break;
            }
        }
    }

    //Handling backspace
    if(event.data == null) {
        arrayQuote[indexPtr + arrayValue.length].classList.remove("correct");
        arrayQuote[indexPtr + arrayValue.length].classList.add("incorrect");
    }
}


//Removing the start button
function displayStartButton() {
    const startButton = document.createElement("button");
    startButton.innerText = "Start Game";
    startButton.id = "start-button";
    startButton.addEventListener("click", sendStartGame);


    document.getElementById("game-main").appendChild(startButton);
}

function removeStartButton() {
    const button = document.getElementById("start-button");
    if(button != null) {
        button.removeEventListener("click", sendStartGame);
        button.remove();
    }
}

function sendStartGame() {
    console.log("Sending START to server");

    if(socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            type: "START"
        }));

        //Removing start button
        removeStartButton();
    } else {
        console.log("Socket is closed || ERROR");
    }
}

//Countdown function
function countDown() {
    countValue--;
    document.getElementById("counter").innerText = countValue;

    if(countValue <= 0) {
        clearInterval(countFunc);
        startGame(); //Starting the game
    }
}

//Count up function
function countUp() {
    countValue++;
    document.getElementById("counter").innerText = countValue;
}

function startGame() {
    state = 0;
    indexPtr = 0; //For input handling
    startTime = new Date(); //Getting the start time
    countFunc = setInterval(countUp, 1000); //Starting timer

    //Enabling and focusing the textArea
    const textArea = document.getElementById("user-input");
    textArea.disabled = false;
    textArea.focus();
}

function gameFinished() {
    document.getElementById("user-input").disabled = true; //Disabling the input
    clearInterval(countFunc); //Stoping count function calls

    sendGameFinished();    

    document.getElementById("game-display").style.display = "none"; //Removing game info from display
    clearGameInfo(); //Removing game information from fields

}

function sendGameFinished() {
    console.log("Sending game finished");
    

    if(socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            type: "FINISHED"
        }));
    } else {
        console.log("Socket isn't connected || error");
    } 
}

//function update players placement
function updatePlayerPlacement(userId, placementNum) {
    console.log(userId);
    const userRow = document.getElementById(userId + "-placement");

    switch(placementNum) {
        case 1:
            userRow.innerText = placementNum + "st";
            break;
        case 2:
            userRow.innerText = placementNum + "nd";
            break;
        case 3:
            userRow.innerText = placementNum + "rd";
            break;
        default:
            userRow.innerText = placementNum + "th";
            break;
    }
}

//Removes information from game display items
function clearGameInfo() {
    const inputField = document.getElementById("user-input");
    inputField.value = "";

    const textDisplay = document.getElementById("text-display");
    while(textDisplay.firstChild) {
        textDisplay.removeChild(textDisplay.firstChild);
    }
}