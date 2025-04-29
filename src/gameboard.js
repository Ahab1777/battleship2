import Ship from "./ship";
import { isArrayOutOfBounds, isStringOutOfBounds, stringToArray, arrayToString, forceCoordinateToArray } from "./utils";

export default class Gameboard{
    constructor(){
        this._board = this.#generateBoard();
        this._fleet = [];
    }

    #generateBoard() {
        return Array(10)
            .fill()
            .map(() => Array(10).fill().map(() => new Square()));
    }

    receiveAttack(coordinate) {
        const convertedCoordinate = forceCoordinateToArray(coordinate)
        const [row, col] = convertedCoordinate;
        const square = this._board[row][col];
        square.hitSquare();
    }

    isMiss(coordinate){
        const convertedCoordinate = forceCoordinateToArray(coordinate)
        const hitStatus = this.isSquareHit(coordinate)

        const hasShip = this._board[convertedCoordinate[0]][convertedCoordinate[1]]?.ship ? true : false;
        
        if (hitStatus && hasShip) {
            return false
        } else if(hitStatus && !hasShip){
            return true
        } else if(!hitStatus){
            return false
        }

    }

    isSquareHit(coordinate){
        const convertedCoordinate = forceCoordinateToArray(coordinate)
        return this._board[convertedCoordinate[0]][convertedCoordinate[1]].hitStatus;
    }

    placeShip(ship, startCoordinate, endCoordinate){
        const size = ship.shipSize;

        //Convert coordinates if needed
        const startCoordinateConverted = forceCoordinateToArray(startCoordinate);
        const endCoordinateConverted = forceCoordinateToArray(endCoordinate)

        //populate board in correct direction until ship length size
        //if X axis changes, ship is horizontal
            //if startX > endX, subtract positioning
            //if startX < endX, add for positioning
        if (startCoordinateConverted[0] < endCoordinateConverted[0]) { 
            const xAxis = startCoordinateConverted[0]
            const yAxis = startCoordinateConverted[1]
            for (let x = 0; x < size; x++) {
                this._board[xAxis + x][yAxis].ship = ship//place ship along its direction on board
            }
            this._fleet.push(ship)
        }
        else if (startCoordinateConverted[0] > endCoordinateConverted[0]){
            const xAxis = startCoordinateConverted[0]
            const yAxis = startCoordinateConverted[1]
            for (let x = 0; x < size; x++) {
                this._board[xAxis - x][yAxis].ship = ship//place ship along its direction on board
            }
            this._fleet.push(ship)
        }
        //if Y axis changes, ship is vertical
            //if start Y > end Y, subtract for positioning
            //if start Y < end Y, add for positioning
        else if (startCoordinateConverted[1] < endCoordinateConverted[1]) {
            const xAxis = startCoordinateConverted[0]
            const yAxis = startCoordinateConverted[1]
            for (let y = 0; y < size; y++) {
                this._board[xAxis][yAxis + y].ship = ship//place ship along its direction on board
            }
            this._fleet.push(ship)
        }
        else if (startCoordinateConverted[1] > endCoordinateConverted[1]) {
            const xAxis = startCoordinateConverted[0]
            const yAxis = startCoordinateConverted[1]
            for (let y = 0; y < size; y++) {
                this._board[xAxis][yAxis - y].ship = ship//place ship along its direction on board
            }
            this._fleet.push(ship)
        }
        else if (startCoordinateConverted === endCoordinateConverted){
            throw new Error('Start and end coordinates cannot be the same');
        }
    }

    isFleetSunk() {
        return this._fleet.length > 0 && this._fleet.every(ship => ship.isSunk);
    }

    getShipAt(coordinate){
        const convertedCoordinate = forceCoordinateToArray(coordinate)
        return this._board[convertedCoordinate[0]][convertedCoordinate[1]].ship
    }
} 


export class Square{
    constructor(){
        this._hasBeenHit = false
        this._ship = null
    }
    
    set ship(ship){
        this._ship = ship
    }
    
    hitSquare(){
        if (this._hasBeenHit) {
            return
        }
        if (this._ship) {
            this._ship.hit()
        }
        this._hasBeenHit = true
    }

    get hitStatus(){
        return this._hasBeenHit
    }

    get ship(){
        return this._ship
    }
}