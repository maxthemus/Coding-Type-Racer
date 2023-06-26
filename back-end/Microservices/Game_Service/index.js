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
                    handleUserLeave(socket, message.userId);
                    break;
                case "START":
                    handleUserStart(socket, message.userId);
                    console.log("Start Game");
                    break;
                case "FINISHED":
                    console.log("Finshed Game");
                    handleUserFinish(socket, message.userId);
                    break;
                case "DISCONNECTED":
                    console.log("User has disconnected");
                    handleUserLeave(socket, message.userId); //Leaving is the same as disconnecting
                    break;
                case "UPDATE":
                    console.log("User is updating");
                    handleUserUpdate(socket, message.userId, message.userStatus);
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
const userToGame = new Map(); //Map userId to GameId
const idToGame = new Map();
const waitingGames = []; 
const emptyGames = []; //FOR DEBUGGING should probably remove

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

        console.log(gameToJoin);
    } else {
        //USER is in a game 
        console.log("User is already in a game");
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
    idToGame.set(gameId, newGame);
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


/**
 * Removes user from game. 
 * @param { socket } socket 
 * @param { userId as String } userId 
 */
function handleUserLeave(socket, userId) {
    const gameId = userToGame.get(userId);
    const usersGame = idToGame.get(gameId);
    
    console.log(idToGame);

    //Checking if user is in game
    if(usersGame) {
        //If the user is in a game THEN we want to leave the game

        //Leaving the game
        const playerRemoved = usersGame.removePlayer(userId);
        if(!playerRemoved) { //Checking for removing bugs
            console.log("BUG removing player");
        }

        //Once the place has left we need to check the gameState to see if player array is empty
        if(usersGame.players.length == 0) {
            console.log("Game is empty... Needs to be cleaned up");
            console.log(emptyGames); //Printing out the empty games
            usersGame.gameState = "EMPTY"; //Setting game state to EMPTY
            emptyGames.push(usersGame); //Adding usersGame to empty array

            /** TODO -- CLEAN UP EMPTY GAMES */
            //Removing gameState from map
            idToGame.delete(gameId);

            //removing games from waiting agmes
            removeWaitingGame(usersGame); 
       } else {
            //We want to send an update of the gameState back to users
            socket.send(JSON.stringify({
                type: "GAME-UPDATE",
                gameState: usersGame.stateToObj()
            })); 
        }

        //Removing map from userId to GameId
        userToGame.delete(userId);

        //Sending back response
        socket.send(JSON.stringify({
            type: "USER-LEAVE",
            userId: userId,
            message: "User has left the game"
        }));

        //Updating game State on clients
    
    } else {
        //We just want to remove the from the game map
        userToGame.delete(userId);
    }
}

/**
 * Handles starting the game 
 * @param { Socket} socket 
 * @param { userId as String } userId 
 */
function handleUserStart(socket, userId) {
    const gameId = userToGame.get(userId);
    const usersGame = idToGame.get(gameId);
    
    console.log(idToGame);

    //Checking if user is in game
    if(usersGame) {
        //Checking if game is not running
        if(usersGame.gameState != "RUNNING") {
            //FOR DEBUGGING PURPOSES
            if(usersGame.gameState == "EMPTY") {
                //Game wasn't cleaned up correctly
                console.log("Game is EMPTY");
            }

            //set gameState to "RUNNING"
            usersGame.gameState = "RUNNING";

            //Removing game from waiting games
            removeWaitingGame(usersGame);

            //Send response "GAME-START"
            socket.send(JSON.stringify({
                type: "GAME-START",
                gameState: usersGame.stateToObj() 
            }));
        }
    }
}


/**
 * Handles when user finished the game
 * @param { Socket } socket 
 * @param { userId as String } userId 
 */
function handleUserFinish(socket, userId) {
    const gameId = userToGame.get(userId);
    const usersGame = idToGame.get(gameId);
    
    //console.log(idToGame);

    //Checking if user is in game
    if(usersGame) {
        //Checking if gameState is "RUNNING"
        if(usersGame.gameState == "RUNNING") {
            //Now we want to check if the user has already finished
            console.log(usersGame.length);

            //Checking to see if user has finished
            if(usersGame.playerStatus.get(userId) >= usersGame.length) {
                const place = usersGame.nextPlace++; //Getting the place and then incrementing it
                usersGame.playerPlacements.set(userId, place);

                //Sending message to user saying finished
                socket.send(JSON.stringify({
                    type: "USER-FINISHED",
                    userId: userId,
                    placement: place, 
                    gameState: usersGame.stateToObj()
                }));

                //Send update to everyone saying finished
                socket.send(JSON.stringify({
                    type: "GAME-UPDATE",
                    gameState: usersGame.stateToObj()
                }));

                //Now we want to check to see if all users have finihsed
                let gameFinished = true; //we assume the game is finished
                for(let index in usersGame.players) {
                    const userId = usersGame.players[index]; 
                    if(usersGame.playerStatus.get(userId) < usersGame.length) {
                        console.log("User isn't finished!!!!!!!!");
                        gameFinished = false;
                        break;
                    }    
                }

                //Checking to see if the game is finished if so we need to clean up the game
                if(gameFinished) {
                    handleGameCleanUp(usersGame);
                }
            } 
        }
    } 
}


/**
 * 
 * @param { Socket } socket 
 * @param { userId as String } userId 
 * @param { status as String } updateStatus 
 */
function handleUserUpdate(socket, userId, updateStatus) {
    const gameId = userToGame.get(userId);
    const usersGame = idToGame.get(gameId);

    console.log(usersGame);

    if(usersGame) {
        if(usersGame.gameState == "RUNNING") {
            //Updating users status on the gameState object
            usersGame.playerStatus.set(userId, updateStatus);

            //Sending update back to users in game
            socket.send(JSON.stringify({
                type: "GAME-UPDATE",
                gameState: usersGame.stateToObj()
            }));
        }
    }
}

function handleGameCleanUp(game) {
    game.gameState = "EMPTY"; //Setting game state to EMPTY
    emptyGames.push(game); //Adding usersGame to empty array

    /** TODO -- CLEAN UP EMPTY GAMES */
    //Removing gameState from map
    idToGame.delete(game.id);

    //removing games from waiting agmes
    if(game.state == "WAITING") {
        let index = waitingGames.indexOf(game);
        waitingGames.splice(index, 1);
    } 
}

function removeWaitingGame(game) {
    //removing games from waiting agmes
    if(game.state == "WAITING") {
        let index = waitingGames.indexOf(game);
        waitingGames.splice(index, 1);
    }
}