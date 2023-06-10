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

        console.log(document.getElementById("signup-form").style.display);
        //We want to send infomration to back-end
        document.getElementById("signup-form").style.display = "none";
    }


    
    console.log("Form Submitted");

});


function clearInvalidInfo() {
    const usernameInvalid = document.getElementById("invalid-username");
    const passwordInvalid = document.getElementById("invalid-password");

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
    if(username.length < 8) {
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



//TEST FUC
function back() {
    document.getElementById("signup-form").style.display = "block";
}