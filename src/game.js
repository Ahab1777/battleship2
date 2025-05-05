import Ship from "./ship.js";
import { stringToArray, arrayToString, forceCoordinateToArray, isCoordinateOutOfBounds } from "./utils.js";


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
              id: "carrier",
              size: 5,
            },
            {
              id: "battleship",
              size: 4,
            },
            {
              id: "cruiser",
              size: 3,
            },
            {
              id: "submarine",
              size: 3,
            },
            {
              id: "destroyer",
              size: 2,
            },
          ];
    }

    togglePlayers(){
        this.attackingPlayer = this.attackingPlayer === this.humanPlayer ? this.computerPlayer : this.humanPlayer;

        this.defendingPlayer = this.defendingPlayer === this.humanPlayer ? this.computerPlayer : this.humanPlayer;
    }

    randomCoordinate(shipSize = null, originCoordinate = null){//shipSize and originCoordinate for uses in ship placement
        
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
                this.defendingPlayer.gameboard.isSquareHit(randomCoordinate)
            )
            return randomCoordinate
        }

        const columns = 'ABCDEFGHIJ';
        const rows = 10;
        do {//Generate random coordinate
            const randomColumn = columns[Math.floor(Math.random() * columns.length)];
            const randomRow = Math.floor(Math.random() * rows) + 1;
            randomCoordinate = `${randomColumn}${randomRow}`;
        } while (//If coordinate is already hit, try again
            this.defendingPlayer.gameboard.isSquareHit(randomCoordinate)
        );
        return randomCoordinate;
    }

    positionShips(standardFleet = this.standardFleet){

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
            //Smart opponent
            //Is there a ship visible and unsunk??
            let attackDone = false;
            let coordinateFound = false;
            const playerSquareNodeList = document.querySelectorAll(`.player-container .square`);
            const squareMap = new Map();//Create map of squares to easily find squares by the coordinate(string)
            playerSquareNodeList.forEach(square => {
                squareMap.set(square.dataset.pos, square);
            });

            //Look for a valid surrounding squares to hit
            for (const square of playerSquareNodeList) {
                const [coordX, coordY] = forceCoordinateToArray(square.dataset.pos);
                if (square.classList.contains('hit') && !square.classList.contains('sunk')) {//Check if current square has been hit
                    const directions = [ // Create array of surrounding coordinates for the current square
                        [coordX - 1, coordY], // Left
                        [coordX + 1, coordY], // Right
                        [coordX, coordY - 1], // Up
                        [coordX, coordY + 1]  // Down
                    ];
                    //Loop over every adjacent square to check if there is another hit
                    for (let i = 0; i < directions.length; i++) {
                        const currentCoordinate = arrayToString(directions[i]);//Needs to be string to use as key for squareMap
                        const currentSquare = squareMap.get(currentCoordinate);
                        if (isCoordinateOutOfBounds(directions[i])){//Skip loop if adjacent square is invalid or coordinate has been found
                            continue 
                        }
                        if(coordinateFound){
                            break
                        }
                        //If square is hit, keep attacking direction until sunk or miss
                        if (currentSquare.classList.contains('hit')) {
                            //Use opposite side as target
                            let coordinateCandidate;
                            if (i === 0) { //If left also hit, target right
                                coordinateCandidate = directions[1]
                            }          
                            else if(i === 1) {//If right also hit, target left
                                coordinateCandidate = directions[0]
                            }
                            else if(i === 2) {//If up also hit, target down
                                coordinateCandidate = directions[3]
                            }
                            else if(i === 3) {//If down also hit target up
                                coordinateCandidate = directions[2]
                            }
                            //Check if coordinate candidate is valid before sending it forward
                            const getSquareOfCoordinateCandidate = squareMap.get(arrayToString(coordinateCandidate))

                            if (
                                !isCoordinateOutOfBounds(coordinateCandidate) && 
                                !getSquareOfCoordinateCandidate.classList.contains('hit') && 
                                !getSquareOfCoordinateCandidate.classList.contains('miss') &&
                                !getSquareOfCoordinateCandidate.classList.contains('sunk')) 
                                {
                                coordinate = coordinateCandidate
                                coordinateFound = true;
                                break;
                            }
                        }                        
                    }
                    
                    //loop over every adjacent to check if there is another non-miss/non-hit
                    if (coordinateFound) {
                        break;
                    }
                    for (let i = 0; i < directions.length; i++) {
                        if (isCoordinateOutOfBounds(directions[i]) || coordinateFound) {
                            continue
                        }
                        const currentCoordinate = arrayToString(directions[i]);//Needs to be string to use as key for squareMap
                        const currentSquare = squareMap.get(currentCoordinate);
                        //If square is not a miss - select it
                        if(
                            !currentSquare.classList.contains('miss') && 
                            !currentSquare.classList.contains('hit') &&
                            !currentSquare.classList.contains('sunk')
                        ){
                            console.log("🚀 ~ Game ~ makeAttack ~ currentSquare.classList: no MISS and not HIT", currentSquare.classList)
                            coordinate = currentCoordinate;
                            coordinateFound = true;
                            break;
                        }
                                       
                    }


                }
            }
            if (!isCoordinateOutOfBounds(coordinate) && coordinateFound) {
                
                console.log("🚀 ~ Game ~ makeAttack ~ ATTACK DONE:", coordinate)
                console.log("🚀 ~ Game ~ makeAttack  ATTACK DONE - String ->!", forceCoordinateToArray(coordinate))
                console.log("🚀 ~ Game ~ makeAttack ~ !isCoordinateOutOfBounds(coordinate):", !isCoordinateOutOfBounds(coordinate))
                console.log("🚀 ~ Game ~ makeAttack ~ coordinateFound:", coordinateFound)
                attackDone = true;
                this.defendingPlayer.gameboard.receiveAttack(coordinate);
                this.checkWinCon()
                return; // Exit the function entirely
            }
            //If no other square is hit, make random attack
            if (!coordinateFound) {
                console.log("🚀 ~ Game ~ makeAttack ~ Attack was Random:", coordinate)
                coordinate = this.randomCoordinate()
                this.defendingPlayer.gameboard.receiveAttack(coordinate)
                this.checkWinCon()
            }
        }
        if (this.attackingPlayer === this.humanPlayer){
            this.defendingPlayer.gameboard.receiveAttack(coordinate)
            this.checkWinCon()
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