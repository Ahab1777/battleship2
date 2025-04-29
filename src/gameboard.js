import Ship from "./ship";
import { isArrayOutOfBounds, isStringOutOfBounds, stringToArray, arrayToString } from "./utils";

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
        let convertedCoordinate;
        if (typeof coordinate === 'string') {
            convertedCoordinate = stringToArray(coordinate);
        } else if (Array.isArray(coordinate)) {
            convertedCoordinate = coordinate;
        } else {
            throw new Error('Invalid coordinate format. Coordinate must be either a string or an array.');
        }

        const [row, col] = convertedCoordinate;
        const square = this._board[row][col];
        square.hitSquare();
    }

    isMiss(coordinate){
        let convertedCoordinate;
        if (typeof coordinate === 'string') {
            convertedCoordinate = stringToArray(coordinate);
        } else if (Array.isArray(coordinate)) {
            convertedCoordinate = coordinate;
        } else {
            throw new Error('Invalid coordinate format. Coordinate must be either a string or an array.');
        }

        const hitStatus = this._board[convertedCoordinate[0]][convertedCoordinate[1]].hitStatus;

        const hasShip = this._board[convertedCoordinate[0]][convertedCoordinate[1]]?.ship ? true : false;
        
        if (hitStatus && hasShip) {
            return false
        } else if(hitStatus && !hasShip){
            return true
        } else if(!hitStatus){
            return false
        }

    }

    placeShip(ship, startCoordinate, endCoordinate){
        const size = ship.shipSize;

        //Convert coordinates if needed
        let startCoordinateConverted
        let endCoordinateConverted
        if (typeof(startCoordinate) === 'string' && typeof(endCoordinate) === 'string') {
            startCoordinateConverted = stringToArray(startCoordinate);
            endCoordinateConverted = stringToArray(endCoordinate);
        } else if (Array.isArray(startCoordinate) && Array.isArray(endCoordinate)) {
            startCoordinateConverted = startCoordinate;
            endCoordinateConverted = endCoordinate;
        } else {
            throw new Error('Invalid coordinate format. Coordinates must be either strings or arrays.');
        }

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
        let convertedCoordinate;
        if (typeof coordinate === 'string') {
            convertedCoordinate = stringToArray(coordinate);
        } else if (Array.isArray(coordinate)) {
            convertedCoordinate = coordinate;
        } else {
            throw new Error('Invalid coordinate format. Coordinate must be either a string or an array.');
        }

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