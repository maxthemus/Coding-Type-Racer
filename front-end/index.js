//Pages
const LOGIN_PAGE = "./login.html";
const SIGNUP_PAGE = "./signup.html";
const MULTIPLAYER_GAME_PAGE = "./multiplayerGame.html";
let loggedIn = false; //By default user isn't logged in

//Function called onload of home page
window.addEventListener("load", updateUserInfo);


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
        window.location.href = MULTIPLAYER_GAME_PAGE;
    } else {
        redirectLoginPage();
    }
}


//Function for header drop down
function handleDropDown() {
    //Toggle the drop down menu
    if(document.getElementById("user_dropdown").style.display == "none") {
        document.getElementById("user_dropdown").style.display = "flex";
    } else {
        document.getElementById("user_dropdown").style.display = "none";

    }
}

function handleLogout() {
    console.log("Logging out");

    //Resetting user data
    window.sessionStorage.clear(); //clearing all session data

    if(window.location.href != "index.html") {
        window.location.href="./index.html"
    }
}

function handleMyProfile() {
    console.log("My profile");
}