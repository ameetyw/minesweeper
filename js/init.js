'use strict';

const MINE = '💣';
const MARKED = '🚩';
const NUMS = ['', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣'];
const PLAY_EMOJI = '🤓';
const LIFE = '💛';
const HINT = '💡';
const SAFE_CLICK = '🦾';
const TOTAL_LIVES_COUNT = 3;
const TOTAL_HINTS_COUNT = 3;
const TOTAL_SAFE_CLICK_COUNT = 3;

var gGame = {};
var gLevel = { SIZE: 4, MINES: 2 };
var gBoard;
var gTimerIntervalId;
var gMinesAdded;
var gBoardBackups;
var gGameBackups = {};

function init() {
    initializeGameVariables();

    if (gTimerIntervalId) clearInterval(gTimerIntervalId);
    document.querySelector(`[data-id="time"]`).innerText = '0:00.0';

    document.querySelector('.restart').innerText = PLAY_EMOJI;

    gBoard = createBoard(gLevel.SIZE);
    renderBoard();
    renderFeature('lives', gGame.livesCount, LIFE);
    renderFeature('hints', gGame.hintsCount, HINT);
    renderFeature('safe-click', gGame.safeClickCount, SAFE_CLICK);
}

function initializeGameVariables() {
    gGame.isOn = true;
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gGame.secsPassed = 0;
    gGame.clickedMinesCount = 0;
    gGame.livesCount = TOTAL_LIVES_COUNT;
    gGame.hintsCount = TOTAL_HINTS_COUNT;
    gGame.safeClickCount = TOTAL_SAFE_CLICK_COUNT;
    gGame.isHintOn = false;
    gGame.isSafeClickOn = false;
    gMinesAdded = 0;

    gBoardBackups = [];
    gGameBackups = [];
}

function startGame(pos) {
    document.querySelector('.message').style.display = 'none';
    while (gMinesAdded < gLevel.MINES) setMinesAround(pos);
    setNeighMinesCounts();
    turnTimerOn();
    createBackUp();
}

function setMinesAround(pos) {
    var randI = getRandomInt(0, gLevel.SIZE);
    var randJ = getRandomInt(0, gLevel.SIZE);
    var currCell = gBoard[randI][randJ];

    if ((randI === pos.i && randJ === pos.j) || currCell.isMine) return;

    // first click is on position with 0 neighboring mines in medium-high levels
    if (gLevel.SIZE > 4) {
        if ((randI >= pos.i - 1 && randI <= pos.i + 1) &&
            (randJ >= pos.j - 1 && randJ <= pos.j + 1)) {
            return;
        }
    }

    currCell.isMine = true;
    gMinesAdded++;
}

// sets minesAroundCounts for all borad
function setNeighMinesCounts() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cell = gBoard[i][j];
            cell.minesAroundCount = getCellNeighMinesCount({ i, j });
        }
    }
}

// get minesAroundCounts of a cell
function getCellNeighMinesCount(cellPos) {
    var neighMinesCount = 0;
    for (var i = cellPos.i - 1; i <= cellPos.i + 1; i++) {
        if (i < 0 || i >= gLevel.SIZE) continue;
        for (var j = cellPos.j - 1; j <= cellPos.j + 1; j++) {
            if (j < 0 || j >= gLevel.SIZE) continue;
            if (i === cellPos.i && j === cellPos.j) continue;

            if (gBoard[i][j].isMine) neighMinesCount++;
        }
    }
    return neighMinesCount;
}

function createBoard(size) {
    var mat = [];
    for (var i = 0; i < size; i++) {
        var row = [];
        for (var j = 0; j < size; j++) {
            row.push(createCell());
        }
        mat.push(row);
    }
    return mat;
}

function createCell() {
    var cell = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false
    };
    return cell;
}

function setLevel(level) {
    if (level === 1) {
        gLevel.SIZE = 4;
        gLevel.MINES = 2;
    } else if (level === 2) {
        gLevel.SIZE = 8;
        gLevel.MINES = 12;
    } else {
        gLevel.SIZE = 12;
        gLevel.MINES = 30;
    }

    init();
}