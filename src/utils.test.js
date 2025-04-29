import Ship from "./ship";
import { arrayToString, isArrayOutOfBounds, isStringOutOfBounds, stringToArray } from "./utils";

describe('Testing utility functions', () => {
    const outOfBoundsArrayX = [10, 8];
    const outOfBoundsArrayY = [4, 11];
    const outOfBoundsStringX = 'K9'
    const outOfBoundsStringY = 'E12'
    const withinBoundsArray = [9,0]
    const withinBoundsString = 'J1'
    
    test('Convert string to array', () => {
        expect(stringToArray(outOfBoundsStringX)).toEqual(outOfBoundsArrayX)
        expect(stringToArray(outOfBoundsStringY)).toEqual(outOfBoundsArrayY)
    })

    test('Convert array to string', () => {
        expect(arrayToString(outOfBoundsArrayX)).toEqual(outOfBoundsStringX)
        expect(arrayToString(outOfBoundsArrayY)).toEqual(outOfBoundsStringY)

    })
    
    test('Is array within bounds?', () => {
        expect(isArrayOutOfBounds(outOfBoundsArrayX)).toBe(true)
        expect(isArrayOutOfBounds(outOfBoundsArrayY)).toBe(true)
        expect(isArrayOutOfBounds(withinBoundsArray)).toBe(false)
    })

    test('Is string out of bounds?', () => {
        expect(isStringOutOfBounds(outOfBoundsStringX)).toBe(true)
        expect(isStringOutOfBounds(outOfBoundsStringY)).toBe(true)
        expect(isStringOutOfBounds(withinBoundsString)).toBe(false)
    })

})