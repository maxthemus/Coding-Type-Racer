const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0YjllMmRjNC0xOWQ0LTRiMTgtODVlZS0xNGEyYTM1NmJlMGIiLCJpYXQiOjE2ODQwMDIzMzN9.smUSMtzzWPggwK6LfI-AvC2UcSZYnOqxTTm-hh0V5Xw";
const userID = "6fe5bacc-f1bf-11ed-a05b-0242ac120003";
//Opening socket connection
const socket = new WebSocket('ws://127.0.0.1:3053');


socket.addEventListener('open', (event) => {
    console.log("Socket has been open");
});

socket.addEventListener("close", (event) => {
    console.log(event);

    switch(event.code) {
        case 3000: //Invalid Payload
            console.log("Invalid Payload");
            break;
        case 3001: //Failed AUTH
            console.log("Authentication failed");
            break;
    }
    console.log("Socket has been closed");
});

socket.addEventListener("message", (event) => {
    console.log(event.data);
    const message = JSON.parse(event.data);
    console.log(message);
});


//FUNCTIONS 
async function authenticateSocket() {
    if(socket.readyState == WebSocket.OPEN) {
        const messageStr = JSON.stringify({
            type: "AUTH",
            token: token
        });

        socket.send(messageStr);
        console.log("Auth Sent"); 
    } else {
        console.log("Socket is not open");
    }
}