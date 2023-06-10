const USER_SERVICE_API = "127.0.0.1:3051/api/user/login";
const HOME_PAGE = "./index.html";

const loginForm = document.getElementById("login-form");

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

    fetch("http://127.0.0.1:3051/api/user/login", {
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
    });
});

function handleValidLogin(token, username) {
    window.sessionStorage.setItem("token", token);
    window.sessionStorage.setItem("username", username);
    //Redirect to home 
    window.location.href = HOME_PAGE;

}

function handleFailLogin() {
    //Display invalid text
    document.getElementById("form-element").innerText = "Invalid Username or Password";
}