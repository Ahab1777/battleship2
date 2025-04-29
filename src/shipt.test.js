import Ship from "./ship";

describe('Submarine(length = 3) sinks after 3 hits', () => {
    let submarine;

    beforeEach(() => {
        submarine = new Ship(3) 
    })

    test('Sink submarine', () => {
        submarine.hit()
        expect(submarine.hitCount).toBe(1)
        submarine.hit()
        expect(submarine.hitCount).toBe(2)
        expect(submarine.isSunk).toBe(false)
        submarine.hit()
        expect(submarine.isSunk).toBe(true)
    })
})