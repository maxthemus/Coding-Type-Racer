/**
 *  Game Service - Microservice
 * 
 *  All connections to this service must be made via web Sockets
 *  As of version 1.0.0
 * 
 */
//Configuration File
require('dotenv').config();
const PORT = process.env.PORT;

//Importing GameState class
const GameState = require('./GameState');

//Http server
const http = require("http");
const server = http.createServer();

//Web socket Server
const WebSocket = require("ws");
const socketServer = new WebSocket.Server({ server });

//Starting server
server.listen(PORT, () => {
    console.log("Game Service starting on PORT : " + PORT);
});

//UUID package for gameID
const { v4: uuidv4 } = require('uuid');


//Handling Web Sockets
socketServer.on("connection", (socket) => {
    console.log("Service opened connection");

    socket.on("message", (buffer) => {
        const message = JSON.parse(buffer);
        console.log(message);
        
        if("type" in message) {
            switch(message.type) {
                case "JOIN":
                    console.log("Joining game");
                    handleUserJoinGame(socket, message.userId);
                    break;
                case "LEAVE":
                    console.log("Leaving Game");

                    break;
                case "START":
                    console.log("Start Game");
                    break;
                case "FINISHED":
                    console.log("Finshed Game");
                    break;
                case "DISCONNECTED":
                    console.log("User has disconnected");
                    break;
            }
        }

    });


    socket.on("close", () => {
        //GOTS TO CLEAN UP ALL THE GAMES
        console.log("Connection has been closed");
    });
})

//Variables for handling Games
const userToGame = new Map();
const idToGame = new Map();
const waitingGames = []; 

/**
 * Takes in socket and user id. Joins user to a game and responds to client. 
 * @param {socket} socket 
 * @param {userId as String} userId 
 */
function handleUserJoinGame(socket, userId) {
    //Check if the user is already in a game
    if(!userToGame.has(userId)) {
        //USER is not in a game 

        //Find game for user to join
        let gameToJoin = searchForGame();
        if(!gameToJoin) { //Checking if game was found
            //Game was not found
            gameToJoin = createGame();
        }
        
        //JOIN user to game
        joinGame(userId, gameToJoin);

        //SEND response 
        socket.send(JSON.stringify({
            type: "USER-JOINED",
            gameState: gameToJoin.stateToObj()
        }));
    } else {
        //USER is in a game 
    }
}


/**
 * searches waitingGames array to find a game to join 
 * @returns { GameState || Null } gameState object
 */
function searchForGame() {
    if(waitingGames.length > 0) {
        return waitingGames[0];
    }    
    return null;
}

/**
 * Creates game StateObject 
 * @returns { GameState } gameState object
 */
function createGame() {
    const gameId = uuidv4();
    const newGame = new GameState(gameId, "test text for game");
    waitingGames.push(newGame);
    return newGame;
}


/**
 * Joins user to a gameState object 
 * @param { userId as String} userId 
 * @param { gameState } gameState 
 */
function joinGame(userId, gameState) {
    gameState.addPlayer(userId); //Adding user to gameState
    userToGame.set(userId, gameState.id); //Mapping user to gameId
}