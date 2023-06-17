//VARIABLES
const LOGIN_PAGE = "./login.html";
const MAIN_PAGE = "./index.html";
const SOCKET_SERVER = "ws://127.0.0.1:3053";
let socket; //Socket for connecting to game server

//Event listener for 
window.addEventListener("load", () => {
    //Checking if user is logged in
    if(!getUserInformation()) { 
        window.location.href = LOGIN_PAGE; //Reddirection to login page || Could be main page 
    }
    openSocketConnection(); //Opening socket connection
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
                handleJoinGame(message.gameState); 
                return;
            case "USER-LEAVE":
                return;
        }
    }
}

//Function handle closing socket
function handleSocketClose() {
    window.location.href = HOME_PAGE;
}

//Function handles user joining a game
function handleJoinGame(gameState) {
    //Close the menu
    removeGameMenu();

    //Open up game view
    displayGameMenu();

    //Updaing game state
    updateGameStateDisplay(gameState);
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
    document.getElementById("queue-menu").style.display = "block";
    document.getElementById("game-main").style.display = "none";

    //Adding event listeners to buttons
    document.getElementById("queue-button").addEventListener("click", joinQueue);
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
}

//Function for removing game view
function removeGameView() {

}


//FUNCITON FOR GAME 
function updateGameStateDisplay(gameState) {
    //Updating text 
    const displayArea = document.getElementById("text-display");
    gameState.text.split('').forEach(character => {
        const spanTag = document.createElement("span");
        spanTag.innerText = character;
        displayArea.appendChild(displayArea);
    });

    //Upating user information
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