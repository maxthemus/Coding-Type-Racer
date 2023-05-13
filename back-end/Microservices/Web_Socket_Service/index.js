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
})

socketServer.on("open", () => {
    console.log("Client has connected");
});

socketServer.on("close", () => {
    console.log("Client has closed connection");
});