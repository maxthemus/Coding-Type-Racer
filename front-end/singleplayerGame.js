//Services
const DB_SERVICE = "http://127.0.0.1:3054/api/data";

//Pages
const HOME_PAGE = "./index.html";
const LOGIN_PAGE = "./login.html";
const SIGNUP_PAGE = "./signup.html";

//Game setting variables
let language;
let difficult;


//User state variables
let loggedIn = false; //By default user isn't logged in

window.addEventListener("load", () => {
    updateUserInfo();
    showMenu();
}); //Load event


//ORIGINAL FUNCTION IS IN "index.js"
//Updating the user information in the header
function updateUserInfo() {
    //Checking if username is set
    if(window.sessionStorage.getItem("username") !== null) {
        loggedIn = true;        

        //Making vertical alignment for drop down menu
        document.getElementById("user-info").style.display = "block";

        //Creating drop down menu for logged in user
        const dropDownButton = document.createElement("button"); //Creating button
        dropDownButton.innerText = window.sessionStorage.getItem("username"); //Setting button value to the users name
        dropDownButton.addEventListener("click", handleDropDown);
        document.getElementById("user-info").appendChild(dropDownButton);

        //Creating div for the drop down
        const dropDownDiv = document.createElement("div");
        dropDownDiv.style.height = "75px";
        dropDownDiv.style.width = "100px";
        dropDownDiv.style.backgroundColor = "#1c5b97";
        dropDownDiv.style.display = "none";
        dropDownDiv.style.flexDirection = "column";
        dropDownDiv.id = "user_dropdown";
        document.getElementById("user-info").append(dropDownDiv);

        //Creating buttons for the drop down
        const profileButton = document.createElement("button");
        profileButton.id = "profile-button";
        profileButton.addEventListener("click", handleMyProfile);
        profileButton.classList.add("drop_down_button");
        profileButton.innerText = "My Profile";
        dropDownDiv.appendChild(profileButton);


        const logoutButton = document.createElement("button");
        logoutButton.id = "logout-button";
        logoutButton.addEventListener("click", handleLogout);
        profileButton.classList.add("drop_down_button");
        logoutButton.innerText = "Logout";
        dropDownDiv.appendChild(logoutButton);
    } else {
        //We want to display the login and signup buttons
         
        //Setting up signup button
        const signUpButton = document.createElement("button");
        signUpButton.addEventListener("click", redirectSignUpPage);
        signUpButton.innerText = "Sign up";
        signUpButton.id = "button-signup";
       
        //Setting up login button
        const loginButton = document.createElement("button");
        loginButton.addEventListener("click", redirectLoginPage);
        loginButton.innerText = "Login";
        loginButton.id = "button-login";

        document.getElementById("user-info").appendChild(signUpButton);
        document.getElementById("user-info").appendChild(loginButton);
    }
}

//Gets the users login token
function getUserInformation() {
    return sessionStorage.getItem("token");
}

document.getElementById("logo").addEventListener("click", navigateMainPage);



//Page Redirections
//Handler for login button press
function redirectLoginPage() {
    window.location.href = LOGIN_PAGE;
}

//Handler for signup button press
function redirectSignUpPage() {
    window.location.href = SIGNUP_PAGE;    
}


function navigateMainPage() {
    window.location.href = HOME_PAGE;
}


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
}

function removeGame() {
    document.getElementById("game-main").style.display = "none";

    document.getElementById("user-input").disabled = true;
    document.getElementById("user-input").value = "";

    //Removing event listener for game
    document.getElementById("user-input").removeEventListener("input", handleUserCharacterInput);
}


async function playGame() {
    removeMenu();
    showGame();
    
    //Next we need to fetch the text
    const text = await fetchText(); 
    displayGameText(text);

    console.log(text);
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
        const spanTag = document.createElement("span");
        spanTag.innerText = character;
        displayArea.appendChild(spanTag);
    });
}



//GAME LOGIC
//Function to handle user input for game 
let indexPtr = 0; //Variable for current index of character in typing
function handleUserCharacterInput(event) {
    const arrayQuote = document.getElementById("text-display").querySelectorAll("span"); //Getting all the span tags
    const arrayValue = document.getElementById("user-input").value.split('');

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

