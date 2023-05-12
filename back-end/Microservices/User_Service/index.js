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

//UUID v4 for userId
const uuid = require("uuid");



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
        error: "Invalid Payload",
    });
});



/**
 * END POINT for signing up users
 * Logic for signup:
 * - validate payload   
 * - Validate password
 * - IF [username is NOT taken]
 *      THEN create user
 *      ELSE create response with failed user creation and "Password doesn't meet requirements"
 *   ELSE send response saying "username taken"
 */
app.post(PATH+"/signup", (req, res) => {
    if(req.body != undefined) {
        let validPayload = validateSignUpPayload(req.body);
        
        if(validPayload) {
            let validPassword = validatePassword(req.body.password);

            if(validPassword) {
                let usernameTaken = checkUsernameTaken(req.body.username);

                if(!usernameTaken) {
                    let userCreated = signUpUser(req.body);

                    if(userCreated) {
                        res.status(200).send({
                            signedUp: true
                        });
                        return;
                    }
                    res.status(500).send({
                        userCreated: false,
                        validPassword: true,
                        usernameTaken: true,
                        error: "Error creating user"
                    });
                    return;                
                }

                res.status(409).send({
                    signedUp: false,
                    validPassword: true,
                    usernameTaken: true,
                    error: "Username is taken" 
                });
                return;
            }
            res.status(400).send({
                signedUp: false,
                validPassword: false,
                error: "Invalid Password"
            });
        }
    } 
    
    //Error occur so we send back a invalid payload error message
    res.status(400).send({
        signedUp: false,
        error:"Invalid Payload"
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

/**
 * Validates user sign up JSON payload object 
 * @param {Object} payload 
 * @returns valid Payload 
 */
function validateSignUpPayload(payload) {
    if("username" in payload && "password" in payload && "email" in payload) {
        return true;
    }
    return false;
}


/** NEEDS IMPLEMENTING
 * Validate password based on password requirements 
 * @param {String} password 
 * @returns boolean  
 */
function validatePassword(password) {
    return true;
}

/**
 * Checks if user already has username
 * @param {String} username
 * @returns boolean based on if username exists
 */
function checkUsernameTaken(username) {
    for(let index in TEMP_USER_DB) {
        if(TEMP_USER_DB[index].username == username) {
            return true; //Username taken
        }
    }

    return false; //Username NOT taken 
}

/** NEEDS IMPLEMENT
 * Quries database service and adds user 
 * @param {Object} user 
 * @returns boolean
 */
function signUpUser(user) {
    const id = uuid.v4(); //Generate UUID

    const userObj = {
        userID: id,
        username: user.username,
        password: user.password,
        email: user.email
    }
    TEMP_USER_DB.push(userObj);

    return true;
}