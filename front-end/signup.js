//Pages
const HOME_PAGE = "./index.html";
const LOGIN_PAGE = "./login.html";
const SIGNUP_PAGE = "./signup.html";

const USER_SERVICE = "http://127.0.0.1:3051/api/user/signup";


console.log("Hello world!");

document.getElementById("signup-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const email = document.getElementById("form-email").value;
    const username = document.getElementById("form-username").value;
    const password = document.getElementById("form-password").value;
    const repassword = document.getElementById("form-repassword").value;

    //Password validation
    let validUsername = validateUsername(username);
    let validPassword = validatePassword(password, repassword);    

    if(!validUsername || !validPassword) {
        clearInvalidInfo();        

        //Something is not valid
        if(!validUsername) {
            document.getElementById("invalid-username").innerText = "Invalid Username, Length 5-16";
        }

        if(!validPassword) {
            document.getElementById("invalid-password").innerText = "Invalid Password, <br/>Requirements<br/>- At least One Upper case<br/>- At least One Lower case<br/>- At least One Digit<br/>- Min Length 8 characters<br/> Max Length 16 characters<br/>";
        }
    } else {
        //Valid
        const payload = {
            email: email,
            username: username,
            password: password
        };

        //Sending signup request to user service
        fetch("http://127.0.0.1:3051/api/user/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload)
        }).then((response) => {
            return response.json();
        }).then((data) => {
            console.log(data);

            if(data.signedUp) {
                document.getElementById("signup-form").style.display = "none";
                document.getElementById("signup-validation").style.display = "block";
            } else {
                //Password is invalid
                if(!data.validPassword) {
                    document.getElementById("invalid-password").innerText = "Invalid Password, <br/>Requirements<br/>- At least One Upper case<br/>- At least One Lower case<br/>- At least One Digit<br/>- Min Length 8 characters<br/> Max Length 16 characters<br/>";
                }

                //Email is taken
                if(data.emailTaken) {
                    document.getElementById("invalid-email").innerText = "Email is taken";
                }

                //Username is taken
                if(data.usernameTaken) {
                    document.getElementById("invalid-username").innerText = "Username is taken";
                }
            }
        }).catch((err) => {
            console.log(err);
        });
    }
    console.log("Form Submitted");


});


function clearInvalidInfo() {
    const emailInvalid = document.getElementById("invalid-email");
    const usernameInvalid = document.getElementById("invalid-username");
    const passwordInvalid = document.getElementById("invalid-password");

    //Clearing email Invalid
    while(emailInvalid.firstChild) {
        emailInvalid.removeChild(emailInvalid.firstChild);
    }

    //Clearing username Invalid
    while(usernameInvalid.firstChild) {
        usernameInvalid.removeChild(usernameInvalid.firstChild);
    }

    //Clearing password Invalid
    while(passwordInvalid.firstChild) {
        passwordInvalid.removeChild(passwordInvalid.firstChild);
    }

}

//Function for validating username
function validateUsername(username) {
    //Checking length
    if(username.length >= 5) {
        const regexPattern = /^[a-zA-Z0-9_]{5,16}$/;
        if(regexPattern.test(username)) {
            return true;
        }
    }
    return false;
}

//Function for validating passwords
function validatePassword(password, repassword) {
    if(password == repassword) {
        const regexPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,16}$/
        if(regexPattern.test(password)) {
            return true;
        }
    } 
    return false; //Invalid password
}


//Setting up header buttons
document.getElementById("button-login").addEventListener("click", () => {
    window.location.href = LOGIN_PAGE;
});

//Setting up logo home page button
document.getElementById("logo").addEventListener("click", navigateMainPage);

function navigateMainPage() {
    window.location.href = HOME_PAGE;
}