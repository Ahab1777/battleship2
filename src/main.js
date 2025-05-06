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

    //identify number of ships to check if game can be started
    const totalShips = match.standardFleet.length;
    
    //Place computer ships
    resetDOM(match)
    match.positionShips()
    
    

    //Add flip ships button
    const flipShipBtn = document.querySelector('.flip-btn')
    flipShipBtn.addEventListener('click', () => {
        flipShips();
        render(match)
    })
    
    //Add handlers to make grid a drop zone
    const playerSquareNodeList = document.querySelectorAll(`.player-container .square`)
    playerSquareNodeList.forEach(square => {
        //...In with the new.
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

            //Check if all ships are positioned to start the game
            if (totalShips === playerGameboard._fleet.length) {
                //Remove pointer styles once fleet is positioned
                const playerSquareNodeList = document.querySelectorAll(`.player-container .square`)
                playerSquareNodeList.forEach(square => {
                    square.style.pointerEvents = "none";
                })
                //Add attack handler to enemy grid
                const computerSquareNodeList = document.querySelectorAll(`.computer-container .square`)
                computerSquareNodeList.forEach(square => {
                    square.addEventListener('click', () => {
                        //If game ended, prevent click
                        
                        if (match.gameHasEnded) return;

                        //If square already hit, prevent another hit
                        if(
                            square.classList.contains('miss') || 
                            square.classList.contains('hit') || 
                            square.classList.contains('sunk'))
                            {
                                return
                            }

                        //Add attack function
                        const coordinate = square.getAttribute('data-pos');
                
                        match.makeAttack(coordinate);
                        render(match);
                        match.checkWinCon();
                        console.log("🚀 ~ square.addEventListener ~ match:", match)

                        if (match.gameHasEnded) return; // Stop if the game has ended
                        match.togglePlayers();
                
                        // Make the board unclickable
                        computerSquareNodeList.forEach((square) => {
                            square.style.pointerEvents = "none";
                        });
                
                        // Re-enable the board after the computer's turn
                        setTimeout(() => {
                            computerSquareNodeList.forEach((square) => {
                            square.style.pointerEvents = "auto";
                            });
                        }, 500); // Match the delay of the computer's attack
                
                        // Disable the clicked square
                        // square.style.pointerEvents = "none";
                        // Computer's attack
                        setTimeout(() => {
                            // Add a delay to simulate the computer "thinking"
                            match.makeAttack();
                            render(match);
                            match.checkWinCon();
                            if (match.gameHasEnded) return; // Stop if the game has ended
                            match.togglePlayers();
                            render(match);
                        }, 500); // 500ms delay
                    })
                })                
                render(match)
                return
            }
            render(match)
        });
    })
    render(match)
})
