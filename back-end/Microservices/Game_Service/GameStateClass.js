class GameState {
    constructor(gameId, text) {
        this.id = gameId;
        this.state = "WAITING";
        this.players = [userId];
        this.playerStatus = new Map();
        this.text = text;
    }

    setState(newState) {
        this.state = newState;
    }


    addPlayer(userId) {
        if(this.state == "WAITING") {
            if(!this.players.includes(userId)) {
                this.players.push(userId);
                this.playerStatus.set(userId, 0);
                return true;
            } else {
                return false;
            }
        }
    }   
    removePlayer(userId) {
        let index = this.players.indexOf(userId);
        if(index != -1) {
            this.player.splie(index);
            this.playerStatus.delete(userId);
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
            text: this.text
        });
    }
}

module.exports = {
    GameState
};