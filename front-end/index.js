//Variables
let inGame = false;
let text = "";
let textArray = [];

//Functions
function getText() {
    fetch('http://localhost:4000/api/v1/text').then((payload) => {
        return payload.json();
    }).then((data) => {
        inGame = true; //Setting that we are in the gameA
        text = data.text;
        textArray = text.split("");

        addTextToScreen();
    }).catch((err) => {
        console.log(err);
        alert("Something Went Wrong on FETCH REQUEST");
    });
}

function addTextToScreen() {
    for(let i = 0; i < textArray.length; i++) {
        let tempElement = document.createElement("p");
        let textNode = document.createTextNode(textArray[i]);
        tempElement.appendChild(textNode);

        let element = document.getElementById("text__sec");
        element.appendChild(tempElement);
    }
}