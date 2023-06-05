//Variables
const QUOTE_API_URL = 'http://127.0.0.1:4000/api/v1/text' // put your api here max
const quoteDisplayElement = document.getElementById('quoteDisplay')
const quoteInputElement = document.getElementById('quoteInput')
const timerElement = document.getElementById('timer')

let inGame = false; //Variable to keep if user is in game or not
let text = ""; //Holds text user is typing in game
let textArray = []; //Holds the individual characters for the text in Array


let indexPtr = 0;
let nextSpaceIndex = 0;

function setNextSpace() {
    const arrayQuote = quoteDisplayElement.querySelectorAll('span');

    for (let index = indexPtr; index < arrayQuote.length; index++) {
        if (arrayQuote[index].innerText == ' ') {
            nextSpaceIndex = index;
            return;
        }
    }
    nextSpaceIndex = arrayQuote.length; 
}

quoteInputElement.addEventListener('input', (event) =>{
    const arrayQuote = quoteDisplayElement.querySelectorAll('span')
    const arrayValue = quoteInputElement.value.split('')

    console.log("next index = " +nextSpaceIndex);
    console.log("indexPtr = " + indexPtr);

    //Checking to see if word is done
    if(event.data == " ") {
        let validWord = true; //Be default word is valid
        for(let index = indexPtr; index < nextSpaceIndex; index++) {
            console.log(arrayValue[index]);

            if(arrayQuote[index].classList != "correct") {
                console.log("invalid letter");
                validWord = false;
                break;
            }
        }
    
        if(validWord) {
            console.log("valid Word");
            indexPtr = nextSpaceIndex + 1;
            console.log(arrayQuote[indexPtr].innerText);

            arrayQuote[nextSpaceIndex].classList.add("correct");
            setNextSpace();


            //Resetting the value in the input
            quoteInputElement.value = "";
        }

    }

    let correct = true
    arrayQuote.forEach((charactersSpan, index) => {
        if(index >= indexPtr) {
            const character = arrayValue[index - indexPtr];
            console.log("Char = " + character);
            if (character == null) { // if character hasn't been type null
                charactersSpan.classList.remove('correct')
                charactersSpan.classList.remove('incorrect')
                correct = false
            }
            else if (character === charactersSpan.innerText) {
                charactersSpan.classList.add('correct')
                charactersSpan.classList.remove('incorrect')
            } else {
                charactersSpan.classList.remove('correct')
                charactersSpan.classList.add('incorrect')
                correct = false
            }
        }
   });


    if (correct) {
        renderNewQuote();
        //indexPtr = 0;
    }
})

//Function added so called when start button is clicked
function getText() {
    console.log("Starting Game");
}


function getTextQuote(){
    return "testing this works";
    //return fetch (QUOTE_API_URL)
    //.then(response => response.json())
    //.then(data => data.text)
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

    setNextSpace();
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
