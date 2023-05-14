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
const GameState = require('./GameStateClass');

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
                    if(!userToGameMap.has(message.userId)) {
                        const gameToJoin = findGameForUser(message.userId);

                        if(!gameToJoin) { //Checking if gameObject was found
                            console.log("Error Finding Game");
                            return;
                        } 

                        joinUserToGame(userId, gameId);
                        //We want to send response saying joined game
                        //And then we want to update all users in game that user has joined Game
                    }
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
const waitingGames = new Map();
const runningGames = new Map();
const userToGameMap = new Map();

//Handling JOIN game
function findGameForUser(userId) {
    //First we have to find a game that is in the WAITING state
    //IF free WAITING >> join
    //ELSE >> create game >> and join user to game
    if(waitingGames.size > 0) {
        const availableGame = waitingGames.values();
        return availableGame.next().value; 
    } else {
        return createGame();
    }
}

function joinUserToGame(userId, gameId) {
    if(waitingGames.has(gameId)) {
        const gameState = waitingGames.get(gameId);
        let joinGame = gameState.addPlayer(userId);
        if(joinGame) {
            gameState.setState("STARTING"); //Starts the countdown
            startGame(gameId);
        }
    }
    return false; //Something went wrong
}

function disconectUserFromGame(userId) {

} 


/**
 * Creates a GameStateObject 
 * @returns a GameStateObject
 */
function createGame() {
    let gamedId = uuidv4();//Creating game UUID
    const gameState = new GameState(gameId, "this is a test text for building the game service");
    waitingGames.set(gameId, gameState); //Adding game to waiting
    return gameState;
} 

function destoryGame(gameId) {

}

function startGame(gameId) {
    console.log("Starting Game");
}