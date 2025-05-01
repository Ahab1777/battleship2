import Game from "./game.js";
import Player from "./player.js";
import Gameboard from "./gameboard.js";
import { render, resetDOM } from "./dom-manager.js";
import { dragOver, dragEnter, dragLeave, drop, flipShips } from "./utils.js";



const newGameBtn = document.querySelector('.new-game');
newGameBtn.addEventListener('click', () => {
    //Create new players and match
    let playerGameboard = new Gameboard();
    let computerGameboard = new Gameboard();
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

    //TEST
    const testBtn = document.querySelector('#render')
    testBtn.addEventListener('click', (e) => {
        console.log("🚀 ~ newGameBtn.addEventListener ~ playerGameboard:", playerGameboard)
        render(match)
    })

    //Remove old eventListeners
    const playerSquareNodeList = document.querySelectorAll(`.player-container .square`)




    //Remove previous event listeners and add again handler to make grid a drop zone
    playerSquareNodeList.forEach(square => {
        //Out with the old...
        const newSquare = square.cloneNode(true);
        square.parentNode.replaceChild(newSquare, square);

        //...In with the new.
        const getShipAtFunction = player.gameboard.getShipAt.bind(player.gameboard);
        const placeShipFunction = player.gameboard.placeShip.bind(player.gameboard)


        newSquare.addEventListener('dragenter', dragEnter)
        newSquare.addEventListener('dragover', (e) => {
            dragOver(e, getShipAtFunction)
        });
        newSquare.addEventListener('dragleave', (e) => {
            dragLeave(e)
            render(match)
        });
        newSquare.addEventListener('drop', (e) => {
            drop(e, placeShipFunction, getShipAtFunction);
            render(match)
        });

        
    })

})
