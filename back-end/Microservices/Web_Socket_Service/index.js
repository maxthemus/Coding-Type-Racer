/**
 *  Web Socket Service - Microservice
 * 
 *  ALL API end points start with /api/socket
 * 
 *  API end points:
 * 
 */

//Configuration File
require('dotenv').config();
const PORT = process.env.PORT;
const API_PATH = process.env.PATH;
const GAME_SERVICE = process.env.GAME_SERVICE;

//Express set up
const express = require("express");
const app = express();
app.use(express.json());

//Http server
const http = require("http");
const server = http.createServer(app);

//Web socket server
const WebSocket = require("ws");
const socketServer = new WebSocket.Server({ server });

//Starting server
server.listen(PORT, () => {
    console.log("Web Socket Service has started on PORT : " + PORT);
});

//Authentication key
const fs = require('fs');
const key = fs.readFileSync("../../Authentication/secret.key", "utf-8").trim();

//JSON web tokens
const jwt = require("jsonwebtoken");

//Web socket client for connection to GameService
const gameServiceSocket = new WebSocket(GAME_SERVICE);  
gameServiceSocket.on('error', console.error); //Printing out error if there is an error


//Handling Web Sockets
//Maps user Sockets -> UserId
const CLIENT_SOCKETS = new Map(); //socket -> ID
const ID_SOCKET = new Map(); //ID -> socket

socketServer.on("connection", (socket) => {
    console.log("Client has connected");

    /**
     * All socket connections have to be handled inside this block
     * or you will not be able to identify what socket the message has
     * come from
     */
    socket.on("message", (buffer) => {
        const message = JSON.parse(buffer); //HANDLE IF BODY IS NOT JSON WILL THROW ERROR AND RESULT IN CRASH
        console.log(message);

        //If the socket isn't in the map then it isn't authenticated
        if(!CLIENT_SOCKETS.has(socket)) {
            //Checking for message type
            //Drops message if no type
            if("type" in message)  {
                //If invalid type then just drop the packet
                switch(message.type) {
                    case "AUTH":
                        handleAuthenticationMessage(socket, message);
                        return;
                }
            } 
            socket.close(3000, JSON.stringify({
                type: "PAYLOAD",
                message: "Invalid Payload"
            })); 
        } else {
            //ELSE the socket is already authenticated
            console.log("Authenticated");

            //Checking if message is in payload
            if("type" in message) {
                //Checking message type
                switch (message.type) {
                    case "JOIN":
                        //Calling game join handler
                        if("gameId" in message) {
                            handleUserJoinGame(socket, CLIENT_SOCKETS.get(socket), message.gameId);
                            return;
                        } 
                        handleUserJoinGame(socket, CLIENT_SOCKETS.get(socket), null);
                        return;
                    case "LEAVE":
                        handleUserLeaveGame(socket, CLIENT_SOCKETS.get(socket));
                        return;
                    case "UPDATE":
                        handleUserUpdate(socket, CLIENT_SOCKETS.get(socket), message.userState);
                        return;
                    case "START":
                       handleGameStart(socket, CLIENT_SOCKETS.get(socket));
                       return;
                    case "FINISHED":
                        handleGameFinshed(socket, CLIENT_SOCKETS.get(socket));
                        return;
                    case "CREATE":
                        handleCreateGame(socket, CLIENT_SOCKETS.get(socket), message.language);
                        return
                }
            }
            socket.send(JSON.stringify({
                type: "PAYLOAD",
                message: "Invalid Payload"
            }));
        }
    });


    socket.on("close", () => {
        console.log("Client connection has closed");
        //We also want to send leaving message to server as losing conneciton is same as leaving game
        handleUserLeaveGame(socket, CLIENT_SOCKETS.get(socket));

        removeSocketFromMap(socket);
    });
});





//FUNCTIONS
function handleAuthenticationMessage(socket, message) {
    if("token" in message) {
        let authenticated = authenticateSocket(socket, message.token);

        if(!authenticated) {
            //Closing socket due to auth
            socket.close(3001, JSON.stringify({
                type: "AUTH",
                message: "Authentication failed"
            })); 
        } else {
            socket.send(JSON.stringify({
                type: "AUTH",
                authenticated: true
            }));
            console.log("Socket Authenticated : UserId = " + CLIENT_SOCKETS.get(socket));
        }
    } 
}

/**
 * Uses JWT to authenticate socket 
 * @param {socket} socket 
 * @param {jwt} token 
 */
function authenticateSocket(socket, token) {
    console.log("Authenticating token");
    let authenticated = false;

    try {
        const decoded = jwt.verify(token, key);
        console.log("Valid AUTH");
        console.log(decoded);
        //and we want to add socket to map
        if("userId" in decoded) {
            addSocketToMap(socket, decoded.userId);
            authenticated = true;
        }
    } catch(error) {
        console.log("Invalid token");
    }
    return authenticated;
} 

/**
 * maps socket to userId 
 * @param {socket} socket 
 * @param {uuid as String} userId 
 */
function addSocketToMap(socket, userId) {
    CLIENT_SOCKETS.set(socket, userId);
    ID_SOCKET.set(userId, socket);
}

/**
 * removes are socket to userId map 
 * @param {socket} socket 
 */
function removeSocketFromMap(socket) {
    const userId = CLIENT_SOCKETS.get(socket);

    CLIENT_SOCKETS.delete(socket);
    ID_SOCKET.delete(userId);
}

/**
 * Forwards "JOIN" to game serivce to join user to game
 * @param { Socket } socket 
 * @param { userId as String } userId 
 */
function handleUserJoinGame(socket, userId, gameId) {
    console.log("Join join game");

    //Checking to see if connection to game service is open
    if(gameServiceSocket.readyState == WebSocket.OPEN) {
        if(gameId == null) {
            const message = JSON.stringify({
                type: "JOIN",
                userId: userId,
            });
            gameServiceSocket.send(message);
        } else {
            const message = JSON.stringify({
                type: "JOIN",
                userId: userId,
                gameId: gameId
            }); 
            gameServiceSocket.send(message);
        }
    } else {
        const message = JSON.stringify({
            type: "ERROR",
            message: "Internal server error"
        });

        socket.send(socket);
    }
}

function handleCreateGame(socket, userId, language) {
    console.log("User creating game");

    if(gameServiceSocket.readyState == WebSocket.OPEN) {
        gameServiceSocket.send(JSON.stringify({
            type: "CREATE",
            userId: userId,
            language: language
        }));
    }
}


//Handling client socket connected to the GAME_SERVICE
gameServiceSocket.on("message", (data) => {
    const message = JSON.parse(data);
    console.log(message);
    console.log(message.type);

    //Getting type of message 
    if("type" in message) {
        switch(message.type) {
            case "USER-JOINED":
                console.log("User has joined Game");
                joinGameResponse(message.gameState);
                return;
            case "USER-LEAVE":
                leaveGameResponse(message.userId);
                return;
            case "GAME-UPDATE":
                updateGameResponse(message.gameState);
                return;
            case "GAME-START":
                startGameResponse(message.gameState);
                return;
            case "USER-FINISHED":
                finishedGameResponse(message.userId, message.placement, message.gameState);
                return;
            case "GAME-CREATED":
                gameCreatedResponse(message.userId, message.gameState);
                console.log("HERE");
                return;
        }
    }
});



//Functions for sending responses to clients for the game service
/**
 * Sends response back to client with updated game state with new player 
 * @param { GameState as object } gameState 
 */
function joinGameResponse(gameState) {
    console.log(gameState);
    
    if("players" in gameState) {
        broadCastObject(gameState.players, gameState, "USER-JOIN");
    }    
}


//Function to send an object to all users in an array of userId
/**
 * Sends object to specified users 
 * @param { Array of userId } users 
 * @param { Object } objectToSend 
 * @param { String } type
 */
function broadCastObject(users, objectToSend, type) {
    //Checking type of users
    if(Array.isArray(users)) {
        for(let index in users) {
            if(ID_SOCKET.has(users[index])) {
                const userSocket = ID_SOCKET.get(users[index]);

                const message = JSON.stringify({
                    type: type,
                    gameState: objectToSend
                });

                userSocket.send(message);
            }
        } 
    } 
}


//Handles user leaving the game
/**
 * Forward leave message to game service 
 * @param { socket} socket 
 * @param { userId as String } userId 
 */
function handleUserLeaveGame(socket, userId) {
    if(gameServiceSocket.readyState == WebSocket.OPEN) {
        const message = JSON.stringify({
            type: "LEAVE",
            userId: userId
        });

        gameServiceSocket.send(message);
    }
}


//Function for sending a leaving game response
function leaveGameResponse(userId) {
    if(ID_SOCKET.has(userId)) {
        const socket = ID_SOCKET.get(userId);
        socket.send(JSON.stringify({
            type:"USER-LEAVE",
            message: "You have left the game!"
        }));
    }
}

//Function for sending an update response to users in game
function updateGameResponse(gameState) {
    if("players" in gameState) {
        broadCastObject(gameState.players, gameState, "GAME-UPDATE");
    } 
}

//Handles user update request
function handleUserUpdate(socket, userId, userState) {
    console.log("Updating the users state");
    if(gameServiceSocket.readyState == WebSocket.OPEN) {
        const message = JSON.stringify({
            type: "UPDATE",
            userId: userId,
            userStatus: userState
        });

        gameServiceSocket.send(message);
    }
}

//Handles user starting the game
function handleGameStart(socket, userId) {
    console.log("Starting game");
    if(gameServiceSocket.readyState == WebSocket.OPEN) {
        const message = JSON.stringify({
            type: "START",
            userId: userId
        });

        gameServiceSocket.send(message);
    }
}

function startGameResponse(gameState) {
    if("players" in gameState) {
        broadCastObject(gameState.players, gameState, "GAME-START");
    }
} 

function handleGameFinshed(socket, userId) {
    console.log("Game Finished");
    if(gameServiceSocket.readyState == WebSocket.OPEN) {
        const message = JSON.stringify({
            type: "FINISHED",
            userId: userId
        });

        gameServiceSocket.send(message);
    }
}

function finishedGameResponse(userId, placement, gameState) {
    if(ID_SOCKET.has(userId)) {
        console.log("SENDING RES");
        const socket = ID_SOCKET.get(userId);

        const finishedObj = {
            userId: userId,
            placement: placement
        } 

        if("players" in gameState) {
            broadCastObject(gameState.players, finishedObj, "USER-FINISHED");
        }
    }
}

function gameCreatedResponse(userId, gameState) {
    if(ID_SOCKET.has(userId)) {
        console.log("Sending resonse");
        const socket = ID_SOCKET.get(userId);

        socket.send(JSON.stringify({
            type: "GAME-CREATED",
            gameState: gameState
        }));
    }
}