//Pages
const HOME_PAGE = "./index.html";
const LOGIN_PAGE = "./login.html";
const SIGNUP_PAGE = "./signup.html";
let loggedIn = false; //By default user isn't logged in

//Services
const USER_SERVICE = "http://127.0.0.1:3051/api/user";

//Function called onload of home page
window.addEventListener("load", handleOnLoad);

async function handleOnLoad() {
    //First we want to handle the quries
    const url = new URL(window.location.href);
    const searchParams = url.searchParams; 

    if(searchParams.has("username")) {
        //We want to fetch user information
        try {
            const profileData = await getUserInformation(searchParams.get("username"));
            console.log(profileData);
            displayProfileData(profileData);
        } catch(err) {
            console.log("User not found!");
            displayError();
        }
    } else {
        //We want to check if user is logged in
        if(window.sessionStorage.getItem("username") !== null) {
            //Display this users information
            try {
                const profileData = await getUserInformation(window.sessionStorage.getItem("username"));
                console.log(profileData);
                displayProfileData(profileData);
            } catch(err) {
                console.log("INVALID LOGIN");
                displayError();
            }

        } else {
            //Redirect to login page
            window.location.href = LOGIN_PAGE;
        }
    }

    updateUserInfo();
}


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

//Handler for logo click
document.getElementById("logo").addEventListener("click", navigateMainPage);
function navigateMainPage() {
    window.location.href = HOME_PAGE;
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
}


function getUserInformation(username) {
    return new Promise( async (resolve, reject) => {
        const regexPattern = /^[a-zA-Z0-9_]{5,16}$/;
        if(!regexPattern.test(username)) {
            return reject();
        }

        fetch(USER_SERVICE+"/info/profile?username="+username).then((response) => {
            return response.json();
        }).then((data) => {
            if("userFound" in data) {
                if(data.userFound) {
                    return resolve(data.userProfile);
                }
            }            
            return reject();
        }).catch(() => {
            return reject();
        });
    });
}


function displayProfileData(profileData) {
    document.getElementById("profile-username").innerText = profileData.username;
}

function displayError() {
    document.getElementById("profile-username").innerText = "User not found!";
}