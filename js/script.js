document.addEventListener("DOMContentLoaded", () => {
  const board = document.getElementById("scrabble-board");
  const rack = document.getElementById("tile-rack");
  const scoreElement = document.getElementById("score");
  const letterCounter = document.getElementById("letter-counter");

  let currentScore = 0;
  let isCenterTileUsed = false;

  // Define all premium square types and their locations
  // (Ensure this matches your project. No changes here except formatting.)
  const premiumSquares = [
    { row: 7, col: 7, type: "center", label: "⭐ Double Word Score" },
    // Triple Word Squares
    { row: 0, col: 0, type: "triple-word", label: "Triple Word Score" },
    { row: 0, col: 14, type: "triple-word", label: "Triple Word Score" },
    { row: 14, col: 0, type: "triple-word", label: "Triple Word Score" },
    { row: 14, col: 14, type: "triple-word", label: "Triple Word Score" },
    { row: 0, col: 7, type: "triple-word", label: "Triple Word Score" },
    { row: 14, col: 7, type: "triple-word", label: "Triple Word Score" },
    { row: 7, col: 0, type: "triple-word", label: "Triple Word Score" },
    { row: 7, col: 14, type: "triple-word", label: "Triple Word Score" },

    // Double Word Squares (Ensure these match your original definitions)
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

    // Triple Letter Squares (Ensure no duplicates and match your original data)
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

    // Double Letter Squares (Ensure these match your original definitions)
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

  /**
   * resetTiles()
   * Resets the tile counts to their original distribution.
   */
  function resetTiles() {
    for (const letter in ScrabbleTiles) {
      if (ScrabbleTiles.hasOwnProperty(letter)) {
        ScrabbleTiles[letter]["number-remaining"] = ScrabbleTiles[letter]["original-distribution"];
      }
    }
  }

  /**
   * generateBoard()
   * Clears the board and generates the 15x15 cells, applying premium squares.
   */
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

  /**
   * allowDrop(e)
   * Allows tiles to be dropped onto cells by preventing default behavior.
   */
  function allowDrop(e) {
    e.preventDefault();
  }

  /**
   * handleDrop(e)
   * Handles dropping of a tile onto a board cell.
   * Ensures the first tile is placed at the center square.
   */
  function handleDrop(e) {
    e.preventDefault();
    // Normalize target: ensure we get the cell element even if dropped on a label
    const cellElem = e.target.classList.contains("cell") ? e.target : e.target.closest(".cell");
    if (!cellElem) return; // No valid cell found, abort.

    const letter = e.dataTransfer.getData("text");
    const tile = document.querySelector(`[data-letter="${letter}"]`);

    // If no tile or cell, abort
    if (!tile || !cellElem) return;

    const row = parseInt(cellElem.getAttribute("data-row"), 10);
    const col = parseInt(cellElem.getAttribute("data-col"), 10);

    const isCenterSquare = (row === 7 && col === 7);

    // Enforce center start rule
    if (!isCenterTileUsed && !isCenterSquare) {
      alert("The first tile must be placed on the center square.");
      return;
    }

    // Only place tile if cell is not locked
    if (cellElem.getAttribute("data-locked") === "false") {
      cellElem.appendChild(tile);
      cellElem.setAttribute("data-locked", "true");
      tile.style.width = "100%";
      tile.style.height = "100%";

      // Mark center tile as used once successfully placed
      if (isCenterSquare) {
        isCenterTileUsed = true;
      }

      updateLetterCounter(letter);
    }
  }

  /**
   * generateTiles()
   * Fills the rack with 7 random tiles from the pool.
   */
  function generateTiles() {
    rack.innerHTML = "";
    for (let i = 0; i < 7; i++) {
      const letter = getRandomLetter();
      if (!letter) continue;

      const tile = document.createElement("img");
      tile.src = (letter === "_")
        ? `./graphics_data/Scrabble_Tiles/Scrabble_Tile_Blank.jpg`
        : `./graphics_data/Scrabble_Tiles/Scrabble_Tile_${letter}.jpg`;

      tile.classList.add("tile");
      tile.setAttribute("data-letter", letter);
      tile.setAttribute("draggable", "true");

      tile.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text", letter);
      });

      rack.appendChild(tile);
    }
  }

  /**
   * getRandomLetter()
   * Selects a random letter from available tiles, decrementing its count.
   */
  function getRandomLetter() {
    const letters = Object.keys(ScrabbleTiles);
    const total = letters.reduce((sum, key) => sum + ScrabbleTiles[key]["number-remaining"], 0);

    if (total === 0) {
      alert("No more tiles available!");
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

    // Fallback (should never reach here)
    return null;
  }

  /**
   * updateLetterCounter(letter)
   * Refreshes the letter usage table after a tile is placed.
   */
  function updateLetterCounter(letter) {
    renderLetterCounter();
  }

  /**
   * renderLetterCounter()
   * Displays the count of used and total letters in a table.
   */
  function renderLetterCounter() {
    const tableRows = Object.entries(ScrabbleTiles)
      .map(([letter, info]) =>
        `<tr>
           <td>${letter}</td>
           <td>${info["original-distribution"] - info["number-remaining"]}</td>
           <td>${info["original-distribution"]}</td>
         </tr>`
      )
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

  // New Game button resets everything
  document.getElementById("new-game").addEventListener("click", () => {
    currentScore = 0;
    scoreElement.textContent = currentScore;
    isCenterTileUsed = false;
    resetTiles();
    generateBoard();
    generateTiles();
    renderLetterCounter();
  });

  // Initial setup
  resetTiles();
  generateBoard();
  generateTiles();
  renderLetterCounter();
});
