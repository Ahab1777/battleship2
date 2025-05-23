import { dragEnd, dragStart } from "./utils.js";

export function render(match){
    //TODO display enemy fleet remaining

    const player = match.humanPlayer
    const computer = match.computerPlayer

    //1 - Render fleet por custom positioning
    const fleet = document.querySelector('.fleet');

    //1.1 - Set fleet container direction and ships direction
    const fleetDirection = fleet.dataset.direction 
    if (fleetDirection === 'vertical') {
        fleet.classList.remove('horizontal')
        fleet.classList.add('vertical')
    }
    else if (fleetDirection === 'horizontal') {
        fleet.classList.remove('vertical')
        fleet.classList.add('horizontal')
    }


    const dockedShipsNode = document.querySelectorAll('.docked-ship');//Select ships and remove/add direction class based on docked-ship direction dataset
    dockedShipsNode.forEach(ship => {
            const currentDirectionClass = ship.dataset.direction;
            const pastDirectionClass = currentDirectionClass === 'horizontal' ? 'vertical' : 'horizontal';
            ship.classList.remove(pastDirectionClass);
            ship.classList.add(currentDirectionClass)
    })


    //2 - Render player grid
    const playerSquaresNode = document.querySelectorAll('.player-container .square');
    playerSquaresNode.forEach(square => {
        const coordinate = square.getAttribute('data-pos');
        const board = player.gameboard
        const shipAtCoordinate = board.getShipAt(coordinate);
        //1 - Intact ship
        if (
            shipAtCoordinate && 
            !shipAtCoordinate.isSunk && 
            !board.isMiss(coordinate)) 
            {
            square.classList.add('ship');
            square.style.pointerEvents = "none";//Make square unclickable

        }
        //2 - is hit - missed
        if (
            board.isMiss(coordinate)) 
            {
            square.classList.add('miss')
            square.style.pointerEvents = "none";//Make square unclickable

        }
        //3 - is hit - ship hit
        if (
            shipAtCoordinate && 
            board.isSquareHit(coordinate) && 
            !shipAtCoordinate.isSunk) 
            {
            square.classList.add('hit')
            square.classList.remove('ship');
            square.style.pointerEvents = "none";//Make square unclickable

        }
        //4 - is hit - sunk
        if (
            shipAtCoordinate && 
            shipAtCoordinate.isSunk) 
            {
            square.classList.add('sunk');
            square.classList.remove('hit')
            square.classList.remove('ship');
            square.style.pointerEvents = "none";//Make square unclickable

            
        }
    });

    //3 - Render computer grid
    const computerSquareNodeList = document.querySelectorAll(`.computer-container .square`);
    computerSquareNodeList.forEach(square => {
        const coordinate = square.getAttribute('data-pos');
        const board = computer.gameboard

        //Square logic
                if (board.isMiss(coordinate)) {
            square.classList.add('miss');
        } else if (
            board.isSquareHit(coordinate) && 
            !board.getShipAt(coordinate)?.isSunk
        ) {
            square.classList.add('hit');
        } else if (board.getShipAt(coordinate)?.isSunk) {
            square.classList.remove('hit');
            square.classList.add('sunk');
        }
    })

    //Render enemy fleet status
    const fleetStatus = document.querySelector('.ships-remaining');
    const enemyFleet = match.computerPlayer.gameboard._fleet;
    let shipsRemaining = 0;
    shipsRemaining = enemyFleet.reduce((acc, currentShip) => {
        if (currentShip.isSunk) {
            return acc;
        }
        return acc + 1;
    }, 0);
    


    // Render display based on fleet status
    const flipShipBtn = document.querySelector('.flip-btn');
    const computerGrid = document.querySelector('.computer-team')
    const fleetContainer = document.querySelector('.fleet-container')
    const enemyBoardContainer = document.querySelector('.team-container-a')
    const playerBoard = document.querySelector('.player-team')
    if(match.humanPlayer.gameboard._fleet.length === match.standardFleet.length){
        flipShipBtn.disabled = true;// Activate flip btn depending on game state
        fleetStatus.textContent = shipsRemaining //Display remaining enemy ships// 
        computerGrid.style.display = 'block'
        //hide ship placement square
        fleetContainer.style.display = 'none'

        //show enemy board
        enemyBoardContainer.style.display = 'flex'
        //Set adequate style to the player board so that it's margin left is zero, this way it gets near the other board at the center
        playerBoard.style.marginLeft = '0px'

    }
    else{
        flipShipBtn.disabled = false;// Deactivate flip btn depending on game state
        fleetStatus.textContent = 'Drag and drop your ships first!' // Tell player to place ships first
        computerGrid.style.display = 'none'

        //display ship placement square
        fleetContainer.style.display = 'flex'
    
        //hide enemy board
        enemyBoardContainer.style.display = 'none'
        //Set adequate style to the player board so that it is centered while they are placing the ships
        playerBoard.style.marginLeft = 'auto'
    }


    //If game ends, present winner
    const scoreContainer = document.querySelector('.score');
    if (match.gameHasEnded) {
        let winnerMessage;
        //Block all interactions with board
        
        if (match.winner === match.humanPlayer) {
            winnerMessage = "Congratulations! <br>You have beaten the computer."
        }
        else if (match.winner === match.computerPlayer) {
            winnerMessage = "The computer has won this time.<br>Try again!"
        }
        scoreContainer.innerHTML = winnerMessage;
    }
   
    

}

export function resetDOM(match){
    //1 - Reset all square
    //1.1 - Get square classes back to only 'square'
    const allSquares = document.querySelectorAll('.square');
    allSquares.forEach(square => {
        square.className = 'square';
        square.style.pointerEvents = "auto";//Make square unclickable
    })

    //1.2 - Remove all listeners from squares by cloning them and replacing the original by the clone
    allSquares.forEach(square => {
        const newSquare = square.cloneNode(true);
        square.parentNode.replaceChild(newSquare, square)
        square.pointerEvents = 'auto'
    })

    //2 - Empty docked ships fleet-container and refill it with standardFleet
    const fleet = document.querySelector('.fleet');
    fleet.dataset.direction = 'horizontal';
    
    //2.2 - fill docks with ships
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

    //Reset score display
    const scoreContainer = document.querySelector('.score');
    scoreContainer.innerHTML = '<div>Enemy ships remaining: <div class="ships-remaining"></div></div>'


    //Reset buttons event handlers
    const flipShipBtn = document.querySelector('.flip-btn')
    const newFlipBtn = flipShipBtn.cloneNode(true);
    flipShipBtn.parentNode.replaceChild(newFlipBtn, flipShipBtn)
}