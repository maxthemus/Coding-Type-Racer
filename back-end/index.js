//RUN TIME VARS
let PORT = 4000;
let BASE_PATH = "/api/v1";

//VARIABLES 
//Temp array to hold texts 
const texts = [
    "print(\"Hello World!\");",
    "System.out.println(\"Hello World!\");",
    "console.log(\"Hello World!\");"
];

//IMPORTS 
const express = require('express');
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

//END POINTS
app.get(`${BASE_PATH}/text`, (req, res) => {
    console.log("got REQ");
    let text = texts[Math.floor(Math.random() * texts.length)];
    res.send({
        text: text
    });
});


app.listen(PORT, () => {
    console.log("Backend starting on PORT == " + PORT);
})