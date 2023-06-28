//Pages
const MULTIPLAYER_GAME_PAGE = "./multiplayerGame.html";
const SINGLEPLAYER_GAME_PAGE = "./singleplayerGame.html";
let loggedIn = false; //By default user isn't logged in

//Function called onload of home page
window.addEventListener("load", handlePageLoad);

function handlePageLoad() {
    //Setting logged in status
    loggedIn = (window.sessionStorage.getItem("username") !== null);
}


//Adding event listener for single player button
document.getElementById("singlePlayer-button").addEventListener("click", handleJoinSinglePlayer);
//Function for handling starting singleplayer
function handleJoinSinglePlayer() {
    console.log("SINGLEPLAYER");
    window.location.href = SINGLEPLAYER_GAME_PAGE;
}

document.getElementById("multiPlayer-button").addEventListener("click", handleJoinMultiPlayer);
//Function for handling starting multiplayer
function handleJoinMultiPlayer() {
    if(loggedIn) {
        window.location.href = MULTIPLAYER_GAME_PAGE;
    } else {
        redirectLoginPage();
    }
}

function redirectLoginPage() {
    window.location.href = "./login.html";
}