/**
 * Javascript file for handling Header 
 *
 * Current Header tags for pages 
<header id="home-header">
    <button id="header-logo-button">
        <h3 class="header_logo">The Racing Coder</h3>
    </button>

    <div class="header_user" id="user-info">
    </div>
</header>
*/

//Imports 
import { redirectHomePage, redirectLoginPage, redirectSignupPage, redirectProfilePage, logoutUser } from "./redirect.js";

window.addEventListener("load", setUpHeader);


/**
 *  Function for setting up the header
 */
export function setUpHeader() {
    //Adding event listener to the main page
    if(window.location.href != "./index.html") {
        document.getElementById("header-logo-button").addEventListener("click", redirectHomePage);
    }

    //Looking at the user localstorage
    const username = window.sessionStorage.getItem("username");
    if(username !== null) {
        addLoginInfo(username);
    } else {
        addLoginButtons();
    }


}



/**
 *  Function used to add the login info drop down to the header 
 */
export function addLoginInfo(username) {
    //Checking if username is a string
    if(username) {
        const userInfo = document.getElementById("user-info");

        //Creating dropdown menu button
        const dropDownButton = document.createElement("button");
        dropDownButton.id = "header-user-dropbutton";
        dropDownButton.innerText = username;
        dropDownButton.addEventListener("click", handleDropDown);
        userInfo.appendChild(dropDownButton);

        //Creating drop down div
        const dropDownDiv = document.createElement("div");
        dropDownDiv.id = "header-user-dropdown";
        userInfo.appendChild(dropDownDiv);

        //Creating buttons for the drop down div
        const profileButton = document.createElement("button");
        profileButton.id = "header-user-profile";
        profileButton.addEventListener("click", redirectProfilePage);
        profileButton.classList.add("drop_down_button");
        profileButton.innerText = "My Profile";
        dropDownDiv.appendChild(profileButton);

        const logoutButton = document.createElement("button");
        logoutButton.id = "header-user-logout";
        logoutButton.addEventListener("click", logoutUser);
        logoutButton.innerText = "Logout";
        dropDownDiv.appendChild(logoutButton);

        userInfo.style.display = "block";
    }
}

/**
 *  Function used to remove the login info drop down from header
 */
export function removeLoginInfo() {
    const userInfo = document.getElementById("user-info");

    //Removing event listeners
    document.getElementById("header-user-dropbutton").removeEventListener("click", handleDropDown);
    document.getElementById("header-user-profile").removeEventListener("click", redirectProfilePage);
    document.getElementById("header-user-logout").removeEventListener("click", logoutUser);

    //Removing all dropdown nodes
    const dropDownDiv = document.getElementById("header-user-dropdown");
    while(dropDownDiv.firstChild) {
        dropDownDiv.removeChild(dropDownDiv.firstChild);
    }

    //Removing all elements in userInfo
    while(userInfo.firstChild) {
        userInfo.removeChild(userInfo.firstChild);
    }

    userInfo.style.display = "flex";
}



/**
 *  Function for adding login buttons from header 
 */
export function addLoginButtons() {
    const userInfo = document.getElementById("user-info"); //Getting user info tag

    //Creating login button
    const loginButton = document.createElement("button");
    loginButton.id = "header-login-button";
    loginButton.innerText = "Login";
    loginButton.addEventListener("click", redirectLoginPage);
    
    //Creating sign up button
    const signupButton = document.createElement("button");
    signupButton.innerText = "Sign up";
    signupButton.addEventListener("click", redirectSignupPage);

    //Appending children
    userInfo.appendChild(loginButton);
    userInfo.appendChild(signupButton);
}

/**
 * Function for removing login buttons from header  
 */
export function removeLoginButtons() {
    const userInfo = document.getElementById("user-info");

    //Removing event listeners
    document.getElementById("header-login-button").removeEventListener("click", redirectLoginPage);
    document.getElementById("header-signup-button").removeEventListener("click", redirectSignupPage);

    //Removing nodes from div
    while(userInfo.firstChild) {
        userInfo.removeChild(userInfo.firstChild);
    }
}


//LOCAL FUNCTIONS TO THIS FILE
function handleDropDown() {
    //Toggling the drop down menu
    const dropDownMenu = document.getElementById("header-user-dropdown");
    if(dropDownMenu.style.display == "none") {
        dropDownMenu.style.display = "flex";
    } else {
        dropDownMenu.style.display = "none";
    }
}