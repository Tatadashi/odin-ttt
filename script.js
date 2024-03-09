const GameBoard = (function () {
    const board = [];
    const rows = 3;
    const columns = 3;
    
    //store 3x3 board as a 2d array
    let counter = 1;
    for (let i = 0; i < rows; i++) {
        board[i] = [];
        for (let j = 0; j < columns; j++) {
            board[i].push(counter);
            counter++;
        }
    }
    
    const replaceSpace = function (player, spaceNumber) {
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                if (board[i][j] === spaceNumber) {
                    board[i][j] = player;
                    return true;
                }
            }
        }

        return false;
    }

    const resetBoard = function () {
        let counter = 1;
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                board[i][j] = counter;
                counter++;
            }
        }
    }

    //gets the indices of the 2d board where it is occupied by player (argument)
    function createMatchArray (player) {
        let matches = []
        let originalElementID = 0;
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                if (board[i][j] === player.symbol) {
                    matches.push(originalElementID);
                }
                originalElementID++;
            }
        }
        return matches;
    }

    function findWinCon (player) {
        const matches = createMatchArray(player);
        let isWin = false;

        //checks if matches array contains a specific set of values
        const checker = (match, set) => set.every(v => match.includes(v));

        //horizontal matches
        const horizontalLeft = [0,1,2];
        const horizontalMiddle = [3,4,5];
        const horizontalRight = [6,7,8];

        //vertical matches
        const verticalLeft = [0,3,6];
        const verticalMiddle = [1,4,7];
        const verticalRight = [2,5,8];

        //diagonal matches
        const diagonalDown = [0,4,8];
        const diagonalUp = [2,4,6];

        //array of winning sets
        const setArray = [horizontalLeft, horizontalMiddle, horizontalRight, verticalLeft, verticalMiddle, verticalRight, diagonalDown, diagonalUp];

        //check if matches has any of the sets
        setArray.forEach((set) => {
            if (checker(matches, set)) {
                isWin = true;
            }
        });
        
        return isWin;
    }

    function showBoard1D () {
        let oneD = [];

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                oneD.push(board[i][j]);
            }
        }

        return oneD;
    }

    return {replaceSpace, showBoard1D, resetBoard, findWinCon};
})();

function createPlayer (symbol) {
    return {symbol,name: symbol, score: 0};
}

const GameController = function () {
    const board = GameBoard;

    const playerO = createPlayer(`O`);
    const playerX = createPlayer(`X`);

    let gameOver = false;
    let currentPlayer = playerO;
    let spacesLeft = 9;

    function displayTurnMessage () {
        if (!gameOver) {
            const turnMessage = `(${currentPlayer.symbol}) Player ${currentPlayer.name}'s Turn`;
            ScreenController.renderMessage(`${turnMessage}`)
        }
    }

    const playTurn = function (spaceNumber) {
        if (!gameOver) {
            placeMarker(spaceNumber);
        }
    };

    function switchPlayer () {
        currentPlayer = (currentPlayer == playerO) ? playerX : playerO
    }

    function placeMarker (spaceNumber) {
        if (board.replaceSpace(currentPlayer.symbol, spaceNumber)) {
            spacesLeft--;
            ScreenController.renderBoard(GameBoard.showBoard1D());

            checkWin(currentPlayer);
            switchPlayer();

            if (spacesLeft == 0 && !gameOver) {
                ScreenController.renderMessage(`Draw!`);
                gameOver = true;
            } else if (!gameOver) {
                displayTurnMessage();
            }
        }
    }

    function checkWin (currentPlayer) {
        if (board.findWinCon(currentPlayer)) {
            gameResult(currentPlayer);
        }
    }

    function gameResult (winner) {
        //winner
        gameOver = true;
        winner.score++;
        ScreenController.renderMessage(`(${winner.symbol}) Player ${winner.name} Wins!`)
        ScreenController.renderStats();
    }

    function playAgain () {
        if (gameOver || spacesLeft == 0) {
            board.resetBoard();
            ScreenController.renderBoard(GameBoard.showBoard1D());
            gameOver = false;
            spacesLeft = 9;
            displayTurnMessage();
        }
    }

    return {playTurn, playAgain, playerO, playerX, displayTurnMessage}
};

const ScreenController = (function () {
    const game = GameController();
    const boardArray = GameBoard.showBoard1D();

    renderBoard(boardArray);
    renderStats();

    const form = document.querySelector(`form`);
    form.addEventListener(`submit`, (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const name = formData.get(`name`);
        const player = formData.get(`player`);

        changeName(player, name);
        dialog.close();
    });

    function changeName (player, name) {
        if (player == game.playerO.symbol) {
            game.playerO.name = name;
        } else {
            game.playerX.name = name;
        }
        
        game.displayTurnMessage();
        renderStats();
    }

    (function setButtons () {
        const restartButton = document.getElementById(`restart`);
        restartButton.addEventListener(`click`, (e) => {
            game.playAgain();
        });

        const nameButton = document.getElementById(`change-name`);
        nameButton.addEventListener(`click`, (e) => {
            form.reset();
            dialog.showModal();
        });

        const closeModalButton = document.getElementById(`close`);
        closeModalButton.addEventListener(`click`, (e) => {
            dialog.close();
        });
    })();
    
    //changes visual of 3x3 board to match the board array in Gameboard
    function renderBoard (boardArray) {
        boardBoxes = document.querySelectorAll(`#board .symbol-text`);

        boardBoxes.forEach((box, index) => {
            if (typeof boardArray[index] !== `number`) {
                box.innerText = boardArray[index];
            } else {
                box.innerText = ``;
            }
        });
    }

    //add click event for playing a turn to all boxes in 3x3 board
    (function addBoxClicks () {
        boardBoxes = document.querySelectorAll(`#board .box`);

        boardBoxes.forEach((box) => {
            box.addEventListener(`click`, (e) => {
                game.playTurn(Number(box.getAttribute(`box-number`)));
            });
        });
    })();

    //changes message on top middle of screen (announce who wins/whose turn it is)
    function renderMessage (message) {
        gameText = document.querySelector(`#game-text`);
        gameText.innerText = `${message}`;
    }

    //changes stats (info on left and right of board) to match player objects created in GameController
    function renderStats () {
        const oStats = document.getElementById(`player-O`);
        const xStats = document.getElementById(`player-X`);

        let oScore = oStats.querySelector(`.score`);
        oScore.innerText = `Score: ${game.playerO.score} Wins`
        let oName = oStats.querySelector(`.name`);
        oName.innerText = `Name: ${game.playerO.name}`

        let xScore = xStats.querySelector(`.score`);
        xScore.innerText = `Score: ${game.playerX.score} Wins`
        let xName = xStats.querySelector(`.name`);
        xName.innerText = `Name: ${game.playerX.name}`
    }

    return {renderBoard, renderMessage, renderStats};
})();