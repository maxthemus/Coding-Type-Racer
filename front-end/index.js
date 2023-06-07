//Variables
const QUOTE_API_URL = 'http://127.0.0.1:4000/api/v1/text' // put your api here max
const quoteDisplayElement = document.getElementById('quoteDisplay')
const quoteInputElement = document.getElementById('quoteInput')
const timerElement = document.getElementById('timer')

let inGame = false; //Variable to keep if user is in game or not
let text = ""; //Holds text user is typing in game
let textArray = []; //Holds the individual characters for the text in Array


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

//FOR DEBUGGING PLZ REMOVE
function spanTextToCharArray() {
    const arrayQuote = quoteDisplayElement.querySelectorAll("span");
    let array = [];

    for(let index = 0; index < arrayQuote.length; index++) {
        array.push(arrayQuote[index].innerText);
    }

    return array;
}



let indexPtr;
quoteInputElement.addEventListener('input', (event) =>{
    const arrayQuote = quoteDisplayElement.querySelectorAll('span')
    const arrayValue = quoteInputElement.value.split('')

    console.log("Input value = " + event.data);
    console.log("Quote value = " + spanTextToCharArray());
    console.log("Input array = " + arrayValue);

    console.log(indexPtr + " : " + (indexPtr + arrayValue.length));

    let valid = true;
    for(let index = indexPtr; index < (indexPtr + arrayValue.length); index++) {
        console.log(index + " : " + indexPtr);
        if(arrayValue[index - indexPtr] == arrayQuote[index].innerText && valid) {
            console.log(arrayValue[index - indexPtr] + " : is correct");
            arrayQuote[index].classList.remove("incorrect");
            arrayQuote[index].classList.add("correct");
        } else {
            valid = false;

            arrayQuote[index].classList.remove("correct");
            arrayQuote[index].classList.add("incorrect");
        }
    } 

    if(valid) {
        if(indexPtr + arrayValue.length >= arrayQuote.length) {
            alert("Quote is finished");
            quoteInputElement.disabled = true;
            quoteInputElement.value = "";
        } else {
            switch (event.data) {
                case " ":
                    console.log("New World");
                    //Clearing the input and shiriting the indexPtr
                    indexPtr = (indexPtr + arrayValue.length);
                    console.log(indexPtr);
                    quoteInputElement.value = "";
                    break;
                case null:
                    
                    break;
                default:
            }
        }
    } 

    if(event.data == null) {
        console.log("HERE");
        arrayQuote[indexPtr + arrayValue.length].classList.remove("correct");
        arrayQuote[indexPtr + arrayValue.length].classList.add("incorrect");
    }
});

//Function added so called when start button is clicked
function getText() {
    console.log("Starting Game");
    renderNewQuote();

}


function getTextQuote(){
    return "testing this works";
    //return fetch (QUOTE_API_URL)
    //.then(response => response.json())
    //.then(data => data.text)
}

async function renderNewQuote(){
    indexPtr = 0;
    quoteInputElement.enabled = true;
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



//returns an array of all index of special character in order
function getKeyIndexes(text) {
    let indexes = [];

    for(let index in text) {
        if(text[index] == " ") {
            indexes.push(index);
        }
    }
    return indexes;
}


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
