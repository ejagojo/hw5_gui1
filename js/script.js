/*
Name: Eljohn(EJ) Agojo
Date: 12/16/2024
File: script.js

GUI Assignment:
    This assignment is about creating a web app copy of the infamous game scrabble, by utilizing jQuery and our knowledge of
    HTML, CSS, and JavaScript.

Eljohn Agojo, UMass Lowell Computer Science, eljohn_agojo@student.uml.edu
Copyright (c) 2024 by Eljohn. All rights reserved. May be freely copied or 
excerpted for educational purposes with credit to the author.
*/

document.addEventListener("DOMContentLoaded", () => {
  // Grabbing references to all key UI elements from the DOM for easy manipulation.
  const board = document.getElementById("scrabble-board");
  const rack = document.getElementById("tile-rack");
  const scoreElement = document.getElementById("score");
  const letterCounter = document.getElementById("letter-counter");
  const garbageBin = document.getElementById("garbage-bin");
  const modal = document.getElementById("modal");
  const modalMessage = document.getElementById("modal-message");
  const modalClose = document.getElementById("modal-close");
  const validateWordButton = document.getElementById("validate-word");
  const refreshTilesButton = document.getElementById("refresh-tiles");
  const recallTileButton = document.getElementById("recall-tile");

  // Tracking current score and other gameplay states.
  let currentScore = 0;
  let isCenterTileUsed = false;
  let uniqueTileId = 0; // Unique ID for each tile so we can reference them easily.
  let previouslyScoredWords = [];
  let wordsScoredCount = 0;

  // A stack to keep track of placed tiles: each entry stores tile info and its board cell.
  let placedTilesStack = [];

  // Flag to indicate if "Refresh Tiles" action was performed, affects recall logic.
  let hasRefreshed = false;

  // When refresh button is clicked, we fill the rack to seven tiles and mark that refresh occurred.
  refreshTilesButton.addEventListener("click", () => {
    fillRackToSeven();
    updateLetterCounter();
    hasRefreshed = true;
  });

  // resetTiles: restores all tile counts to their original distribution, ready for a new game.
  function resetTiles() {
    for (const letter in ScrabbleTiles) {
      if (ScrabbleTiles.hasOwnProperty(letter)) {
        ScrabbleTiles[letter]["number-remaining"] = ScrabbleTiles[letter]["original-distribution"];
      }
    }
  }

  // premiumSquares: a predefined list of all special bonus squares on the standard Scrabble board.
  // Each entry includes the row, column, type of bonus, and label.
  const premiumSquares = [
    { row: 7, col: 7, type: "center", label: "⭐ Double Word Score" },
    { row: 0, col: 0, type: "triple-word", label: "Triple Word Score" },
    { row: 0, col: 14, type: "triple-word", label: "Triple Word Score" },
    { row: 14, col: 0, type: "triple-word", label: "Triple Word Score" },
    { row: 14, col: 14, type: "triple-word", label: "Triple Word Score" },
    { row: 0, col: 7, type: "triple-word", label: "Triple Word Score" },
    { row: 14, col: 7, type: "triple-word", label: "Triple Word Score" },
    { row: 7, col: 0, type: "triple-word", label: "Triple Word Score" },
    { row: 7, col: 14, type: "triple-word", label: "Triple Word Score" },
    { row: 1, col: 1, type: "double-word", label: "Double Word Score" },
    { row: 2, col: 2, type: "double-word", label: "Double Word Score" },
    { row: 3, col: 3, type: "double-word", label: "Double Word Score" },
    { row: 4, col: 4, type: "double-word", label: "Double Word Score" },
    { row: 10, col: 10, type: "double-word", label: "Double Word Score" },
    { row: 11, col: 11, type: "double-word", label: "Double Word Score" },
    { row: 12, col: 12, type: "double-word", label: "Double Word Score" },
    { row: 13, col: 13, type: "double-word", label: "Double Word Score" },
    { row: 13, col: 1, type: "double-word", label: "Double Word Score" },
    { row: 1, col: 13, type: "double-word", label: "Double Word Score" },
    { row: 12, col: 2, type: "double-word", label: "Double Word Score" },
    { row: 2, col: 12, type: "double-word", label: "Double Word Score" },
    { row: 11, col: 3, type: "double-word", label: "Double Word Score" },
    { row: 3, col: 11, type: "double-word", label: "Double Word Score" },
    { row: 10, col: 4, type: "double-word", label: "Double Word Score" },
    { row: 4, col: 10, type: "double-word", label: "Double Word Score" },
    { row: 1, col: 5, type: "triple-letter", label: "Triple Letter Score" },
    { row: 1, col: 9, type: "triple-letter", label: "Triple Letter Score" },
    { row: 5, col: 1, type: "triple-letter", label: "Triple Letter Score" },
    { row: 5, col: 13, type: "triple-letter", label: "Triple Letter Score" },
    { row: 9, col: 1, type: "triple-letter", label: "Triple Letter Score" },
    { row: 9, col: 13, type: "triple-letter", label: "Triple Letter Score" },
    { row: 13, col: 5, type: "triple-letter", label: "Triple Letter Score" },
    { row: 13, col: 9, type: "triple-letter", label: "Triple Letter Score" },
    { row: 5, col: 5, type: "triple-letter", label: "Triple Letter Score" },
    { row: 5, col: 9, type: "triple-letter", label: "Triple Letter Score" },
    { row: 9, col: 5, type: "triple-letter", label: "Triple Letter Score" },
    { row: 9, col: 9, type: "triple-letter", label: "Triple Letter Score" },
    { row: 0, col: 3, type: "double-letter", label: "Double Letter Score" },
    { row: 0, col: 11, type: "double-letter", label: "Double Letter Score" },
    { row: 2, col: 6, type: "double-letter", label: "Double Letter Score" },
    { row: 2, col: 8, type: "double-letter", label: "Double Letter Score" },
    { row: 3, col: 0, type: "double-letter", label: "Double Letter Score" },
    { row: 3, col: 7, type: "double-letter", label: "Double Letter Score" },
    { row: 3, col: 14, type: "double-letter", label: "Double Letter Score" },
    { row: 6, col: 2, type: "double-letter", label: "Double Letter Score" },
    { row: 6, col: 6, type: "double-letter", label: "Double Letter Score" },
    { row: 6, col: 8, type: "double-letter", label: "Double Letter Score" },
    { row: 6, col: 12, type: "double-letter", label: "Double Letter Score" },
    { row: 7, col: 3, type: "double-letter", label: "Double Letter Score" },
    { row: 7, col: 11, type: "double-letter", label: "Double Letter Score" },
    { row: 8, col: 2, type: "double-letter", label: "Double Letter Score" },
    { row: 8, col: 6, type: "double-letter", label: "Double Letter Score" },
    { row: 8, col: 8, type: "double-letter", label: "Double Letter Score" },
    { row: 8, col: 12, type: "double-letter", label: "Double Letter Score" },
    { row: 11, col: 0, type: "double-letter", label: "Double Letter Score" },
    { row: 11, col: 7, type: "double-letter", label: "Double Letter Score" },
    { row: 11, col: 14, type: "double-letter", label: "Double Letter Score" },
    { row: 14, col: 3, type: "double-letter", label: "Double Letter Score" },
    { row: 14, col: 11, type: "double-letter", label: "Double Letter Score" },
    { row: 12, col: 6, type: "double-letter", label: "Double Letter Score" },
    { row: 12, col: 8, type: "double-letter", label: "Double Letter Score" },
  ];

  // generateBoard: creates the 15x15 Scrabble board dynamically.
  // Each cell is assigned data attributes for row/col and special classes for premium squares.
  function generateBoard() {
    board.innerHTML = "";
    for (let row = 0; row < 15; row++) {
      for (let col = 0; col < 15; col++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.setAttribute("data-row", row);
        cell.setAttribute("data-col", col);
        cell.setAttribute("data-locked", "false");

        const premium = premiumSquares.find((sq) => sq.row === row && sq.col === col);
        if (premium) {
          cell.classList.add(premium.type);
          const label = document.createElement("span");
          label.textContent = premium.label;
          label.classList.add("cell-label");
          cell.appendChild(label);
        }

        if (row === 7 && col === 7) {
          // The center cell must host the first tile placed.
          cell.classList.add("center");
        }

        cell.addEventListener("dragover", allowDrop);
        cell.addEventListener("drop", handleDrop);

        board.appendChild(cell);
      }
    }
  }

  // allowDrop: Enables dropping of dragged tiles onto the board cells.
  function allowDrop(e) {
    e.preventDefault();
  }

  // isAdjacentToPlacedTile: ensures that after the first tile, every placed tile is next to an existing tile.
  // Checks the four orthogonal neighbors for placed tiles.
  function isAdjacentToPlacedTile(row, col) {
    if (placedTilesStack.length === 0) return true;

    const deltas = [[-1,0],[1,0],[0,-1],[0,1]];
    for (let [dr,dc] of deltas) {
      const nr = row+dr;
      const nc = col+dc;
      if (nr >=0 && nr <15 && nc>=0 && nc<15) {
        const neighborCell = board.querySelector(`.cell[data-row="${nr}"][data-col="${nc}"]`);
        if (!neighborCell) continue;
        if (neighborCell.getAttribute("data-locked") === "true") {
          return true;
        }
      }
    }
    return false;
  }

  // fillRackToSeven: After playing or discarding tiles, bring the rack back to 7 tiles if possible.
  function fillRackToSeven() {
    const currentTilesInRack = rack.querySelectorAll('.tile').length;
    const needed = 7 - currentTilesInRack;
    if (needed > 0) {
      addTilesToRack(needed);
    }
  }

  // addTilesToRack: draws the specified number of new tiles from the distribution to the player's rack.
  function addTilesToRack(count) {
    for (let i = 0; i < count; i++) {
      const letter = getRandomLetter();
      if (!letter) {
        // No more tiles available, end the game gracefully.
        const summary = `Game Over! No more tiles available!\nWords Scored: ${wordsScoredCount}\nTotal Score: ${currentScore}`;
        showModal(summary);
        return;
      }

      const tile = document.createElement("img");
      tile.src = (letter === "_")
        ? `./graphics_data/Scrabble_Tiles/Scrabble_Tile_Blank.jpg`
        : `./graphics_data/Scrabble_Tiles/Scrabble_Tile_${letter}.jpg`;

      tile.classList.add("tile");
      tile.setAttribute("data-letter", letter);
      tile.setAttribute("data-tile-id", `tile-${uniqueTileId++}`);
      tile.setAttribute("draggable", "true");

      tile.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text", tile.getAttribute("data-tile-id"));
      });

      rack.appendChild(tile);
    }
  }

  // handleDrop: triggered when a tile is dropped onto a cell.
  // Validates if the placement is allowed (center for first tile, adjacency for subsequent tiles).
  function handleDrop(e) {
    e.preventDefault();
    const cellElem = e.target.classList.contains("cell") ? e.target : e.target.closest(".cell");
    if (!cellElem) return;

    const tileId = e.dataTransfer.getData("text");
    const tile = document.querySelector(`[data-tile-id="${tileId}"]`);
    if (!tile || !cellElem) return;

    const row = parseInt(cellElem.getAttribute("data-row"), 10);
    const col = parseInt(cellElem.getAttribute("data-col"), 10);

    // Check if the first placed tile is on the center square.
    const isCenterSquare = (row === 7 && col === 7);
    if (placedTilesStack.length === 0 && !isCenterSquare) {
      showModal("The first tile must be placed on the center square.");
      return;
    }

    // For subsequent tiles, enforce adjacency.
    if (placedTilesStack.length > 0) {
      if (!isAdjacentToPlacedTile(row,col)) {
        showModal("This tile must be placed adjacent to an existing tile.");
        // Bounce the tile back to the rack.
        rack.appendChild(tile);
        tile.style.width = "";
        tile.style.height = "";
        return;
      }
    }

    // If cell is free, lock the tile in.
    if (cellElem.getAttribute("data-locked") === "false") {
      let premiumLabel = null;
      const label = cellElem.querySelector(".cell-label");
      if (label) {
        premiumLabel = label.textContent;
        label.remove(); // Remove label once tile is placed.
      }

      cellElem.appendChild(tile);
      cellElem.setAttribute("data-locked", "true");
      tile.style.width = "100%";
      tile.style.height = "100%";

      if (isCenterSquare) {
        isCenterTileUsed = true;
      }

      placedTilesStack.push({ tile: tile, cell: cellElem, validated: false, premiumLabel: premiumLabel });

      updateLetterCounter();
    }
  }

  // showModal: Displays a modal with a given message to inform the user about rules or errors.
  function showModal(message) {
    modalMessage.textContent = message;
    modal.classList.remove("hidden");
  }

  // Close the modal on OK button click.
  modalClose.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  // generateTiles: fills the player's rack at the start of a new game.
  function generateTiles() {
    rack.innerHTML = "";
    fillRackToSeven();
  }

  // getRandomLetter: draws a random letter from the remaining tile distribution.
  function getRandomLetter() {
    const letters = Object.keys(ScrabbleTiles);
    const total = letters.reduce((sum, key) => sum + ScrabbleTiles[key]["number-remaining"], 0);

    if (total === 0) {
      return null; // No tiles left.
    }

    let randomIndex = Math.floor(Math.random() * total);
    for (const letter of letters) {
      randomIndex -= ScrabbleTiles[letter]["number-remaining"];
      if (randomIndex < 0) {
        ScrabbleTiles[letter]["number-remaining"]--;
        return letter;
      }
    }
    return null;
  }

  // updateLetterCounter: refreshes the letter usage table.
  function updateLetterCounter() {
    renderLetterCounter();
  }

  // renderLetterCounter: shows how many of each letter have been used vs total.
  function renderLetterCounter() {
    const tableRows = Object.entries(ScrabbleTiles)
      .map(([letter, info]) => {
        const used = info["original-distribution"] - info["number-remaining"];
        return `
          <tr>
            <td>${letter}</td>
            <td>${used}</td>
            <td>${info["original-distribution"]}</td>
          </tr>`;
      })
      .join("");

    letterCounter.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Letter</th>
            <th>Used</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>`;
  }

  // "New Game" button: resets everything for a fresh start.
  document.getElementById("new-game").addEventListener("click", () => {
    currentScore = 0;
    scoreElement.textContent = currentScore;
    isCenterTileUsed = false;
    resetTiles();
    generateBoard();
    generateTiles();
    updateLetterCounter();
    previouslyScoredWords = [];
    wordsScoredCount = 0;
    placedTilesStack = []; 
    hasRefreshed = false;
  });

  // Garbage bin events: allows discarding a tile from rack to refresh it.
  garbageBin.addEventListener("dragover", (e) => {
    e.preventDefault();
    garbageBin.classList.add("drag-over");
  });

  garbageBin.addEventListener("dragleave", () => {
    garbageBin.classList.remove("drag-over");
  });

  garbageBin.addEventListener("drop", (e) => {
    e.preventDefault();
    garbageBin.classList.remove("drag-over");

    const tileId = e.dataTransfer.getData("text");
    const tile = document.querySelector(`[data-tile-id="${tileId}"]`);

    if (!tile) return;

    tile.remove();
    generateTileInRack();
    updateLetterCounter();
  });

  // generateTileInRack: draws a single new tile after discarding one to maintain 7 tiles in hand.
  function generateTileInRack() {
    const letter = getRandomLetter();
    if (!letter) {
      // No tiles left: game over scenario.
      const summary = `Game Over! No more tiles available!\nWords Scored: ${wordsScoredCount}\nTotal Score: ${currentScore}`;
      showModal(summary);
      return;
    }

    const tile = document.createElement("img");
    tile.src = (letter === "_")
      ? `./graphics_data/Scrabble_Tiles/Scrabble_Tile_Blank.jpg`
      : `./graphics_data/Scrabble_Tiles/Scrabble_Tile_${letter}.jpg`;

    tile.classList.add("tile");
    tile.setAttribute("data-letter", letter);
    tile.setAttribute("data-tile-id", `tile-${uniqueTileId++}`);
    tile.setAttribute("draggable", "true");

    tile.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text", tile.getAttribute("data-tile-id"));
    });

    rack.appendChild(tile);
    updateLetterCounter();
  }

  // getWordsFromBoard: extracts all horizontal and vertical words formed on the board.
  // Only continuous sequences of letters longer than 1 count as words.
  function getWordsFromBoard() {
    const size = 15;
    const boardArray = [];
    for (let r = 0; r < size; r++) {
      boardArray[r] = [];
      for (let c = 0; c < size; c++) {
        const cell = board.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
        const tileImg = cell.querySelector('img.tile');
        if (tileImg) {
          const letter = tileImg.getAttribute('data-letter');
          boardArray[r][c] = letter;
        } else {
          boardArray[r][c] = null;
        }
      }
    }

    const horizontalWords = [];
    for (let r = 0; r < size; r++) {
      let word = [];
      for (let c = 0; c < size; c++) {
        const letter = boardArray[r][c];
        if (letter) {
          word.push(letter);
        } else {
          if (word.length > 1) {
            horizontalWords.push(word.join(''));
          }
          word = [];
        }
      }
      if (word.length > 1) {
        horizontalWords.push(word.join(''));
      }
    }

    const verticalWords = [];
    for (let c = 0; c < size; c++) {
      let word = [];
      for (let r = 0; r < size; r++) {
        const letter = boardArray[r][c];
        if (letter) {
          word.push(letter);
        } else {
          if (word.length > 1) {
            verticalWords.push(word.join(''));
          }
          word = [];
        }
      }
      if (word.length > 1) {
        verticalWords.push(word.join(''));
      }
    }

    return [...horizontalWords, ...verticalWords];
  }

  // isWordValid: checks the formed word against an online dictionary API.
  // Returns true if valid English word, false otherwise.
  async function isWordValid(word) {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      if (response.ok) {
        return true;
      } else {
        return false;
      }
    } catch {
      return false;
    }
  }

  // validateWordButton: triggered when player clicks "Validate Word."
  // Checks all placed words, validates them, calculates their scores if valid, and updates total score.
  validateWordButton.addEventListener("click", async () => {
    const words = getWordsFromBoard();

    if (words.length === 0) {
      showModal("No words found on the board.");
      return;
    }

    let totalPlayScore = 0;
    // Only consider new words that were not previously scored.
    const newWords = words.filter((w) => !previouslyScoredWords.includes(w));

    for (const word of newWords) {
      const valid = await isWordValid(word);
      if (!valid) {
        showModal(`The word "${word}" is not a valid English word.`);
        continue; 
      }

      let wordScore = 0;
      let wordMultiplier = 1;
      let appliedBonuses = [];
      let usedTilesForThisWord = [];

      const size = 15;
      // Calculate score by scanning the board again to apply bonuses and sum values.
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const cell = board.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
          if (!cell) continue;
          const tileImg = cell.querySelector('img.tile');
          if (tileImg && word.includes(tileImg.getAttribute('data-letter'))) {
            const letter = tileImg.getAttribute('data-letter');
            let letterValue = ScrabbleTiles[letter].value;

            usedTilesForThisWord.push(tileImg);

            // Check for letter multiplier squares.
            if (cell.classList.contains('double-letter')) {
              letterValue *= 2;
              appliedBonuses.push("double letter");
            }
            if (cell.classList.contains('triple-letter')) {
              letterValue *= 3;
              appliedBonuses.push("triple letter");
            }

            wordScore += letterValue;

            // Check for word multiplier squares.
            if (cell.classList.contains('double-word') || cell.classList.contains('center')) {
              wordMultiplier *= 2;
              appliedBonuses.push("double word");
            }
            if (cell.classList.contains('triple-word')) {
              wordMultiplier *= 3;
              appliedBonuses.push("triple word");
            }
          }
        }
      }

      wordScore *= wordMultiplier;
      totalPlayScore += wordScore;
      wordsScoredCount++;

      // Show the user the score for this word.
      showModal(
        `Your word "${word}" scored ${wordScore} points for this play due to having ${appliedBonuses.join(", ")}! Your total score: ${currentScore + totalPlayScore}`
      );

      previouslyScoredWords.push(word);

      // Mark these tiles as validated so they cannot be recalled.
      for (let placed of placedTilesStack) {
        if (usedTilesForThisWord.includes(placed.tile)) {
          placed.validated = true;
        }
      }
    }

    // Update total score after validating all new words.
    currentScore += totalPlayScore;
    scoreElement.textContent = currentScore;
  });

  // Recall Tile Logic:
  // Allows player to undo the last placed tile (if not validated and no refresh after).
  recallTileButton.addEventListener("click", () => {
    if (hasRefreshed) {
      showModal("Cannot recall tile after refreshing tiles.");
      return;
    }

    if (placedTilesStack.length === 0) {
      showModal("No recently placed tile to recall.");
      return;
    }

    const lastPlaced = placedTilesStack[placedTilesStack.length - 1];

    if (lastPlaced.validated) {
      showModal("Cannot recall a tile that is part of a validated word.");
      return;
    }

    placedTilesStack.pop();
    const tile = lastPlaced.tile;
    const cell = lastPlaced.cell;

    // Restore any premium label that was on this cell before.
    if (lastPlaced.premiumLabel) {
      const label = document.createElement("span");
      label.textContent = lastPlaced.premiumLabel;
      label.classList.add("cell-label");
      cell.appendChild(label);
    }

    cell.removeChild(tile);
    cell.setAttribute("data-locked", "false");

    rack.appendChild(tile);
    tile.style.width = "";
    tile.style.height = "";

    updateLetterCounter();
  });

  // Initialize the game on page load: reset tiles, draw board, deal initial tiles, update counters.
  resetTiles();
  generateBoard();
  generateTiles();
  updateLetterCounter();
});
