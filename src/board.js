import { Point } from './modules/point.js';
import { LegionSolver } from './modules/legion_solver.js';
import { pieceColours, pieces } from './pieces.js';
import { i18n } from './i18n.js';
import { saveCurrentState, updatePiecesAndSavePreset } from './characters.js';

// Constants for localStorage keys to match those in characters.js
const STORAGE_KEYS = {
    SELECTED_CHARACTERS: 'legionSolver_selectedCharacters_preset_',
    BOARD_STATE: 'legionBoard_preset_',
    BOARD_FILLED: 'boardFilled_preset_',
    ACTIVE_PRESET: 'legionSolver_activePreset'
};

// Get active preset from localStorage or default to 1
let activePreset = localStorage.getItem(STORAGE_KEYS.ACTIVE_PRESET) ? 
    parseInt(localStorage.getItem(STORAGE_KEYS.ACTIVE_PRESET)) : 1;

// Use the preset-specific board state if available
let boardKey = `${STORAGE_KEYS.BOARD_STATE}${activePreset}`;
let board = JSON.parse(localStorage.getItem(boardKey));

// Initialize board size variables
const BOARD_ROWS = 20;
const BOARD_COLS = 22;

// If no board state exists for this preset, initialize a new one
if (!board) {
    console.log(`Initializing new board for preset ${activePreset}`);
    board = [];
    for (let i = 0; i < BOARD_ROWS; i++) {
        board[i] = [];
        for (let j = 0; j < BOARD_COLS; j++) {
            board[i][j] = -1;
        }
    }
    // Save the initialized board to both preset-specific and default keys
    localStorage.setItem(boardKey, JSON.stringify(board));
    localStorage.setItem('legionBoard', JSON.stringify(board));
} else {
    console.log(`Loaded existing board for preset ${activePreset}`);
    // Copy the preset-specific board to the default key for compatibility
    localStorage.setItem('legionBoard', JSON.stringify(board));
}

// Initialize boardFilled count from preset storage or set to 0
let boardFilledKey = `${STORAGE_KEYS.BOARD_FILLED}${activePreset}`;
let boardFilled = localStorage.getItem(boardFilledKey) ? 
    JSON.parse(localStorage.getItem(boardFilledKey)) : 0;

// Ensure standard key is set for compatibility with solver
localStorage.setItem('boardFilled', JSON.stringify(boardFilled));

// Update boardFilled display if the element exists
document.addEventListener('DOMContentLoaded', () => {
    const boardFilledDisplay = document.getElementById('boardFilledValue');
    if (boardFilledDisplay) {
        boardFilledDisplay.innerText = boardFilled;
    }
});

let legionSolvers = [];
let pieceHistory = [];

const states = {
    START: 'start',
    RUNNING: 'running',
    PAUSED: 'paused',
    COMPLETED: 'completed',
}
let state = states.START;

const legionGroups = [];
for (let i = 0; i < 16; i++) {
    legionGroups[i] = [];
}

document.querySelector('#legionBoard tbody').innerHTML =
    board.map(row => `<tr>${row.map(_ => `<td class="legionCell"></td>`).join('')}</tr>`).join('');

drawBoard();
setLegionGroups();

// Recalculate boardFilled from actual board state
for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[0].length; j++) {
        if (board[i][j] === 0) {
            boardFilled++;
        }
    }
}

// Update localStorage with the calculated value
localStorage.setItem(boardFilledKey, JSON.stringify(boardFilled));

// Update the counter display
document.getElementById('boardFilledValue').innerText = `${boardFilled}`;

// Function to update the board display based on the current board state
function updateBoardDisplay() {
    console.log('Updating board display');
    
    // Get the active preset
    activePreset = localStorage.getItem(STORAGE_KEYS.ACTIVE_PRESET) ? 
        parseInt(localStorage.getItem(STORAGE_KEYS.ACTIVE_PRESET)) : 1;
    
    // Try to get the preset-specific board state first
    const boardKey = `${STORAGE_KEYS.BOARD_STATE}${activePreset}`;
    const boardFilledKey = `${STORAGE_KEYS.BOARD_FILLED}${activePreset}`;
    
    let boardData = localStorage.getItem(boardKey);
    
    // If no preset-specific board exists, fall back to the standard key
    if (!boardData) {
        console.log(`No board state found for preset ${activePreset}, checking standard key`);
        boardData = localStorage.getItem('legionBoard');
    }
    
    // Parse the board data if it exists
    if (boardData) {
        board = JSON.parse(boardData);
        console.log(`Loaded board state for preset ${activePreset}`);
        
        // Save to standard key for compatibility with solver
        localStorage.setItem('legionBoard', boardData);
        
        // Recalculate boardFilled
        boardFilled = 0;
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[0].length; j++) {
                if (board[i][j] === 0) {
                    boardFilled++;
                }
            }
        }
        
        // Save boardFilled to both preset-specific and standard keys
        localStorage.setItem(boardFilledKey, JSON.stringify(boardFilled));
        localStorage.setItem('boardFilled', JSON.stringify(boardFilled));
        
        // Update the visual display of the board
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[0].length; j++) {
                const cell = getLegionCell(i, j);
                if (cell) {
                    cell.style.background = pieceColours.get(board[i][j]);
                }
            }
        }
        
        // Update the counter display
        const boardFilledDisplay = document.getElementById('boardFilledValue');
        if (boardFilledDisplay) {
            boardFilledDisplay.innerText = `${boardFilled}`;
        }
        
        // Update borders and colors
        drawBoard();
    } else {
        console.error('No board state found when updating display');
        
        // Initialize new board if no state exists
        board = [];
        for (let i = 0; i < BOARD_ROWS; i++) {
            board[i] = [];
            for (let j = 0; j < BOARD_COLS; j++) {
                board[i][j] = -1;
            }
        }
        
        boardFilled = 0;
        
        // Save the initialized board to both preset-specific and standard keys
        localStorage.setItem(boardKey, JSON.stringify(board));
        localStorage.setItem('legionBoard', JSON.stringify(board));
        localStorage.setItem(boardFilledKey, JSON.stringify(0));
        localStorage.setItem('boardFilled', JSON.stringify(0));
        
        // Update the counter display
        const boardFilledDisplay = document.getElementById('boardFilledValue');
        if (boardFilledDisplay) {
            boardFilledDisplay.innerText = '0';
        }
        
        // Update the board display
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[0].length; j++) {
                const cell = getLegionCell(i, j);
                if (cell) {
                    cell.style.background = pieceColours.get(board[i][j]);
                }
            }
        }
        
        // Update borders and colors
        drawBoard();
    }
}

// Make updateBoardDisplay globally accessible
window.updateBoardDisplay = updateBoardDisplay;

let isBigClick = false;
if (localStorage.getItem("isBigClick")) {
    document.getElementById("bigClick").checked = JSON.parse(localStorage.getItem("isBigClick"));
    if (JSON.parse(localStorage.getItem("isBigClick"))) {
        activateBigClick();
    }
}

let isLiveSolve = false;
if (localStorage.getItem("isLiveSolve")) {
    document.getElementById("liveSolve").checked = JSON.parse(localStorage.getItem("isLiveSolve"));
    if (JSON.parse(localStorage.getItem("isLiveSolve"))) {
        activateLiveSolve();
    }
}

document.getElementById("bigClick").addEventListener("click", activateBigClick);
document.getElementById("liveSolve").addEventListener("click", activateLiveSolve);
document.getElementById("clearBoard").addEventListener("click", clearBoard);
document.getElementById("boardButton").addEventListener("click", handleButton);
document.getElementById("resetButton").addEventListener("click", reset);
document.getElementById("darkMode").addEventListener("click", activateDarkMode);

let dragging = false;
let dragValue;
for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[0].length; j++) {
        let grid = getLegionCell(i, j)

        grid.addEventListener("mousedown", () => {
            dragValue = board[i][j] == 0 ? -1 : 0;
            setBoard(i, j, dragValue);
            dragging = true;
        });
        grid.addEventListener("mouseover", () => {
            if (dragging) {
                setBoard(i, j, dragValue);
            } else {
                hoverOverBoard(i, j);
            }
        });
        grid.addEventListener("mouseout", () => {
            if (!dragging) {
                hoverOffBoard(i, j) ;
            }
        });
    }
}
document.documentElement.addEventListener("mouseup", () => { dragging = false });
document.getElementById("legion").addEventListener("dragstart", (evt) => evt.preventDefault());

function setLegionGroups() {
    for (let i = 0; i < board.length / 4; i++) {
        for (let j = i; j < board.length / 2; j++) {
            legionGroups[0].push(new Point(j, i));
            legionGroups[1].push(new Point(i, j + 1))
            legionGroups[2].push(new Point(i, board[0].length - 2 - j))
            legionGroups[3].push(new Point(j, board[0].length - 1 - i))
            legionGroups[4].push(new Point(board.length - 1 - j, board[0].length - 1 - i))
            legionGroups[5].push(new Point(board.length - 1 - i, board[0].length - 2 - j))
            legionGroups[6].push(new Point(board.length - 1 - i, j + 1))
            legionGroups[7].push(new Point(board.length - 1 - j, i))
        }
    }
    for (let i = board.length / 4; i < board.length / 2; i++) {
        for (let j = i; j < board.length / 2; j++) {
            legionGroups[8].push(new Point(j, i));
            legionGroups[9].push(new Point(i, j + 1));
            legionGroups[10].push(new Point(3 * board.length / 4 - 1 - j, board.length / 4 + 1 + i));
            legionGroups[11].push(new Point(j, board[0].length - 1 - i));
            legionGroups[12].push(new Point(board.length - 1 - j, board[0].length - 1 - i));
            legionGroups[13].push(new Point(j + board.length / 4, i + board.length / 4 + 1));
            legionGroups[14].push(new Point(j + board.length / 4, 3 * board.length / 4 - i));
            legionGroups[15].push(new Point(board.length - j - 1, i));
        }
    }
}

function setLegionBorders() {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            getLegionCell(i, j).style.borderWidth = '1px';
        }
    }
    for (let i = 0; i < board[0].length / 2; i++) {
        getLegionCell(i, i).style.borderTopWidth = '3px';
        getLegionCell(i, i).style.borderRightWidth = '3px';
        getLegionCell(board.length - i - 1, i).style.borderBottomWidth = '3px';
        getLegionCell(board.length - i - 1, i).style.borderRightWidth = '3px';
        getLegionCell(i, board[0].length - i - 1).style.borderTopWidth = '3px';
        getLegionCell(i, board[0].length - i - 1).style.borderLeftWidth = '3px';
        getLegionCell(board.length - i - 1, board[0].length - i - 1).style.borderBottomWidth = '3px';
        getLegionCell(board.length - i - 1, board[0].length - i - 1).style.borderLeftWidth = '3px';
    }
    for (let i = 0; i < board.length; i++) {
        getLegionCell(i, 0).style.borderLeftWidth = '3px';
        getLegionCell(i, board[0].length / 2).style.borderLeftWidth = '3px';
        getLegionCell(i, board[0].length - 1).style.borderRightWidth = '3px';
    }
    for (let i = 0; i < board[0].length; i++) {
        getLegionCell(0, i).style.borderTopWidth = '3px';
        getLegionCell(board.length / 2, i).style.borderTopWidth = '3px';
        getLegionCell(board.length - 1, i).style.borderBottomWidth = '3px';
    }
    for (let i = board.length / 4; i < 3 * board.length / 4; i++) {
        getLegionCell(i, Math.floor(board[0].length / 4)).style.borderLeftWidth = '3px';
        getLegionCell(i, Math.floor(3 * board[0].length / 4)).style.borderRightWidth = '3px';
    }
    for (let i = Math.ceil(board[0].length / 4); i < Math.floor(3 * board[0].length / 4); i++) {
        getLegionCell(board.length / 4, i).style.borderTopWidth = '3px';
        getLegionCell(3 * board.length / 4, i).style.borderTopWidth = '3px';
    }
}

let isDarkMode = false;
if (localStorage.getItem("isDarkMode")) {
    document.getElementById("darkMode").checked = JSON.parse(localStorage.getItem("isDarkMode"));
    if (JSON.parse(localStorage.getItem("isDarkMode"))) {
        activateDarkMode();
    }
}


function findGroupNumber(i, j) {
    for (let k = 0; k < legionGroups.length; k++) {
        for (let point of legionGroups[k]) {
            if (point.x == i && point.y == j) {
                return k;
            }
        }
    }
}

function getLegionCell(i, j) {
    return document.getElementById("legionBoard")
    .getElementsByTagName("tr")[i]
    .getElementsByTagName("td")[j];
}

function clearBoard() {
    console.log(`Clearing board for preset ${activePreset}`);
    
    // Get the active preset
    activePreset = localStorage.getItem(STORAGE_KEYS.ACTIVE_PRESET) ? 
        parseInt(localStorage.getItem(STORAGE_KEYS.ACTIVE_PRESET)) : 1;
    
    // Clear the board array
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            board[i][j] = -1;
            const cell = getLegionCell(i, j);
            if (cell) {
                cell.style.background = pieceColours.get(board[i][j]);
            }
        }
    }
    
    // Reset the filled count
    boardFilled = 0;
    
    // Save to both preset-specific and standard keys
    const boardKey = `${STORAGE_KEYS.BOARD_STATE}${activePreset}`;
    const boardFilledKey = `${STORAGE_KEYS.BOARD_FILLED}${activePreset}`;
    
    localStorage.setItem(boardKey, JSON.stringify(board));
    localStorage.setItem('legionBoard', JSON.stringify(board));
    
    localStorage.setItem(boardFilledKey, JSON.stringify(0));
    localStorage.setItem('boardFilled', JSON.stringify(0));
    
    // Update the display
    const boardFilledDisplay = document.getElementById('boardFilledValue');
    if (boardFilledDisplay) {
        boardFilledDisplay.innerText = '0';
    }
    
    // Update borders and colors
    drawBoard();
    
    // Save the complete state (both board and characters)
    if (typeof updatePiecesAndSavePreset === 'function') {
        updatePiecesAndSavePreset();
    }
    
    console.log(`Board cleared for preset ${activePreset}`);
}

function setBoard(i, j, value) {
    if (state != states.START) {
        return;
    }

    if (isBigClick) {
        if (value == 0) {
            for (let point of legionGroups[findGroupNumber(i, j)]) {
                let grid = getLegionCell(point.x, point.y);
                grid.style.background = pieceColours.get(0);
                if (board[point.x][point.y] == -1) {
                    boardFilled++;
                }
                board[point.x][point.y] = 0;
            }
        } else {
            for (let point of legionGroups[findGroupNumber(i, j)]) {
                let grid = getLegionCell(point.x, point.y);
                grid.style.background = pieceColours.get(-1);
                if (board[point.x][point.y] == 0) {
                    boardFilled--;
                }
                board[point.x][point.y] = -1;
            }
        }
    } else {
        let grid = getLegionCell(i, j);
        if (value == -1) {
            if (board[i][j] != -1) {
                board[i][j] = -1;
                grid.style.background = pieceColours.get(-1);
                boardFilled--;
            }
        } else {
            if (board[i][j] != 0) {
                board[i][j] = 0;
                grid.style.background = pieceColours.get(0);
                boardFilled++;
            }
        }
    }
    
    // Save to both preset-specific and standard keys
    const boardKey = `${STORAGE_KEYS.BOARD_STATE}${activePreset}`;
    const boardFilledKey = `${STORAGE_KEYS.BOARD_FILLED}${activePreset}`;
    
    localStorage.setItem(boardKey, JSON.stringify(board));
    localStorage.setItem('legionBoard', JSON.stringify(board));
    
    localStorage.setItem(boardFilledKey, JSON.stringify(boardFilled));
    localStorage.setItem('boardFilled', JSON.stringify(boardFilled));
    
    document.getElementById('boardFilledValue').innerText = `${boardFilled}`;
    
    // Save the complete state (both board and characters)
    updatePiecesAndSavePreset();
}

function hoverOverBoard(i, j) {
    if (state != states.START) {
        return;
    }
    if (isBigClick) {
        for (let point of legionGroups[findGroupNumber(i, j)]) {
            if (board[point.x][point.y] == -1) {
                if (isDarkMode) {
                    getLegionCell(point.x, point.y).style.background = 'dimgrey';
                } else {
                    getLegionCell(point.x, point.y).style.background = 'silver';
                }
            } else {
                if (isDarkMode) {
                    getLegionCell(point.x, point.y).style.background = 'rgb(20, 20, 20)';
                } else {
                    getLegionCell(point.x, point.y).style.background = 'dimgrey';
                }

            }

        }
    } else {
        if (board[i][j] == -1) {
            if (isDarkMode) {
                getLegionCell(i, j).style.background = 'dimgrey';
            } else {
                getLegionCell(i, j).style.background = 'silver';
            }
        } else {
            if (isDarkMode) {
                getLegionCell(i, j).style.background = 'rgb(20, 20, 20)';
            } else {
                getLegionCell(i, j).style.background = 'dimgrey';
            }
        }

    }
}

function hoverOffBoard(i, j) {
    if (state != states.START) {
        return;
    }
    if (isBigClick) {
        for (let point of legionGroups[findGroupNumber(i, j)]) {
            if (board[point.x][point.y] == -1) {
                getLegionCell(point.x, point.y).style.background = pieceColours.get(-1);
            } else {
                getLegionCell(point.x, point.y).style.background = pieceColours.get(0);
            }
        }
    } else {
        if (board[i][j] == -1) {
            getLegionCell(i, j).style.background = pieceColours.get(-1);
        } else {
            getLegionCell(i, j).style.background = pieceColours.get(0);
        }
    }
}

function resetBoard() {
    for (let k = 0; k < legionSolvers.length; k++) {
        for (let i = 0; i < legionSolvers[k].board.length; i++) {
            for (let j = 0; j < legionSolvers[k].board[0].length; j++) {
                if (k == 0) {
                    getLegionCell(i, j).style.borderWidth = '1px';
                    if (legionSolvers[k].board[i][j] >= 0) {
                        getLegionCell(i, j).style.background = pieceColours.get(0);
                        legionSolvers[k].board[i][j] = 0;
                    }
                } else {
                    if (legionSolvers[k].board[i][j] >= 0) {
                        legionSolvers[k].board[i][j] = 0;
                    }
                }
            }
        }
    }


    setLegionBorders();
    legionSolvers = [];
}

function drawBoard() {
    setLegionBorders();
    colourBoard();
}

function colourBoard() {
    let cell;
    const isDarkMode = document.getElementById("darkMode").checked;
    
    // Set colors based on dark mode
    if (isDarkMode) {
        pieceColours.set(-1, '#2a2a2a');
        pieceColours.set(0, '#444');
    } else {
        pieceColours.set(-1, 'white');
        pieceColours.set(0, 'grey');
    }
    
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            if (board[i][j] != -1) {
                let cell = getLegionCell(i, j);
                let group = findGroupNumber(i, j);
                if (board[i][j] == 0) {
                    cell.style.background = pieceColours.get(0);
                } else if (board[i][j] > 0) {
                    cell.style.background = pieceColours.get(board[i][j]);
                }
            }
        }
    }

    if (pieceHistory.length == 0 && legionSolvers[0]) {
        pieceHistory = legionSolvers[0].history;
    }

    for (let piece of pieceHistory) {
        for (let i = 0; i < piece.length; i++) {
            if (board[piece[i].y][piece[i].x - 1] > 0 && (getLegionCell(piece[i].y, piece[i].x).style.borderLeftWidth == '3px' || getLegionCell(piece[i].y, piece[i].x - 1).style.borderRightWidth == '3px')) {
                getLegionCell(piece[i].y, piece[i].x).style.borderLeftWidth = '1px';
                getLegionCell(piece[i].y, piece[i].x - 1).style.borderRightWidth = '1px';
            }
            if (board[piece[i].y - 1] && board[piece[i].y - 1][piece[i].x] > 0 && (getLegionCell(piece[i].y, piece[i].x).style.borderTopWidth == '3px' || getLegionCell(piece[i].y - 1, piece[i].x).style.borderBottomWidth == '3px' )) {
                getLegionCell(piece[i].y, piece[i].x).style.borderTopWidth = '1px';
                getLegionCell(piece[i].y - 1, piece[i].x).style.borderBottomWidth = '1px';
            }
            for (let j = 0; j < piece.length; j++) {
                if (i != j && piece[i].x - 1 == piece[j].x && piece[i].y == piece[j].y) {
                    getLegionCell(piece[i].y, piece[i].x).style.borderLeftWidth = '0px';
                    if (board[0][piece[i].x - 1]) {
                        getLegionCell(piece[i].y, piece[i].x - 1).style.borderRightWidth = '0px';
                    }
                }
                if (i != j && piece[i].x == piece[j].x && piece[i].y - 1 == piece[j].y) {
                    getLegionCell(piece[i].y, piece[i].x).style.borderTopWidth = '0px';
                    if (board[piece[i].y - 1]) {
                        getLegionCell(piece[i].y - 1, piece[i].x).style.borderBottomWidth = '0px';
                    }
                }
            }
        }
    }
}

function activateDarkMode() {
    let isDarkMode = document.getElementById("darkMode").checked;

    localStorage.setItem("isDarkMode", JSON.stringify(isDarkMode));

    if(isDarkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }

    colourBoard();
}

function activateBigClick() {
    isBigClick = !isBigClick;
    localStorage.setItem("isBigClick", JSON.stringify(isBigClick));
    
    // Save the complete state when user preferences change
    saveCurrentState();
}

function activateLiveSolve() {
    isLiveSolve = !isLiveSolve;
    localStorage.setItem("isLiveSolve", JSON.stringify(isLiveSolve));
    if (isLiveSolve && state != states.COMPLETED) {
        drawBoard();
    }
    
    // Save the complete state when user preferences change
    saveCurrentState();
}

function reset() {
    resetBoard();
    document.getElementById("clearBoard").disabled = false;
    document.getElementById("boardButton").innerText = i18n("start");
    document.getElementById("resetButton").style.visibility = 'hidden';
    document.getElementById("iterations").style.visibility = 'hidden';
    document.getElementById("time").style.visibility = 'hidden';
    document.getElementById("failText").style.visibility = 'hidden';
    pieceHistory = [];
    state = states.START;
    
    // Save the complete state after reset
    saveCurrentState();
}

async function handleButton(evt) {
    switch (state) {
        case states.START:
            evt.target.innerText = i18n("pause");
            document.getElementById("clearBoard").disabled = true;
            state = states.RUNNING;
            let success = await runSolver();
            if (!success) {
              document.getElementById("failText").style.visibility = 'visible';
            }
            evt.target.innerText = i18n("reset");
            state = states.COMPLETED;
            break;
        case states.RUNNING:
            evt.target.innerText = i18n("continue");
            for (let solvers of legionSolvers) {
                solvers.pause();
            }
            state = states.PAUSED;
            document.getElementById("resetButton").style.visibility = 'visible';
            break;
        case states.PAUSED:
            evt.target.innerText = i18n("pause");
            pieceHistory = [];
            for (let solvers of legionSolvers) {
                solvers.continue();
            }
            state = states.RUNNING
            document.getElementById("resetButton").style.visibility = 'hidden';
            break;
        case states.COMPLETED:
            reset();
            break;
    }
}

async function runSolver() {
    if (boardFilled == 0 && currentPieces > 0) {
        return false;
    }
    
    // CRITICAL FIX: Make sure pieces array is updated from selected characters
    console.log("Ensuring pieces array is updated before solving...");
    
    // Direct approach to update pieces from selected characters
    const selectedPieces = document.querySelectorAll('.selectedPiece');
    const pieceCountByIndex = {};
    
    // Detailed logging of each selected piece
    console.log(`Found ${selectedPieces.length} selected pieces:`);
    selectedPieces.forEach(piece => {
        const characterName = piece.querySelector('.characterName')?.textContent || 'Unknown';
        const characterLevel = piece.querySelector('.characterLevel')?.textContent || 'Unknown';
        const characterClass = piece.getAttribute('data-character-class') || piece.dataset.characterClass || 'unknown';
        const pieceIndex = parseInt(piece.getAttribute('data-piece-index') || piece.dataset.pieceIndex) || 0;
        
        console.log(`- ${characterName} (${characterClass} ${characterLevel}): Using piece index ${pieceIndex}`);
        
        pieceCountByIndex[pieceIndex] = (pieceCountByIndex[pieceIndex] || 0) + 1;
    });
    
    // Reset all piece amounts first
    pieces.forEach(piece => {
        if (piece && typeof piece === 'object') {
            piece.amount = 0;
        }
    });
    
    // Then update with our counts and show shape of each piece
    console.log("Updating piece amounts and visualizing shapes:");
    for (const [pieceIndex, count] of Object.entries(pieceCountByIndex)) {
        const index = parseInt(pieceIndex) - 1; // pieceIndex is 1-based, array is 0-based
        if (index >= 0 && index < pieces.length && pieces[index]) {
            pieces[index].amount = count;
            
            // Visualize the shape for verification
            console.log(`Piece #${pieceIndex} (amount: ${count}):`);
            if (pieces[index].shape) {
                // Convert shape to ASCII art for console viewing
                const shapeLines = [];
                pieces[index].shape.forEach(row => {
                    let rowString = '  ';
                    row.forEach(cell => {
                        rowString += cell === 0 ? '□ ' : (cell === 1 ? '■ ' : '▣ ');
                    });
                    shapeLines.push(rowString);
                });
                console.log(shapeLines.join('\n'));
                
                // Also show point shape that solver actually uses
                if (pieces[index].pointShape) {
                    console.log(`  Point shape (${pieces[index].pointShape.length} points):`);
                    const points = pieces[index].pointShape.map(p => 
                        `    (${p.x},${p.y})${p.isMiddle ? ' [middle]' : ''}`
                    ).join('\n');
                    console.log(points);
                }
            } else {
                console.warn(`  No shape defined for piece #${pieceIndex}`);
            }
        } else {
            console.warn(`Piece index ${pieceIndex} (${index} in array) is out of range. Array length: ${pieces.length}`);
        }
    }
    
    // Call global update function if available
    if (typeof window.updatePiecesForSolver === 'function') {
        window.updatePiecesForSolver();
    }
    
    // Check if any pieces have amounts set
    let hasPieces = false;
    pieces.forEach((piece, index) => {
        if (piece.amount > 0) {
            console.log(`Piece ${index + 1} amount:`, piece.amount);
            hasPieces = true;
        }
    });
    
    if (!hasPieces) {
        console.error("No pieces were selected! Make sure pieces are being added correctly.");
        alert("No pieces were selected! Please select at least one character piece.");
        return false;
    }
    
    // Check if board has any filled spaces
    let hasFilledSpaces = false;
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            if (board[i][j] === 0) { // 0 means filled space to solve
                hasFilledSpaces = true;
                break;
            }
        }
        if (hasFilledSpaces) break;
    }
    
    if (!hasFilledSpaces) {
        console.error("No spaces were selected on the board! You need to fill in some spaces.");
        alert("No spaces were filled on the board! Click on the grid to fill some spaces.");
        return false;
    }
    
    console.log("==================================");
    
    let downBoard = [];
    for (let i = 0; i < board.length; i++) {
        downBoard[i] = [];
        for (let j = 0; j < board[0].length; j++) {
            downBoard[i][j] = board[board.length - 1 - i][board[0].length - 1 - j];
        }
    }
    let rightBoard = [];
    for (let i = 0; i < board[0].length; i++) {
        rightBoard[i] = [];
        for (let j = 0; j < board.length; j++) {
            rightBoard[i][j] = board[board.length - j - 1][i];
        }
    }
    let leftBoard = [];
    for (let i = 0; i < board[0].length; i++) {
        leftBoard[i] = [];
        for (let j = 0; j < board.length; j++) {
            leftBoard[i][j] = board[j][board[0].length - 1 - i];
        }
    }

    pieceHistory = [];
    legionSolvers.push(new LegionSolver(board, _.cloneDeep(pieces), onBoardUpdated));
    legionSolvers.push(new LegionSolver(rightBoard, _.cloneDeep(pieces), () => false));
    legionSolvers.push(new LegionSolver(downBoard, _.cloneDeep(pieces), () => false));
    legionSolvers.push(new LegionSolver(leftBoard, _.cloneDeep(pieces), () => false));

    let runRotated = legionSolvers[0].longSpaces.length != 0;
    const boardPromise = legionSolvers[0].solve();
    let success;
    if (runRotated) {
        const rightBoardPromise = legionSolvers[1].solve();
        const downBoardPromise = legionSolvers[2].solve();
        const leftBoardPromise = legionSolvers[3].solve();
        success = await Promise.race([boardPromise, rightBoardPromise, downBoardPromise, leftBoardPromise]);
    } else {
        success = await boardPromise;
    }

    for (let solver of legionSolvers) {
        solver.stop();
    }

    let finishedSolver;

    if (legionSolvers[0].success !== undefined) {
        for (let i = 0; i < legionSolvers[0].board.length; i++) {
            for (let j = 0; j < legionSolvers[0].board[0].length; j++) {
                board[i][j] = legionSolvers[0].board[i][j];
            }
        }
        finishedSolver = legionSolvers[0];
        pieceHistory = legionSolvers[0].history;
    } else if (legionSolvers[1].success !== undefined) {
        for (let i = 0; i < legionSolvers[1].board[0].length; i++) {
            for (let j = 0; j < legionSolvers[1].board.length; j++) {
                board[i][j] = legionSolvers[1].board[j][legionSolvers[1].board[0].length - 1 - i];
            }
        }

        for (let piece of legionSolvers[1].history) {
            for (let point of piece) {
                let holder = point.y
                point.y = legionSolvers[1].board[0].length - 1 - point.x
                point.x = holder;
            }
        }
        finishedSolver = legionSolvers[1];
        pieceHistory = legionSolvers[1].history
    } else if (legionSolvers[2].success !== undefined) {
        for (let i = 0; i < legionSolvers[2].board.length; i++) {
            for (let j = 0; j < legionSolvers[2].board[0].length; j++) {
                board[i][j] = legionSolvers[2].board[legionSolvers[2].board.length - 1 - i][legionSolvers[2].board[0].length - 1 - j];
            }
        }

        for (let piece of legionSolvers[2].history) {
            for (let point of piece) {
                point.y = legionSolvers[2].board.length - 1 - point.y
                point.x = legionSolvers[2].board[0].length - 1 - point.x
            }
        }
        finishedSolver = legionSolvers[2];
        pieceHistory = legionSolvers[2].history
    } else if (legionSolvers[3].success !== undefined) {
        for (let i = 0; i < legionSolvers[3].board[0].length; i++) {
            for (let j = 0; j < legionSolvers[3].board.length; j++) {
                board[i][j] = legionSolvers[3].board[legionSolvers[3].board.length - j - 1][i];
            }
        }

        for (let piece of legionSolvers[3].history) {
            for (let point of piece) {
                let holder = point.x
                point.x = legionSolvers[3].board.length - 1 - point.y
                point.y = holder
            }
        }
        finishedSolver = legionSolvers[3];
        pieceHistory = legionSolvers[3].history
    }

    document.getElementById("iterations").style.visibility = 'visible';
    document.getElementById("iterationsValue").innerText = `${finishedSolver.iterations}`;

    document.getElementById("time").style.visibility = 'visible';
    document.getElementById("timeValue").innerText = `${new Date().getTime() - finishedSolver.time}ms`;
    if (success) {
        drawBoard();
    }
    return success;
}

function onBoardUpdated() {
    if (isLiveSolve) {
        drawBoard();
    }
}

// Initialize dark mode from localStorage
function initDarkMode() {
    const savedDarkMode = localStorage.getItem("isDarkMode");
    if (savedDarkMode) {
        const isDarkMode = JSON.parse(savedDarkMode);
        document.getElementById("darkMode").checked = isDarkMode;
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        }
    }
    colourBoard();
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initDarkMode();
});

export { pieceColours };