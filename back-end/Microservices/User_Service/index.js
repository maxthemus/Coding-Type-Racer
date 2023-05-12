/**
 * 
 * 
 */
const PORT = 3051;

const express = require("express");


const app = express(); //Creating the app 


//Starting the server!
app.listen(PORT, () => {
    console.log("Starting User Service on PORT : " + PORT);
});
