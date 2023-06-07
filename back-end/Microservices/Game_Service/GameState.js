class GameState {
    constructor(gameId, text) {
        this.id = gameId;
        this.state = "WAITING";
        this.players = [];
        this.playerStatus = new Map();
        this.playerPlacements = new Map();
        this.nextPlace = 1;
        this.text = text;
        this.length = (text.split(" ")).length;
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
}

module.exports = GameState;