//Variables
const QUOTE_API_URL = 'http://127.0.0.1:4000/api/v1/text' // put your api here max
const quoteDisplayElement = document.getElementById('quoteDisplay')
const quoteInputElement = document.getElementById('quoteInput')
const timerElement = document.getElementById('timer')

let inGame = false; //Variable to keep if user is in game or not
let text = ""; //Holds text user is typing in game
let textArray = []; //Holds the individual characters for the text in Array


let count = 0;
let increment = true;

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
                    pacBlue = 200
                    moveR + 10
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


let pacBlue = 0
let moveR = 0
//-----------------------------------pac man-----------------------
function draw(){

    translate(0,moveR)
        angleMode(DEGREES);
      fill(255, 255, pacBlue); // Yellow color for Pac-Man
      arc(50, 50, 80, 80, count,-count, PIE)
      
      if (increment) {
        count++;
        if (count >= 20) {
          increment = false;
        }
      } else {
        count--;
        if (count <= 0) {
          increment = true;
        }
      }
    }

function getTextQuote(){
    return "Testing this works boing";
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

function setup() {
    createCanvas(400, 400);
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


