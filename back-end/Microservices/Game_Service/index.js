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
import {GameState} from "./GameStateClass.js";

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


//Handling Web Sockets
socketServer.on("connection", (socket) => {
    console.log("Service opened connection");

    socket.on("message", (buffer) => {
        const message = JSON.parse(buffer);
        console.log(message);
        
        if("type" in message) {
            switch(message.type) {
                case "JOIN":

                    break;
            }
        }

    });


    socket.on("close", () => {
        //GOTS TO CLEAN UP ALL THE GAMES
        console.log("Connection has been closed");
    });
})



//Handling JOIN game
function joinUserToGame() {
    //First we have to find a game that is in the WAITING state
    //IF free WAITING >> join
    //ELSE >> create game >> and join user to game
}