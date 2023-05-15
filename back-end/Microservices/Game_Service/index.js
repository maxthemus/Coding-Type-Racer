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
                    if("userId" in message) {
                        //Checking if user is already in a game
                        let userInGame = userToGameMap.has(message.userId);
                        if(userInGame) {
                            socket.send(JSON.stringify({
                                type: "FAIL-JOIN",
                                message: "Already in game"
                            }));
                            return;
                        }
                        
                        //Finding game to join
                        const gameToJoin = findGameForUser(message.userId);

                        if(!gameToJoin) { //Checking if gameObject was found
                            console.log("Error Finding Game");
                            return;
                        } 

                        let joined = joinUserToGame(message.userId, gameToJoin);
                        userToGameMap.set(message.userId, gameToJoin);                        

                        //We want to send response saying joined game
                        //And then we want to update all users in game that user has joined Game
                        if(!joined) {
                            console.log("Error joining user to game");
                            return;
                        }


                        socket.send(JSON.stringify({
                            type: "JOINED-GAME",
                            userId: message.userId,
                            gameState: gameToJoin.stateToObj()
                        }));


                        //Sending update to game state to users
                        socket.send(JSON.stringify({
                            type: "UPDATE-GAME",
                            gameState: gameToJoin.stateToObj()
                        }));
                    } else {
                        //Handling invalid payload
                        console.log("Invalid payload");
                    }
                    break;
                case "LEAVE":
                    if("userId" in message) {
                        if(userToGameMap.has(message.userId)) {
                            //Removing users from in game
                            //MIGHT NOT HAVE TO DO THIS DEPENDS HOW LEAVE IS HANDLED ON FRONT END
                            if(disconectUserFromGame(message.userId)) {
                                console.log("Player removed from game");


                                socket.send(JSON.stringify({
                                    type: "LEAVE-GAME",
                                    message: "Left game" 
                                }));
                            } else {
                                socket.send(JSON.stringify({
                                    type: "LEAVE-GAME",
                                    message: "Left game but didn't exist"
                                }));
                            }

                            //getting the users game
                            const game = userToGameMap.get(message.userId);

                            userToGameMap.delete(message.userId);
                            destoryGame(game.id); 


                            console.log(waitingGames);
                        } else {
                            socket.send(JSON.stringify({
                                type: "LEAVE-GAME",
                                message: "User was not mapped to game"
                            })); 
                        }
                    } else {
                        console.log("Invalid payload");
                    }
                    break;
                case "START":
                    let started = startGame(message.gameId);
                    
                    if(started) {
                        const gameState = runningGames.get(message.gameId);
                        socket.send(JSON.stringify({
                            type: "START-GAME",
                            started: true,
                            timeToStart: 10,
                            gameState: gameState.stateToObj 
                        }));
                    }                    
                    break;
                case "FINISHED":
                    //Update game state with players finished                    
                    let usersGame = userToGameMap.get(message.userId);
                    if(usersGame) {
                        let usersPlacement = usersGame.playerFinished();
                    }
                    
                    socket.send(JSON.stringify({
                        type: "USER-FINISHED",
                        gameState: usersGame.stateToObj()
                    }));

                    //Last player to finish must clean up the gameState 
                    //Uses user id to clean
                    cleanUpUser(message.userId);
                    
                    //Printing out stuff for debuggin purposes
                    console.log(userToGameMap);
                    console.log(waitingGames);
                    console.log(runningGames);
                    break;
                case "DISCONNECTED":
                    cleanUpUser(message.userId);
                    //User has disconnected CLEAN UP user data
                    //Uses user id to clean
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

function joinUserToGame(userId, gameState) {
    return gameState.addPlayer(userId);
}

function disconectUserFromGame(userId) {
    let usersGame = userToGameMap.get(userId);
    return usersGame.removePlayer(userId);
} 


/**
 * Creates a GameStateObject 
 * @returns a GameStateObject
 */
function createGame() {
    let gameId = uuidv4();//Creating game UUID
    const gameState = new GameState(gameId, "this is a test text for building the game service");
    waitingGames.set(gameId, gameState); //Adding game to waiting
    return gameState;
} 

function destoryGame(gameId) {
    //Checks if game has users 
    let game = waitingGames.get(gameId);
    if(game) {
        if (game.players.length == 0) {
            waitingGames.delete(gameId);
            return;
        }
    }
    game = runningGames.get(gameId);
    if(game)  {
        if (game.players.length == 0) {
            runningGames.delete(gameId);
            return;
        }
    }
}

function startGame(gameId) {
    //When game is started we want to move the game from waiting to running
    //When in running we want to produce a start time
    console.log("Starting Game");

    if(waitingGames.has(gameId)) {
        let gameState = waitingGames.get(gameId);
        waitingGames.delete(gameId);

        runningGames.set(gameId, gameState);
        return true;
    }
    return false;
}


function cleanUpUser(userId) {
    let usersGame = userToGameMap.get(userId);

    if(usersGame) {
        const gameId = usersGame.id;
        disconectUserFromGame(userId);
        if(usersGame.players.length === 0) {
            destoryGame(gameId);
            waitingGames.delete(gameId);
            runningGames.delete(gameId);
        }
    }
}


