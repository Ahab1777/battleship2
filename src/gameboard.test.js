import Ship from "./ship";
import Gameboard, { Square } from "./gameboard";
//Square tests


describe('Square class tests', () => {
    let square;
    let destroyer;

    beforeEach(() => {
        square = new Square;
        destroyer = new Ship(2);
        square.ship = destroyer;
    });

    test('Set ship on square', () => {
        expect(square.ship).toBe(destroyer)
    })

    test('Hit ship on square', () => {
        square.hitSquare()
        expect(square.hitStatus).toBe(true)
    })

    test('checking hit status', () => {
        expect(square.hitStatus).toBe(false)
        square.hitSquare()
        expect(square.hitStatus).toBe(true)
    })

})

describe('Gameboard', () => {
    let gameboard;
    
    beforeEach(() => {
        gameboard = new Gameboard
    })

    test('placeShip and getShipAt', () => {
        const submarine = new Ship(3)
        const destroyer = new Ship(2)
        gameboard.placeShip(submarine, 'D4', 'F4')
        expect(gameboard.getShipAt('D4')).toBe(submarine)
        expect(gameboard.getShipAt('E4')).toBe(submarine)
        expect(gameboard.getShipAt('F4')).toBe(submarine)
        expect(gameboard.getShipAt('B4')).toBeFalsy()
        expect(gameboard.getShipAt('J4')).toBeFalsy()
        gameboard.placeShip(destroyer, 'J4', 'J5')
        expect(gameboard.getShipAt('J4')).toBeTruthy()
        expect(gameboard.getShipAt('J4')).toBe(destroyer)
        expect(gameboard.getShipAt('J5')).toBe(destroyer)
    })


    test('isMiss', () => {
        const submarine = new Ship(3)
        gameboard.placeShip(submarine, 'B8', 'B10')
        expect(gameboard.isMiss('B7')).toBe(false)
        expect(gameboard.isMiss('B8')).toBe(false)
        expect(gameboard.isMiss('B9')).toBe(false)
        expect(gameboard.isMiss('B10')).toBe(false)
        gameboard.receiveAttack('B7')
        expect(gameboard.isMiss('B7')).toBe(true)
        expect(gameboard.isMiss('B8')).toBe(false)
        expect(gameboard.isMiss('B9')).toBe(false)
        expect(gameboard.isMiss('B10')).toBe(false)
        gameboard.receiveAttack([1, 5])
        expect(gameboard.isMiss('B6')).toBe(true)

    })

    test('receiveAttack works with strings', () => {
        const submarine = new Ship(3)
        gameboard.placeShip(submarine, 'B8', 'B10')
        expect(gameboard.isMiss('B9')).toBe(false)
        gameboard.receiveAttack('B9')
        expect(gameboard.getShipAt('B9').hitCount).toBe(1)
        expect(gameboard.getShipAt('B9')).toBe(submarine)
        expect(gameboard.isMiss('B9')).toBe(false)
        expect(gameboard.getShipAt('B9').hitCount).toBe(1)
        gameboard.receiveAttack('B8')
        expect(gameboard.getShipAt('B9').hitCount).toBe(2)
        gameboard.receiveAttack('B10')
        expect(submarine.isSunk).toBe(true)
    })

    test('receiveAttack works with arrays', () => {
        const submarine = new Ship(3)
        gameboard.placeShip(submarine, [2,0], [2,2])
        expect(gameboard.isMiss([2,1])).toBe(false)
        gameboard.receiveAttack([2,1])
        expect(gameboard.getShipAt([2,1]).hitCount).toBe(1)
        expect(gameboard.getShipAt([2,1])).toBe(submarine)
        expect(gameboard.isMiss([2,1])).toBe(false)
        expect(gameboard.getShipAt([2,1]).hitCount).toBe(1)
        gameboard.receiveAttack([2,0])
        expect(gameboard.getShipAt([2,1]).hitCount).toBe(2)
        gameboard.receiveAttack([2,2])
        expect(submarine.isSunk).toBe(true)
    })

    test('isFleetSunk', () => {
        const submarine = new Ship(3)
        const destroyer = new Ship(2)
        gameboard.placeShip(submarine, 'D4', 'F4')
        gameboard.placeShip(destroyer, 'J4', 'J5')
        expect(gameboard.isFleetSunk()).toBe(false)
        gameboard.receiveAttack('D4')
        gameboard.receiveAttack('E4')
        gameboard.receiveAttack('F4')
        expect(gameboard.isFleetSunk()).toBe(false)
        gameboard.receiveAttack('J4')
        gameboard.receiveAttack('J5')
        expect(gameboard.isFleetSunk()).toBe(true)
    })


})