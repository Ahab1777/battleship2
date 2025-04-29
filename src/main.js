import Game from "./game.js";
import Player from "./player.js";



const newGameBtn = document.querySelector('.new-game');
newGameBtn.addEventListener('click', () => {
    //Create new players and match
    let player = new Player('player');
    let computer = new Player('computer');''
    let match = new Game(player, computer);

    //Place computer ships
    match.positionShips()

})