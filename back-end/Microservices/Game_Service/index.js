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
    });


    socket.on("close", () => {
        //GOTS TO CLEAN UP ALL THE GAMES
        console.log("Connection has been closed");
    });
})
