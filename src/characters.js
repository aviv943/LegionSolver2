import { Piece } from './modules/piece.js';
import { sumBy } from 'lodash';
import { i18n, getCurrentLanguage } from './i18n.js';
import { updateCurrentPieces } from './pieces.js';

// Constants for localStorage keys
const STORAGE_KEYS = {
    SELECTED_CHARACTERS: 'legionSolver_selectedCharacters_preset_',
    BOARD_STATE: 'legionBoard_preset_',
    BOARD_FILLED: 'boardFilled_preset_',
    ACTIVE_PRESET: 'legionSolver_activePreset',
    PIECE_AMOUNTS: 'pieceAmounts',
    CURRENT_PIECES: 'currentPieces'
};

// Current active preset (1-5)
let activePreset = 1;

// MapleStory character data with legion effects, classes, and piece shapes
const charactersData = [
    // Warriors
    {
        id: 1,
        name: 'Hero',
        class: 'warrior',
        mainStat: 'STR',
        level: 250,
        legionEffect: 'STR +',
        pieceIndex: 9, // Refers to the piece type (lvl 250 Warrior)
        description: 'A Warrior class that specializes in critical damage',
        icon: '⚔️'
    },
    {
        id: 2,
        name: 'Paladin',
        class: 'warrior',
        mainStat: 'STR',
        level: 250,
        legionEffect: 'STR +',
        pieceIndex: 9, // Refers to the piece type (lvl 250 Warrior)
        description: 'A Warrior class with holy elemental attacks and party shields',
        icon: '🛡️'
    },
    {
        id: 3,
        name: 'Dark Knight',
        class: 'warrior',
        mainStat: 'STR',
        level: 250,
        legionEffect: 'Max HP +%',
        pieceIndex: 9, // Refers to the piece type (lvl 250 Warrior)
        description: 'A Warrior class that sacrifices HP for powerful attacks',
        icon: '🔱'
    },
    {
        id: 4,
        name: 'Dawn Warrior',
        class: 'warrior',
        mainStat: 'STR',
        level: 250,
        legionEffect: 'Max HP +%',
        pieceIndex: 9, // Refers to the piece type (lvl 250 Warrior)
        description: 'A Warrior of light combining solar and lunar forces',
        icon: '☀️'
    },
    {
        id: 5,
        name: 'Mihile',
        class: 'warrior',
        mainStat: 'STR',
        level: 250,
        legionEffect: 'Max HP +',
        pieceIndex: 9, // Refers to the piece type (lvl 250 Warrior)
        description: 'A royal guardian who uses a Soul Shield for defense',
        icon: '🔆'
    },
    {
        id: 6,
        name: 'Blaster',
        class: 'warrior',
        mainStat: 'STR',
        level: 250,
        legionEffect: 'IED +%',
        pieceIndex: 9, // Refers to the piece type (lvl 250 Warrior)
        description: 'A Resistance fighter who uses arm cannons',
        icon: '💥'
    },
    {
        id: 7,
        name: 'Demon Slayer',
        class: 'warrior',
        mainStat: 'STR',
        level: 250,
        legionEffect: 'Status Resistance +',
        pieceIndex: 9, // Refers to the piece type (lvl 250 Warrior)
        description: 'A former commander of the Black Mage who uses dark force',
        icon: '😈'
    },
    {
        id: 8,
        name: 'Demon Avenger',
        class: 'warrior',
        mainStat: 'HP',
        level: 250,
        legionEffect: 'Boss Damage +%',
        pieceIndex: 9, // Refers to the piece type (lvl 250 Warrior)
        description: 'A demon who sacrificed everything for revenge',
        icon: '🔥'
    },
    {
        id: 9,
        name: 'Aran',
        class: 'warrior',
        mainStat: 'STR',
        level: 250,
        legionEffect: '70% chance to heal MAXHP +%',
        pieceIndex: 9, // Refers to the piece type (lvl 250 Warrior)
        description: 'A Pole Arm-wielding hero of old with combo attacks',
        icon: '❄️'
    },
    {
        id: 44,
        name: 'Hayato',
        class: 'warrior',
        mainStat: 'STR',
        level: 250,
        legionEffect: 'Critical Damage +%',
        pieceIndex: 9, // Refers to the piece type (lvl 250 Warrior)
        description: 'A samurai warrior who uses swift katana techniques',
        icon: '⚔️'
    },
    
    // Mages
    {
        id: 10,
        name: 'Arch Mage (Fire/Poison)',
        class: 'mage',
        mainStat: 'INT',
        level: 250,
        legionEffect: 'Max MP +%',
        pieceIndex: 12, // Refers to the piece type (lvl 250 Mage)
        description: 'A Mage who specializes in fire and poison elemental magic',
        icon: '🔥'
    },
    {
        id: 11,
        name: 'Arch Mage (Ice/Lightning)',
        class: 'mage',
        mainStat: 'INT',
        level: 250,
        legionEffect: 'INT +',
        pieceIndex: 12, // Refers to the piece type (lvl 250 Mage)
        description: 'A Mage who specializes in ice and lightning elemental magic',
        icon: '⚡'
    },
    {
        id: 12,
        name: 'Bishop',
        class: 'mage',
        mainStat: 'INT',
        level: 250,
        legionEffect: 'INT +',
        pieceIndex: 12, // Refers to the piece type (lvl 250 Mage)
        description: 'A support Mage who uses holy magic to heal and buff allies',
        icon: '✝️'
    },
    {
        id: 13,
        name: 'Battle Mage',
        class: 'mage',
        mainStat: 'INT',
        level: 250,
        legionEffect: 'INT +',
        pieceIndex: 12, // Refers to the piece type (lvl 250 Mage)
        description: 'A close-combat staff-wielding mage of the Resistance',
        icon: '🧙‍♂️'
    },
    {
        id: 14,
        name: 'Luminous',
        class: 'mage',
        mainStat: 'INT',
        level: 250,
        legionEffect: 'INT +',
        pieceIndex: 12, // Refers to the piece type (lvl 250 Mage)
        description: 'A Mage of light and darkness who must maintain equilibrium',
        icon: '☯️'
    },
    {
        id: 15,
        name: 'Evan',
        class: 'mage',
        mainStat: 'INT',
        level: 250,
        legionEffect: '70% chance to heal MAXMP +%',
        pieceIndex: 12, // Refers to the piece type (lvl 250 Mage)
        description: 'A dragon master who fights alongside Mir',
        icon: '🐉'
    },
    {
        id: 16,
        name: 'Illium',
        class: 'mage',
        mainStat: 'INT',
        level: 250,
        legionEffect: 'INT +',
        pieceIndex: 12, // Refers to the piece type (lvl 250 Mage)
        description: 'A crystal-wielding Mage from Flora',
        icon: '💎'
    },
    {
        id: 17,
        name: 'Kanna',
        class: 'mage',
        mainStat: 'INT',
        level: 250,
        legionEffect: 'Boss Damage +%',
        pieceIndex: 12, // Refers to the piece type (lvl 250 Mage)
        description: 'A Japanese spiritual Mage who uses fan weapons',
        icon: '🌸'
    },

    // Archers
    {
        id: 18,
        name: 'Bowmaster',
        class: 'archer',
        mainStat: 'DEX',
        level: 250,
        legionEffect: 'DEX +',
        pieceIndex: 10, // Refers to the piece type (lvl 250 Archer)
        description: 'An Archer who fires multiple arrows with high speed',
        icon: '🏹'
    },
    {
        id: 19,
        name: 'Marksman',
        class: 'archer',
        mainStat: 'DEX',
        level: 250,
        legionEffect: 'Critical Rate +%',
        pieceIndex: 10, // Refers to the piece type (lvl 250 Archer)
        description: 'An Archer with high damage, single-target attacks',
        icon: '🎯'
    },
    {
        id: 20,
        name: 'Pathfinder',
        class: 'archer',
        mainStat: 'DEX',
        level: 250,
        legionEffect: 'DEX +',
        pieceIndex: 10, // Refers to the piece type (lvl 250 Archer)
        description: 'An ancient relic hunter who uses cursed magic',
        icon: '⚱️'
    },
    {
        id: 21,
        name: 'Wind Archer',
        class: 'archer',
        mainStat: 'DEX',
        level: 250,
        legionEffect: 'DEX +',
        pieceIndex: 10, // Refers to the piece type (lvl 250 Archer)
        description: 'An Archer who uses the power of wind',
        icon: '🍃'
    },
    {
        id: 22,
        name: 'Wild Hunter',
        class: 'archer',
        mainStat: 'DEX',
        level: 250,
        legionEffect: 'Damage to Normal Monsters +%',
        pieceIndex: 10, // Refers to the piece type (lvl 250 Archer)
        description: 'A crossbow-wielding Resistance member who rides a jaguar',
        icon: '🐆'
    },
    {
        id: 23,
        name: 'Mercedes',
        class: 'archer',
        mainStat: 'DEX',
        level: 250,
        legionEffect: 'Skill Cooldown -%',
        pieceIndex: 10, // Refers to the piece type (lvl 250 Archer)
        description: 'An elven queen who dual-wields Bowguns with combo skills',
        icon: '🧝‍♀️'
    },

    // Thieves
    {
        id: 24,
        name: 'Night Lord',
        class: 'thief',
        mainStat: 'LUK',
        level: 250,
        legionEffect: 'Critical Rate +%',
        pieceIndex: 11, // Refers to the piece type (lvl 250 Thief)
        description: 'A Thief who throws stars from the shadows',
        icon: '🌑'
    },
    {
        id: 25,
        name: 'Shadower',
        class: 'thief',
        mainStat: 'LUK',
        level: 250,
        legionEffect: 'LUK +',
        pieceIndex: 11, // Refers to the piece type (lvl 250 Thief)
        description: 'A melee Thief who uses daggers and meso attacks',
        icon: '🗡️'
    },
    {
        id: 26,
        name: 'Dual Blade',
        class: 'thief',
        mainStat: 'LUK',
        level: 250,
        legionEffect: 'LUK +',
        pieceIndex: 11, // Refers to the piece type (lvl 250 Thief)
        description: 'A Thief who dual-wields katars with fast attacks',
        icon: '⚔️'
    },
    {
        id: 27,
        name: 'Night Walker',
        class: 'thief',
        mainStat: 'LUK',
        level: 250,
        legionEffect: 'LUK +',
        pieceIndex: 11, // Refers to the piece type (lvl 250 Thief)
        description: 'A bat-controlling throwing star specialist',
        icon: '🦇'
    },
    {
        id: 28,
        name: 'Phantom',
        class: 'thief',
        mainStat: 'LUK',
        level: 250,
        legionEffect: 'Meso Obtained +%',
        pieceIndex: 11, // Refers to the piece type (lvl 250 Thief)
        description: 'A master thief who can steal skills from other classes',
        icon: '♠️'
    },
    {
        id: 29,
        name: 'Cadena',
        class: 'thief',
        mainStat: 'LUK',
        level: 250,
        legionEffect: 'LUK +',
        pieceIndex: 11, // Refers to the piece type (lvl 250 Thief)
        description: 'A chain-wielding Nova who uses various weapons in combo',
        icon: '⛓️'
    },
    {
        id: 30,
        name: 'Hoyoung',
        class: 'thief',
        mainStat: 'LUK',
        level: 250,
        legionEffect: 'LUK +',
        pieceIndex: 11, // Refers to the piece type (lvl 250 Thief)
        description: 'A trickster sage who uses illusions and talismans',
        icon: '🦊'
    },
    {
        id: 43,
        name: 'Khali',
        class: 'thief',
        mainStat: 'LUK',
        level: 250,
        legionEffect: 'LUK +',
        pieceIndex: 11, // Refers to the piece type (lvl 250 Thief)
        description: 'A nimble thief who specializes in swift shadow attacks',
        icon: '🥷'
    },

    // Pirates
    {
        id: 31,
        name: 'Buccaneer',
        class: 'pirate',
        mainStat: 'STR',
        level: 250,
        legionEffect: 'STR +',
        pieceIndex: 13, // Refers to the piece type (lvl 250 Pirate)
        description: 'A pirate who uses knuckles with energy-charging abilities',
        icon: '👊'
    },
    {
        id: 32,
        name: 'Corsair',
        class: 'pirate',
        mainStat: 'DEX',
        level: 250,
        legionEffect: 'Summon Duration +%',
        pieceIndex: 13, // Refers to the piece type (lvl 250 Pirate)
        description: 'A gunslinging pirate who uses mechanical summons',
        icon: '🔫'
    },
    {
        id: 33,
        name: 'Cannoneer',
        class: 'pirate',
        mainStat: 'STR',
        level: 250,
        legionEffect: 'STR +',
        pieceIndex: 13, // Refers to the piece type (lvl 250 Pirate)
        description: 'A pirate who rides and fires from a giant cannon',
        icon: '💣'
    },
    {
        id: 34,
        name: 'Shade',
        class: 'pirate',
        mainStat: 'STR',
        level: 250,
        legionEffect: 'Critical Damage +%',
        pieceIndex: 13, // Refers to the piece type (lvl 250 Pirate)
        description: 'A forgotten hero who uses spirit fox powers',
        icon: '👻'
    },
    {
        id: 35,
        name: 'Angelic Buster',
        class: 'pirate',
        mainStat: 'DEX',
        level: 250,
        legionEffect: 'DEX +',
        pieceIndex: 13, // Refers to the piece type (lvl 250 Pirate)
        description: 'A Nova girl who transforms into a magical girl',
        icon: '💕'
    },
    {
        id: 36,
        name: 'Thunder Breaker',
        class: 'pirate',
        mainStat: 'STR',
        level: 250,
        legionEffect: 'STR +',
        pieceIndex: 13, // Refers to the piece type (lvl 250 Pirate)
        description: 'A lightning-wielding pirate with quick combo attacks',
        icon: '⚡'
    },
    {
        id: 37,
        name: 'Mechanic',
        class: 'pirate',
        mainStat: 'DEX',
        level: 250,
        legionEffect: 'Buff Duration +%',
        pieceIndex: 13, // Refers to the piece type (lvl 250 Pirate)
        description: 'A Resistance member who pilots a mechanical suit',
        icon: '🤖'
    },
    {
        id: 38,
        name: 'Ark',
        class: 'pirate',
        mainStat: 'STR',
        level: 250,
        legionEffect: 'STR +',
        pieceIndex: 13, // Refers to the piece type (lvl 250 Pirate)
        description: 'A Specter from Flora who transforms between forms',
        icon: '🐙'
    },

    // Special Classes
    {
        id: 39,
        name: 'Xenon',
        class: 'special',
        mainStat: 'LUK/DEX/STR',
        level: 250,
        legionEffect: 'STR,DEX,LUK +',
        pieceIndex: 14, // Refers to the piece type (lvl 250 Xenon)
        description: 'A hybrid android who uses all three stats',
        icon: '🤖'
    },
    {
        id: 40,
        name: 'Zero',
        class: 'special',
        mainStat: 'STR',
        level: 250,
        legionEffect: 'EXP +%',
        pieceIndex: 9, // Zero uses Warrior pieces
        description: 'Dual characters Alpha and Beta who share a body',
        icon: '⚔️'
    },
    {
        id: 41,
        name: 'Kinesis',
        class: 'special',
        mainStat: 'INT',
        level: 250,
        legionEffect: 'INT +',
        pieceIndex: 12, // Kinesis uses Mage pieces
        description: 'A psychic from another world who uses telekinesis',
        icon: '🧠'
    },
    {
        id: 42,
        name: 'Adele',
        class: 'special',
        mainStat: 'STR',
        level: 250,
        legionEffect: 'STR +',
        pieceIndex: 9, // Adele uses Warrior pieces
        description: 'A master of Aether who uses floating swords',
        icon: '⚔️'
    },
    {
        id: 45,
        name: 'Lynn',
        class: 'mage',
        mainStat: 'INT',
        level: 250,
        legionEffect: 'IED +%',
        pieceIndex: 12, // Refers to the piece type (lvl 250 Mage)
        description: 'A wizard who harnesses elemental powers through her staff',
        icon: '🪄'
    },
    {
        id: 46,
        name: 'Lara',
        class: 'mage',
        mainStat: 'INT',
        level: 250,
        legionEffect: 'INT +',
        pieceIndex: 12, // Refers to the piece type (lvl 250 Mage)
        description: 'A nature wizard who channels the power of the forest',
        icon: '🌿'
    }
];

// Make the characters data globally accessible
window.charactersData = charactersData;

// Make the updatePieceAmounts function globally accessible
window.updatePieceAmounts = updatePieceAmounts;

// Directly attempt to initialize when this script loads
(function immediateInit() {
    console.log('DEBUG: Attempting immediate initialization');
    // Check if document is already loaded
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        console.log('DEBUG: Document ready, will initialize shortly');
        setTimeout(initCharacterSelector, 300);
    } else {
        // Wait for document to be ready
        console.log('DEBUG: Document not ready, adding event listener');
        document.addEventListener('DOMContentLoaded', function() {
            console.log('DEBUG: DOMContentLoaded from characters.js');
            setTimeout(initCharacterSelector, 300);
        });
    }
})();

// Initialize the character selector
function initCharacterSelector() {
    console.log('DEBUG: initCharacterSelector start');
    console.log('Initializing character selector');
    
    // Wait a short time to ensure DOM is fully loaded
    setTimeout(() => {
        const characterSelector = document.getElementById('characterSelector');
        
        if (!characterSelector) {
            console.error('Character selector element not found');
            return;
        }
        
        // Replace category buttons with preset buttons
        const filterContainer = document.querySelector('.filterContainer');
        console.log('DEBUG: filterContainer:', filterContainer);
        
        if (filterContainer) {
            // Clear any existing content
            filterContainer.innerHTML = '';
            
            // Create preset buttons
            for (let i = 1; i <= 5; i++) {
                const presetBtn = document.createElement('button');
                presetBtn.className = 'presetBtn';
                presetBtn.setAttribute('data-preset', i);
                presetBtn.textContent = `Preset ${i}`;
                
                // Add click handler
                presetBtn.onclick = function() {
                    switchPreset(i);
                };
                
                filterContainer.appendChild(presetBtn);
            }
            
            console.log('Created 5 preset buttons');
        } else {
            console.error('Filter container not found, trying direct selection by ID');
            // Try alternative method to find the container
            const classCategories = document.getElementById('classCategories');
            if (classCategories) {
                classCategories.innerHTML = '';
                
                // Create preset buttons
                for (let i = 1; i <= 5; i++) {
                    const presetBtn = document.createElement('button');
                    presetBtn.className = 'presetBtn';
                    presetBtn.setAttribute('data-preset', i);
                    presetBtn.textContent = `Preset ${i}`;
                    
                    // Add click handler
                    presetBtn.onclick = function() {
                        switchPreset(i);
                    };
                    
                    classCategories.appendChild(presetBtn);
                }
                
                console.log('Created 5 preset buttons using ID');
                
                // Add the filterContainer class if it's missing
                if (!classCategories.classList.contains('filterContainer')) {
                    classCategories.classList.add('filterContainer');
                }
            } else {
                console.error('Could not find classCategories by ID either');
            }
        }
        
        // Create character cards
        console.log('DEBUG: About to render character cards');
        renderCharacterCards();
        
        // Create hidden form elements for compatibility with the original solver
        createHiddenPieceForm();
        
        // Add Clear All button event - direct onclick approach
        const clearPiecesBtn = document.getElementById('clearPieces');
        if (clearPiecesBtn) {
            clearPiecesBtn.onclick = function() {
                clearPieceSelection();
            };
        }
        
        // Load the active preset from localStorage
        const savedActivePreset = localStorage.getItem(STORAGE_KEYS.ACTIVE_PRESET);
        if (savedActivePreset) {
            activePreset = parseInt(savedActivePreset);
        }
        
        // Update the active preset button UI
        updateActivePresetUI();
        
        // Load saved state for the active preset
        setTimeout(() => {
            loadSavedState();
        }, 100);
        
        console.log('DEBUG: initCharacterSelector completed');
    }, 200); // Small delay to ensure DOM is ready
}

// Update the active preset button UI
function updateActivePresetUI() {
    // Remove active class from all preset buttons
    document.querySelectorAll('.presetBtn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to the current preset button
    const activeBtn = document.querySelector(`.presetBtn[data-preset="${activePreset}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

// Create hidden form elements for compatibility with the original solver
function createHiddenPieceForm() {
    // Check if the form already exists
    if (document.getElementById('pieceForm')) {
        return;
    }
    
    console.log('Creating hidden piece form');
    
    const pieceForm = document.createElement('div');
    pieceForm.id = 'pieceForm';
    pieceForm.style.display = 'none';
    
    // Create the form element
    const form = document.createElement('form');
    
    // Create inputs for all possible piece types (1-18)
    for (let i = 1; i <= 18; i++) {
        const input = document.createElement('input');
        input.type = 'number';
        input.id = `piece${i}`;
        input.name = `piece${i}`;
        input.value = '0';
        input.min = '0';
        form.appendChild(input);
    }
    
    pieceForm.appendChild(form);
    document.body.appendChild(pieceForm);
    
    console.log('Hidden piece form created with inputs for pieces 1-18');
}

// Switch to a different preset
function switchPreset(presetNumber) {
    console.log(`Switching to preset ${presetNumber}`);
    
    // Don't save the current state if we're already on this preset
    if (activePreset !== presetNumber) {
        // Save current state before switching
        saveCurrentState();
        
        // Update active preset
        activePreset = presetNumber;
        localStorage.setItem(STORAGE_KEYS.ACTIVE_PRESET, activePreset.toString());
        
        // Update UI
        updateActivePresetUI();
        
        // Load the state for the new preset
        // loadSavedState will now handle clearing the character selection if needed
        loadSavedState();
        
        // Load the board state for the new preset using both our method and the global function
        // This ensures both character.js and board.js are in sync
        loadBoardStateForPreset(presetNumber);
        
        // Use the global updateBoardDisplay function if available for comprehensive update
        if (typeof window.updateBoardDisplay === 'function') {
            console.log('Using global updateBoardDisplay for comprehensive board update');
            setTimeout(() => {
                window.updateBoardDisplay();
            }, 50); // Short delay to ensure localStorage updates are complete
        }
    } else {
        console.log(`Already on preset ${presetNumber}, no action needed`);
    }
}

// Load board state for the given preset
function loadBoardStateForPreset(presetNumber) {
    console.log(`Loading board state for preset ${presetNumber}`);
    
    // Get board state for this preset
    const boardState = localStorage.getItem(`${STORAGE_KEYS.BOARD_STATE}${presetNumber}`);
    const boardFilled = localStorage.getItem(`${STORAGE_KEYS.BOARD_FILLED}${presetNumber}`);
    
    // Store the state in the standard keys that the board code uses
    if (boardState) {
        localStorage.setItem('legionBoard', boardState);
        console.log(`Loaded board state for preset ${presetNumber}`);
    } else {
        // If no board state exists for this preset, initialize an empty board
        console.log(`No board state found for preset ${presetNumber}, creating new empty board`);
        
        // Initialize a new empty board
        const emptyBoard = [];
        for (let i = 0; i < 20; i++) {
            emptyBoard[i] = [];
            for (let j = 0; j < 22; j++) {
                emptyBoard[i][j] = -1;
            }
        }
        
        // Save the empty board
        const emptyBoardJson = JSON.stringify(emptyBoard);
        localStorage.setItem('legionBoard', emptyBoardJson);
        localStorage.setItem(`${STORAGE_KEYS.BOARD_STATE}${presetNumber}`, emptyBoardJson);
    }
    
    if (boardFilled) {
        localStorage.setItem('boardFilled', boardFilled);
        
        // Update the board display
        const boardFilledDisplay = document.getElementById('boardFilledValue');
        if (boardFilledDisplay) {
            boardFilledDisplay.innerText = JSON.parse(boardFilled);
        }
        console.log(`Loaded board filled state (${boardFilled}) for preset ${presetNumber}`);
    } else {
        // If no boardFilled exists, set it to 0
        localStorage.setItem('boardFilled', JSON.stringify(0));
        localStorage.setItem(`${STORAGE_KEYS.BOARD_FILLED}${presetNumber}`, JSON.stringify(0));
        
        // Update the board display to zero
        const boardFilledDisplay = document.getElementById('boardFilledValue');
        if (boardFilledDisplay) {
            boardFilledDisplay.innerText = '0';
        }
        console.log(`No board filled state found for preset ${presetNumber}, setting to 0`);
    }
    
    // Update the board display if needed
    if (typeof window.updateBoardDisplay === 'function') {
        window.updateBoardDisplay();
    }
}

// Save board state for the current preset
function saveBoardStateForPreset() {
    console.log(`Saving board state for preset ${activePreset}`);
    
    // Get current board state
    const boardState = localStorage.getItem('legionBoard');
    const boardFilled = localStorage.getItem('boardFilled');
    
    // Save to preset-specific key
    if (boardState) {
        localStorage.setItem(`${STORAGE_KEYS.BOARD_STATE}${activePreset}`, boardState);
        console.log(`Saved board layout for preset ${activePreset}`);
    } else {
        localStorage.removeItem(`${STORAGE_KEYS.BOARD_STATE}${activePreset}`);
        console.log(`Removed board layout for preset ${activePreset}`);
    }
    
    if (boardFilled) {
        localStorage.setItem(`${STORAGE_KEYS.BOARD_FILLED}${activePreset}`, boardFilled);
        console.log(`Saved board filled count (${boardFilled}) for preset ${activePreset}`);
    } else {
        localStorage.removeItem(`${STORAGE_KEYS.BOARD_FILLED}${activePreset}`);
        console.log(`Removed board filled count for preset ${activePreset}`);
    }
}

// Render all character cards
function renderCharacterCards() {
    console.log('DEBUG: renderCharacterCards called');
    console.log('DEBUG: characterData length:', charactersData.length);
    
    if (!charactersData || charactersData.length === 0) {
        console.error('Character data is missing or empty');
        return;
    }
    
    console.log('Rendering character cards');
    const characterSelector = document.getElementById('characterSelector');
    if (!characterSelector) {
        console.error('Character selector element not found');
        
        // Try again after a short delay
        setTimeout(() => {
            const retrySelector = document.getElementById('characterSelector');
            if (retrySelector) {
                console.log('Character selector found after retry');
                renderCharactersToElement(retrySelector);
            } else {
                console.error('Character selector still not found after retry');
            }
        }, 300);
        return;
    }
    
    renderCharactersToElement(characterSelector);
}

// Helper function to render characters to a container element
function renderCharactersToElement(container) {
    // Log the element to make sure it's what we expect
    console.log('DEBUG: container element:', container);
    
    container.innerHTML = '';
    
    // Create a container with class sections
    const charactersContainer = document.createElement('div');
    charactersContainer.className = 'character-sections-container';
    
    // Define standardized icons for legion effects
    const legionEffectIcons = {
        'STR +%': '💪',
        'DEX +%': '🎯',
        'INT +%': '🧠',
        'LUK +%': '🍀',
        'Max HP +%': '❤️',
        'Max MP +%': '💙',
        'Ignore Defense +%': '🛡️',
        'Boss Damage +%': '👑',
        'Critical Rate +%': '🎯',
        'Critical Damage +%': '💥',
        'Buff Duration +%': '⏱️',
        'Skill Cooldown -% Reduction': '⚡',
        'Summon Duration +%': '🧚',
        'Damage to Normal Monsters +%': '👹',
        'Meso Obtained +%': '💰',
        'Experience Obtained +%': '📊',
        'Stat +%': '📈'
    };
    
    // Group characters by class
    const charactersByClass = {
        warrior: { title: 'Warriors', characters: [] },
        mage: { title: 'Mages', characters: [] },
        archer: { title: 'Archers', characters: [] },
        thief: { title: 'Thieves', characters: [] },
        pirate: { title: 'Pirates', characters: [] },
        special: { title: 'Special Classes', characters: [] }
    };
    
    // Sort characters into their respective class groups
    charactersData.forEach(character => {
        if (charactersByClass[character.class]) {
            charactersByClass[character.class].characters.push(character);
        } else {
            console.warn(`Unknown character class: ${character.class}`);
        }
    });
    
    // Create a section for each class
    Object.values(charactersByClass).forEach(classGroup => {
        if (classGroup.characters.length === 0) {
            return; // Skip empty classes
        }
        
        // Create a section for this class
        const sectionElement = document.createElement('div');
        sectionElement.className = 'character-section';
        
        // Add a header for this class with collapsible functionality
        const headerElement = document.createElement('div');
        headerElement.className = 'character-section-header';
        
        // Add header content with a chevron indicator
        headerElement.innerHTML = `
            <span>${classGroup.title}</span>
            <span class="section-toggle">▼</span>
        `;
        
        sectionElement.appendChild(headerElement);
        
        // Create a container for the character cards in this section
        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'character-cards-container';
        
        // Add all characters for this class
        classGroup.characters.forEach(character => {
            const card = document.createElement('div');
            card.className = 'characterCard';
            card.dataset.id = character.id;
            card.dataset.class = character.class;
            
            // Get standardized icon for this legion effect
            const legionEffect = character.legionEffect;
            const effectIcon = legionEffectIcons[legionEffect] || '🔮';
            
            card.innerHTML = `
                <div class="characterName">${character.name}</div>
                <div class="characterClass">
                    <span class="effect-icon">${effectIcon}</span>
                    <span class="effect-text">${legionEffect}</span>
                </div>
            `;
            
            // Add click handler directly
            card.onclick = function() {
                console.log('Character card clicked:', character.name);
                selectCharacter(character);
            };
            
            cardsContainer.appendChild(card);
        });
        
        // Add the cards container to the section
        sectionElement.appendChild(cardsContainer);
        
        // Add toggle functionality to the header
        headerElement.addEventListener('click', function(e) {
            // Don't toggle if a character card was clicked
            if (e.target.closest('.characterCard')) {
                return;
            }
            
            // Toggle the visibility of the cards container
            const isVisible = cardsContainer.style.display !== 'none';
            cardsContainer.style.display = isVisible ? 'none' : 'grid';
            
            // Update the toggle indicator
            const toggle = headerElement.querySelector('.section-toggle');
            if (toggle) {
                toggle.textContent = isVisible ? '▶' : '▼';
            }
        });
        
        // Add the section to the main container
        charactersContainer.appendChild(sectionElement);
    });
    
    // Add the container to the selector
    container.appendChild(charactersContainer);
    console.log('DEBUG: Characters rendered by class sections');
}

// Filter characters by category - no longer needed, but keep it for compatibility
function filterCharacters(category) {
    // This function is no longer needed as we're showing all characters
    console.log('filterCharacters is deprecated with preset system');
}

// Handle character selection
function selectCharacter(character) {
    console.log('Selecting character:', character.name);
    
    // Show character details
    const detailsContent = document.getElementById('characterDetailsContent');
    if (!detailsContent) {
        console.error('Character details content element not found');
        return;
    }
    
    // Map levels to piece indices based on character class
    const levelToPieceIndex = {
        'warrior': {
            60: 0,  // Level 60 - Basic shape
            100: 1, // Level 100 - Basic shape
            140: 2, // Level 140 - Warrior shape
            200: 4, // Level 200 - Warrior shape
            250: 9  // Level 250 - Warrior shape
        },
        'mage': {
            60: 0,  
            100: 1,
            140: 3, // Level 140 - Mage shape
            200: 7, // Level 200 - Mage shape  
            250: 12 // Level 250 - Mage shape
        },
        'archer': {
            60: 0,
            100: 1,
            140: 3, // Level 140 - Archer shape (same as mage/thief)
            200: 5, // Level 200 - Archer shape
            250: 10 // Level 250 - Archer shape
        },
        'thief': {
            60: 0,
            100: 1, 
            140: 3, // Level 140 - Thief shape (same as mage/archer)
            200: 6, // Level 200 - Thief shape
            250: 11 // Level 250 - Thief shape
        },
        'pirate': {
            60: 0,
            100: 1,
            140: 2, // Level 140 - Pirate shape (same as warrior)
            200: 8, // Level 200 - Pirate shape
            250: 13 // Level 250 - Pirate shape
        },
        'special': {
            // Special classes use their specific pieceIndex from the character data
            // But we'll still allow level selection for UI consistency
            60: character.pieceIndex,
            100: character.pieceIndex,
            140: character.pieceIndex,
            200: character.pieceIndex,
            250: character.pieceIndex
        }
    };
    
    // Create level selection radio buttons
    const levelOptions = [60, 100, 140, 200, 250].map(level => {
        const pieceIndex = levelToPieceIndex[character.class][level] || 0;
        const checked = level === 250 ? 'checked' : ''; // Default to level 250
        return `
            <label class="level-option">
                <input type="radio" name="characterLevel" value="${level}" data-piece-index="${pieceIndex}" ${checked}>
                <span>Level ${level}</span>
            </label>
        `;
    }).join('');
    
    detailsContent.innerHTML = `
        <div class="characterDetailCard" data-class="${character.class}">
            <h4>${character.name}</h4>
            <p><strong>Class:</strong> ${character.class.charAt(0).toUpperCase() + character.class.slice(1)}</p>
            <p><strong>Main Stat:</strong> ${character.mainStat}</p>
            <p><strong>Legion Effect:</strong> ${character.legionEffect}</p>
            <p>${character.description}</p>
            
            <div class="level-selection">
                <p><strong>Select Character Level:</strong></p>
                <div class="level-options">
                    ${levelOptions}
                </div>
            </div>
            
            <button id="addCharacterBtn">Add to Board</button>
        </div>
    `;
    
    // Add button click event
    const addBtn = document.getElementById('addCharacterBtn');
    if (addBtn) {
        addBtn.onclick = function() {
            // Get the selected level and piece index
            const selectedLevel = document.querySelector('input[name="characterLevel"]:checked');
            const level = selectedLevel ? parseInt(selectedLevel.value) : 250;
            const pieceIndex = selectedLevel ? parseInt(selectedLevel.dataset.pieceIndex) : character.pieceIndex;
            
            console.log('Adding character to board:', character.name, 'Level:', level, 'Piece Index:', pieceIndex);
            
            // Create a modified character object with the selected level and piece index
            const modifiedCharacter = {
                ...character,
                level: level,
                pieceIndex: pieceIndex
            };
            
            addCharacterToPieceSelection(modifiedCharacter);
        };
    }
}

// Add character to piece selection
function addCharacterToPieceSelection(character) {
    console.log('Adding character to piece selection:', character.name, 'Level:', character.level, 'Piece Index:', character.pieceIndex);
    
    // CRITICAL FIX: Preserve board state information before making changes
    const boardButton = document.getElementById("boardButton");
    const currentBoardState = {
        boardFilled: localStorage.getItem(STORAGE_KEYS.BOARD_FILLED),
        boardState: localStorage.getItem(STORAGE_KEYS.BOARD_STATE),
        solverState: boardButton?.innerText || ""
    };
    
    // Check if we're in a non-START state
    const isAfterStart = currentBoardState.solverState && 
                         currentBoardState.solverState !== i18n("start");
    
    console.log('Current board state:', 
        `Filled spaces: ${currentBoardState.boardFilled || 0}, `,
        `Solver state: ${currentBoardState.solverState}, `,
        `Is after start: ${isAfterStart}`);
    
    const pieceSelectionContent = document.getElementById('pieceSelectionContent');
    if (!pieceSelectionContent) {
        console.error('Piece selection content element not found');
        return;
    }
    
    // Create a unique ID based on character id and level to allow multiple versions of the same character
    const uniqueId = `${character.id}-${character.level}`;
    
    // Check if character at this level is already selected
    if (document.querySelector(`.selectedPiece[data-unique-id="${uniqueId}"]`)) {
        console.log('Character already selected at this level');
        return;
    }
    
    // Get the appropriate CSS class based on pieceIndex
    const getPieceColorClass = (pieceIndex) => {
        switch(pieceIndex) {
            case 1: return 'piece-lvl60';
            case 2: return 'piece-lvl100';
            case 3: return 'piece-lvl140-warrior-pirate';
            case 4: return 'piece-lvl140-mage-thief-archer';
            case 5: return 'piece-lvl200-warrior';
            case 6: return 'piece-lvl200-archer';
            case 7: return 'piece-lvl200-thief-lab';
            case 8: return 'piece-lvl200-mage';
            case 9: return 'piece-lvl200-pirate';
            case 10: return 'piece-lvl250-warrior';
            case 11: return 'piece-lvl250-archer';
            case 12: return 'piece-lvl250-thief';
            case 13: return 'piece-lvl250-mage';
            case 14: return 'piece-lvl250-pirate';
            case 15: return 'piece-lvl250-xenon';
            case 16:
            case 17:
            case 18: return 'piece-lab-enhanced';
            default: return '';
        }
    };

    // Create piece element
    const pieceElement = document.createElement('div');
    pieceElement.className = `selectedPiece ${getPieceColorClass(character.pieceIndex)}`;
    pieceElement.dataset.id = character.id;
    pieceElement.dataset.uniqueId = uniqueId;
    pieceElement.dataset.pieceIndex = character.pieceIndex;
    pieceElement.dataset.level = character.level;
    pieceElement.dataset.characterClass = character.class;
    
    pieceElement.innerHTML = `
        <div class="selectedPieceInfo">
            <span class="characterName">${character.name}</span>
            <span class="characterLevel">Lvl ${character.level}</span>
        </div>
        <button class="removePieceBtn">×</button>
    `;
    
    // Add remove button event
    const removeBtn = pieceElement.querySelector('.removePieceBtn');
    if (removeBtn) {
        removeBtn.onclick = function() {
            console.log('Removing character:', character.name, 'Level:', character.level);
            pieceElement.remove();
            updatePieceAmounts();
            toggleCharacterSelection(character.id, false);
            
            // Save state after removing character
            saveCurrentState();
        };
    }
    
    // Store current boardFilled before adding piece
    const originalBoardFilled = isAfterStart ? 
        (currentBoardState.boardFilled ? JSON.parse(currentBoardState.boardFilled) : 0) : 0;
    
    // Add the piece to the DOM
    pieceSelectionContent.appendChild(pieceElement);
    
    // Update the piece amounts in the solver
    updatePieceAmounts();
    
    // Highlight selected character
    toggleCharacterSelection(character.id, true);
    
    // Save the current selection state
    saveCurrentState();
    
    // CRITICAL FIX: Restore boardFilled if we're adding a character after solving has started
    if (isAfterStart && currentBoardState.boardFilled) {
        console.log(`Restoring board state after adding character during solving: ${originalBoardFilled}`);
        
        // Restore the boardFilled value in localStorage
        localStorage.setItem(STORAGE_KEYS.BOARD_FILLED, JSON.stringify(originalBoardFilled));
        
        // Update the display
        const boardFilledElement = document.getElementById('boardFilledValue');
        if (boardFilledElement) {
            boardFilledElement.innerText = originalBoardFilled.toString();
            console.log(`Restored boardFilled display to ${originalBoardFilled}`);
        }
        
        // Force a verification of the board state in main.js
        if (typeof window.updatePiecesForSolver === 'function') {
            setTimeout(() => {
                console.log('Calling updatePiecesForSolver to verify board state');
                window.updatePiecesForSolver();
            }, 100);
        }
    }
}

// Toggle character selection highlight
function toggleCharacterSelection(characterId, isSelected) {
    const card = document.querySelector(`.characterCard[data-id="${characterId}"]`);
    if (card) {
        if (isSelected) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    }
}

// Update piece amounts for the solver
function updatePieceAmounts() {
    console.log('Updating piece amounts');
    
    // Flag to prevent infinite recursion
    if (window._isUpdatingPieces) {
        console.log('Already updating pieces, preventing recursive call');
        return;
    }
    
    // Set recursion guard flag
    window._isUpdatingPieces = true;
    
    try {
        // Check current state of solver
        const boardButton = document.getElementById("boardButton");
        const solverState = boardButton?.innerText || "";
        const isAfterStart = solverState && solverState !== i18n("start");
        
        // Store the current boardFilled value to restore it later if needed
        let originalBoardFilled = null;
        if (isAfterStart) {
            originalBoardFilled = localStorage.getItem(STORAGE_KEYS.BOARD_FILLED);
            console.log(`Solver is in ${solverState} state, preserving boardFilled: ${originalBoardFilled}`);
        }
        
        // Make sure the form exists
        if (!document.getElementById('pieceForm')) {
            createHiddenPieceForm();
        }
        
        // Reset all piece amounts
        for (let i = 1; i <= 18; i++) { // Increased to 18 to include lab pieces
            const pieceInput = document.getElementById(`piece${i}`);
            if (pieceInput) {
                pieceInput.value = 0;
            } else {
                console.warn(`Piece input element for piece${i} not found`);
                // Try to create it if missing
                const form = document.querySelector('#pieceForm form');
                if (form) {
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.id = `piece${i}`;
                    input.name = `piece${i}`;
                    input.value = '0';
                    input.min = '0';
                    form.appendChild(input);
                    console.log(`Created missing piece input: piece${i}`);
                }
            }
        }
        
        // Count selected pieces by type
        const pieceCountByIndex = {};
        let characterCount = 0;
        let totalPieces = 0;
        
        document.querySelectorAll('.selectedPiece').forEach(piece => {
            const pieceIndex = parseInt(piece.dataset.pieceIndex);
            pieceCountByIndex[pieceIndex] = (pieceCountByIndex[pieceIndex] || 0) + 1;
            characterCount++;
            
            // Calculate total pieces (cells) based on character level
            const level = parseInt(piece.dataset.level) || 250;
            let cellCount = 1; // Default
            
            if (level === 60) cellCount = 1;
            else if (level === 100) cellCount = 2;
            else if (level === 140) cellCount = 3;
            else if (level === 200) cellCount = 4;
            else if (level === 250) cellCount = 5;
            
            totalPieces += cellCount;
        });
        
        console.log('Piece counts by index:', pieceCountByIndex);
        console.log('Total characters:', characterCount);
        console.log('Total pieces (cells):', totalPieces);
        
        // Update piece inputs
        for (const [pieceIndex, count] of Object.entries(pieceCountByIndex)) {
            const pieceInput = document.getElementById(`piece${pieceIndex}`);
            if (pieceInput) {
                pieceInput.value = count;
                console.log(`Updated piece${pieceIndex} to ${count}`);
            } else {
                console.warn(`Piece input element for piece${pieceIndex} not found`);
            }
        }
        
        // CRITICAL FIX: Restore the boardFilled value if the solver has already started
        if (isAfterStart && originalBoardFilled) {
            console.log(`Restoring boardFilled value (${originalBoardFilled}) after character update`);
            localStorage.setItem(STORAGE_KEYS.BOARD_FILLED, originalBoardFilled);
            
            // Update the boardFilled display
            const boardFilledDisplay = document.getElementById('boardFilledValue');
            if (boardFilledDisplay) {
                boardFilledDisplay.innerText = JSON.parse(originalBoardFilled);
            }
        }
        
        // Call global update function if available, but DON'T call updatePiecesForSolver
        // This was causing the infinite recursion
        if (typeof window.updateCurrentPieces === 'function') {
            window.updateCurrentPieces();
        }
    } finally {
        // Reset recursion guard flag
        window._isUpdatingPieces = false;
    }
}

// Clear all selected pieces
function clearPieceSelection() {
    console.log('Clearing all selected pieces');
    
    // Use our helper to clear the UI
    clearCharacterSelectionUI();
    
    // Update the piece amounts in the solver
    updatePieceAmounts();
    
    // Save the cleared state
    saveCurrentState();
}

// Save the current state to localStorage for the current preset
function saveCurrentState() {
    // Prevent recursion
    if (window._isSavingState) {
        console.log("Already saving state, preventing recursion");
        return;
    }
    
    window._isSavingState = true;
    
    try {
        console.log(`Saving current state to localStorage for preset ${activePreset}`);
        
        // Get all selected pieces
        const selectedPieces = [];
        document.querySelectorAll('.selectedPiece').forEach(piece => {
            selectedPieces.push({
                characterId: parseInt(piece.dataset.id),
                level: parseInt(piece.dataset.level),
                pieceIndex: parseInt(piece.dataset.pieceIndex),
                uniqueId: piece.dataset.uniqueId
            });
        });
        
        // Save to localStorage with preset suffix
        localStorage.setItem(`${STORAGE_KEYS.SELECTED_CHARACTERS}${activePreset}`, JSON.stringify(selectedPieces));
        
        // Save the board state for this preset
        saveBoardStateForPreset();
        
        console.log(`Saved ${selectedPieces.length} characters to localStorage for preset ${activePreset}`);
    } catch (error) {
        console.error('Error saving state to localStorage:', error);
    } finally {
        window._isSavingState = false;
    }
}

// Load the saved state from localStorage for the current preset
function loadSavedState() {
    console.log(`Loading saved state from localStorage for preset ${activePreset}`);
    
    try {
        // Always clear existing selection and character highlights
        clearCharacterSelectionUI();
        
        // Load selected characters for the current preset
        const savedCharacters = localStorage.getItem(`${STORAGE_KEYS.SELECTED_CHARACTERS}${activePreset}`);
        if (savedCharacters) {
            const characters = JSON.parse(savedCharacters);
            
            if (characters && characters.length > 0) {
                console.log(`Found ${characters.length} saved characters for preset ${activePreset}`);
                
                // Add each saved character
                characters.forEach(savedChar => {
                    // Find the character data
                    const characterData = charactersData.find(c => c.id === savedChar.characterId);
                    if (characterData) {
                        // Create a modified character object with the saved level and piece index
                        const modifiedCharacter = {
                            ...characterData,
                            level: savedChar.level,
                            pieceIndex: savedChar.pieceIndex
                        };
                        
                        // Add the character without saving state (to avoid recursion)
                        addCharacterWithoutSaving(modifiedCharacter);
                    }
                });
                
                // Update piece amounts once after adding all characters
                updatePieceAmounts();
            } else {
                console.log('No saved characters found for this preset');
                // Reset piece amounts since we have no characters
                resetPieceAmounts();
            }
        } else {
            console.log('No saved character state found for this preset');
            // Reset piece amounts since we have no characters
            resetPieceAmounts();
        }
        
        // Load the board state for this preset
        loadBoardStateForPreset(activePreset);
        
    } catch (error) {
        console.error('Error loading state from localStorage:', error);
    }
}

// Helper function to clear character selection UI
function clearCharacterSelectionUI() {
    // Clear the selected characters container
    const pieceSelectionContent = document.getElementById('pieceSelectionContent');
    if (pieceSelectionContent) {
        pieceSelectionContent.innerHTML = '';
    }
    
    // Remove highlights from character cards
    document.querySelectorAll('.characterCard.selected').forEach(card => {
        card.classList.remove('selected');
    });
}

// Add character without saving state (to avoid recursion during loading)
function addCharacterWithoutSaving(character) {
    console.log('Adding saved character:', character.name, 'Level:', character.level);
    
    const pieceSelectionContent = document.getElementById('pieceSelectionContent');
    if (!pieceSelectionContent) {
        console.error('Piece selection content element not found');
        return;
    }
    
    // Create a unique ID based on character id and level
    const uniqueId = `${character.id}-${character.level}`;
    
    // Check if character at this level is already selected
    if (document.querySelector(`.selectedPiece[data-unique-id="${uniqueId}"]`)) {
        console.log('Character already selected at this level');
        return;
    }
    
    // Get the appropriate CSS class based on pieceIndex
    const getPieceColorClass = (pieceIndex) => {
        switch(pieceIndex) {
            case 1: return 'piece-lvl60';
            case 2: return 'piece-lvl100';
            case 3: return 'piece-lvl140-warrior-pirate';
            case 4: return 'piece-lvl140-mage-thief-archer';
            case 5: return 'piece-lvl200-warrior';
            case 6: return 'piece-lvl200-archer';
            case 7: return 'piece-lvl200-thief-lab';
            case 8: return 'piece-lvl200-mage';
            case 9: return 'piece-lvl200-pirate';
            case 10: return 'piece-lvl250-warrior';
            case 11: return 'piece-lvl250-archer';
            case 12: return 'piece-lvl250-thief';
            case 13: return 'piece-lvl250-mage';
            case 14: return 'piece-lvl250-pirate';
            case 15: return 'piece-lvl250-xenon';
            case 16:
            case 17:
            case 18: return 'piece-lab-enhanced';
            default: return '';
        }
    };

    // Create piece element
    const pieceElement = document.createElement('div');
    pieceElement.className = `selectedPiece ${getPieceColorClass(character.pieceIndex)}`;
    pieceElement.dataset.id = character.id;
    pieceElement.dataset.uniqueId = uniqueId;
    pieceElement.dataset.pieceIndex = character.pieceIndex;
    pieceElement.dataset.level = character.level;
    pieceElement.dataset.characterClass = character.class;
    
    pieceElement.innerHTML = `
        <div class="selectedPieceInfo">
            <span class="characterName">${character.name}</span>
            <span class="characterLevel">Lvl ${character.level}</span>
        </div>
        <button class="removePieceBtn">×</button>
    `;
    
    // Add remove button event
    const removeBtn = pieceElement.querySelector('.removePieceBtn');
    if (removeBtn) {
        removeBtn.onclick = function() {
            console.log('Removing character:', character.name, 'Level:', character.level);
            pieceElement.remove();
            updatePieceAmounts();
            toggleCharacterSelection(character.id, false);
            
            // Save state after removing character
            saveCurrentState();
        };
    }
    
    // Add the piece to the DOM
    pieceSelectionContent.appendChild(pieceElement);
    
    // Highlight selected character
    toggleCharacterSelection(character.id, true);
}

// Debug utility for the UI - expose this to window
function debugCharacterSelector() {
    console.log('=== Character Selection Debug Information ===');
    
    // Show active preset information
    console.log(`Active Preset: ${activePreset}`);
    
    // Count character cards and their classes
    const characterCards = document.querySelectorAll('.characterCard');
    const classCounts = {};
    characterCards.forEach(card => {
        const charClass = card.getAttribute('data-class');
        classCounts[charClass] = (classCounts[charClass] || 0) + 1;
    });
    
    console.log(`Total character cards: ${characterCards.length}`);
    console.log('Character counts by class:', classCounts);
    
    // Check preset buttons
    const presetButtons = document.querySelectorAll('.presetBtn');
    console.log(`Total preset buttons: ${presetButtons.length}`);
    console.log('Preset buttons:', Array.from(presetButtons).map(btn => btn.getAttribute('data-preset')));
    
    // Check active preset
    const activePresetButton = document.querySelector('.presetBtn.active');
    if (activePresetButton) {
        console.log('Active preset button:', activePresetButton.getAttribute('data-preset'));
    } else {
        console.log('No active preset button found');
    }
    
    // Check currently selected pieces
    const selectedPieces = document.querySelectorAll('.selectedPiece');
    console.log(`Total selected pieces: ${selectedPieces.length}`);
    
    if (selectedPieces.length > 0) {
        console.log('Selected pieces details:');
        selectedPieces.forEach(piece => {
            const id = piece.getAttribute('data-id');
            const pieceIndex = piece.getAttribute('data-piece-index');
            const level = piece.getAttribute('data-level');
            
            console.log(`- ID: ${id}, Piece Index: ${pieceIndex}, Level: ${level}`);
            
            // Add visual representation of the piece shape
            if (window.pieces && pieceIndex > 0 && pieceIndex <= window.pieces.length) {
                const index = pieceIndex - 1; // Convert from 1-based to 0-based
                if (window.pieces[index] && window.pieces[index].shape) {
                    console.log('  Shape:');
                    window.pieces[index].shape.forEach(row => {
                        let rowString = '  ';
                        row.forEach(cell => {
                            rowString += cell === 0 ? '□ ' : '■ ';
                        });
                        console.log(rowString);
                    });
                }
            }
        });
    }
    
    // Debug localStorage for presets
    console.log('=== Preset Storage Debug ===');
    for (let i = 1; i <= 5; i++) {
        const charactersKey = `${STORAGE_KEYS.SELECTED_CHARACTERS}${i}`;
        const boardStateKey = `${STORAGE_KEYS.BOARD_STATE}${i}`;
        const boardFilledKey = `${STORAGE_KEYS.BOARD_FILLED}${i}`;
        
        const characters = localStorage.getItem(charactersKey);
        const boardState = localStorage.getItem(boardStateKey);
        const boardFilled = localStorage.getItem(boardFilledKey);
        
        console.log(`Preset ${i}:`);
        console.log(`- Characters: ${characters ? JSON.parse(characters).length + ' characters' : 'None'}`);
        console.log(`- Board State: ${boardState ? 'Saved' : 'None'}`);
        console.log(`- Board Filled: ${boardFilled || 'None'}`);
    }
    
    // Debug pieces array (used by the solver)
    if (window.pieces) {
        console.log('=== Pieces Array Debug ===');
        console.log(`Total piece types: ${window.pieces.length}`);
        
        // Count piece usage
        let totalPieces = 0;
        window.pieces.forEach((piece, index) => {
            if (piece.amount > 0) {
                totalPieces += piece.amount;
                console.log(`Piece #${index + 1} (${getPieceDescription(index + 1)}):`);
                console.log(`  Amount: ${piece.amount}`);
                console.log(`  Shape:`);
                piece.shape.forEach(row => {
                    let rowString = '  ';
                    row.forEach(cell => {
                        rowString += cell === 0 ? '□ ' : '■ ';
                    });
                    console.log(rowString);
                });
            }
        });
        
        console.log(`Total pieces used: ${totalPieces}`);
    } else {
        console.log('Pieces array not found! The solver will not work correctly.');
    }
}

// Helper function to get piece description based on index
function getPieceDescription(index) {
    switch(index) {
        case 1: return "Level 60 (All classes)";
        case 2: return "Level 100 (All classes)";
        case 3: return "Level 140 Warrior/Pirate";
        case 4: return "Level 140 Mage/Thief/Archer";
        case 5: return "Level 200 Warrior";
        case 6: return "Level 200 Archer";
        case 7: return "Level 200 Thief/Lab";
        case 8: return "Level 200 Mage";
        case 9: return "Level 200 Pirate";
        case 10: return "Level 250 Warrior";
        case 11: return "Level 250 Archer";
        case 12: return "Level 250 Thief";
        case 13: return "Level 250 Mage";
        case 14: return "Level 250 Pirate";
        case 15: return "Level 250 Xenon";
        case 16: return "Level 200 Enhanced Lab";
        case 17: return "Level 250 Enhanced Lab";
        case 18: return "Level 250 Lab";
        default: return `Unknown piece type (${index})`;
    }
}

// Make the debugCharacterSelector function globally accessible
window.debugCharacterSelector = debugCharacterSelector;

// For compatibility with external code
function updatePiecesAndSavePreset() {
    // Guard against recursion
    if (window._isSavingPreset) {
        console.log('Already saving preset, preventing recursive call');
        return;
    }
    
    window._isSavingPreset = true;
    
    try {
        // Update piece amounts but don't trigger additional save operations
        updatePieceAmounts();
        
        // Save the current state
        saveCurrentState();
    } finally {
        window._isSavingPreset = false;
    }
}

// Reset all piece amounts to zero
function resetPieceAmounts() {
    console.log('Resetting all piece amounts to zero');
    
    // Reset all piece inputs to zero
    for (let i = 1; i <= 18; i++) {
        const pieceInput = document.getElementById(`piece${i}`);
        if (pieceInput) {
            pieceInput.value = 0;
        }
    }
    
    // Clear the character selection UI
    clearCharacterSelectionUI();
    
    // Reset piece amounts internally in the solver
    if (window.pieces) {
        for (let piece of window.pieces) {
            piece.amount = 0;
        }
    }
    
    // Set current values to zero in the display
    const currentPiecesValue = document.getElementById('currentPiecesValue');
    if (currentPiecesValue) {
        currentPiecesValue.innerText = '0';
    }
    
    const currentCaracterCountValue = document.getElementById('currentCaracterCountValue');
    if (currentCaracterCountValue) {
        currentCaracterCountValue.innerText = '0';
    }
    
    // Save zeroed state to localStorage (without triggering recursion)
    localStorage.setItem(STORAGE_KEYS.PIECE_AMOUNTS, JSON.stringify(Array(18).fill(0)));
    localStorage.setItem(STORAGE_KEYS.CURRENT_PIECES, JSON.stringify(0));
    
    // Use global update only if we need to update the UI in other components
    // This is wrapped in a setTimeout to avoid any recursion issues
    setTimeout(() => {
        if (typeof window.updateCurrentPieces === 'function') {
            window.updateCurrentPieces();
        }
    }, 0);
}

export { charactersData, initCharacterSelector, debugCharacterSelector, saveCurrentState, loadSavedState, updatePiecesAndSavePreset }; 