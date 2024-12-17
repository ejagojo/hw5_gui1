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

/*
Explanation for Implementing Adjacency Check:

Now we add logic so that except for the very first placed tile (which must be on the center), all subsequently placed tiles must be placed directly adjacent (up, down, left, or right) to at least one already placed tile. If this condition is not met, the tile is not allowed to remain on the board and should be returned ("bounced back") to the rack.

Why this rule?
- In Scrabble, words must be formed in a continuous line. The first tile sets the starting point (center cell), and each subsequent tile must connect to previously placed tiles so there are no isolated letters.

How do we check adjacency?
1. When placing a tile, we know its (row, col).
2. If it's the first tile placed (placedTilesStack is empty before placement), it must be placed on the center. We already handle that, so no issue there.
3. If it's not the first tile, we must check if at least one of its orthogonal neighbors (up, down, left, right) contains a placed tile.
   - We can easily check the placedTilesStack or just check if those neighbor cells have data-locked="true".
   - If no placed tile is adjacent, this placement is invalid. We remove the tile from the board and put it back to the rack.

Step-by-step:
- In handleDrop, after verifying the center rule and before actually finalizing the placement:
  - If placedTilesStack is not empty, perform adjacency check.
  - To check adjacency: Look at (r-1,c), (r+1,c), (r,c-1), (r,c+1). If any of these is locked or already contains a tile, adjacency is satisfied.
- If adjacency fails:
  - Bounce the tile back to the rack and show a modal or just silently revert.

This ensures that every tile after the first is placed in continuous contact with existing tiles, enforcing a linear word formation pattern.
*/

document.addEventListener("DOMContentLoaded", () => {
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

  let currentScore = 0;
  let isCenterTileUsed = false;
  let uniqueTileId = 0;
  let previouslyScoredWords = [];
  let wordsScoredCount = 0;

  let placedTilesStack = [];
  let hasRefreshed = false;

  refreshTilesButton.addEventListener("click", () => {
    rack.innerHTML = "";
    generateTiles();
    updateLetterCounter();
    hasRefreshed = true;
  });

  function resetTiles() {
    for (const letter in ScrabbleTiles) {
      if (ScrabbleTiles.hasOwnProperty(letter)) {
        ScrabbleTiles[letter]["number-remaining"] = ScrabbleTiles[letter]["original-distribution"];
      }
    }
  }

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
          cell.classList.add("center");
        }

        cell.addEventListener("dragover", allowDrop);
        cell.addEventListener("drop", handleDrop);

        board.appendChild(cell);
      }
    }
  }

  function allowDrop(e) {
    e.preventDefault();
  }

  // Check adjacency for the tile being placed:
  // If this is not the first tile (stack not empty), we must check if (row,col) is adjacent to any placed tile.
  function isAdjacentToPlacedTile(row, col) {
    // If no tiles placed yet, no check needed (first tile case handled separately)
    if (placedTilesStack.length === 0) return true;

    // Check the four orthogonal neighbors
    const deltas = [[-1,0],[1,0],[0,-1],[0,1]];
    for (let [dr,dc] of deltas) {
      const nr = row+dr;
      const nc = col+dc;
      // Must be within board
      if (nr >=0 && nr <15 && nc>=0 && nc<15) {
        const neighborCell = board.querySelector(`.cell[data-row="${nr}"][data-col="${nc}"]`);
        if (!neighborCell) continue;
        // If neighbor cell is locked (has a tile placed), adjacency is satisfied
        if (neighborCell.getAttribute("data-locked") === "true") {
          return true;
        }
      }
    }
    return false;
  }

  function handleDrop(e) {
    e.preventDefault();
    const cellElem = e.target.classList.contains("cell") ? e.target : e.target.closest(".cell");
    if (!cellElem) return;

    const tileId = e.dataTransfer.getData("text");
    const tile = document.querySelector(`[data-tile-id="${tileId}"]`);
    if (!tile || !cellElem) return;

    const row = parseInt(cellElem.getAttribute("data-row"), 10);
    const col = parseInt(cellElem.getAttribute("data-col"), 10);

    // Check if first tile must be on center
    const isCenterSquare = (row === 7 && col === 7);
    if (placedTilesStack.length === 0 && !isCenterSquare) {
      showModal("The first tile must be placed on the center square.");
      return;
    }

    // If not first tile, ensure adjacency
    if (placedTilesStack.length > 0) {
      if (!isAdjacentToPlacedTile(row,col)) {
        // Not adjacent, bounce back
        showModal("This tile must be placed adjacent to an existing tile.");
        // Return tile to rack
        rack.appendChild(tile);
        tile.style.width = "";
        tile.style.height = "";
        return;
      }
    }

    if (cellElem.getAttribute("data-locked") === "false") {
      let premiumLabel = null;
      const label = cellElem.querySelector(".cell-label");
      if (label) {
        premiumLabel = label.textContent;
        label.remove();
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

  function showModal(message) {
    modalMessage.textContent = message;
    modal.classList.remove("hidden");
  }

  modalClose.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  function generateTiles() {
    rack.innerHTML = "";
    for (let i = 0; i < 7; i++) {
      const letter = getRandomLetter();
      if (!letter) {
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
    updateLetterCounter();
  }

  function getRandomLetter() {
    const letters = Object.keys(ScrabbleTiles);
    const total = letters.reduce((sum, key) => sum + ScrabbleTiles[key]["number-remaining"], 0);

    if (total === 0) {
      return null;
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

  function updateLetterCounter() {
    renderLetterCounter();
  }

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

  function generateTileInRack() {
    const letter = getRandomLetter();
    if (!letter) {
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

  validateWordButton.addEventListener("click", async () => {
    const words = getWordsFromBoard();

    if (words.length === 0) {
      showModal("No words found on the board.");
      return;
    }

    let totalPlayScore = 0;
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
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const cell = board.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
          if (!cell) continue;
          const tileImg = cell.querySelector('img.tile');
          if (tileImg && word.includes(tileImg.getAttribute('data-letter'))) {
            const letter = tileImg.getAttribute('data-letter');
            let letterValue = ScrabbleTiles[letter].value;

            usedTilesForThisWord.push(tileImg);

            if (cell.classList.contains('double-letter')) {
              letterValue *= 2;
              appliedBonuses.push("double letter");
            }
            if (cell.classList.contains('triple-letter')) {
              letterValue *= 3;
              appliedBonuses.push("triple letter");
            }

            wordScore += letterValue;

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
      showModal(
        `Your word "${word}" scored ${wordScore} points for this play due to having ${appliedBonuses.join(", ")}! Your total score: ${currentScore + totalPlayScore}`
      );

      previouslyScoredWords.push(word);

      for (let placed of placedTilesStack) {
        if (usedTilesForThisWord.includes(placed.tile)) {
          placed.validated = true;
        }
      }
    }

    currentScore += totalPlayScore;
    scoreElement.textContent = currentScore;
  });

  // Recall Tile Logic:
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

    // If there was a premium label originally, restore it
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

  resetTiles();
  generateBoard();
  generateTiles();
  updateLetterCounter();
});
