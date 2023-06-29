//VARIABLES
const USER_SERVICE = "http://localhost:3051/api/user/";
const LOGIN_PAGE = "./login.html";
const HOME_PAGE = "./index.html";
const SOCKET_SERVER = "ws://127.0.0.1:3053";
let socket; //Socket for connecting to game server
let inGame;
let countFunc; //For canceling interval
let countValue; //For game start countdown interval reference
let startTime;
let state;

//Function for getting user login information
function getUserInformation() {
    return sessionStorage.getItem("token");
}

//Event listener for 
window.addEventListener("load", handleLoad);

function handleLoad() {
    //Checking if user is logged in
    if(!getUserInformation()) { 
        window.location.href = LOGIN_PAGE; //Reddirection to login page || Could be main page 
    }
    openSocketConnection(); //Opening socket connection

}


/**
 * SOCKET FUNCTIONS
 */
//Functions
function openSocketConnection() {
    socket = new WebSocket(SOCKET_SERVER); //Opening socket connection

    //Handling connection error
    socket.addEventListener("error", handleConnectionError);

    //Handling connection opening
    socket.addEventListener("open", handleSocketConnection);

    //Handling socket closing
    socket.addEventListener("close", handleSocketClose);

    //Handling socket message
    socket.addEventListener("message", handleSocketMessage);
}

function handleSocketConnection() {
    authenticateSocket();

    //Getting url parameters
    const url = new URL(window.location.href);
    const searchParams = url.searchParams;

    if(searchParams.has("game")) {
        console.log("HERE");
        //We want to join the game right away
        removeGameMenu();
        displayGameMain(); 
        joinGame(searchParams.get("game"));
    } else {
        inGame = false; //setting in game to false
    }
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
                addMultiplayerMenu();
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
                handleGameStart();
                return;
            case "GAME-UPDATE":
                updateGameStateDisplay(message.gameState);
                return;
        }
    }
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

function joinQueue() {
    console.log("Joining game queue");

    if(socket.readyState == WebSocket.OPEN) {
        socket.send(JSON.stringify({
            type: "JOIN",
        }));
    } else {
        console.log("Socket isn't open || Handle this error");
    }
}
function joinGame(gameId) {
    if(socket.readyState == WebSocket.OPEN) {
        socket.send(JSON.stringify({
            type: "JOIN",
            gameId: gameId
        }));
    } else {
        console.log("Socket isn't open || Handle this error");
    }
}

//Function handle closing socket
function handleSocketClose() {
    window.location.href = HOME_PAGE;
}

/**
 *  FUNCTIONS
 */

//Function handles user joining a game
function handleJoinGame(gameState) {
    handleGameGraphicsUpdate(gameState, true); 
    if(!inGame) {
        if(gameState.state == "WAITING") {
            //displayStartButton();
        }
        updateTextLength(gameState.text);
        inGame = true; //Setting in game 
    }
}

//Function handles game start
function handleGameStart() {
    removeStartButton(); //Removing the start button from the game

    countValue = 10; //10 Seconds
    countFunc = setInterval(countDown, 1000); 
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


/**
 * Handling user finishing game
 */
function handleUserFinished(message) {
    console.log("User has finished");

    updatePlayerPlacement(message.userId, message.placement);
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




//Function for displaying game menu
function displayGameMenu() {
    console.log("Displaying game");
    document.getElementById("queue-menu").style.display = "flex";
    document.getElementById("game-main").style.display = "none";

    //Adding event listeners to buttons
    document.getElementById("queue-button").addEventListener("click", joinQueue);

    document.getElementById("game-display").style.display = "flex";
}

//Function for removing game menu
function removeGameMenu() {
    //Removing event listeneres .. Clean up
    document.getElementById("queue-button").removeEventListener("click", joinQueue);


    document.getElementById("queue-menu").style.display = "none";
    document.getElementById("game-main").style.display = "flex";
}

//Function for displaying game view
function displayGameView() {
    //removeGameMenu(); //Removing game menu

    document.getElementById("game-main").style.display = "flex"; //Displaying the game state

    //Adding event listener to the game view input
    document.getElementById("user-input").addEventListener("input", handleUserCharacterInput);
    document.getElementById("user-input").addEventListener("keydown", handleTabs);
}

//Function for removing game view
function removeGameView() {


}


//FUNCITON FOR GAME 
/**
 * 
 *BIG TOBY FUNC
 */
function updateGameStateDisplay(gameState) {
    //Updating text 
    const stateMap = new Map(gameState.playerStatus);
    
    console.log("UPDATING GAME STATES");
    
    //Key == USER ID
    //Value == User status (integer)
    for(const [key, value] of stateMap) {
        const stateTag = document.getElementById(key +"-state");
        if(stateTag != null) {
            let state = "";
            console.log(value + " / " + gameLength);
            let percentage = (value/gameLength);
            console.log(gameLength);
            console.log("PERcent + " + percentage);

            //State character length must be 33 characters 
            let characterCount = ((percentage) * 32);
            console.log("Character count = " + characterCount);

            for(let i = 0; i < characterCount; i++) {
                //get a random number 1 or 0                
                state += Math.round(Math.random()) + "";
            }
            stateTag.innerText = state;
        }
    }
}



//Function to handle user input for game 
let indexPtr = 0; //Variable for current index of character in typing
async function handleUserCharacterInput(event) {
    const arrayQuote = document.getElementById("text-display").querySelectorAll("span"); //Getting all the span tags
    const arrayValue = document.getElementById("user-input").value.split('');

    let valid = await updateTextColors();
    if(valid) {
        if(indexPtr + arrayValue.length >= arrayQuote.length) {
            state++;
            updatePlayerStatus();
            gameFinished();

            state = 0; //reset state
            
        } else {
            switch(event.data) {
                case " ":
                case ".":
                case "(":
                case "<":
                    //Reset input because new word
                    indexPtr = (indexPtr + arrayValue.length);
                    document.getElementById("user-input").value = "";
                    
                    state++; //Incrementing state
                    updatePlayerStatus();
                    break;
                case null:
                    //Checking if input was new line
                    if(event.inputType == "insertLineBreak") {
                        console.log("NEW LINE");
                        indexPtr = (indexPtr + arrayValue.length);
                        document.getElementById("user-input").value = "";
                    
                        state++; //Incrementing state
                        updatePlayerStatus();
                    }

                    break;
            } 
        }
    }

    //Handling backspace
    if(event.inputType == "deleteContentBackward") {
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
    document.getElementById("user-input").removeEventListener("input", handleUserCharacterInput);

    clearInterval(countFunc); //Stoping count function calls

    sendGameFinished();    

    document.getElementById("game-display").style.display = "none"; //Removing game info from display
    clearGameInfo(); //Removing game information from fields

    //Displaying game over buttons
    displayGameOverButtons();

    inGame = false; //Setting in game to false 
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



//Removes information from game display items
function clearGameInfo() {
    const inputField = document.getElementById("user-input");
    inputField.value = "";

    const textDisplay = document.getElementById("text-display");
    while(textDisplay.firstChild) {
        textDisplay.removeChild(textDisplay.firstChild);
    }
}

function displayGameOverButtons() {
    //Creating div for buttons
    const gameOverDiv = document.createElement("div");
    gameOverDiv.id = "game-over";

    //Creating play again button
    const playAgain = document.createElement("button");
    playAgain.id = "playagain-button";
    playAgain.innerText = "Play Again";

    //Creating Main Menu button
    const menuButton = document.createElement("button");
    menuButton.id = "menu-button";
    menuButton.innerText = "Main Menu";

    //Adding event handlers to buttons
    menuButton.addEventListener("click", navigateMainPage);
    playAgain.addEventListener("click", handlePlayAgain);


    //Appending buttons to div
    gameOverDiv.appendChild(playAgain);
    gameOverDiv.appendChild(menuButton);

    //Appending game over div to main game
    document.getElementById("game-main").appendChild(gameOverDiv);
}

function removeGameOverButtons() {
    //Removing event listeners
    const gameOverDiv = document.getElementById("game-over");
    
    if(gameOverDiv != null) {
        //Removing event listeners
        document.getElementById("playagain-button").removeEventListener("click", navigateMainPage);        
        document.getElementById("menu-button").removeEventListener("click", handlePlayAgain);

        //Removing children from node
        while(gameOverDiv.firstChild) {
            gameOverDiv.removeChild(gameOverDiv.firstChild);
        }

        //Removing node
        gameOverDiv.remove();
    } else {
        console.log("ERROR - Removing game over buttons");
    }
}

function handlePlayAgain() {
    //removing game over buttons
    removeGameOverButtons();    

    //Clearing game data
    clearGameData();

    //Displyaing input field
    displayGameMain();

    //First we want to leave the game
    leaveGame();

    //Then we want to join the queue again
    joinQueue();
}

function leaveGame() {
    if(socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            type: "LEAVE"
        }));
    } else {
        console.log("Socket is closed || ERROR");
    }
}

function clearGameData() {
    document.getElementById("counter").innerText = "...";

    //Removing all information in info table
    const infoTable = document.getElementById("info-table");
    while(infoTable.firstChild) {
        infoTable.removeChild(infoTable.firstChild);
    }
}

function displayGameMain() {
    document.getElementById("game-display").style.display = "flex";
    document.getElementById("text-display").style.display = "block";
}





//ORIGINAL FUNCTION IN SINGLEPLAYER
function handleTabs(event) {
    if(event.key === 'Tab') {
        event.preventDefault();
        event.target.value = event.target.value +  "    ";

        updateTextColors();
    } 
}

//ORIGINAL FUNCTION IS IN SINGLEPLAYER
//Funciton for updating color text
async function updateTextColors() {
    return new Promise((res) => {
        const arrayQuote = document.getElementById("text-display").querySelectorAll("span"); //Getting all the span tags
        const arrayValue = document.getElementById("user-input").value.split('');


        //Creating the cursor
        const cursorIndex = indexPtr + arrayValue.length;
        if(arrayQuote[cursorIndex + 1] != null) {
            arrayQuote[cursorIndex + 1].classList.remove("cursor");
        }
        if(arrayQuote[cursorIndex + 1] != null) {
            arrayQuote[cursorIndex - 1].classList.remove("cursor");
        }
        //Placing cursor
        if(arrayQuote[cursorIndex] != null) {
            arrayQuote[cursorIndex].classList.add("cursor");
        }


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
        res(valid);
    });
}


/**
 * UPDATING VARIABLES
 */
let language = "RANDOM";
let gameLength;

/**
 * UPDATING CODE REFACTORING
 */
function addMultiplayerMenu() {
    const mainDiv = document.getElementById("multiplayer-main");

    const menuTitle = document.createElement("h3");
    menuTitle.id = "multiplayer-title";
    menuTitle.innerText = "Multiplayer";
    mainDiv.appendChild(menuTitle);

    //Creating div for buttons
    const menuDiv = document.createElement("div");
    menuDiv.id = "multiplayer-menu";

    //Creating buttons
    //Queue button
    const menuQueueButton = document.createElement("button");
    menuQueueButton.id = "multiplayer-menu-queue";
    menuQueueButton.innerText = "Join Queue";
    menuQueueButton.addEventListener("click", handleJoinGameQueue);
    menuDiv.appendChild(menuQueueButton);

    //Create game button
    const menuCreateButton = document.createElement("button");
    menuCreateButton.id = "multiplayer-menu-create";
    menuCreateButton.innerText = "Create Game";
    menuCreateButton.addEventListener("click", handleCreateGame);
    menuDiv.appendChild(menuCreateButton);

    mainDiv.appendChild(menuDiv);
}

function removeMultiplayerMenu() {
    const mainDiv = document.getElementById("multiplayer-main");

    //Removing event handlers
    document.getElementById("multiplayer-menu-queue").removeEventListener("click", handleJoinGameQueue);
    document.getElementById("multiplayer-menu-create").removeEventListener("click", handleCreateGame);

    //Removing buttons
    const menuDiv = document.getElementById("multiplayer-menu");
    while(menuDiv.firstChild) {
        menuDiv.removeChild(menuDiv.firstChild);
    }

    //Removing all elements in mainDiv
    while(mainDiv.firstChild) {
        mainDiv.removeChild(mainDiv.firstChild);
    }
}


//Menu event handler buttons
function handleJoinGameQueue() {
    removeMultiplayerMenu();
    addQueueMenu();
}

function handleCreateGame() {
    removeMultiplayerMenu(); 
}


/**
 * Functions for queue menu
 */
function addQueueMenu() {
    const mainDiv = document.getElementById("multiplayer-main");

    //Creating title
    const queueTitle = document.createElement("h3");
    queueTitle.id = "queue-title";
    queueTitle.innerText = "Queue Settings";
    mainDiv.appendChild(queueTitle);

    //Creating main div for search settings
    const settingsDiv = document.createElement("div");
    settingsDiv.id ="queue-settings";
    mainDiv.appendChild(settingsDiv);

    //Creating inputs for settings 
    const languageSettings = document.createElement("div");
    languageSettings.id = "language-settings";
    settingsDiv.appendChild(languageSettings);

    //Adding language selector
    addLanguageSelector();

    
    //Creating div for buttons 
    const buttonDiv = document.createElement("div");
    buttonDiv.id = "queue-buttons";

    //Creating back button
    const backButton = document.createElement("button");
    backButton.id = "queue-back-button";
    backButton.innerText = "X";
    backButton.addEventListener("click", handleQueueBackButton);
    buttonDiv.appendChild(backButton);

    //Join Queue button
    const queueButton = document.createElement("button");
    queueButton.id = "join-queue-button";
    queueButton.innerText = "Join Queue";
    queueButton.addEventListener("click", joinGameQueue);
    buttonDiv.appendChild(queueButton);

    mainDiv.appendChild(buttonDiv);
}

function removeQueueMenu() {
    const mainDiv = document.getElementById("multiplayer-main");

    //First we need to remove all settings divs    
    removeLanguageSelector();

    const settingsDiv = document.getElementById("queue-settings");
    while(settingsDiv.firstChild) {
        settingsDiv.removeChild(settingsDiv.firstChild);
    }

    //Now we remove event listeners from buttons
    document.getElementById("join-queue-button").removeEventListener("click", joinGameQueue);
    document.getElementById("queue-back-button").removeEventListener("click", handleQueueBackButton);

    const buttonDiv = document.getElementById("queue-back-button");
    while(buttonDiv.firstChild) {
        buttonDiv.removeChild(buttonDiv.firstChild);
    }

    //Remove all elements from mainDiv
    while(mainDiv.firstChild) {
        mainDiv.removeChild(mainDiv.firstChild);
    }
}

function addLanguageSelector() {
    //Creating selector tag
    const languageSelector = document.createElement("select");
    languageSelector.name = "languages";
    languageSelector.id = "language-select";

    //Creating all options
    const randomOption = document.createElement("option");
    randomOption.value = "RANDOM";
    randomOption.innerText = "Random";

    const pythonOption = document.createElement("option");
    pythonOption.value = "PYTHON";
    pythonOption.innerText = "Python";

    const javascriptOption = document.createElement("option");
    javascriptOption.value = "JAVASCRIPT";
    javascriptOption.innerText = "Javascript";

    const javaOption = document.createElement("option");
    javaOption.value = "JAVA";
    javaOption.innerText = "Java";

    const cOption = document.createElement("option");
    cOption.value = "C";
    cOption.innerText = "C";

    //Appending children
    languageSelector.appendChild(randomOption);
    languageSelector.appendChild(pythonOption);
    languageSelector.appendChild(javascriptOption);
    languageSelector.appendChild(javaOption);
    languageSelector.appendChild(cOption);

    //Adding event listeners    
    languageSelector.addEventListener("change", handleLanguageChange);

    //Adding selector to the div
    document.getElementById("language-settings").appendChild(languageSelector);
}

function removeLanguageSelector() {
    //Removing all child elements in selector
    const languageSelector = document.getElementById("language-select");
    while(languageSelector.firstChild) {
        languageSelector.removeChild(languageSelector.firstChild);
    }

    //Removing event listener
    languageSelector.removeEventListener("change", handleLanguageChange);

    languageSelector.remove();
}

//Functions for handling language 
function handleLanguageChange(event) {
    language = event.target.value;
}

function handleQueueBackButton () {
    removeQueueMenu();
    addMultiplayerMenu();
}

/**
 * Functions for displaying game view
 */
function addGameView() {
    const gameView = document.createElement("div");
    gameView.id = "game-view";
    document.getElementById("multiplayer-main").appendChild(gameView);

    addGameInfo();

    addGameDisplay();
}

function removeGameView() {
    const gameView = document.getElementById("game-view");

    removeGameInfo();

    removeGameDisplay();

    gameView.remove();
}

//Functions for sub components of gameView
function addGameInfo() {
    const gameInfo = document.createElement("div");
    gameInfo.id = "game-info";
    document.getElementById("game-view").appendChild(gameInfo);

    addGameCounter();

    addGameTable();

}
function removeGameInfo() {
    const gameInfo = document.getElementById("game-info");

    removeGameCounter();

    removeGameTable();

    //Removing div
    gameInfo.remove();
}

function addGameCounter() {
    const counterDiv = document.createElement("div");
    counterDiv.id = "game-counter";

    //Creating text tag for timer
    const counterText = document.createElement("p");
    counterText.id = "counter";
    counterText.innerText = "..."; //Default text
    counterDiv.appendChild(counterText);

    //Appending div to the gameInfo
    document.getElementById("game-info").appendChild(counterDiv);
}

function removeGameCounter () {
    const counterDiv = document.getElementById("game-counter");

    while(counterDiv.firstChild) {
        counterDiv.removeChild(counterDiv.firstChild);
    }

    counterDiv.remove();
}

function addGameTable() {
    const tableDiv = document.createElement("div");
    tableDiv.id = "player-info";

    //Creating table
    const table = document.createElement("table");
    table.id = "info-table";
    tableDiv.appendChild(table);

    //Appending table div to game-info
    document.getElementById("game-info").appendChild(tableDiv);
} 

function removeGameTable() {
    const tableDiv = document.getElementById("player-info");

    const table = document.getElementById("info-table");
    while(table.firstChild) {
        //Removing col from table
        while(table.firstChild.firstChild) {
            table.firstChild.removeChild(table.firstChild.firstChild);
        }
        table.removeChild(table.firstChild);
    }

    //Removing nodes
    table.remove();
    tableDiv.remove();
}

//Adds user to table
function addUser(userId, username) {
    const table = document.getElementById("info-table");

    const userRow = document.createElement("tr");
    userRow.id = userId;

    //Creating the cols for the user information
    const nameCol = document.createElement("td");
    nameCol.id = userId + "-name";
    nameCol.innerText = username;

    const stateCol = document.createElement("td");
    stateCol.id = userId + "-state";

    const placementCol = document.createElement("td");
    placementCol.id = userId + "-placement";

    //Appending cols to row
    userRow.appendChild(nameCol);
    userRow.appendChild(stateCol);
    userRow.appendChild(placementCol);

    table.appendChild(userRow);
}

//Removes user from table
function removeUser(userId) {
    //Removing all child nodes
    const userRow = document.getElementById(userId);

    while(userRow.firstChild) {
        userRow.removeChild(userRow.firstChild);
    }
    userRow.remove();
}

function addGameDisplay() {
    const gameDisplay = document.createElement("div");
    gameDisplay.id = "game-display";
    document.getElementById("game-view").appendChild(gameDisplay);

    addGameText();

    addGameInput();
}
function removeGameDisplay() {

}

function addGameText() {
    const textDiv = document.createElement("div");
    textDiv.id = "text-display";
    document.getElementById("game-display").appendChild(textDiv);
}
function removeGameText() {

}

function addGameInput() {
    const inputDiv = document.createElement("div");
    inputDiv.id = "input-area";
    document.getElementById("game-display").appendChild(inputDiv);

    //Creating text field
    const textArea = document.createElement("textarea");
    textArea.id = "user-input";
    textArea.classList.add("text_area");
    textArea.disabled = true; //by default textarea is disabled
    textArea.addEventListener("keydown", handleTabs); //Checking for tab
    textArea.addEventListener("input", handleUserCharacterInput); //Normal input event handler    

    //Appending div to game-display
    inputDiv.appendChild(textArea);
}
function removeGameInput() {
    const inputDiv = document.getElementById("input-area");

    const textArea = document.getElementById("text_area");
    //Removing event listeners
    textArea.removeEventListener("keydown", handleTabs);
    textArea.removeEventListener("input", handleUserCharacterInput);

    //Removing nodes
    textArea.remove();
    inputDiv.remove();
}


/**
 * GAME FUNCTIONS 
 */
function joinGameQueue() {
    //Remove queue menu
    removeQueueMenu();

    //Displaying game view
    addGameView();

    //Send join game request
    joinQueue();
}

function handleGameGraphicsUpdate(gameState, updateText) {
    if(updateText) {
        updateTextDisplay(gameState.text);
    }

    updateUserInformation(gameState.players, new Map(gameState.playerStatus));
}

function updateTextDisplay(text) {
    const displayArea = document.getElementById("text-display");
    text.split('').forEach(character => {
        if(character.charCodeAt(0) != 13) {
            const spanTag = document.createElement("span");
            spanTag.innerText = character;
            displayArea.appendChild(spanTag);
        }
    });
}

function updateUserStatus(statusMap) {
    for(const [key, value] of statusMap) {
        const status = document.getElementById(key+"-status");
        if(status !== null) {
            status.innerText = value; 
        }
    }
}

async function updateUserInformation(users, statusMap) {
    //Updating for new usernames
    for(let index in users) {
        const userRow = document.getElementById(users[index]);
        if(!userRow) {
            //Create user row
            const username = await fetchUsername(users[index]); 
            addUser(users[index], username);
        } 
        //Update user row information 
        updateUserStatus(users[index], statusMap.get(users[index]));
    }

}


function updateTextLength(text) {
    let count = 0;
    for(let index in text) {
        switch(text[index]) {
            case " ":
            case ".":
            case "(":
            case "<":
                count++;
                break;
        }
    }
    gameLength = count+1; //+1 because the final character
}


//API FUNCTIONS
async function fetchUsername(userId) {
    return new Promise((resolve) => {
        fetch(USER_SERVICE + "info/username?id=" + userId).then((res) => {
            return res.json();
        }).then((data) => {
            console.log(data);
            if ("username" in data) {
                return resolve(data.username);
            } else {
                return resolve("...");
            }
        });
    });
   }
