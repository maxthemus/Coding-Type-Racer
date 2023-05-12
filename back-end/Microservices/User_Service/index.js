/**
 *  User service - Microservice 
 * 
 *  All API end points start with /api/user
 * 
 *  API end points:
 *  - GET - /
 * 
 */
const PORT = 3051;
const PATH = "/api/user";

//Express set up
const express = require("express");
const app = express(); //Creating the app 
app.use(express.json());

//Authentication key
const fs = require('fs');
const key = fs.readFileSync("../../Authentication/secret.key", "utf-8").trim();

//JSON web tokens
const jwt = require("jsonwebtoken");



//#TEMP VARIABLES TO REPLICATE DB
let TEMP_USER_DB = [{
    userId: "4b9e2dc4-19d4-4b18-85ee-14a2a356be0b",
    username: "admin",
    password: "password"
}];


//#TEMP VARIABLES END


/**
 * Login logic:
 * - Parse body to check for a username and as password
 * - Get username and query database users with username
 * - IF - (username exists) 
 *      THEN - Compare PASSWORDS - res results
 *      ELSE - res false 
 */
app.post(PATH+"/login", (req, res) => {
    //Parsing body for username and password
    if(req.body != undefined) {
        if("username" in req.body && "password" in req.body) {
            //VALID PAYLOAD handle request
            let validUser = validateUser(req.body.username, req.body.password);

            if(validUser != null) {
                //VALID USER create authentication JWT token
                const token = jwt.sign({userId: validUser.userId}, key);

                res.status(200).send({
                    loggedIn: true,
                    token: token
                });
            } else {
                res.status(401).send({
                    loggedIn: false,
                    error: "Invalid Credentials"
                });
            }
            return;
        }
    } 

    //Error occur so we send back a invalid payload
    res.status(400).send({
        loggedIn: false,
        error: "Invalid payload",
    });
});


//Starting the server!
app.listen(PORT, () => {
    console.log("Starting User Service on PORT : " + PORT);
});




//FUNCTION


/**
 * Checks users cridentails using the databse service 
 * @param {string} username username of user
 * @param {string} password password of user
 */
function validateUser(username, password) {
    for(let index in TEMP_USER_DB) {
        let user = TEMP_USER_DB[index];

        if(user.username == username) {
            if(user.password == password) {
               return user; //Valid user 
            }
        }
    }
    
    return null; //Invalid user
}