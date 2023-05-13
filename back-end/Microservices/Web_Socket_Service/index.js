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
const PATH = process.env.PATH;

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


//Handling Web Sockets
//Maps user Sockets -> UserId
const CLIENT_SOCKETS = new Map();

socketServer.on("connection", (socket) => {
    console.log("Client has connected");

    /**
     * All socket connections have to be handled inside this block
     * or you will not be able to identify what socket the message has
     * come from
     */
    socket.on("message", (buffer) => {
        console.log(buffer);
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
                        break;
                }
            } 
        } else {
            socket.send(JSON.stringify({
                type: "message",
                message: "Already authenticated"
            }));
        }
    });

});


socketServer.on("close", () => {

    console.log("Client has closed connection");
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
}

/**
 * removes are socket to userId map 
 * @param {socket} socket 
 */
function removeSocketFromMap(socket) {
    CLIENT_SOCKETS.delete(socket);
}