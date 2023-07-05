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
const DB_SERVICE = process.env.DB_SERVICE;

//Importing GameState class
const GameState = require('./GameState');

//Http server
const http = require("http");
const server = http.createServer();

//Web socket Server
const WebSocket = require("ws");
const socketServer = new WebSocket.Server({ server });

//Http request
const axios = require("axios");


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
                    if("gameId" in message){ 
                        handleUserJoinGame(socket, message.userId, message.gameId);
                    } else {
                        handleUserJoinGame(socket, message.userId, null);
                    }
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
                case "CREATE":
                    console.log("User is creating a game");
                    handleUserCreateGame(socket, message.userId, message.language);
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
async function handleUserJoinGame(socket, userId, gameId) {
    //Check if the user is already in a game
    if(!userToGame.has(userId)) {
        //USER is not in a game 

        //Checking if user wants to join a specific game
        if(gameId === null) {
            //Find game for user to join
            let gameToJoin = await Promise.resolve(searchForGame());
            console.log(gameToJoin);
            if(!gameToJoin) { //Checking if game was found
                //Game was not found
                gameToJoin = await Promise.resolve(createGame("RANDOM", false)); //Random language and not private game
            }  
                
            //JOIN user to game
            joinGame(userId, gameToJoin);

            //SEND response 
            socket.send(JSON.stringify({
                type: "USER-JOINED",
                gameState: gameToJoin.stateToObj()
            }));

            
            //AUTO GAME STARTER
            //Updating game State on clients
            if(gameToJoin.type == "NORMAL") {
                console.log("Auto Starting Game : " + gameToJoin.id);
                gameAutoStarter(gameToJoin, socket);
            }
        } else {
            //User wants to join a specific game
            if(idToGame.has(gameId)) {
                const gameToJoin = idToGame.get(gameId);
                if(gameToJoin.type == "PRIVATE") {
                    //Then we want to add the player to the game
                    joinGame(userId, gameToJoin);

                    socket.send(JSON.stringify({
                        type: "USER-JOINED",
                        gameState: gameToJoin.stateToObj()
                    }));
                } else {
                    console.log("GAME ISN'T PRIVATE");
                }
            }
        }
    } else {
        //USER is in a game 
        console.log("User is already in a game");
    }
}

async function handleUserCreateGame(socket, userId, language) {
    if(!userToGame.get(userId)) {
        const game = await Promise.resolve(createGame(language, true));

        joinGame(userId, game); //Joining user to the game

        socket.send(JSON.stringify({
            type: "GAME-CREATED",
            userId: userId,
            gameState: game.stateToObj()
        }));
    }
}


/**
 * searches waitingGames array to find a game to join 
 * @returns { GameState || Null } gameState object
 */
function searchForGame() {
    return new Promise((res, rej) => {
        if(waitingGames.length > 0) {
            for(let index in waitingGames) {
                if(waitingGames[index].type == "NORMAL") {
                    return res(waitingGames[index]); //Game was found
                } 
            }            

        } 
        return res(null); //If no games were found
    });
}

/**
 * Creates game StateObject 
 * @returns { GameState } gameState object
 */
async function createGame(language, privateGame) {
    return new Promise((res, rej) => {
        axios.get(DB_SERVICE+"/text?language="+language + "&difficulty=RANDOM").then((response) => {
            const data = response.data;
            const gameId = uuidv4();
            const newGame = new GameState(gameId, data.text);
            idToGame.set(gameId, newGame);
            waitingGames.push(newGame);

            if(privateGame) {
                newGame.type = "PRIVATE";
            }

            res(newGame);
        }).catch((err) => {
            console.log("ERROR");
            console.log(err);
            res(null);
        });
    });
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
        handleGameStart(usersGame, socket); 
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

    console.log(usersGame);
    
    //Checking if user is in game
    if(usersGame) {
        //Checking if gameState is "RUNNING"
        if(usersGame.gameState == "RUNNING") {
            //Now we want to check if the user has already finished
            console.log(usersGame.length);
            console.log(usersGame.playerStatus.get(userId));
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
                        gameFinished = false;
                        break;
                    }    
                }

                //Checking to see if the game is finished if so we need to clean up the game
                if(gameFinished) {
                    handleGameCleanUp(usersGame);
                }
            } else {
                console.log("USER HASN'T");
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


//Function for auto starting games
/**
 * Basic logic for the game auto started v1.0
 * 1- Check gameState for player count
 * 2- If play count is > (min player count) then -> start 15 second game count down
 * 3- send game start
 */
function gameAutoStarter(gameObj, socket) {
    if(gameObj.players.length > 1) {
        gameObj.setStartTimer(handleGameStart, socket); //Passing in callback function handleGameStart
    }
}


//Handles starting the game and sending game informaiton out to players
function handleGameStart(game, socket) {
    if(game.gameState != "RUNNING") {
        //FOR DEBUGGING PURPOSES
        if(game.gameState == "EMPTY") {
            //Game wasn't cleaned up correctly
            console.log("Game is EMPTY");
        }

        //set gameState to "RUNNING"
        game.gameState = "RUNNING";

        //Removing game from waiting games
        removeWaitingGame(game);

        //Send response "GAME-START"
        socket.send(JSON.stringify({
            type: "GAME-START",
            gameState: game.stateToObj() 
        }));    
    }
}