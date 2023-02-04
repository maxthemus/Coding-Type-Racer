//Variables
let inGame = false; //Variable to keep if user is in game or not
let text = ""; //Holds text user is typing in game
let textArray = []; //Holds the individual characters for the text in Array

//Functions
/**
Funtion getText() will send an API request to the backend to recieve a random snippet of code for the game
*/
function getText() {
    //Fetch is used to send API requests
    fetch('http://localhost:4000/api/v1/text').then((payload) => { 
        return payload.json(); //Takes what is sent back and packages it into JSON
    }).then((data) => { //the parameter is data is the JSON 
        text = data.text;
        textArray = text.split("");

        addTextToScreen();

        inGame = true;
    }).catch((err) => {
        //ERROR handling
        console.log(err);
        alert("Something Went Wrong on FETCH REQUEST");
    });
}

function addTextToScreen() {
    for(let i = 0; i < textArray.length; i++) {
        if(inGame) { //If the element exists remove the old one
            let removeElement = document.getElementById("texts");
            removeElement.remove();
        }

        let tempElement = document.createElement("p");
        let textNode = document.createTextNode(textArray[i]);
        tempElement.setAttribute("id", "texts");
        tempElement.appendChild(textNode);

        

        let element = document.getElementById("text__sec");
        element.appendChild(tempElement);

        
    }
}
