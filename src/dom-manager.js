import { forceCoordinateToArray } from "./utils";

export function render(match){
    //TODO display enemy fleet remaining

    const player = match.humanPlayer
    const computer = match.computerPlayer

    //1 - Render fleet por custom positioning
    const fleet = document.querySelector('.fleet');

    //1.1 - Set fleet container direction
    const fleetDirection = fleet.dataset.direction //directions are reversed so that ship remain within the boundaries of the fleet container
    if (fleetDirection === 'vertical') {
        fleet.classList.remove('vertical')
        fleet.classList.add('horizontal')

    }
    else if (fleetDirection === 'horizontal') {
        fleet.classList.remove('horizontal')
        fleet.classList.add('vertical')
    }

    //1.2 - Create node of ship elements




    //2 - Render player grid
    const playerGrid = document.querySelector('.player-container');
    const playerSquaresNode = document.querySelectorAll('.player-container .square');
    playerSquaresNode.forEach(square => {
        const position = square.getAttribute('data-pos');
        const [row, col] = forceCoordinateToArray(position);

        const gameboardSquare = player.gameboard._board[row][col]


    })



}