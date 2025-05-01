import Game from "./game.js";
import Player from "./player.js";
import Gameboard from "./gameboard.js";
import { render, resetDOM } from "./dom-manager.js";
import { dragOver, dragEnter, dragLeave, drop, flipShips } from "./utils.js";



const newGameBtn = document.querySelector('.new-game');
newGameBtn.addEventListener('click', () => {
    //Create new players and match
    let playerGameboard = new Gameboard;
    let computerGameboard = new Gameboard;
    let player = new Player('player', playerGameboard);
    let computer = new Player('computer', computerGameboard);''
    let match = new Game(player, computer);

    //Place computer ships
    resetDOM(match)
    match.positionShips()
    render(match)

    //Add flip ships button
    const flipShipBtn = document.querySelector('.flip-btn')
    flipShipBtn.addEventListener('click', () => {
        flipShips();
        render(match)
    })

    //Make player's board a drop-zone
    const playerSquareNodeList = document.querySelectorAll(`.player-container .square`)
    playerSquareNodeList.forEach(square => {
        const getShipAtFunction = player.gameboard.getShipAt.bind(player.gameboard);
        const placeShipFunction = player.gameboard.placeShip.bind(player.gameboard)


        square.addEventListener('dragenter', dragEnter)
        square.addEventListener('dragover', (e) => {
            dragOver(e, getShipAtFunction)
        });
        square.addEventListener('dragleave', (e) => {
            dragLeave(e)
            render(match)
        });
        square.addEventListener('drop', (e) => {
            drop(e, placeShipFunction, getShipAtFunction);
            render(match)
        });

        
    })

})