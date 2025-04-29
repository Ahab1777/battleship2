
export default class Ship{
    constructor(length){
        this._length = length;
        this._hits = 0;
    }

    hit(){
        this._hits++;
    }

    get isSunk() {
        if (this._hits >= this._length) {
            return true;
        }
        return false
    }

    get hitCount() {
        return this._hits
    }

    get shipSize() {
        return this._length
    }
}