/**
 *  Database - Microservce
 */
//Configuration file
require("dotenv").config();
const PORT = process.env.PORT;
const PATH = process.env.API_PATH;

//Express set up
const express = require("express");
const app = express();

//Setting up cors
const cors = require("cors");

app.use(express.json());
app.use(cors());


//Connecting to database
const mysql = require("mysql");
let dbCon = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB
});

dbCon.connect((err) => {
    if(err) {
        console.log("error");
        console.log(err);
    } else {
        console.log("Connected to Database");
    }
});

//API END POINTS
app.post(PATH+"/add/user", (req, res) => {
    console.log(req.body);
    //Checking payload for all information for creating user
    if("userId" in req.body && "username" in req.body && "password" in req.body && "email" in req.body) {
        const payload = req.body;
        const sqlQuery = `INSERT INTO temp_users (userId, username, password, email) VALUES ('${payload.userId}', '${payload.username}', '${payload.password}', '${payload.email}')`;
        dbCon.query(sqlQuery, (err, result) => {
            if(err) {
                console.log(err);
                res.send({
                    type: "ERROR",
                    message: "Error inserting into db"
                });
            } else {
                console.log(result);
                res.send({
                    type: "USER-CREATED" 
                });
            }
        });
    } else {
        res.send({
            type:"PAYLOAD",
            message: "Invalid payload"
        });
    }
});

//End point is for checking if username is taken
app.post(PATH+"/check/username", (req, res) => {
    console.log(req.body);
    if("username" in req.body) {
        //Querying users
        let sqlQuery = `SELECT * FROM temp_users WHERE username="${req.body.username}"`;
        dbCon.query(sqlQuery, (err, result) => {
            if(err) {
                console.log(err);
                res.send({
                    type: "ERROR",
                });
            } else {
                if(result.length > 1) {
                    res.send({
                        usernameTaken: true
                    });
                    return;
                }
            }
        });

        sqlQuery = `SELECT * FROM users WHERE username="${req.body.username}"`;
        dbCon.query(sqlQuery, (err, result) => {
            if(err) {
                res.send({
                    type: "ERROR"
                });
            } else {
                if(result.length > 1) {
                    res.send({
                        usernameTaken: true
                    });
                    return;
                }
            }
        });

        //Username isn't taken
        res.send({
            usernameTaken: false
        });
    } else {
        res.send({
            type: "PAYLOAD",
            message: "Invalid payload"
        });
    }
});

//End point is for checking if email is taken
app.post(PATH+"/check/email", (req, res) => {
    console.log(req.body);
    if("email" in req.body) {
        //Querying users
        let sqlQuery = `SELECT * FROM temp_users WHERE email="${req.body.email}"`;
        dbCon.query(sqlQuery, (err, result) => {
            if(err) {
                console.log(err);
                res.send({
                    type: "ERROR",
                });
            } else {
                if(result.length > 1) {
                    res.send({
                        emailTaken: true
                    });
                    return;
                }
            }
        });

        sqlQuery = `SELECT * FROM users WHERE email="${req.body.email}"`;
        dbCon.query(sqlQuery, (err, result) => {
            if(err) {
                res.send({
                    type: "ERROR"
                });
            } else {
                if(result.length > 1) {
                    res.send({
                        emailTaken: true
                    });
                    return
                }
            }
        });

        //Email is not taken
        res.send({
            emailTaken: false
        });
    } else {
        res.send({
            type: "PAYLOAD",
            message:"Invalid Payload"
        });
    }
});

//End point for is for getting users password
app.post(PATH+"/user/password", (req, res) => {
    console.log(req.body);
    if("username" in req.body) {
        const sqlQuery = `SELECT password, userId FROM users WHERE username='${req.body.username}'`;
        dbCon.query(sqlQuery, (err, result) => {
            if(err) {
                console.log(err);
                res.send({
                    type: "ERROR",
                    message: "ERROR with db"
                });
            } else {
                console.log(result);
                if(result.length >= 1) {
                    console.log(result);
                    res.send({
                        validUser: true,
                        password: result[0].password,
                        userId: result[0].userId
                    });
                } else {
                    res.send({
                        validUser: false
                    });
                }
            }
        });
    } else {
        res.send({
            type: "PAYLOAD",
            message: "Invalid payload"
        });
    }
});

//End point for grabbing username 
app.post(PATH+"/user/username", (req, res) => {
    if("userId" in req.body) {
        const sqlQuery = `SELECT username FROM users WHERE userId='${req.body.userId}'`;
        dbCon.query(sqlQuery, (err, result) => {
            if(err) {
                res.send({
                    type: "INVALID-USER"
                });
            } else {
                if(result.length >= 1) {
                    res.send({
                        type: "VALID-USER",
                        username: result[0].username
                    });
                } else {
                    res.send({
                        type: "INVALID-USER"
                    });
                }
            }
        });
        
    } else {
        res.send({
            type: "PAYLOAD"
        });
    }
});

//This end point is for validating a user account 
//EG moving it from temp_users -> users
app.get(PATH+"/user/validate", (req, res) => {
    const userEmail = req.query.email;
    if(!userEmail) {
        res.send({
            type: "PAYLOAD",
            message: "Invalid payload"
        });
        return;
    }    

    //First we get the information of the user account
    const selectQuery = `SELECT * FROM temp_users WHERE email='${userEmail}'`;
    const selectDelete = new Promise((resolve, rej) => {
        dbCon.query(selectQuery, (err, result) => {
            if(err) {
                rej(res);
                return;
            } else {
                if(result.length >= 1) {
                    //Inserting into users db
                    const userInfo = result[0];
                    const insertQuery = `INSERT INTO users (userId, username, password, email) VALUES ('${userInfo.userId}', '${userInfo.username}', '${userInfo.password}', '${userInfo.email}')`;
                    dbCon.query(insertQuery, (err, result) => {
                        if (err) {
                            rej(res);
                            return;
                        } else {
                            resolve();
                        }
                    });
                } else {
                    rej(res);
                    return;
                }
            }
        });
    }).then(() => {
        const deleteQuery = `DELETE FROM temp_users WHERE email='${userEmail}'`;
        dbCon.query(deleteQuery, (err, result) => {
            if(err) {
                res.send().status(404); //SEND ERROR FIX THIS
                return;
            } 
            res.send({
                validated: true,
            });
        });
    }).catch((res) => {
        res.send({
            type: "ERROR"
        });
    }); 
});

//End point is for grabbing a random text from a random language
app.get(PATH+"/text/random", (req,res) => {
    const sqlQuery = `SELECT * FROM game_text ORDER BY RAND() LIMIT 1`;
    dbCon.query(sqlQuery, (err, result) => {
        if(err) {
            res.send({
                type: "ERROR",
                message: "Error with DB"
            });
        } else {
            
            //MIGHT NEED TO REMOVE ESCAPE CHARACTERS FROM TEXT

            res.send(result[0]);
        }
    });
});

//Starting server
app.listen(PORT, () => {
    console.log("Database service started on : " + PORT);
});