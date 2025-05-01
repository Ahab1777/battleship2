import { forceCoordinateToArray } from "./utils.js";
import { dragEnd, dragStart } from "./utils.js";

export function render(match){
    //TODO display enemy fleet remaining

    const player = match.humanPlayer
    const computer = match.computerPlayer

    //1 - Render fleet por custom positioning
    const fleet = document.querySelector('.fleet');

    //1.1 - Set fleet container direction and ships direction
    const fleetDirection = fleet.dataset.direction //directions are reversed so that ship remain within the boundaries of the fleet container
    if (fleetDirection === 'vertical') {
        fleet.classList.remove('vertical')
        fleet.classList.add('horizontal')
    }
    else if (fleetDirection === 'horizontal') {
        fleet.classList.remove('horizontal')
        fleet.classList.add('vertical')
    }


    //TODO - simplify logic
    const dockedShipsNode = document.querySelectorAll('.docked-ship');//Select ships and remove/add direction class based on docked-ship direction dataset
    dockedShipsNode.forEach(ship => {
            const currentDirectionClass = ship.dataset.direction;
            const pastDirectionClass = currentDirectionClass === 'horizontal' ? 'vertical' : 'horizontal';
            ship.classList.remove(pastDirectionClass);
            ship.classList.add(currentDirectionClass)
    })

    //1.2 - Create node of ship elements
    match.standardFleet.forEach(ship => {

    })


    //2 - Render player grid
    const playerSquaresNode = document.querySelectorAll('.player-container .square');
    playerSquaresNode.forEach(square => {
        const coordinate = square.getAttribute('data-pos');
        const board = player.gameboard
        const shipAtCoordinate = board.getShipAt(coordinate);
        //1 - Intact ship
        if (shipAtCoordinate && !shipAtCoordinate.isSunk) {
            console.log("🚀 ~ render ~ shipAtCoordinate:", shipAtCoordinate)
            
            square.classList.add('ship');
        }
        //2 - is hit - missed
        if (board.isMiss(coordinate)) {
            square.classList.add('miss')
        }
        //3 - is hit - ship hit
        if (shipAtCoordinate && board.isSquareHit(coordinate)) {
            square.classList.add('hit')
            square.classList.remove('ship');
        }
        //4 - is hit - sunk
        if (shipAtCoordinate && shipAtCoordinate.isSunk) {
            square.classList.add('sunk');
            square.classList.remove('ship');
            
        }
        
    });

    //3 - Render computer grid
    const computerSquareNodeList = document.querySelectorAll(`.computer-container .square`);
    computerSquareNodeList.forEach(square => {
        const coordinate = square.getAttribute('data-pos');
        const board = computer.gameboard

        //Square logic
        //1 - is hit - missed
        if (board.isMiss(coordinate)) {
            square.classList.add('miss')
        }
        //2 - is hit - ship hit
        if (board.isSquareHit(coordinate) && board.getShipAt(coordinate)) {
            square.classList.add('hit')
        }
        //3 - is hit - sunk
        if (board.getShipAt(coordinate)?.sunkStatus) {
            square.classList.add('sunk');
        }
        

    })
}

export function resetDOM(match){
    //1 - Reset all square
    //1.1 - Get square classes back to only 'square'
    const allSquares = document.querySelectorAll('.square');
    allSquares.forEach(square => {
        square.className = 'square';
    })

    //1.2 - Remove all listeners from squares by cloning them and replacing the original by the clone
    allSquares.forEach(square => {
        const newSquare = square.cloneNode(true);
        square.parentNode.replaceChild(newSquare, square)
    })

    //2 - Empty docked ships fleet-container and refill it with standardFleet
    const fleet = document.querySelector('.fleet');
    fleet.innerHTML = '';
    match.standardFleet.forEach((ship) => {
        const newShipElement = document.createElement('div');
        const shipSize = ship.size;
        newShipElement.setAttribute('draggable', 'true')
        newShipElement.dataset.size = shipSize;
        newShipElement.dataset.docked = true;
        newShipElement.dataset.direction = 'vertical';
        newShipElement.classList.add('vertical');
        newShipElement.classList.add('docked-ship')
        newShipElement.id = ship.id;
        newShipElement.addEventListener('dragstart', dragStart);
        newShipElement.addEventListener('dragend', dragEnd)

        //Fill the ship with squares
        for (let i = 0; i < shipSize; i++) {
            const squareElement = document.createElement("div");
            squareElement.classList.add('square', 'ship');
            newShipElement.appendChild(squareElement);
        }
        //Add ship to the fleet
        fleet.append(newShipElement)
    })

    //3 - Clear game status display
    const display = document.querySelector('.game-status');
    display.textContent = '';

    //Reset buttons event handlers
    const flipShipBtn = document.querySelector('.flip-btn')
    const newFlipBtn = flipShipBtn.cloneNode(true);
    flipShipBtn.parentNode.replaceChild(newFlipBtn, flipShipBtn)

    const testRenderBtn = document.querySelector('#render')
    const newRender = testRenderBtn.cloneNode(true)
    testRenderBtn.parentNode.replaceChild(newRender, testRenderBtn)


}