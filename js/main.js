'use strict';

var gIsRightClicked = false;

function cellClicked(cellI, cellJ) {
    var cell = gBoard[cellI][cellJ];
    var pos = { i: cellI, j: cellJ };

    // allow exposing flags after game is over
    if (!gGame.isOn) {
        gManualMode.isOn = true; // will label mines in green..
        if (cell.isMarked) showCell(pos);
        return;
    }
    if (gManualMode.isOn) {
        manualMineSet(cell, pos);
        return;
    }
    if (!gGame.secsPassed) startGame(pos);

    if (gGame.isHintOn) showHintAround(pos);
    // cannot click flagged cells
    else if (cell.isMarked) return;
    // right+left click to expand around shown cell
    else if (cell.isShown && gIsRightClicked) {
        expandAround(pos);
        gIsRightClicked = false;
    } else if (cell.isMine) lifeLostAt(pos);
    else if (!cell.minesAroundCount) expandAround(pos);
    else showCell(pos);

    endMove();
}

function markCell(event, elCell, cellI, cellJ) {
    event.preventDefault();
    gIsRightClicked = true;
    var cell = gBoard[cellI][cellJ];
    if (!gGame.isOn || cell.isShown) return;    // gIsRightClick remains true for right+left click

    //unflage a flagged cell
    if (cell.isMarked) {
        gGame.markedCount--;
        elCell.innerText = '';
    } else {
        gGame.markedCount++;
        elCell.innerText = MARKED;
    }

    cell.isMarked = !cell.isMarked;
    elCell.classList.toggle('not-pointer');

    gIsRightClicked = false;
    endMove();
}

// "clicks" on the pos and all its neighbors
function expandAround(pos) {
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= gLevel.SIZE) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= gLevel.SIZE) continue;
            var currCell = gBoard[i][j];
            var currPos = { i, j };
            if (currCell.isShown || currCell.isMarked) continue;
            showCell(currPos);
            if (currCell.isMine) gameOver(LOOSE);
            else if (!currCell.minesAroundCount) expandAround(currPos);
        }
    }
}

function endMove() {
    checkGameOver();
    createBackUp();
}

function lifeLostAt(pos) {
    showCell(pos);
    gGame.livesCount--;
    gGame.clickedMinesCount++;
    var elMineCell = document.querySelector(`[data-cell="${pos.i}-${pos.j}"]`);
    elMineCell.classList.add('clicked-mine');
    renderFeature('lives', gGame.livesCount, LIFE);
    if (!gGame.livesCount) gameOver(LOOSE);
}

function undo() {
    if (!gGame.secsPassed || !gGame.isOn) {
        document.querySelector('.message').style.display = 'block';
        return;
    }
    if (gBoardBackups.length === 1) return; // original state already

    gBoardBackups.pop();
    gGameBackups.pop();

    // copy last state of backup arrays
    gBoard = copyBoard(gBoardBackups.slice(-1)[0]);
    var lastGameState = gGameBackups.slice(-1)[0];

    // restore relevant gGame entries
    gGame.shownCount = lastGameState.shownCount;
    gGame.markedCount = lastGameState.markedCount;
    gGame.clickedMinesCount = lastGameState.clickedMinesCount;

    renderBoard();
}

function hintClicked() {
    checkToShowMessage();
    if (!gGame.hintsCount || !gGame.isOn || !gGame.secsPassed) return;

    gGame.hintsCount--;
    renderFeature('hints', gGame.hintsCount, HINT);
    gGame.isHintOn = true;
    document.querySelector('.hint-text').style.visibility = 'visible';
}

function showHintAround(pos) {
    document.querySelector('.hint-text').style.visibility = 'hidden';
    var hintPositions = getHintPositions(pos);

    for (var i = 0; i < hintPositions.length; i++) {
        showCell(hintPositions[i]);
    }

    setTimeout(function () { hideHintsAt(hintPositions); }, 1500);
    gGame.isHintOn = false;
}

function hideHintsAt(hintPositions) {
    for (var i = 0; i < hintPositions.length; i++) {
        hideCell(hintPositions[i]);
    }
}

function getHintPositions(pos) {
    var hintPositions = [];

    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= gLevel.SIZE) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= gLevel.SIZE) continue;
            hintPositions.push({ i, j });
        }
    }
    return hintPositions;
}

function showSafeClick() {
    checkToShowMessage();
    if (!gGame.safeClickCount || !gGame.isOn || !gGame.secsPassed) return;

    gGame.safeClickCount--;
    renderFeature('safe-click', gGame.safeClickCount, SAFE_CLICK);
    gGame.isSafeClickOn = true;
    var pos = getRandomSafeClick();
    showCell(pos);
    setTimeout(function () { hideCell(pos); }, 1000);
    gGame.isSafeClickOn = false;
}

function getRandomSafeClick() {
    var safePositions = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            var currCell = gBoard[i][j];
            if (!currCell.isShown && !currCell.isMine) safePositions.push({ i, j });
        }
    }

    var randIdx = getRandomInt(0, safePositions.length);
    return safePositions[randIdx];
}

function setManualMode() {
    init();
    gManualMode.isOn = true;

    // show message to add mines
    var elMessage = document.querySelector('.manual-message');
    elMessage.style.display = 'block';
    // show mines left
    var elMinesLeftText = document.querySelector('.mines-left');
    elMinesLeftText.style.display = 'inline-block';
    // show # of mines left
    var elMinesLeftNum = document.querySelector('[data-id="mines-left"]');
    elMinesLeftNum.innerText = gLevel.MINES - gMinesAdded;
}

function manualMineSet(cell, pos) {
    console.log('cell:', cell, 'pos:', pos);
    cell.isMine = true;
    gMinesAdded++;

    showCell(pos);
    gManualMode.minePositions.push(pos);

    var elMinesLeft = document.querySelector('[data-id="mines-left"]');
    elMinesLeft.innerText = gLevel.MINES - gMinesAdded;

    if (gMinesAdded === gLevel.MINES) setTimeout(manualSetDone, 1000);
}

function manualSetDone() {
    gManualMode.isOn = false;

    for (var i = 0; i < gLevel.MINES; i++) {
        var currCellPos = gManualMode.minePositions[i];
        hideCell(currCellPos);
    }

    // hide message
    var elMessage = document.querySelector('.manual-message');
    elMessage.style.display = 'none';
    // hide mines left
    var elMinesLeftText = document.querySelector('.mines-left');
    elMinesLeftText.style.display = 'none';
}

function checkToShowMessage() {
    var elMessage = null;
    
    if (!gGame.isOn) {
        elMessage = document.querySelector('[data-id="message-new"]');
    } else if (!gGame.secsPassed) {
        elMessage = document.querySelector('[data-id="message-start"]');
    }
    
    if (elMessage) {
        elMessage.style.display = 'block';
        setTimeout(function() {
            elMessage.style.display = 'none';
        }, 1000);
    }
}