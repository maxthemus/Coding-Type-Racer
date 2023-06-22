/**
 *  User service - Microservice 
 * 
 *  All API end points start with /api/user
 * 
 *  API end points:
 *  - POST - /login
 *  - POST - /signup
 * 
 */
//Configuration File
require('dotenv').config();
const PORT = process.env.PORT;
const PATH = process.env.API_PATH;
const EMAIL = process.env.EMAIL;
const PASS = process.env.PASS;
const DB_SERVICE = process.env.DB_SERVICE;

//Setting up cors
const cors = require("cors");

//Express set up
const express = require("express");
const app = express(); //Creating the app 

app.use(cors());
app.use(express.json());


//Authentication key
const fs = require('fs');
const key = fs.readFileSync("../../Authentication/secret.key", "utf-8").trim();

//Verification Key
const verKey = fs.readFileSync("../../Authentication/secret_one.key", "utf-8").trim();

//JSON web tokens
const jwt = require("jsonwebtoken");

//UUID v4 for userId
const uuid = require("uuid");

//node mailer set up
const nodemailer = require("nodemailer");

//Setting up bycrypt
const bcrypt = require("bcrypt");

//Setting up axios for http requests
const axios = require("axios");
const { resolve } = require('path');

//#TEMP VARIABLES TO REPLICATE DB
let TEMP_USER_DB = [{
    userId: "4b9e2dc4-19d4-4b18-85ee-14a2a356be0b",
    username: "admin",
    password: "password"
}, {
    userId: "4b9e2dc4-19d4-4b18-85ee-14a2a356be0f",
    username: "test",
    password: "test"
}];

let INVALID_USER_DB = [

];


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
    console.log(req.body);
    //Parsing body for username and password
    if(req.body != undefined) {
        if("username" in req.body && "password" in req.body) {
            //VALID PAYLOAD handle request
            let validUserId = validateUser(req.body.username, req.body.password);

            if(validUserId != null) {
                //VALID USER create authentication JWT token
                const token = jwt.sign({userId: validUserId}, key);

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
                let emailTaken = checkEmailTaken(req.body.email);

                if(!usernameTaken && !emailTaken) {
                    let userCreated = signUpUser(req.body);

                    if(userCreated) {
                        const email = req.body.email;

                        //Creating verification token
                        const verificationToken = jwt.sign({email:email}, verKey,{expiresIn: '1d'})

                        sendVerificationEmail(req.body.email, verificationToken);                        

                        res.status(200).send({
                            signedUp: true,
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
                    usernameTaken: usernameTaken,
                    emailTaken: emailTaken, 
                    error: "Information is taken" 
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


//User Signup Verification signup
app.get(PATH+"/email/verification", (req, res) => {
    const token = req.query.token;
    //Verifiying token
    try {
        jwt.verify(token, verKey, (err,decoded) => {
            if(err) {
                throw new Error();
            }
            res.redirect("http://localhost/code-racer/front-end/index.html");
            axios.get(DB_SERVICE+"/user/validate?email="+decoded.email); 
        });
    } catch(err) {
        console.log("error");
        res.redirect("http://localhost/code-racer/front-end/error.html");
    }
});

//Get username information 
app.get(PATH+"/info/username", (req, res) => {
    const userId = req.query.id;
    console.log(userId);
    let username = "";
    
    for(let index in TEMP_USER_DB) {
        if(TEMP_USER_DB[index].userId == userId) {
            username = TEMP_USER_DB[index].username;
            break;
        }    
    }
    res.send({
        username: username        
    });
});


//Starting the server!
app.listen(PORT, () => {
    console.log("Starting User Service on PORT : " + PORT);
});




//FUNCTIONS
/**
 * Checks users cridentails using the databse service 
 * @param {string} username username of user
 * @param {string} password password of user
 */
function validateUser(username, password) {
    /*
    for(let index in TEMP_USER_DB) {
        let user = TEMP_USER_DB[index];

        if(user.username == username) {
            if(user.password == password) {
               return user; //Valid user 
            }
        }
    }
    */
    return new Promise((resolve) => {
        axios.post(DB_SERVICE+"/user/password", {username: username}).then(async(res) => {
            if("validUser" in res.data) {
                if(res.data.validUser) {
                    console.log("HERE");
                    //We are going to user bcrypt to verify the password
                    const valid = await bcrypt.compare(password, res.data.password); 
                    if(valid) {
                        console.log(valid);
                        return resolve(res.data.userId); //ID
                    }
                }
            }
        });
    });
    return resolve(null);
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
    const regexPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,16}$/
    return regexPattern.test(password);
}

/**
 * Checks if user already has username
 * @param {String} username
 * @returns boolean based on if username exists
 */
function checkUsernameTaken(username) {
    /* OLD VERSION
    for(let index in TEMP_USER_DB) {
        if(TEMP_USER_DB[index].username == username) {
            return true; //Username taken
        }
    }

    for(let index in INVALID_USER_DB) {
        if(INVALID_USER_DB[index].username == username) {
            return true;
        }
    }
    */
    axios.post(DB_SERVICE+"/check/username", {username: username}).then((res) => {
        console.log("CHECKING USERNAME");
        console.log(res.data);
        if("usernameTaken" in res.data) {
            return res.data.usernameTaken;
        } else {
            return true;
        }
    }).catch(() => {
        return true;
    });
}

/** NEEDS IMPLEMENT
 * Quries database service and adds user 
 * @param {Object} user 
 * @returns boolean
 */
async function signUpUser(user) {
    const id = uuid.v4(); //Generate UUID
    const hashedPassword = await hashPassword(user.password); //Waiting for password to be hashed

    //Checking if hash failed
    if(!hashPassword) {
        return false;
    } else {
        const userObj = {
            userId: id,
            username: user.username,
            password: hashedPassword,
            email: user.email
        }
        //TEMP_USER_DB.push(userObj);
        INVALID_USER_DB.push(userObj);

        //Sending POST request to insert into temp users
        axios.post(DB_SERVICE+"/add/user", userObj).then((res) => {
            console.log(res.data);
            if("type" in res.data) {
                if(res.data.type == "USER-CREATED") {
                    return true;
                }
            }
        }).catch((err) => {
            console.log(err.message);
            return false;
        });
    
        return false;//Invalid response package
    }
}

//Checks if the email is already taken
function checkEmailTaken(email) {
    //Sending POST request to db to check for email is taken
    axios.post(DB_SERVICE+"/check/email", {email: email}).then(() => {
        if("emailTaken" in res.data) {
            return res.emailTaken;
        }
        return true; //Else email is taken
    }).catch((err) => {
        return true;  
    });
}


//Send verification emil to user
async function sendVerificationEmail(email, token) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: "codingracer@gmail.com",
            pass:"hnnhzydvneleyfbo"
        }

    });

    const mailOptions = {
        to: email,
        subject: 'Coding Racer Email Verificaiton',
        html: `<h3>Testing</h3><p>Click this link to verify this account: <a href="http://127.0.0.1:3051/api/user/email/verification?token=${token}">Link</a></p>`
    }; 

    try {
        const info = await transporter.sendMail(mailOptions);
    } catch(err) {
        console.log(err);
        console.log("Error sending email");
    }
}

//Function to hash the password
function hashPassword(password) {
    return new Promise((res, rej) => {
        bcrypt.hash(password, 5, (err, hash) => {
            if(err) {
                rej(false);
            } else {
                res(hash);
            }
        });
    });
}