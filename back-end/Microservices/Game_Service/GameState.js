class GameState {
    constructor(gameId, text) {
        this.id = gameId;
        this.state = "WAITING";
        this.players = [];
        this.playerStatus = new Map();
        this.playerPlacements = new Map();
        this.nextPlace = 1;
        this.text = text;
        this.length = this.getTextLength(text);
        this.type = "NORMAL"; //TYPES INCLUDE "NORMAL", "PRIVATE"
        this.timer = null; //Set this variable to the setTimeout 
    } 

    setState(newState) {
        this.state = newState;
    }


    addPlayer(userId) {
        if(this.state == "WAITING") {
            if(!this.players.includes(userId)) {
                this.players.push(userId);
                this.playerStatus.set(userId, 0);
                this.playerPlacements.set(userId, -1);
                return true;
            } else {
                return false;
            }
        }
    }   
    removePlayer(userId) {
        let index = this.players.indexOf(userId);
        if(index != -1) {
            this.players.splice(index, 1);
            this.playerStatus.delete(userId);
            this.playerPlacements.delete(userId);

            //If the there are no players currently then we want to stop the timer
            if(this.players.length <= 0) {
                clearTimeout(this.timer);
            }

            return true;
        }     
        return false;
    }
    
    updatePlayerState(userId, newStatus) {
        this.playerStatus.set(userId, newStatus);
    }

    stateToJSON() {
        return JSON.stringify({
            id: this.id,
            state: this.state,
            players:  this.players,
            playerStatus: this.playerStatus,
            playerPlacements: this.playerPlacements,
            text: this.text
        });
    }

    stateToObj() {
        //Turning maps into arrays        
        let tempPlayerStatus = Array.from(this.playerStatus.entries());
        let tempPlayerPlacements = Array.from(this.playerPlacements.entries());

        return {
            id: this.id,
            state: this.state,
            players:  this.players,
            playerStatus: tempPlayerStatus,
            playerPlacements: tempPlayerPlacements,
            text: this.text
        };
    }

    playerFinished(userId) {
        this.playerPlacements.set(userId, this.nextPlace++);
    }

    getTextLength(text) {
       let count = 0;
        for(let index in text) {
            switch(text[index]) {
                case " ":
                case ".":
                case "(":
                case "<":
                case "\n":
                    count++;
                    break;
            }
        }
        return count; 
    }

    /**
     * 
     * @param { function to start game} startFunction 
     */
    setStartTimer(startFunction, socket) {
        if(this.timer == null) {
            this.timer = setTimeout(() => {
                startFunction(this, socket);
            }, 10000); //Currently auto starter is at 10 seconds
        }
   }
}

module.exports = GameState;