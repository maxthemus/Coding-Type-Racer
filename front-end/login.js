const USER_SERVICE_API = "http://122.58.68.153:3051/api/user/login";
const HOME_PAGE = "./index.html";
const LOGIN_PAGE = "./login.html";
const SIGNUP_PAGE = "./signup.html";

const loginForm = document.getElementById("login-form");

//Checking if user is already logged in
window.addEventListener("load", () => {
    if(window.localStorage.getItem("username") !== null) {
        window.location.href = "HOME_PAGE";
    }
});


loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    
    const username = document.getElementById("form-username").value;
    const password = document.getElementById("form-password").value;

    //perform some pre sending validation
    //ALSO SECURITY

    const payload = {
        username: username,
        password: password
    };

    fetch(USER_SERVICE_API, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
    }).then((response) => {
        return response.json();
    }).then((data) => {
        if("loggedIn" in data) {
            if(data.loggedIn) {
                handleValidLogin(data.token, username);
            } else {
                handleFailLogin();
            }
        }
    }).catch((err) => {
        console.log(err);
    });
});

function handleValidLogin(token, username) {
    window.localStorage.setItem("token", token);
    window.localStorage.setItem("username", username);
    //Redirect to home 
    window.location.href = HOME_PAGE;

}

function handleFailLogin() {
    //Display invalid text
    document.getElementById("form-element").innerText = "Invalid Username or Password";
}