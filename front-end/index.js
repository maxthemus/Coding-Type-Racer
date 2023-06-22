//Pages
const LOGIN_PAGE = "./login.html";
const SIGNUP_PAGE = "./signup.html";
let loggedIn = false; //By default user isn't logged in

//Function called onload of home page
window.addEventListener("load", updateUserInfo);


//Updating the user information in the header
function updateUserInfo() {
    //Checking if username is set
    if(window.sessionStorage.getItem("username") !== null) {
        loggedIn = true;        

        //We want to display the username     
        const usernameElement = document.createElement("h3");
        usernameElement.innerText = window.sessionStorage.getItem("username");
        document.getElementById("user-info").appendChild(usernameElement);
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

//Handler for login button press
function redirectLoginPage() {
    window.location.href = LOGIN_PAGE;
}

//Handler for signup button press
function redirectSignUpPage() {
    window.location.href = SIGNUP_PAGE;    
}


//Adding event listener for single player button
document.getElementById("singlePlayer-button").addEventListener("click", handleJoinSinglePlayer);
//Function for handling starting singleplayer
function handleJoinSinglePlayer() {
    if(loggedIn) {

    } else {
        redirectLoginPage();
    }
}

document.getElementById("multiPlayer-button").addEventListener("click", handleJoinMultiPlayer);
//Function for handling starting multiplayer
function handleJoinMultiPlayer() {
    if(loggedIn) {

    } else {
        redirectLoginPage();
    }
}

