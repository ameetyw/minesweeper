'use strict';

function renderBoard() {
    var strHTML = '<table><tbody>\n';
    for (var i = 0; i < gBoard.length; i++) {
        strHTML += '\t<tr>\n';
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j];
            var currElCellContent = '';
            var clickedClass = '';
            if (currCell.isShown) {
                clickedClass = ' clicked';
                currElCellContent = (currCell.isMine) ? MINE :
                    NUMS[currCell.minesAroundCount];
            } else if (currCell.isMarked) currElCellContent = MARKED;

            strHTML += `\t\t<td class="cell${clickedClass}" data-cell="${i}-${j}" 
                        onclick="cellClicked(${i}, ${j})" 
                        oncontextmenu="markCell(event,this,${i},${j})">
                        ${currElCellContent}</td>\n`;
        }
        strHTML += '\t</tr>\n';
    }
    strHTML += '</tbody></table>';

    var elGameContainer = document.querySelector('.game-board');
    elGameContainer.innerHTML = strHTML;
}

function showCell(pos) {
    var cell = gBoard[pos.i][pos.j];
    if (cell.isShown) return;
    
    var elCell = document.querySelector(`[data-cell="${pos.i}-${pos.j}"]`);
    if (cell.isMine) elCell.innerText = MINE;
    else elCell.innerText = NUMS[cell.minesAroundCount];
    
    if (gGame.isHintOn || gGame.isSafeClickOn || gManualMode.isOn) {
        elCell.classList.add('hint');
    } else {
        cell.isShown = true;
        gGame.shownCount++;
        elCell.classList.add('clicked');
    }
}

function hideCell(pos) {
    var elCell = document.querySelector(`[data-cell="${pos.i}-${pos.j}"]`);
    var cell = gBoard[pos.i][pos.j];
    if (!cell.isShown) elCell.innerText = '';
    elCell.classList.remove('hint');
}

function renderFeature(featureName, count, SYMBOL) {
    var featureStr = '';
    for (var i = 0; i < count; i++) {
        featureStr += SYMBOL;
    }
    document.querySelector(`[data-id="${featureName}"]`).innerText = featureStr;
}

function createBackUp() {
    gBoardBackups.push(copyBoard(gBoard));
    gGameBackups.push({ ...gGame });
}

function copyBoard(board) {
    var boardCopy = [];
    for (var i = 0; i < board.length; i++) {
        var rowCopy = [];
        for (var j = 0; j < board[0].length; j++) {
            var cellObjCopy = { ...board[i][j] };
            rowCopy.push(cellObjCopy);
        }
        boardCopy.push(rowCopy);
    }
    return boardCopy;
}

function turnTimerOn() {
    gGame.startTime = Date.now();
    gTimerIntervalId = setInterval(updateTimer, 100);
}

function updateTimer() {
    var timeSinceStart = Date.now() - gGame.startTime;
    gGame.secsPassed = new Date(timeSinceStart).toISOString().slice(14, -3);
    document.querySelector(`[data-id="time"]`).innerText = gGame.secsPassed;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}