//VARIABLES
const JOIN_URL = "http://122.58.68.153/code-racer/front-end/multiplayerGame.html";
const USER_SERVICE = "http://122.58.68.153:3051/api/user/";
const LOGIN_PAGE = "./login.html";
const HOME_PAGE = "./index.html";
const SOCKET_SERVER = "ws://122.58.68.153:3053";
let socket; //Socket for connecting to game server
let inGame;
let countFunc; //For canceling interval
let countValue; //For game start countdown interval reference
let startTime;
let state;

//Function for getting user login information
function getUserInformation() {
    return window.localStorage.getItem("token");
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

function handleSocketConnected() {
    //Getting url parameters
    const url = new URL(window.location.href);
    const searchParams = url.searchParams;
    console.log(url);

    if(searchParams.has("game")) {
        console.log(searchParams.get("game"));
        //We want to join the game right away        
        addGameView();

        joinGame(searchParams.get("game"));
    } else {
        inGame = false; //setting in game to false

        addMultiplayerMenu();
    }
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
                handleSocketConnected();
                return;
            case "USER-JOIN":
                console.log(message);
                handleJoinGame(message.gameState); 
                return;
            case "USER-LEAVE":
                if("player" in message) {
                    removeUser(message.player);
                }
                return;
            case "USER-FINISHED":
                handleUserFinished(message.gameState);
                return;
           case "GAME-START":
                handleGameStart();
                return;
            case "GAME-UPDATE":
                handleGameGraphicsUpdate(message.gameState, false);
                return;
            case "GAME-CREATED":
                handleGameCreated(message.gameState);
                return; 
        }
    }
}

function updatePlayerStatus(updatedState) {
    console.log("sending update");

    if(socket.readyState == WebSocket.OPEN) {
        socket.send(JSON.stringify({
            type: "UPDATE",
            userState: updatedState
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
    console.log("Closing socket");
    //window.location.href = HOME_PAGE;
}

/**
 *  FUNCTIONS
 */

//Function handles user joining a game
function handleJoinGame(gameState) {
    if(!inGame) {
        updateTextLength(gameState.text);
        
        handleGameGraphicsUpdate(gameState, true); 

        inGame = true; //Setting in game 
    } else {
        handleGameGraphicsUpdate(gameState, false);
    }
}

function handleGameCreated(gameState) {
    //We want to handle the game information for users to join in a link
    joinLink = JOIN_URL + "?game=" + gameState.id;
    console.log(joinLink); 

    handleJoinGame(gameState);
    addStartButton();
    addGameLinkButton();
    addLinkPopUp();
}

//Function handles game start
function handleGameStart() {
    countValue = 10; //10 Seconds
    countFunc = setInterval(countDown, 1000); 

    //Removing link popup
    removeLinkPopUp();
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

//Function to handle user input for game 
let indexPtr = 0; //Variable for current index of character in typing
async function handleUserCharacterInput(event) {
    const arrayQuote = document.getElementById("text-display").querySelectorAll("span"); //Getting all the span tags
    const arrayValue = document.getElementById("user-input").value.split('');

    let valid = await updateTextColors();
    console.log(valid);
    if(valid) {
        if(indexPtr + arrayValue.length >= arrayQuote.length) {
            updatePlayerStatus(++state);
            gameFinished();
        } else {
            switch(event.data) {
                case " ":
                case ".":
                case "(":
                case "<":
                    //Reset input because new word
                    indexPtr = (indexPtr + arrayValue.length);
                    document.getElementById("user-input").value = "";
                    
                    updatePlayerStatus(++state);
                    break;
            } 
        }
    }

    //Handling backspace
    if(event.inputType == "deleteContentBackward") {
        arrayQuote[indexPtr + arrayValue.length].classList.remove("correct");
        arrayQuote[indexPtr + arrayValue.length].classList.add("incorrect");
    }

    console.log(state);
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



//Function to start Game
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
    countValue = 0;

    sendGameFinished();    

    removeGameDisplay(); //Removing textArea and Game Text

    addGameOverMenu(); 

    removeLeaveButton();

    removeGameLinkButton();
        
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

function sendCreateGame() {
    console.log("Sending create game");

    if(socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            type: "CREATE",
            language: language
        }));
    } else {
        console.log("Socket isn't connected || error");
    }
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
    
    //Clearing player table
    removeGameTable();
}

//ORIGINAL FUNCTION IN SINGLEPLAYER
async function handleTabs(event) {
    if(event.key === 'Tab') {
        event.preventDefault();
        event.target.value = event.target.value +  "    ";

        let valid = await updateTextColors();
        if(valid) {
            const arrayValue = document.getElementById("user-input").value.split('');
            indexPtr = (indexPtr + arrayValue.length);
            document.getElementById("user-input").value = "";
                    
            state+= 4; //Incrementing state
            updatePlayerStatus(state);
        }
    } 
    console.log(state);
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
        if(arrayQuote[cursorIndex - 1] != null) {
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
let joinLink = "";
let queueType = "NORMAL"

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
    //Quick queue button    
    const quickQueueButton = document.createElement("button");
    quickQueueButton.id = "multiplayer-quick-queue";
    quickQueueButton.innerText = "Quick Queue";
    quickQueueButton.addEventListener("click", handleQuickJoinGame);
    menuDiv.appendChild(quickQueueButton);

    //language queue button
    const menuQueueButton = document.createElement("button");
    menuQueueButton.id = "multiplayer-menu-queue";
    menuQueueButton.innerText = "Language Queue";
    menuQueueButton.addEventListener("click", handleJoinGameQueue);
    menuDiv.appendChild(menuQueueButton);

    //Create game button
    const menuCreateButton = document.createElement("button");
    menuCreateButton.id = "multiplayer-menu-create";
    menuCreateButton.innerText = "Play With Friends";
    menuCreateButton.addEventListener("click", handleCreateGame);
    menuDiv.appendChild(menuCreateButton);

    mainDiv.appendChild(menuDiv);

    mainDiv.classList.add("menu-styles");
}

function removeMultiplayerMenu() {
    const mainDiv = document.getElementById("multiplayer-main");

    //Removing event handlers
    document.getElementById("multiplayer-quick-queue").removeEventListener("click", handleQuickJoinGame);
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

    mainDiv.classList.remove("menu-styles");
}


//Menu event handler buttons
function handleJoinGameQueue() {
    removeMultiplayerMenu();
    addQueueMenu();
}

function handleCreateGame() {
    removeMultiplayerMenu(); 

    addCreateGameMenu();
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

    //Adding label for drop down
    const languageLabel = document.createElement("p");
    languageLabel.innerText = "Select Language";
    languageLabel.id = "select-label";
    languageSettings.appendChild(languageLabel);

    //Adding language selector
    addLanguageSelector(languageSettings);

    
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

    mainDiv.classList.add("language-styles");
}

function removeQueueMenu() {
    const mainDiv = document.getElementById("multiplayer-main");

    document.getElementById("select-label").remove();


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

    mainDiv.classList.remove("language-styles");
}

function addLanguageSelector(parentNode) {
    language = "RANDOM"; //resetting the value of language

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
    parentNode.appendChild(languageSelector);
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
    //Creating div for game information 
    const gameView = document.createElement("div");
    gameView.id = "game-view";
    document.getElementById("multiplayer-main").appendChild(gameView);

    addGameInfo();

    addGameDisplay();

    addButtonDisplay();    

    document.getElementById("multiplayer-main").classList.add("game-styles");
}

function removeGameView() {
    const gameView = document.getElementById("game-view");

    removeButtonDisplay();    

    removeGameInfo();

    removeGameDisplay();

    gameView.remove();

    document.getElementById("multiplayer-main").classList.remove("game-styles");
}

function addLinkPopUp() {
    if(document.getElementById("game-link-div") == null) {
        const linkDiv = document.createElement("div");
        linkDiv.id = "game-link-div";

        //Appending linkDiv to multiplayer main
        document.getElementById("multiplayer-main").appendChild(linkDiv);

        //Adding link to div
        const linkText = document.createElement("p");
        linkText.id = "game-link-text";
        linkText.innerText = joinLink;
        linkDiv.appendChild(linkText);

        //Adding copy link button
        const copyButton = document.createElement("button");
        copyButton.id = "copy-button";
        copyButton.innerText = "Copy Link";
        copyButton.addEventListener("click", handleCopyLinkButton);
        linkDiv.appendChild(copyButton);
    
        //Close pop up button
        const closeButton = document.createElement("button");
        closeButton.id = "close-button";
        closeButton.innerText = "Close";
        closeButton.addEventListener("click", removeLinkPopUp);
        linkDiv.appendChild(closeButton);
    
        window.addEventListener("click", handleLinkPopUp);
    } 

}
function removeLinkPopUp() {
    //Removing event listeners
    const linkDiv = document.getElementById("game-link-div");
    
    if(linkDiv != null) {
        //Removing event listeners for buttons
        document.getElementById("copy-button").removeEventListener("click", handleCopyLinkButton);
        document.getElementById("close-button").removeEventListener("click", removeLinkPopUp);

       while (linkDiv.firstChild) {
            linkDiv.removeChild(linkDiv.firstChild);
        }

        linkDiv.remove();
        window.removeEventListener("click", handleLinkPopUp);    
    }
}

//Function for adding leave button
function addLeaveButton() {
    console.log("Adding leave button");
    const buttonDiv = document.getElementById("button-div");

    const leaveButton = document.createElement("button");
    leaveButton.id = "leave-button";
    leaveButton.innerText = "Leave Game";
    leaveButton.addEventListener("click", handleLeaveGame);
    buttonDiv.appendChild(leaveButton);
}


//Function for removing leave button
function removeLeaveButton() {
    const leaveButton = document.getElementById("leave-button");

    if(leaveButton != null) {
        //Removing event listeners
        leaveButton.removeEventListener("click", handleLeaveGame);
        leaveButton.remove();
    }
}

//Function for adding button display at bottom of game div
function addButtonDisplay() {
    const mainDiv = document.getElementById("multiplayer-main");

    //Creating new div
    const buttonDiv = document.createElement("div");
    buttonDiv.id = "button-div";
    mainDiv.appendChild(buttonDiv);

    addLeaveButton();
}

function removeButtonDisplay() {
    const buttonDiv = document.getElementById("button-div");

    //Removing children
    removeLeaveButton();
    removeGameLinkButton();
    //Removing start button if exists
    if(document.getElementById("start-button") !== null)  {
        removeStartButton(); 
    }

    //removing the div
    buttonDiv.remove();
}


//Function for adding invite link button
function addGameLinkButton() {
    const buttonDiv = document.getElementById("button-div");

    const inviteButton = document.createElement("button");
    inviteButton.id = "invite-button";
    inviteButton.innerText = "Invite Players";
    inviteButton.addEventListener("click", handleInviteButton);
    buttonDiv.append(inviteButton);
}

//Function for removing intive link button
function removeGameLinkButton() {
    const inviteButton = document.getElementById("invite-button");

    if(inviteButton != null) {
        inviteButton.removeEventListener("click", handleInviteButton);
        inviteButton.remove();
    }
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

    if(counterDiv != null) {
        while (counterDiv.firstChild) {
            counterDiv.removeChild(counterDiv.firstChild);
        }

        counterDiv.remove();
    }
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
    nameCol.classList.add("name-col");

    const stateCol = document.createElement("td");
    stateCol.id = userId + "-state";
    stateCol.classList.add("state-col");

    //Creating player progress bar
    const progressDiv = document.createElement("div");
    progressDiv.id = userId+"-progress";
    progressDiv.style.width = "0%";
    progressDiv.classList.add("progress-div");
    stateCol.appendChild(progressDiv);

    const placementCol = document.createElement("td");
    placementCol.id = userId + "-placement";
    placementCol.classList.add("placement-col");

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

    //Removing progress bar
    const userState = document.getElementById(userId +"-state");
    userState.removeChild(userState.firstChild); 

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
    const gameDisplay = document.getElementById("game-display");

    if(gameDisplay !== null) {
        removeGameText();

        removeGameInput();

        gameDisplay.remove();
    }
}

function addGameText() {
    const textDiv = document.createElement("div");
    textDiv.id = "text-display";
    document.getElementById("game-display").appendChild(textDiv);
}
function removeGameText() {
    const textDiv = document.getElementById("text-display");

    if(textDiv !== null) {
      //Removing all span nodes from div
      while (textDiv.firstChild) {
        textDiv.removeChild(textDiv.firstChild);
      }

      textDiv.remove();
    }
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

    if(inputDiv !== null) {
        const textArea = document.getElementById("user-input");
        //Removing event listeners
        textArea.removeEventListener("keydown", handleTabs);
        textArea.removeEventListener("input", handleUserCharacterInput);

        //Removing nodes
        textArea.remove();
        inputDiv.remove();
    }
}

function addGameOverMenu() {
    const gameOverDiv = document.createElement("div");
    gameOverDiv.id = "game-over-menu";
    document.getElementById("game-view").appendChild(gameOverDiv);

    //Now we want to create the buttons in the game over menu
    const playAgainButton = document.createElement("button");
    playAgainButton.id = "play-again";
    playAgainButton.innerText = "Play Again";
    playAgainButton.addEventListener("click", handlePlayAgain);
    gameOverDiv.appendChild(playAgainButton);

    const leaveGame = document.createElement("button");
    leaveGame.id = "leave-game";
    leaveGame.innerText = "Leave Game";
    leaveGame.addEventListener("click", handleLeaveGame);
    gameOverDiv.appendChild(leaveGame);
}

function removeGameOverMenu() {
    const gameOverDiv = document.getElementById("game-over-menu");
    
    //Removing event listeners from buttons
    document.getElementById("play-again").removeEventListener("click", handlePlayAgain);
    document.getElementById("leave-game").removeEventListener("click", handleLeaveGame);

    //Removing all elements in menu
    while(gameOverDiv.firstChild) {
        gameOverDiv.removeChild(gameOverDiv.firstChild);
    }

    gameOverDiv.remove();
}

function addCreateGameMenu() {
    const mainDiv = document.getElementById("multiplayer-main");

    const title = document.createElement("h3");
    title.innerText = "Play With Friends";
    mainDiv.appendChild(title);


    const languageSettings = document.createElement("div");
    languageSettings.id = "language-settings";
    mainDiv.appendChild(languageSettings);

    //Adding label for drop down
    const languageLabel = document.createElement("p");
    languageLabel.innerText = "Select Language";
    languageLabel.id = "select-label";
    languageSettings.appendChild(languageLabel);

    addLanguageSelector(languageSettings);

    //Creating div for buttons 
    const buttonDiv = document.createElement("div");
    buttonDiv.id = "create-buttons";

    //Creating back button
    const backButton = document.createElement("button");
    backButton.id = "create-back-button";
    backButton.innerText = "X";
    backButton.addEventListener("click", handleCreateBackButton);
    buttonDiv.appendChild(backButton);

    //Join Queue button
    const queueButton = document.createElement("button");
    queueButton.id = "create-game-button";
    queueButton.innerText = "Create Game";
    queueButton.addEventListener("click", handleSendCreateGame);
    buttonDiv.appendChild(queueButton);

    mainDiv.appendChild(buttonDiv);

    mainDiv.classList.add("friend-styles");
}

function removeCreateGameMenu() {
    const mainDiv = document.getElementById("multiplayer-main");

    //Removing selectors
    removeLanguageSelector();

    //Now we remove event listeners from buttons
    document.getElementById("create-game-button").removeEventListener("click", handleSendCreateGame);
    document.getElementById("create-back-button").removeEventListener("click", handleCreateBackButton);

    const buttonDiv = document.getElementById("create-buttons");
    while(buttonDiv.firstChild) {
        buttonDiv.removeChild(buttonDiv.firstChild);
    }    



    //Removing all elements
    while(mainDiv.firstChild) {
        mainDiv.removeChild(mainDiv.firstChild);
    }
    
    mainDiv.classList.remove("friend-styles");
}

function handleCreateBackButton() {
    removeCreateGameMenu();
    addMultiplayerMenu();    
}

function addStartButton() {
    const buttonDiv = document.getElementById("button-div");

    const startButton = document.createElement("button");
    startButton.id = "start-button";
    startButton.innerText = "Start Game";
    startButton.addEventListener("click", sendStartGame);

    buttonDiv.appendChild(startButton);
}

function removeStartButton() {
    const startButton = document.getElementById("start-button");
    startButton.removeEventListener("click", sendStartGame);
    startButton.remove();
}


/**
 * GAME FUNCTIONS 
 */
function handlePlayAgain() {
    console.log("Playing again");
    inGame = false;    

    leaveGame();

    removeGameView();

    addGameView();

    switch(queueType) {
        case "PRIVATE":
            sendCreateGame(); 
            break;
        case "NORMAL":
        default:
            joinQueue();
            break;
    }
}

function handleLeaveGame() {
    console.log("Leaving Game");

    //Clearing count information
    clearInterval(countFunc); //Stoping count function calls
    countValue = 0;

    inGame = false; //Setting as not in game    

    leaveGame();

    removeGameView();

    addMultiplayerMenu();
}


function handleQuickJoinGame() {
    removeMultiplayerMenu();

    addGameView();

    joinQueue();

    queueType = "NORMAL";
}

function handleSendCreateGame() {
    removeCreateGameMenu();

    addGameView();

    sendCreateGame();

    queueType = "PRIVATE"; //Setting the queue type
}

function handleLinkPopUp(event) {
    const linkDiv = document.getElementById("game-link-div");
    const outsidePopUp = !linkDiv.contains(event.target);    

    if(outsidePopUp && event.target != document.getElementById("invite-button")) {
        removeLinkPopUp();
    }
}

function handleInviteButton() {
    addLinkPopUp();
}

function handleCopyLinkButton(event) {
    navigator.clipboard.writeText(joinLink).then(() => {
        event.target.innerText = "Copied!";
        setTimeout(() => {
            event.target.innerText = "Copy Link";
        }, 1500);
    });
}


function joinGameQueue() {
    //Remove queue menu
    removeQueueMenu();

    //Displaying game view
    addGameView();

    //Send join game request
    joinQueue();

    queueType = "NORMAL";
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

function updateUserStatus(userId, userState) {
    const state = document.getElementById(userId+"-progress");

    if(state != null) {
        const characterCountTotal = 28;
        const completionPercent = (userState/(gameLength+1)) * 100;
        state.style.width = completionPercent + "%";
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
    for (let index in text) {
        switch (text[index]) {
            case " ":
            case ".":
            case "(":
            case "<":
                count++;
                break;
        }
    }
    gameLength = count;
    console.log('len == ' + gameLength);
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
