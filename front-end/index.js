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
    document.getElementById("text__tag").innerHTML = ""; //Reseting the text to nothing
    
    for(let i = 0; i < textArray.length; i++) {
        let tempElement = document.createElement("span");
        tempElement.innerText = textArray[i];
        tempElement.classList.add('incorrect');
        tempElement.setAttribute("id", "texts");

        let textTag = document.getElementById('text__tag');
        textTag.appendChild(tempElement);
    }
}

const inputField = document.getElementById('quoteInput')
inputField.addEventListener('input', () => {
    const spanArray = document.querySelectorAll("span");
    console.log("even handler");

    for(let i = 0; i < textArray.length; i++) {
        if(inputField.value.charAt(i) === textArray[i]) {
            //Correct
            spanArray[i].classList.remove("incorrect");
            spanArray[i].classList.remove("normal");
            spanArray[i].classList.add("correct");
        } else {
            //Incorrect
            spanArray[i].classList.remove("correct");
            spanArray[i].classList.remove("normal");
            spanArray[i].classList.add("incorrect");
        }
    }
});
