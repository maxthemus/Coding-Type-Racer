//PAGES
const HOME_PAGE = "http://localhost/code-racer/front-end/index.html";
const LOGIN_PAGE = "http://localhost/code-racer/front-end/login.html";
const SIGNUP_PAGE = "http://localhost/code-racer/front-end/signup.html";
const PROFILE_PAGE = "http://localhost/code-racer/front-end/profile.html";
const SINGLEPLAYER_GAME_PAGE = "http://localhost/code-racer/front-end/singleplayerGame.html";
const MULTIPLAYER_GAME_PAGE = "http://localhost/code-racer/front-end/multiplayerGame.html";

//Redirection functions
export function redirectHomePage() {
    if(window.location.href != HOME_PAGE) {
        window.location.href = HOME_PAGE;
    }
}

export function redirectLoginPage() {
    if(window.location.href != LOGIN_PAGE) {
        window.location.href = LOGIN_PAGE;
    }
}

export function redirectSignupPage() {
    if(window.location.href != SIGNUP_PAGE) {
        window.location.href = SIGNUP_PAGE;
    }
}

export function redirectProfilePage() {
    window.location.href = PROFILE_PAGE;
}

export function redirectSinglePlayerPage() {
    if(window.location.href != SINGLEPLAYER_GAME_PAGE) {
        window.location.href = SINGLEPLAYER_GAME_PAGE;
    }
}

export function redirectMultiPlayerPage() {
    if(window.localStorage.href != MULTIPLAYER_GAME_PAGE) {
        window.location.href = MULTIPLAYER_GAME_PAGE;
    }
}

export function logoutUser() {
    //Resetting user data
    window.sessionStorage.clear(); //clearing all session data

    if(window.location.href != "index.html") {
        window.location.href="./index.html"
    }
}