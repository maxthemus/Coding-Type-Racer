//Services
const DB_SERVICE = "http://127.0.0.1:3054/api/data";

//Pages
const HOME_PAGE = "./index.html";
const LOGIN_PAGE = "./login.html";
const SIGNUP_PAGE = "./signup.html";

//Game setting variables
let language = "RANDOM";
let difficult = "RANDOM";


//User state variables
let loggedIn = false; //By default user isn't logged in

window.addEventListener("load", () => {
    showMenu();
}); //Load event


//Functions for changing screens within the page
function showMenu() {
    document.getElementById("menu").style.display = "flex";
    
    //Selector event handlers
    document.getElementById("language-select").addEventListener("change", updateLangauge);
    document.getElementById("difficulty-select").addEventListener("change", updateDifficulty);

    //Attaching event listener to the player button
    document.getElementById("play-button").addEventListener("click", playGame);
}

function removeMenu() {
    document.getElementById("menu").style.display = "none";

    document.getElementById("language-select").removeEventListener("change", updateLangauge);
    document.getElementById("difficulty-select").removeEventListener("change", updateDifficulty);

    //Attaching event listener to the player button
    document.getElementById("play-button").removeEventListener("click", playGame);

    //Removing span tags
    const textDiv = document.getElementById("text-display");
    while(textDiv.firstChild) {
        textDiv.removeChild(textDiv.firstChild);
    }
}

function showGame() {
    document.getElementById("game-main").style.display = "flex";

    document.getElementById("user-input").disabled = false;

    //Adding event listener for game
    document.getElementById("user-input").addEventListener("input", handleUserCharacterInput);
    document.getElementById("user-input").addEventListener("keydown", handleTabs);
}

function removeGame() {
    document.getElementById("game-main").style.display = "none";

    document.getElementById("user-input").disabled = true;
    document.getElementById("user-input").value = "";

    //Removing event listener for game
    document.getElementById("user-input").removeEventListener("input", handleUserCharacterInput);
    document.getElementById("user-input").removeEventListener("keydown", handleTabs);
}


async function playGame() {
    removeMenu();
    showGame();
    
    //Next we need to fetch the text
    const text = await fetchText(); 
    displayGameText(text);

    console.log(text);

    /*console.log("Priting text");
    for(let index in text) {
        console.log(text[index] + " : " + text.charCodeAt(index));
    }*/
}

function gameFinished() {
   indexPtr = 0;  //Resetting index ptr
    removeGame();  
    showMenu();
}

function updateLangauge(event) {
    language = event.target.value;
    const lowerCase = language.toLowerCase();
    document.getElementById("game-language").innerText = language.charAt(0) + lowerCase.slice(1);
    console.log(language);
}

function updateDifficulty(event) {
    difficult = event.target.value;
    const lowerCase = difficult.toLowerCase();
    document.getElementById("game-difficulty").innerText = difficult.charAt(0) + lowerCase.slice(1);
    console.log(difficult);
}


function fetchText() {
    return new Promise((resolve, reject) => {
        fetch(DB_SERVICE+"/text?language="+language+"&difficulty="+difficult).then((res) => {
            return res.json();
        }).then((data) => {
            resolve(data.text);
        }).catch(() => {
            reject(null);
        });
    }); 
}

//Updated the text in span
function displayGameText(text) {
    const displayArea = document.getElementById("text-display");
    text.split('').forEach(character => {
        if(character.charCodeAt(0) != 13) {
            const spanTag = document.createElement("span");
            spanTag.innerText = character;
            displayArea.appendChild(spanTag);
        }
    });
}



//GAME LOGIC
//Function to handle user input for game 
let indexPtr = 0; //Variable for current index of character in typing
function handleUserCharacterInput(event) {
    const arrayQuote = document.getElementById("text-display").querySelectorAll("span"); //Getting all the span tags
    const arrayValue = document.getElementById("user-input").value.split('');

    let valid = updateTextColors();
    console.log(valid);
    if(valid) {
        if(indexPtr + arrayValue.length >= arrayQuote.length) {
            gameFinished();
        } else {
            switch(event.data) {
                case " ":
                case ".":
                case "(":
                case "<":
                    //Reset input because new word
                    indexPtr = (indexPtr + arrayValue.length);
                    document.getElementById("user-input").value = "";
                    break;
                case null:
                    //Checking if input was new line
                    if(event.inputType == "insertLineBreak") {
                        console.log("NEW LINE");
                        indexPtr = (indexPtr + arrayValue.length);
                        document.getElementById("user-input").value = "";
                    }
                    break;
            }
        }
    }

    //Handling backspace
    if(event.inputType == "deleteContentBackward") {
        arrayQuote[indexPtr + arrayValue.length].classList.remove("correct");
        arrayQuote[indexPtr + arrayValue.length].classList.add("incorrect");
    }
}

function handleTabs(event) {
    if(event.key === 'Tab') {
        event.preventDefault();
        event.target.value = event.target.value +  "    ";

        updateTextColors();
    } 
}



function updateTextColors() {
    const arrayQuote = document.getElementById("text-display").querySelectorAll("span"); //Getting all the span tags
    const arrayValue = document.getElementById("user-input").value.split('');

    //Creating the cursor
    const cursorIndex = indexPtr + arrayValue.length;
    if (arrayQuote[cursorIndex + 1] != null) {
        arrayQuote[cursorIndex + 1].classList.remove("cursor");
    }
    if (arrayQuote[cursorIndex + 1] != null) {
        arrayQuote[cursorIndex - 1].classList.remove("cursor");
    }
    //Placing cursor
    if (arrayQuote[cursorIndex] != null) {
        arrayQuote[cursorIndex].classList.add("cursor");
    }     

    let valid = true; 
    for(let index = indexPtr; index < (indexPtr + arrayValue.length); index++) {
        if(arrayValue[index - indexPtr] == arrayQuote[index].innerText && valid) {
            //Setting span tag as correct
            arrayQuote[index].classList.remove("incorrect");
            arrayQuote[index].classList.add("correct");

        } else {
            valid = false; //typing is invalid
        
            arrayQuote[index].classList.remove("correct");
            arrayQuote[index].classList.add("incorrect");
        }
    } 

    return valid;
}