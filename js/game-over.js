'use strict';

const WIN = 'WIN';
const LOOSE = 'LOOSE';
const WIN_EMOJI = '🥳';
const LOOSE_EMOJI = '😵';

function checkGameOver() {
    if (gGame.clickedMinesCount === gLevel.MINES) gameOver(LOOSE);
    else if (gGame.shownCount === gLevel.SIZE ** 2 - gLevel.MINES +
        (TOTAL_LIVES_COUNT - gGame.livesCount)) gameOver(WIN);
}

function gameOver(state) {
    clearInterval(gTimerIntervalId);
    gGame.isOn = false;

    if (state === LOOSE) {
        showUnflaggedMines();
        document.querySelector('.restart').innerText = LOOSE_EMOJI;

    } else if (state === WIN) {
        if (gGame.markedCount < gLevel.MINES) flagAllUnmarked();
        document.querySelector('.restart').innerText = WIN_EMOJI;
    }

    addGameEndedClass();
}

// lost game- show all unflagged mines
function showUnflaggedMines() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            var currCell = gBoard[i][j];
            if (currCell.isMine && !currCell.isMarked) currCell.isShown = true;
        }
    }
    renderBoard();
}

// won game- flag all remaining unflagged mines
function flagAllUnmarked() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            var currCell = gBoard[i][j];
            if (currCell.isMine && !currCell.isMarked) currCell.isMarked = true;
        }
    }
    renderBoard();
}

// no pointer cursor on unshown cells after game over
function addGameEndedClass() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            var currCell = gBoard[i][j];
            if (!currCell.isShown) {
                var elCell = document.querySelector(`[data-cell="${i}-${j}"]`);
                elCell.classList.add('not-pointer');
            }
        }
    }
}