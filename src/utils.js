import Ship from "./ship.js";

export function stringToArray(string) {
    const rowString = string[0]
    const row = rowString.charCodeAt(0);
    const column = parseInt(string.slice(1), 10);
    return [row - 65, column - 1]
}

export function arrayToString(array){
    const [row, column] = array;
    const rowString = String.fromCharCode(row + 65);
    const columnString = (column + 1).toString();
    return rowString + columnString;
}

export function isCoordinateOutOfBounds(coordinate){
    const targetCoordinate = forceCoordinateToArray(coordinate);
    if (
        targetCoordinate[0] < 0 ||
        targetCoordinate[0] > 9 ||
        targetCoordinate[1] < 0 ||
        targetCoordinate[1] > 9
    ) {
        return true
    } 
    else {
        return false
    }

}

export function isStringOutOfBounds(coordinate) {
    if (typeof coordinate !== 'string') {
        throw new Error(`Coordinate (${coordinate}) is not a string`);
    }
    const targetCoordinate = stringToArray(coordinate)
    if (
        targetCoordinate[0] < 0 ||
        targetCoordinate[0] > 9 ||
        targetCoordinate[1] < 0 ||
        targetCoordinate[1] > 9
    ) {
        return true
    } 
    else {
        return false
    }
}

export function isArrayOutOfBounds(coordinate) {
    if (!Array.isArray(coordinate)) {
        throw new Error(`Coordinate (${coordinate}) is not an array`)
    }
    if (
        coordinate[0] < 0 ||
        coordinate[0] > 9 ||
        coordinate[1] < 0 ||
        coordinate[1] > 9
    ) {
        return true
    } 
    else {
        return false
    }
}

export function forceCoordinateToArray(coordinate){
    let convertedCoordinate;
    if (typeof coordinate === 'string') {
        convertedCoordinate = stringToArray(coordinate);
    } else if (Array.isArray(coordinate)) {
        convertedCoordinate = coordinate;
    } else {
        throw new Error('Invalid coordinate format. Coordinate must be either a string or an array.');
    }
    return convertedCoordinate;
}

export function dragStart(e) {
    // console.log('dragStart called');
    //Grab squares within the target ship
    const ship = e.currentTarget;
    const squaresWithin = Array.from(ship.children);

    //Style squares
    squaresWithin.forEach(square => {
        square.classList.add('dragging');
    });

    //Ass class to ship to target it later
    ship.classList.add('dragging-ship');

    //TODO - review if docked dataset is necessary
    //Change docked status to false, since ship left dock
    ship.dataset.docked = false;

    //Center dragging object on mouse
    const direction = ship.dataset.direction;
    const dragImage = ship.cloneNode(true);
    dragImage.style.opacity = '0.5';
    const dragImageId = 'drag-image'; //Add id to target it later
    ship.dataset.dragImageId = dragImageId;
    dragImage.id = dragImageId;
    document.body.appendChild(dragImage);
    const rect = e.target.getBoundingClientRect();
    let offsetX;
    let offsetY;
    if (direction === 'vertical') {
        offsetX = rect.width / 2; // Center horizontally
        offsetY = 20; // Center vertically (20px is half of each square)
    } else if (direction === 'horizontal') {
        offsetX = 20; // Center vertically (20px is half of each square)
        offsetY = rect.height / 2; // Center horizontally
    }
    e.dataTransfer.setDragImage(dragImage, offsetX, offsetY);

    //Feed ship info into dataTransfer for drag and drop
    const id = e.target.id;
    const shipSize = e.target.dataset.size;
    e.dataTransfer.setData('text/plain', JSON.stringify({
        direction: direction,
        shipSize: shipSize,
        id: id
    }));

    //Store the parent id to target it later
    ship.dataset.originalParent = ship.parentNode.id;

    //Delay hide class to be added for dragging animation
    setTimeout(() => {
        ship.classList.add('hide');
    }, 0);
}

export function dragEnd(e) {
    // console.log('dragEnd called');
    e.preventDefault();
    //Grab squares within the target ship
    const ship = e.currentTarget;
    const squaresWithin = Array.from(ship.children);

    //Style squares within ship
    squaresWithin.forEach(square => {
        square.classList.remove('dragging');
    });

    //Remove dragging class from boat 
    ship.classList.remove('dragging-ship');

    // Ensure the ship that got re-docked(returned to fleet container) is visible if drop fails
    ship.classList.remove('hide');

    //remove drag image (ghost ships) from DOM
    const dragImage = document.getElementById('drag-image');
    if (dragImage) {
        dragImage.remove();
    }

    // Ensure the ship that got re-docked(returned to fleet container) is visible if drop fails
    setTimeout(() => {
        ship.classList.remove('hide');
        ship.classList.remove('dragging-ship');
    }, 100);
}

export function dragEnter(e) {
    // console.log('dragEnter called');
    e.preventDefault();
    //e.target.classList.add('drag-over');
}

export function dragOver(e, getShipAtFunction) {
    // console.log('dragOver called');
    e.preventDefault();

    //Add dropEffect
    e.dataTransfer.dropEffect = 'move';

    //Select ship being dragged
    const shipBeingDragged = document.querySelector('.dragging-ship');

    //Grab the size and direction of the ship bring dragged
    const shipSize = parseInt(shipBeingDragged.dataset.size, 10); // Converts to a number
    const direction = shipBeingDragged.dataset.direction;

    //Add drag-over class to squares that ship is hovering over    
    const [coordX, coordY] = forceCoordinateToArray(e.target.dataset.pos);
    const playerSquareNodeList = document.querySelectorAll('.player-container .square');

    let targetCoordinate;
    let newCoord;
    let outOfBounds = false;
    //Check if last square is  out of bounds
    switch (direction) {
        case 'horizontal':
            newCoord = coordX + shipSize;
            if (newCoord < 0 || newCoord > 10) {
                outOfBounds = true;
            }
            break;
        case 'vertical':
            newCoord = coordY + shipSize;
            if (newCoord < 0 || newCoord > 10) {
                outOfBounds = true;
            }
            break;
        default:
            throw new Error('No valid valid direction provided');
    }

    //Check if any target square already have a ship within it
    for (let i = 0; i < shipSize; i++) {
        let currentTargetSquare;
        if (direction === 'horizontal') { //check direction
            currentTargetSquare = [coordX + i, coordY];
        } else if (direction === 'vertical') {
            currentTargetSquare = [coordX, (coordY + i)];
        }

        if (getShipAtFunction(currentTargetSquare)) { //check ship presence
            outOfBounds = true;
        }
    }

    //If hovering over square, add adequate styling to it
    for (let i = 0; i < shipSize; i++) {
        if (direction === 'horizontal') {
            targetCoordinate = [coordX + i, coordY];
        } else if (direction === 'vertical') {
            targetCoordinate = [coordX, (coordY + i)];
        }

        const targetCoordinateString = arrayToString(targetCoordinate);
        const targetSquare = Array.from(playerSquareNodeList).find(
            square => square.dataset.pos === targetCoordinateString
        );

        const squareStyle = outOfBounds ? 'invalid-zone' : 'drag-over';

        if (targetSquare) {
            targetSquare.classList.add(squareStyle);
        }
    }
}

export function dragLeave(e) {
    console.log('dragLeave called');
    const shipBeingDragged = document.querySelector('.dragging-ship');

    const playerSquareNodeList = document.querySelectorAll('.player-container .square');
    playerSquareNodeList.forEach(square => {
        square.classList.remove('drag-over');
        square.classList.remove('invalid-zone');
    });
}

export function drop(e, placeShipFunction, getShipAtFunction) {
    // console.log('drop called');
    e.preventDefault();

    //1 - Create node of square from grid
    const playerSquareNodeList = document.querySelectorAll('.player-container .square');

    //1.1 - Remove dropzone styling from squares
    playerSquareNodeList.forEach(square => {
        square.classList.remove('drag-over');
        square.classList.remove('invalid-zone');
    });

    //2 - Grab ship info
    const shipInfo = JSON.parse(e.dataTransfer.getData('text/plain'));
    const shipSize = parseInt(shipInfo.shipSize, 10);
    const direction = shipInfo.direction;
    let startCoordinate = forceCoordinateToArray(e.target.dataset.pos);

    //2.1 - Use ship size to identify endCoordinate
    const targetCoordinate = direction === 'horizontal'
        ? [startCoordinate[0] + shipSize - 1, startCoordinate[1]]
        : [startCoordinate[0], startCoordinate[1] + shipSize - 1];

    //2.2 - Check if last square is within bounds for a valid drop
    let isValidDrop = true;
    switch (direction) {
        case 'horizontal':
            const coordX = (startCoordinate[0] + shipSize) - 1;
            if (coordX < 0 || coordX > 9) {
                isValidDrop = false;
            }
            break;
        case 'vertical':
            const coordY = (startCoordinate[1] + shipSize) - 1;
            if (coordY < 0 || coordY > 9) {
                isValidDrop = false;
            }
            break;
        default:
            throw new Error('No valid valid direction provided');
    }

    //2.3 If drop invalid, return ship to dock(fleet container)
    if (!isValidDrop) {
        const shipElement = document.getElementById(shipInfo.id);
        const originalParentId = shipElement.dataset.originalParent;
        const originalParent = document.getElementById(originalParentId);
        originalParent.appendChild(shipElement);
        shipElement.classList.remove('hide');
        return;
    }

    //Cancel drop if over another ship by applying getSquareShip on each square
    for (let i = 0; i < shipSize; i++) {

        let currentTargetSquare;
        if (direction === 'horizontal') {
            currentTargetSquare = [(startCoordinate[0] + i), startCoordinate[1]];
            if (getShipAtFunction(currentTargetSquare)) {
                return;
            }
        } else if (direction === 'vertical') {
            currentTargetSquare = [startCoordinate[0], (startCoordinate[1] + i)];
            if (getShipAtFunction(currentTargetSquare)) {
                return;
            }
        }

    }

    //Remove current ship by removing the ghost ship (dragging-ship) matching id 
    const dockedShipsNode = document.querySelectorAll('.docked-ship');
    dockedShipsNode.forEach(ship => {
        if (ship.id === shipInfo.id) {
            ship.remove();
        }
    });

    //Convert end coordinate to string
    const endCoordinate = arrayToString(targetCoordinate);

    //Create new ship and convert startDirection back to string
    const newShip = new Ship(shipSize);
    //Feed placeShip function
    placeShipFunction(newShip, startCoordinate, endCoordinate);
}

export function flipShips() {
    //Identify current position by fleet container direction dataset info
    const fleet = document.querySelector('.fleet');
    const targetDirection = fleet.dataset.direction === 'vertical' ? 'horizontal' : 'vertical';
    const previousDirection = targetDirection === 'vertical' ? 'horizontal' : 'vertical';

    //Apply targetDirection to container and previousdirection to ships
    const dockedShips = document.querySelectorAll('.docked-ship');
    dockedShips.forEach(ship => {
        ship.dataset.direction = previousDirection;
    });

    fleet.dataset.direction = targetDirection;
}