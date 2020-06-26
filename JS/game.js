console.log('Playing Mine Sweeper');

const MINE = '&#x1f4a3;';
const FLAG = '&#128681;';
let gBoard;
let gTimeInterval;


// The default level object
let gLevel = {
    SIZE: 8,
    MINES: 10
};

// The object representing the current game
const gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    hints: 3
};

// A function called when page loads
function initGame() {
    clearInterval(gTimeInterval);
    gBoard = buildBoard(gLevel.SIZE);
    renderBoard(gBoard);
    gGame.isOn = false;
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gGame.secsPassed = 0;
    gGame.hints = 3;
    renderTimer();
    toggleSafeClick();
}

// a function that build the board
function buildBoard(size) {
    const board = [];
    for (let i = 0; i < size; i++) {
        board[i] = [];
        for (let j = 0; j < size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
            };
        }
    }
    return board;
}

// render the board to the browzer
function renderBoard(board) {
    let strHtml = '';
    for (let i = 0; i < board.length; i++) {
        let row = board[0];
        strHtml += '<tr>';
        for (let j = 0; j < row.length; j++) {
            strHtml += `<td class="cell cell-${i}-${j}" oncontextmenu="cellMarked(${i}, ${j})"
            onclick="cellClicked(${i}, ${j})"></td>`;
        }
        strHtml += '</tr>';
    }
    const elBoard = document.querySelector('.game-board');
    elBoard.innerHTML = strHtml;
}

// A function that set the level of the game by the user
function setLevel(level) {
    switch (level) {
        case 1:
            gLevel = {SIZE: 4, MINES: 2}; 
            initGame();         
            break;
        case 2: 
            gLevel = {SIZE: 8, MINES: 12};
            initGame();           
            break;
        case 3:
            gLevel = {SIZE: 12, MINES: 30};  
            initGame();             
            break;    
    }
}

// A function that add mines to the board randomly
function addMines(board, num) {
    for (let k = 0; k < num; k++) {
        let i = getRandomInteger(0, board.length - 1);
        let j = getRandomInteger(0, board[0].length - 1)
        if (board[i][j].isMine || board[i][j].isShown) {
            k--;
        } else {
            board[i][j].isMine = true;
            board[i][j].minesAroundCount = null;
            setMinesNegsCount(i, j, board);
        }
    }
}

// A function that counts how many mines next to a cell
function setMinesNegsCount(row, col, board) {
    for (let i = row - 1; i <= row + 1; i++) {
        for (let j = col - 1; j <= col + 1; j++) {
            if (i < 0 || i >= board.length || j < 0 || j >= board[0].length) continue;
            if (i === row && j === col) continue;
            if (!board[i][j].isMine) {
                board[i][j].minesAroundCount++;
            }
        }
    }
}

// Every time a cell is clicked
function cellClicked( i, j) {
    if (gBoard[i][j].isShown || gBoard[i][j].isMarked) return;

    gBoard[i][j].isShown = true;

    if (!gGame.isOn && gGame.shownCount === 0) {
        addMines(gBoard, gLevel.MINES);
        if (gGame.secsPassed === 0) startTimer();
        gGame.isOn = true;
        toggleSafeClick();
    }
    if (!gGame.isOn) return;

    if (gBoard[i][j].isMine) {
        gameOver(false);
        return;
    }
    revealCell({ i: i, j: j });
    if (gBoard[i][j].minesAroundCount === 0) {
        renderCell({ i: i, j: j }, "");
        expandShown(gBoard, i, j);
    } else {
        renderCell({ i: i, j: j }, gBoard[i][j].minesAroundCount);    
    }    
    
    gGame.shownCount++;
    checkGameOver();
}

// Called on right click to mark a cell (suspected to be a mine) 
function cellMarked(i, j) {
    if (gGame.secsPassed === 0) startTimer();
    if (gBoard[i][j].isShown) return;

    if (gBoard[i][j].isMarked) {
        renderCell({ i: i, j: j }, "");
        gBoard[i][j].isMarked = false;
        gGame.markedCount--;
    } else {
        renderCell({ i: i, j: j }, FLAG)
        gBoard[i][j].isMarked = true;
        gGame.markedCount++;
    }
    checkGameOver();
}

// Check if all cells that are not (isMine) open & all flags are marked
function checkGameOver() {
    const cellsWithoutMines = gLevel.SIZE * gLevel.SIZE - gLevel.MINES;
    if (gGame.shownCount === cellsWithoutMines && gGame.markedCount === gLevel.MINES) {
        gameOver(true);
    } 
}

function gameOver(isWon) {
    clearInterval(gTimeInterval);
    gGame.isOn = false;
    if (isWon) {
        alert('You Won!');
    } else {
        for (let i = 0; i < gBoard.length; i++) {
            for (let j = 0; j < gBoard[0].length; j++) {
                if (gBoard[i][j].isMine) {
                    renderCell({ i: i, j: j }, MINE);
                    revealCell({ i: i, j: j });
                    const elCell = document.querySelector(`.cell-${i}-${j}`)
                    elCell.classList.add('mineBgc');
                }
            }
        }
        alert('Oh No! You stepped on a Mine! Game Over!');
    }
}

// When user clicks a cell with 0 mines around it open also its neighbours
function expandShown(board, row, col) {
    for (let i = row - 1; i <= row + 1; i++) {
        for (let j = col - 1; j <= col + 1; j++) {
            if (i < 0 || i >= board.length || j < 0 || j >= board[0].length) continue;
            if (i === row && j === col || board[i][j].isMine || board[i][j].isShown) continue;
            cellClicked(i, j);
        }
    }
}

// A function that give a hint to the user. hint is marked with yellow color for 3 seconds
function getHint() {
    const hintsOpts = [];
    for (let i = 0; i < gLevel.SIZE; i++) {
        for (let j = 0; j < gLevel.SIZE; j++) {
            if (gBoard[i][j].isMine || gBoard[i][j].isShown || gBoard[i][j].isMarked) continue;
            hintsOpts.push({i: i, j: j});
        }
    }
    if (hintsOpts.length === 0 || gGame.hints === 0 || gGame.isOn === false) {
        alert('no possible hints');        
    } else {
        const randPos = getRandomInteger(0, hintsOpts.length);        
        const elCell = document.querySelector(`.cell-${hintsOpts[randPos].i}-${hintsOpts[randPos].j}`)
        elCell.classList.add('hinted');
        gGame.hints--;
        setTimeout(() => elCell.classList.remove('hinted'), 3000)
    }       
}


function inCreaseTime() {
    gGame.secsPassed = gGame.secsPassed + 0.1
    renderTimer();
}

function renderTimer() {
    const elTimer = document.querySelector('.timer')
    elTimer.innerText = ` ${gGame.secsPassed.toFixed(1)}`
}

function startTimer() {
    gTimeInterval = setInterval(inCreaseTime, 100);
}

function toggleSafeClick() {
    const elDiv = document.querySelector('.hints')
    gGame.isOn? elDiv.style.opacity = 1 : elDiv.style.opacity = 0;
}