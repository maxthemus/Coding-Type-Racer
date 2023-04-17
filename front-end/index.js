//Variables
const QUOTE_API_URL = 'http://127.0.0.1:4000/api/v1/text' // put your api here max
const quoteDisplayElement = document.getElementById('quoteDisplay')
const quoteInputElement = document.getElementById('quoteInput')
const timerElement = document.getElementById('timer')

let inGame = false; //Variable to keep if user is in game or not
let text = ""; //Holds text user is typing in game
let textArray = []; //Holds the individual characters for the text in Array

quoteInputElement.addEventListener('input', () =>{
    const arrayQuote = quoteDisplayElement.querySelectorAll('span')
    const arrayValue = quoteInputElement.value.split('')

    let correct = true
    arrayQuote.forEach((charactersSpan, index) => {
        const character = arrayValue[index]
        if (character == null){ // if character hasn't been type null
            charactersSpan.classList.remove('correct')
            charactersSpan.classList.remove('incorrect')
            correct = false
        }
        else if (character === charactersSpan.innerText){
        charactersSpan.classList.add('correct')
        charactersSpan.classList.remove('incorrect')
        } else {
        charactersSpan.classList.remove('correct')
        charactersSpan.classList.add('incorrect')
        correct = false
    }
    })

    if (correct) renderNewQuote()
})

//Function added so called when start button is clicked
function getText() {
    console.log("Starting Game");
}


function getTextQuote(){
    return fetch (QUOTE_API_URL)
    .then(response => response.json())
    .then(data => data.text)
}

async function renderNewQuote(){
    const quote = await getTextQuote()
    console.log(quote);

    quoteDisplayElement.innerText = ''
    quote.split('').forEach(character => { //splitting up each character into a span, meaning induvidual colours
        const characterSpan = document.createElement('span')
        characterSpan.innerText = character
        quoteDisplayElement.appendChild(characterSpan)
    });
    quoteInputElement.value = null
    startTimer()
}

let startTime
function startTimer() {
    timerElement.innerText = 0
    startTime = new Date()
    setInterval(() => {
       timerElement.innerText = getTimerTime()
    }, 1000)
}
 
function getTimerTime(){
   return Math.floor((new Date() - startTime) / 1000)// will always round down
}

renderNewQuote()

//Functions
/**
Funtion getText() will send an API request to the backend to recieve a random snippet of code for the game
*/
// function getText() {
//     //Fetch is used to send API requests
//     fetch(QUOTE_API_URL).then((payload) => { 
//         return payload.json(); //Takes what is sent back and packages it into JSON
//     }).then((data) => { //the parameter is data is the JSON 
//         text = data.text;
//         textArray = text.split("");

//         addTextToScreen();

//         inGame = true;
//     }).catch((err) => {
//         //ERROR handling
//         console.log(err);
//         alert("Something Went Wrong on FETCH REQUEST");
//     });
// }

// function addTextToScreen() {
//     document.getElementById("text__tag").innerHTML = ""; //Reseting the text to nothing
    
//     for(let i = 0; i < textArray.length; i++) {
//         let tempElement = document.createElement("span");
//         tempElement.innerText = textArray[i];
//         tempElement.classList.add('incorrect');
//         tempElement.setAttribute("id", "texts");

//         let textTag = document.getElementById('text__tag');
//         textTag.appendChild(tempElement);
//     }
// }

// const inputFiel.getElementById('quoteInput')
// inputField.addEventListener('input', () => {
//     const spanArray = document.querySelectorAll("span");
//     console.log("even handler");

//     for(let i = 0; i < textArray.length; i++) {
//         if(inputField.value.charAt(i) === textArray[i]) {
//             //Correct
//             spanArray[i].classList.remove("incorrect");
//             spanArray[i].classList.remove("normal");
//             spanArray[i].classList.add("correct");
//         } else {
//             //Incorrect
//             spanArray[i].classList.remove("correct");
//             spanArray[i].classList.remove("normal");
//             spanArray[i].classList.add("incorrect");
//         }
//     }
// });
