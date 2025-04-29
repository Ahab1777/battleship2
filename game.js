import Ship from "./src/ship";
import { arrayToString, forceCoordinateToArray, isCoordinateOutOfBounds } from "./src/utils";


export default class Game{
    constructor(humanPlayer, computerPlayer){
        this.humanPlayer = humanPlayer;
        this.computerPlayer = computerPlayer;
        this.attackingPlayer = humanPlayer;
        this.defendingPlayer = computerPlayer;
        this.gameHasEnded = false;
        this.winner = null;
        this.standardFleet = [
            {
              type: "carrier",
              size: 5,
            },
            {
              type: "battleship",
              size: 4,
            },
            {
              type: "cruiser",
              size: 3,
            },
            {
              type: "submarine",
              size: 3,
            },
            {
              type: "destroyer",
              size: 2,
            },
          ];
    }

    togglePlayers(){
        this.attackingPlayer = this.attackingPlayer === this.humanPlayer ? this.computerPlayer : this.humanPlayer;

        this.defendingPlayer = this.defendingPlayer === this.humanPlayer ? this.computerPlayer : this.humanPlayer;
    }

    randomCoordinate(shipSize = null, originCoordinate = null){//shipSize and originCoordinate for uses in ship placement
        const columns = 'ABCDEFGHIJ';
        const rows = 10;
        let randomCoordinate;

        if (originCoordinate) {
            const direction = Math.floor(Math.random() * 2); // 0 for vertical, 1 for horizontal
            //if shipSize + originCoordinate direction vertex out of bounds, repeat
            const [colOrigin, rowOrigin] = forceCoordinateToArray(originCoordinate)            
            
            let rowNewRandomCoordinate;
            let colNewRandomCoordinate;

            const attempts = 100;
            let timesAttempted = 0;
            do {
                switch (direction) {
                    case 0: // Vertical
                        if ((rowOrigin + shipSize) > 9) {
                            rowNewRandomCoordinate = rowOrigin - shipSize
                            colNewRandomCoordinate = colOrigin;
                        }
                        else{
                            rowNewRandomCoordinate = rowOrigin + shipSize
                            colNewRandomCoordinate = colOrigin;
                        }
                        break;
                    case 1: // Horizontal
                        if ((colOrigin + shipSize) > 9) {
                            rowNewRandomCoordinate = rowOrigin;
                            colNewRandomCoordinate = colOrigin - shipSize;
                        }
                        else{
                            rowNewRandomCoordinate = rowOrigin;
                            colNewRandomCoordinate = colOrigin + shipSize;
                        }
                        break
                    default:
                        break;
                }

                randomCoordinate = arrayToString([colNewRandomCoordinate, rowNewRandomCoordinate]) 

                timesAttempted++
                if (timesAttempted >= attempts) {
                    throw new Error('Max number of attempts reached')
                }
            } while(
                isCoordinateOutOfBounds(randomCoordinate) ||
                isCoordinateOutOfBounds(randomCoordinate) ||
                this.defendingPlayer.gameboard.squareHitStatus(randomCoordinate)
            )
            return randomCoordinate
        }

        do {//Generate random coordinate
            const randomColumn = columns[Math.floor(Math.random() * columns.length)];
            const randomRow = Math.floor(Math.random() * rows) + 1;
            randomCoordinate = `${randomColumn}${randomRow}`;
        } while (//If coordinate is already hit, try again
            this.defendingPlayer.gameboard.isQuareHit(randomCoordinate)
        );
        return randomCoordinate;
    }

    positionShips(standardFleet){

        //Positioning computer ships - random
        standardFleet.forEach((battleship) => {
            let randomStartingPosition;
            let randomEndingPosition;

            let attempts = 0; //testing
            const maxAttempts = 1000;   //testing 

            let isOverlap = false;
            let isOutOfBounds = false;
            do {
                randomStartingPosition = this.randomCoordinate()
                randomEndingPosition = this.randomCoordinate(battleship.size, randomStartingPosition)

                const [startRow, startCol] = stringToArray(randomStartingPosition)
                const [endRow, endCol] = stringToArray(randomEndingPosition)

                isOverlap = false; //reset reference
                isOutOfBounds = false // reset reference
                if (startRow === endRow) { //ship is horizontal
                    for (let index = 0; index < battleship.size; index++) {
                        let currentCoordinate = arrayToString([startRow, startCol + index])
                        if (isCoordinateOutOfBounds(currentCoordinate)) {
                            isOutOfBounds = true
                            continue
                        }
                        if(this.computerPlayer.gameboard.getShipAt(currentCoordinate)){
                            isOverlap = true;
                        }
                    }
                }
                else if (startCol === endCol){ //ship is vertical
                    for (let index = 0; index < battleship.size; index++) {
                        let currentCoordinate = arrayToString([startRow + index, startCol])
                        if (isCoordinateOutOfBounds(currentCoordinate)) {
                            isOutOfBounds = true
                            continue
                        }
                        //console.log(`startCol ${startCol} // endCol ${endCol} // Current coordinate ${currentCoordinate}`)
                        
                        if(this.computerPlayer.gameboard.getShipAt(currentCoordinate)){
                            isOverlap = true;
                        }
                    }
                }

                attempts++;
                if (attempts > maxAttempts) {
                    throw new Error("Unable to find valid positions for computer's ship placement.");
                }
            } while (
                isOverlap ||
                isOutOfBounds ||
                randomStartingPosition === randomEndingPosition
            )
            this.computerPlayer.gameboard.placeShip(new Ship(battleship.size), randomStartingPosition, randomEndingPosition)
        })
    }

    makeAttack(targetCoordinate){
        let coordinate = targetCoordinate
        //if computer is playing, roll random coordinate,else player chooses coordinate
        if (this.attackingPlayer === this.computerPlayer) {
            coordinate = this.randomCoordinate()
            this.defendingPlayer.gameboard.receiveAttack(coordinate)
        }
        if (this.attackingPlayer === this.humanPlayer){
            this.defendingPlayer.gameboard.receiveAttack(coordinate)
        }
    }

    checkWinCon(){
        //check if current defending player's fleet is sunk
        if (this.defendingPlayer.gameboard.isFleetSunk()) {
            this.gameHasEnded = true;
            this.winner = this.attackingPlayer
        }
    }
}