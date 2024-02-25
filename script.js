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
                if (board[i][j] === player.name) {
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

    const showBoard = () => console.log(board);

    return {replaceSpace, showBoard, resetBoard, findWinCon};
})();

function createPlayer (name) {
    return {
        name,
        score: 0,
        showScore: function() {
            console.log(`Player ${this.name} Score: ${this.score}`);
        }
    };
}

const GameController = (function () {
    const board = GameBoard;

    const playerO = createPlayer(`O`);
    const playerX = createPlayer(`X`);

    let gameOver = false;
    let currentPlayer = playerO;
    displayTurnMessage();

    function displayTurnMessage () {
        board.showBoard();
        const turnMessage = `Player ${currentPlayer.name}'s Turn\n` +
                            `Enter the space number you would like to place your symbol on \n` +
                            `(ex. For space 3: "GameController.playTurn(3)")`;
        console.log(turnMessage);
    }

    const playTurn = function (spaceNumber) {
        if (gameOver) {
            return `Game Ended`;
        }

        placeMarker(spaceNumber);
        checkWin(currentPlayer);

        if (!gameOver) {
            switchPlayer();
            displayTurnMessage();
        }
    };

    function switchPlayer () {
        currentPlayer = (currentPlayer == playerO) ? playerX : playerO
    }

    function placeMarker (spaceNumber) {
        if (board.replaceSpace(currentPlayer.name, spaceNumber)) {
            console.log(`Mark has been Placed`);
        } else {
            console.log(`Space Occupied. Please Choose Another Space`);
        }
    }

    function checkWin (currentPlayer) {
        //if win, call gameresult
        const otherPlayer = (currentPlayer == playerO) ? playerX : playerO;

        if (board.findWinCon(currentPlayer)) {
            gameResult(currentPlayer, otherPlayer);
        }
    }

    function gameResult (winner, loser) {
        console.log(`Player ${winner.name} Wins`);

        gameOver = true;
        winner.score++;
        winner.showScore();
        loser.showScore();

        console.log(`Play More? (Type "GameController.playAgain()")`);
    }

    function playAgain () {
        if (gameOver) {
            board.resetBoard();
            currentPlayer = playerO;
            gameOver = false;
            displayTurnMessage();
        } else {
            console.log(`Game has not ended yet`);
        }
    }

    return {
        playTurn, playAgain
    }
})();
