import { Piece } from './modules/piece.js';
import { sumBy } from 'lodash';
import { i18n, getCurrentLanguage } from './i18n.js';
import { saveCurrentState } from './characters.js';

// Constants for localStorage keys to match those in characters.js
const STORAGE_KEYS = {
    SELECTED_CHARACTERS: 'legionSolver_selectedCharacters',
    BOARD_STATE: 'legionBoard',
    BOARD_FILLED: 'boardFilled',
    PIECE_AMOUNTS: 'pieceAmounts',
    CURRENT_PIECES: 'currentPieces'
};

// TODO: Remove extra 2s.

// Fixed and verified piece shapes for all character classes and levels
const defaultPieces = [
    // Lvl 60 - All classes (index 0)
    [
        [2]
    ],

    // Lvl 100 - All classes (index 1)
    [
        [2, 2]
    ],

    // Lvl 140 Warrior/Pirate (index 2)
    [
        [1, 0],
        [2, 1]
    ],

    // Lvl 140 Mage/Thief/Archer (index 3)
    [
        [1, 2, 1]
    ],

    // Lvl 200 Warrior (index 4)
    [
        [2, 2],
        [2, 2]
    ],

    // Lvl 200 Archer (index 5)
    [
        [1, 2, 2, 1]
    ],

    // Lvl 200 Thief/Lab (index 6)
    [
        [1, 0, 0],
        [1, 2, 1]
    ],

    // Lvl 200 Mage (index 7)
    [
        [0, 1, 0],
        [1, 2, 1]
    ],

    // Lvl 200 Pirate (index 8)
    [
        [1, 2, 0],
        [0, 2, 1]
    ],

    // Lvl 250 Warrior (index 9)
    [
        [1, 1, 2],
        [0, 1, 1]
    ],

    // Lvl 250 Archer (index 10)
    [
        [1, 1, 2, 1, 1]
    ],

    // Lvl 250 Thief (index 11)
    [
        [1, 0, 1],
        [1, 2, 1],
        [1, 0, 1]
    ],

    // Lvl 250 Mage (index 12)
    [
        [0, 1, 0],
        [1, 2, 1],
        [0, 1, 0]
    ],

    // Lvl 250 Pirate (index 13)
    [
        [1, 2, 0, 0],
        [0, 1, 1, 1]
    ],

    // Lvl 250 Xenon (index 14)
    [
        [1, 1, 0],
        [0, 2, 0],
        [0, 1, 1]
    ],
];

const gmsPieces = [
    // Lvl 200 Enhanced Lab
    [
        [1, 0, 0, 0],
        [0, 1, 2, 1]
    ],

    // Lvl 250 Enhanced Lab
    [
        [1, 0, 0, 0, 1],
        [0, 1, 2, 1, 0]
    ],

    // Lvl 250 Lab
    [
        [1, 0, 1],
        [1, 2, 1]
    ],
];

// Create pieces from the defined shapes
const pieces = []
// Reset the Piece ID counter to ensure pieces get IDs starting from 1
Piece.curId = 1;
for (let piece of defaultPieces){
    pieces.push(Piece.createPiece(piece, 0));
}

function hasLabPieces() {
    return !!['GMS', 'TMS'].find(lang => lang === getCurrentLanguage());
}

if (hasLabPieces()) {
    for (let piece of gmsPieces){
        pieces.push(Piece.createPiece(piece, 0));
    }
}

let pieceColours = new Map();
pieceColours.set(-1, 'white');
pieceColours.set(0, 'grey');
for (let i = 0; i < 2; i++) {
    pieceColours.set(1 + i * 18, 'lightpink');
    pieceColours.set(2 + i * 18, 'lightcoral');
    pieceColours.set(3 + i * 18, 'indianred');
    pieceColours.set(4 + i * 18, 'darkseagreen');
    pieceColours.set(5 + i * 18, 'firebrick');
    pieceColours.set(6 + i * 18, 'mediumseagreen');
    pieceColours.set(7 + i * 18, 'purple');
    pieceColours.set(8 + i * 18, 'dodgerblue');
    pieceColours.set(9 + i * 18, 'lightsteelblue');
    pieceColours.set(10 + i * 18, 'maroon');
    pieceColours.set(11 + i * 18, 'green');
    pieceColours.set(12 + i * 18, 'indigo');
    pieceColours.set(13 + i * 18, 'blue');
    pieceColours.set(14 + i * 18, 'cadetblue');
    pieceColours.set(15 + i * 18, 'mediumpurple');
    pieceColours.set(16 + i * 18, 'aquamarine');
    pieceColours.set(17 + i * 18, 'aquamarine');
    pieceColours.set(18 + i * 18, 'aquamarine');
}

// Create hidden piece display elements for the solver to use (compatibility with old code)
function createHiddenPieceDisplays() {
    if (!document.querySelector('#pieceForm form')) {
        return; // Wait for the DOM to be ready
    }
    
    for (let i = 0; i < pieces.length; i++) {
        let row = '<td class="pieceCell"></td>'.repeat(pieces[i].shape[0].length);
        let grid = `<tr>${row}</tr>`.repeat(pieces[i].shape.length);
        document.querySelector('#pieceForm form').innerHTML += `<div class="piece">
            <div id="pieceDescription${i+1}"></div>
            <label for="piece${i+1}">
                <table id="pieceDisplay${i+1}">
                    <tbody>${grid}</tbody>
                </table>
            </label>
            <input id="piece${i+1}" type="number" min=0 value=0>
        </div>`;

        document.getElementById(`pieceDisplay${i+1}`).style.borderCollapse = 'collapse';
        document.getElementById(`pieceDisplay${i+1}`).style.borderSpacing = '0';
        document.getElementById(`pieceDescription${i+1}`).style.paddingRight = '15px';

        for (let j = 0; j < pieces[i].shape.length; j++) {
            for (let k = 0; k < pieces[i].shape[j].length; k++) {
                if (pieces[i].shape[j][k] != 0) {
                    document.getElementById(`pieceDisplay${i+1}`)
                    .getElementsByTagName("tr")[j]
                    .getElementsByTagName("td")[k].style.background = pieceColours.get(i+1);
                }
            }
        }
    }

    // Set piece descriptions
    document.getElementById('pieceDescription1').textContent = i18n('lvl60');
    document.getElementById('pieceDescription2').textContent = i18n('lvl100');
    document.getElementById('pieceDescription3').textContent = i18n('warriorPirate140');
    document.getElementById('pieceDescription4').textContent = i18n('mageThiefArcher140');
    document.getElementById('pieceDescription5').textContent = i18n('warrior200');
    document.getElementById('pieceDescription6').textContent = i18n('archer200');
    document.getElementById('pieceDescription7').textContent = i18n('thiefLab200');
    document.getElementById('pieceDescription8').textContent = i18n('mage200');
    document.getElementById('pieceDescription9').textContent = i18n('pirate200');
    document.getElementById('pieceDescription10').textContent = i18n('warrior250');
    document.getElementById('pieceDescription11').textContent = i18n('archer250');
    document.getElementById('pieceDescription12').textContent = i18n('thief250');
    document.getElementById('pieceDescription13').textContent = i18n('mage250');
    document.getElementById('pieceDescription14').textContent = i18n('pirate250');
    document.getElementById('pieceDescription15').textContent = i18n('xenon250');

    if (hasLabPieces()) {
        document.getElementById('pieceDescription16').textContent = i18n('enhancedLab200');
        document.getElementById('pieceDescription17').textContent = i18n('enhancedLab250');
        document.getElementById('pieceDescription18').textContent = i18n('lab250');
    }
}

// Wait for DOM to be ready before creating piece displays
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createHiddenPieceDisplays);
} else {
    createHiddenPieceDisplays();
}

let currentPieces = 0;
let currentUseCaracterCount = 0;
if (localStorage.getItem(STORAGE_KEYS.CURRENT_PIECES)) {
    currentPieces = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_PIECES));
    document.getElementById('currentPiecesValue').innerText = `${currentPieces}`;
}

let pieceAmounts = JSON.parse(localStorage.getItem(STORAGE_KEYS.PIECE_AMOUNTS))
if (pieceAmounts) {
    document.addEventListener('DOMContentLoaded', () => {
        for (let i = 0; i < pieces.length; i++) {
            const pieceInput = document.getElementById(`piece${i+1}`);
            if (pieceInput) {
                pieceInput.value = pieceAmounts[i] || 0;
            }
        }
        updateCurrentPieces();
    });
}

// Add event listener after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const pieceForm = document.getElementById('pieceForm');
    if (pieceForm) {
        pieceForm.addEventListener("input", updateCurrentPieces);
    }
    
    // No longer need the original clear button event as it's handled in characters.js
});

function updateCurrentPieces() {
    // Prevent recursion
    if (window._isUpdatingCurrentPieces) {
        console.log("Already updating current pieces, preventing recursion");
        return;
    }
    
    window._isUpdatingCurrentPieces = true;
    
    try {
        console.log("Updating current pieces");
        
        // Preserve the current boardFilled value if we're not in the START state
        const solverState = document.getElementById("boardButton")?.innerText || "";
        const isAfterStart = solverState && solverState !== i18n("start");
        const currentBoardFilled = isAfterStart ? localStorage.getItem(STORAGE_KEYS.BOARD_FILLED) : null;
        
        for (let piece of pieces) {
            const pieceInput = document.getElementById(`piece${piece.id}`);
            if (pieceInput) {
                piece.amount = parseInt(pieceInput.value) || 0;
            }
        }

        currentPieces = sumBy(pieces, piece => piece.cellCount * piece.amount);
        currentUseCaracterCount = sumBy(pieces, (piece) => piece.amount);

        localStorage.setItem(STORAGE_KEYS.PIECE_AMOUNTS, JSON.stringify(pieces.map(piece => piece.amount)));
        localStorage.setItem(STORAGE_KEYS.CURRENT_PIECES, JSON.stringify(currentPieces));
        
        // Save character count to localStorage for compatibility
        localStorage.setItem('characterCount', JSON.stringify(currentUseCaracterCount));

        const currentPiecesValue = document.getElementById('currentPiecesValue');
        if (currentPiecesValue) {
            currentPiecesValue.innerText = `${currentPieces}`;
        }
        
        // Check if the element exists before trying to update it
        const currentCaracterCountValue = document.getElementById("currentCaracterCountValue");
        if (currentCaracterCountValue) {
            currentCaracterCountValue.innerText = `${currentUseCaracterCount}`;
        } else {
            console.log("Note: currentCaracterCountValue element not found - this is expected if the element was removed");
        }
        
        // Restore boardFilled if we're not in the START state
        if (isAfterStart && currentBoardFilled) {
            console.log(`Preserving boardFilled value (${currentBoardFilled}) in updateCurrentPieces`);
            localStorage.setItem(STORAGE_KEYS.BOARD_FILLED, currentBoardFilled);
            
            // Update the display
            const boardFilledDisplay = document.getElementById('boardFilledValue');
            if (boardFilledDisplay) {
                boardFilledDisplay.innerText = JSON.parse(currentBoardFilled);
            }
        }
        
        // IMPORTANT: Only save the state if we aren't already in a save operation
        if (!window._isSavingPreset) {
            saveCurrentState();
        }
    } finally {
        window._isUpdatingCurrentPieces = false;
    }
}

function clearPieces() {
    for (let i = 0; i < pieces.length; i++) {
        const pieceInput = document.getElementById(`piece${i+1}`);
        if (pieceInput) {
            pieceInput.value = 0;
        }
    }

    updateCurrentPieces();
}

// Make pieces accessible globally
window.pieces = pieces;
window.currentPieces = currentPieces;
window.currentUseCaracterCount = currentUseCaracterCount;

// Debug function to check piece IDs
window.debugPieceIDs = function() {
    console.log("===== PIECE ID DEBUG =====");
    console.log("Total pieces:", pieces.length);
    
    pieces.forEach((piece, index) => {
        console.log(`Piece at index ${index}:`);
        console.log(`  ID: ${piece.id}`);
        console.log(`  Cell Count: ${piece.cellCount}`);
        const shapeVisualization = piece.shape.map(row => 
            row.map(cell => cell === 0 ? '□' : (cell === 1 ? '■' : '▣')).join('')
        ).join('\n');
        console.log(`  Shape:\n${shapeVisualization}`);
    });
    
    console.log("===== END PIECE ID DEBUG =====");
};

export { pieceColours, pieces, updateCurrentPieces, clearPieces };