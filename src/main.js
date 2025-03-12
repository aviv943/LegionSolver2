import './styles.css';
import { i18n } from './i18n.js';
import { initCharacterSelector, saveCurrentState, updatePiecesAndSavePreset } from './characters.js';
import './board.js';
import { pieces, updateCurrentPieces } from './pieces.js';

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

// Define the monitorBoardState function but don't execute it yet
function monitorBoardState() {
  console.log("Setting up board state monitoring");
  
  let lastKnownBoardFilled = null;
  let lastKnownState = null;
  
  // Check every 500ms if we're not in the START state and boardFilled has changed
  setInterval(() => {
    const currentButton = document.getElementById("boardButton");
    const currentState = currentButton ? currentButton.innerText : null;
    const currentBoardFilled = localStorage.getItem('boardFilled'); // Use standard key for compatibility
    const boardFilledDisplay = document.getElementById('boardFilledValue');
    
    // Only take action if we've moved past the START state
    if (currentState && currentState !== i18n("start")) {
      // First time seeing a non-START state
      if (lastKnownState === null || lastKnownState === i18n("start")) {
        console.log(`Board state changed to ${currentState}, recording filled count: ${currentBoardFilled}`);
        lastKnownBoardFilled = currentBoardFilled;
      }
      
      // If we have a previous non-zero value and current is 0 or much lower, restore it
      if (lastKnownBoardFilled && 
          (!currentBoardFilled || parseInt(currentBoardFilled) === 0 || 
           (parseInt(currentBoardFilled) < parseInt(lastKnownBoardFilled) * 0.5))) {
        console.log(`BoardFilled reset detected! Restoring from ${currentBoardFilled} to ${lastKnownBoardFilled}`);
        localStorage.setItem('boardFilled', lastKnownBoardFilled);
        localStorage.setItem(`${STORAGE_KEYS.BOARD_FILLED}${activePreset}`, lastKnownBoardFilled);
        
        if (boardFilledDisplay) {
          boardFilledDisplay.innerText = JSON.parse(lastKnownBoardFilled);
        }
        
        // Save complete state
        updatePiecesAndSavePreset();
      } else if (currentBoardFilled && parseInt(currentBoardFilled) > 0) {
        // Update our last known value if it's non-zero
        lastKnownBoardFilled = currentBoardFilled;
      }
    }
    
    lastKnownState = currentState;
  }, 500);
}

// Make sure we initialize only once
let initialized = false;

// Initialize everything when DOM is fully loaded
function initialize() {
  if (initialized) return;
  initialized = true;
  
  console.log('Initializing application...');
  
  // Expose key objects globally for other scripts to access
  window.pieces = pieces;
  window.updateCurrentPieces = updateCurrentPieces;
  
  // Start the board state monitoring
  monitorBoardState();
  
  // Verify that our piece shapes are correctly defined
  verifyPieceShapes();
  
  // Initialize the character selector
  console.log('Initializing character selector from main.js');
  initCharacterSelector();
  
  // Set up the solver integration
  setupSolverIntegration();
  
  console.log('Initialization complete');
}

// Verify that all piece shapes are correctly defined
function verifyPieceShapes() {
  console.log('Verifying piece shapes...');
  
  if (!window.pieces || !Array.isArray(window.pieces)) {
    console.error('Pieces array not available for verification');
    return;
  }
  
  const expectedPieces = [
    { name: "Lvl 60 (All classes)", cells: 1 },
    { name: "Lvl 100 (All classes)", cells: 2 },
    { name: "Lvl 140 Warrior/Pirate", cells: 3 },
    { name: "Lvl 140 Mage/Thief/Archer", cells: 3 },
    { name: "Lvl 200 Warrior", cells: 4 },
    { name: "Lvl 200 Archer", cells: 4 },
    { name: "Lvl 200 Thief/Lab", cells: 4 },
    { name: "Lvl 200 Mage", cells: 4 },
    { name: "Lvl 200 Pirate", cells: 4 },
    { name: "Lvl 250 Warrior", cells: 5 },
    { name: "Lvl 250 Archer", cells: 5 },
    { name: "Lvl 250 Thief", cells: 5 },
    { name: "Lvl 250 Mage", cells: 5 },
    { name: "Lvl 250 Pirate", cells: 5 },
    { name: "Lvl 250 Xenon", cells: 5 }
  ];
  
  let allValid = true;
  
  // Check that we have at least the expected number of pieces
  if (window.pieces.length < expectedPieces.length) {
    console.error(`Pieces array has fewer items than expected: ${window.pieces.length} vs ${expectedPieces.length}`);
    allValid = false;
  }
  
  // Verify each piece shape has the expected number of cells
  for (let i = 0; i < Math.min(window.pieces.length, expectedPieces.length); i++) {
    const piece = window.pieces[i];
    const expected = expectedPieces[i];
    
    if (!piece.shape) {
      console.error(`Piece #${i+1} (${expected.name}) has no shape defined`);
      allValid = false;
      continue;
    }
    
    const cellCount = piece.cellCount;
    if (cellCount !== expected.cells) {
      console.error(`Piece #${i+1} (${expected.name}) has ${cellCount} cells, expected ${expected.cells}`);
      allValid = false;
    }
    
    // Verify transformations for this piece
    verifyPieceTransformations(piece, i, expected.name);
  }
  
  if (allValid) {
    console.log('All piece shapes verified successfully');
  } else {
    console.warn('Some piece shapes have issues - the solver may not work correctly');
  }
}

// Check transformations for a single piece
function verifyPieceTransformations(piece, index, name) {
  if (!piece || !piece.shape) {
    console.error(`Cannot verify transformations for piece #${index+1} (${name}) - invalid piece or shape`);
    return false;
  }
  
  // Calculate transformations (rotations and reflections)
  const transformations = piece.transformations;
  if (!transformations || transformations.length === 0) {
    console.error(`Piece #${index+1} (${name}) has no transformations`);
    return false;
  }
  
  console.log(`Piece #${index+1} (${name}) has ${transformations.length} unique orientations`);
  
  // Verify that each transformation is valid
  let allValid = true;
  for (let i = 0; i < transformations.length; i++) {
    const t = transformations[i];
    if (!t.shape || !t.pointShape) {
      console.error(`Transformation #${i+1} for piece #${index+1} is invalid`);
      allValid = false;
      continue;
    }
    
    // Verify that shape and pointShape are consistent
    const shapeCount = t.cellCount;
    const pointCount = t.pointShape.length;
    if (shapeCount !== pointCount) {
      console.error(`Transformation #${i+1} for piece #${index+1} has inconsistent cell count (${shapeCount}) and point count (${pointCount})`);
      allValid = false;
    }
    
    // Visualize this transformation
    if (i < 2) { // Only log the first few transformations to avoid spamming the console
      const shapeText = t.shape.map(row => 
        row.map(cell => cell === 0 ? '□' : (cell === 1 ? '■' : '▣')).join('')
      ).join('\n');
      console.log(`Transformation #${i+1}:\n${shapeText}`);
    }
  }
  
  return allValid;
}

// Make sure the solver gets the right piece information
function setupSolverIntegration() {
  // Add a backup handler for the board button
  const boardButton = document.getElementById('boardButton');
  if (boardButton) {
    console.log('Setting up backup handler for board button');
    boardButton.addEventListener('click', function(event) {
      console.log('Board button clicked from main.js');
      
      // Make sure pieces array is correctly updated before solving
      updatePiecesForSolver();
    });
  }
  
  // Create a mutation observer to update pieces when selections change
  const pieceSelectionContent = document.getElementById('pieceSelectionContent');
  if (pieceSelectionContent) {
    console.log('Setting up mutation observer for piece selection');
    const observer = new MutationObserver(function(mutations) {
      updatePiecesForSolver();
    });
    
    observer.observe(pieceSelectionContent, { childList: true });
  }
}

// Update the pieces array with selected character information
function updatePiecesForSolver() {
  console.log("Updating pieces for solver");
  
  // Prevent recursion
  if (window._isUpdatingPiecesForSolver) {
    console.log("Already updating pieces for solver, preventing recursive call");
    return;
  }
  
  window._isUpdatingPiecesForSolver = true;
  
  try {
    // Ensure we're working with the latest active preset
    activePreset = localStorage.getItem(STORAGE_KEYS.ACTIVE_PRESET) ? 
      parseInt(localStorage.getItem(STORAGE_KEYS.ACTIVE_PRESET)) : 1;
      
    // Call the update function from pieces.js
    updateCurrentPieces();
    
    // Save everything to the preset, but only if not already in a save operation
    if (!window._isSavingPreset) {
      updatePiecesAndSavePreset();
    }
  } finally {
    window._isUpdatingPiecesForSolver = false;
  }
}

// Verify that the piece assignments match the expected class/level mappings
function verifyPieceAssignments(pieceCountByIndex) {
  console.log('Verifying piece assignments...');
  
  if (!window.levelToPieceIndex) {
    console.warn('levelToPieceIndex mapping not available for verification');
    return;
  }
  
  // Check each selected piece against the mapping
  document.querySelectorAll('.selectedPiece').forEach(piece => {
    const characterName = piece.querySelector('.characterName')?.textContent || 'Unknown';
    const characterClass = piece.getAttribute('data-character-class') || piece.dataset.characterClass || 'unknown';
    const characterLevel = piece.querySelector('.characterLevel')?.textContent?.replace('Lvl ', '') || '250';
    const level = parseInt(characterLevel);
    
    // Get the expected piece ID directly from the mapping
    const expectedPieceId = window.levelToPieceIndex[characterClass] ? 
      window.levelToPieceIndex[characterClass][level] : null;
    
    // Get the actual piece index used
    const actualPieceIndex = parseInt(piece.getAttribute('data-piece-index') || piece.dataset.pieceIndex) || 0;
    
    if (expectedPieceId !== actualPieceIndex) {
      console.warn(`Piece mismatch for ${characterName} (${characterClass} lvl ${level}): 
        Expected: ${expectedPieceId}, Actual: ${actualPieceIndex}`);
    } else {
      console.log(`Piece verified for ${characterName} (${characterClass} lvl ${level}): 
        Using piece ID ${actualPieceIndex}`);
    }
  });
}

// Make these functions globally accessible
window.updatePiecesForSolver = updatePiecesForSolver;
window.monitorBoardState = monitorBoardState;

// Initialize the character selector after the page loads
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM content loaded, initializing application');
  
  // Verify DOM elements exist before initialization
  const characterSelector = document.getElementById('characterSelector');
  const filterContainer = document.querySelector('.filterContainer');
  
  // Initialize the character selector with a slight delay to ensure DOM is ready
  setTimeout(() => {
    initCharacterSelector();
  }, 100);
  
  // Start monitoring board state
  setTimeout(() => {
    monitorBoardState();
  }, 1000);
  
  // Verify piece shapes for debugging
  if (typeof verifyPieceShapes === 'function') {
    verifyPieceShapes();
  }
  
  // Set up solver integration if needed
  if (typeof setupSolverIntegration === 'function') {
    setupSolverIntegration();
  }
  
  console.log('Application initialization complete');
});

// Backup initialization if DOMContentLoaded doesn't fire for some reason
window.addEventListener('load', function() {
  // Check if characterSelector has content
  const characterSelector = document.getElementById('characterSelector');
  if (characterSelector && characterSelector.children.length === 0) {
    console.log('Character selector is empty, reinitializing');
    initCharacterSelector();
  }
});

// Debug helper to verify piece mapping
window.debugPieceMapping = function(character) {
    if (!window.levelToPieceIndex || !window.pieces) {
        console.log("levelToPieceIndex or pieces not available for debugging");
        return;
    }

    const characterElement = character;
    const characterName = characterElement.querySelector('.name').textContent;
    
    // Extract class and level
    const characterClass = characterElement.getAttribute('data-class');
    const characterLevel = characterElement.getAttribute('data-level');
    const level = parseInt(characterLevel.replace('Lvl ', ''));
    
    // Get the actual piece index used
    const actualPieceIndex = parseInt(characterElement.getAttribute('data-piece-index'));
    
    // Get the expected piece ID from the levelToPieceIndex mapping
    const expectedPieceId = window.levelToPieceIndex[characterClass][level] || null;
    
    console.log(`${characterName} (${characterClass} ${characterLevel}):`);
    console.log(`- Expected piece ID: ${expectedPieceId}`);
    console.log(`- Actual piece index: ${actualPieceIndex}`);
    
    if (expectedPieceId !== actualPieceIndex) {
        console.warn(`⚠️ MISMATCH: Expected piece ID ${expectedPieceId}, but got ${actualPieceIndex}`);
    }
    
    // Show the expected piece shape
    if (expectedPieceId && window.pieces && expectedPieceId - 1 >= 0 && expectedPieceId - 1 < window.pieces.length) {
        const expectedPiece = window.pieces[expectedPieceId - 1];
        if (expectedPiece) {
            console.log("Expected shape:");
            window.visualizePieceShape(expectedPiece.cells);
        }
    }
};

// Function to visualize a piece shape in the console
window.visualizePieceShape = function(cells) {
    const shapeText = cells.map(row => 
        row.map(cell => cell === 0 ? '□' : (cell === 1 ? '■' : '▣')).join(' ')
    ).join('\n');
    console.log(shapeText);
};
