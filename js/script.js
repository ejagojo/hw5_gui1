document.addEventListener("DOMContentLoaded", () => {
  const board = document.getElementById("scrabble-board");
  const rack = document.getElementById("tile-rack");
  const scoreElement = document.getElementById("score");
  let currentScore = 0;

  // Define all premium square types and their locations
  const premiumSquares = [
    // Center Square
    { row: 7, col: 7, type: "center", label: "Double Word Score" },
    // Triple Word Squares
    { row: 0, col: 0, type: "triple-word", label: "Triple Word Score" }, { row: 0, col: 14, type: "triple-word", label: "Triple Word Score" },
    { row: 14, col: 0, type: "triple-word", label: "Triple Word Score" }, { row: 14, col: 14, type: "triple-word", label: "Triple Word Score" },
    { row: 0, col: 7, type: "triple-word", label: "Triple Word Score" }, { row: 14, col: 7, type: "triple-word", label: "Triple Word Score" },
    { row: 7, col: 0, type: "triple-word", label: "Triple Word Score" }, { row: 7, col: 14, type: "triple-word", label: "Triple Word Score" },
    // Double Word Squares
    { row: 1, col: 1, type: "double-word", label: "Double Word Score" }, { row: 2, col: 2, type: "double-word", label: "Double Word Score" },
    { row: 3, col: 3, type: "double-word", label: "Double Word Score" }, { row: 4, col: 4, type: "double-word", label: "Double Word Score" },
    { row: 10, col: 10, type: "double-word", label: "Double Word Score" }, { row: 11, col: 11, type: "double-word", label: "Double Word Score" },
    { row: 12, col: 12, type: "double-word", label: "Double Word Score" }, { row: 13, col: 13, type: "double-word", label: "Double Word Score" },
    // Triple Letter Squares
    { row: 1, col: 5, type: "triple-letter", label: "Triple Letter Score" }, { row: 1, col: 9, type: "triple-letter", label: "Triple Letter Score" },
    { row: 5, col: 1, type: "triple-letter", label: "Triple Letter Score" }, { row: 5, col: 13, type: "triple-letter", label: "Triple Letter Score" },
    { row: 9, col: 1, type: "triple-letter", label: "Triple Letter Score" }, { row: 9, col: 13, type: "triple-letter", label: "Triple Letter Score" },
    { row: 13, col: 5, type: "triple-letter", label: "Triple Letter Score" }, { row: 13, col: 9, type: "triple-letter", label: "Triple Letter Score" },
    // Double Letter Squares
    { row: 0, col: 3, type: "double-letter", label: "Double Letter Score" }, { row: 0, col: 11, type: "double-letter", label: "Double Letter Score" },
    { row: 2, col: 6, type: "double-letter", label: "Double Letter Score" }, { row: 2, col: 8, type: "double-letter", label: "Double Letter Score" },
    { row: 3, col: 0, type: "double-letter", label: "Double Letter Score" }, { row: 3, col: 7, type: "double-letter", label: "Double Letter Score" },
    { row: 3, col: 14, type: "double-letter", label: "Double Letter Score" }, { row: 6, col: 2, type: "double-letter", label: "Double Letter Score" },
    { row: 6, col: 6, type: "double-letter", label: "Double Letter Score" }, { row: 6, col: 8, type: "double-letter", label: "Double Letter Score" },
    { row: 6, col: 12, type: "double-letter", label: "Double Letter Score" }, { row: 7, col: 3, type: "double-letter", label: "Double Letter Score" },
    { row: 7, col: 11, type: "double-letter", label: "Double Letter Score" }, { row: 8, col: 2, type: "double-letter", label: "Double Letter Score" },
    { row: 8, col: 6, type: "double-letter", label: "Double Letter Score" }, { row: 8, col: 8, type: "double-letter", label: "Double Letter Score" },
    { row: 8, col: 12, type: "double-letter", label: "Double Letter Score" }, { row: 11, col: 0, type: "double-letter", label: "Double Letter Score" },
    { row: 11, col: 7, type: "double-letter", label: "Double Letter Score" }, { row: 11, col: 14, type: "double-letter", label: "Double Letter Score" },
    { row: 14, col: 3, type: "double-letter", label: "Double Letter Score" }, { row: 14, col: 11, type: "double-letter", label: "Double Letter Score" }
  ];

  function generateBoard() {
    board.innerHTML = ""; // Clear board

    for (let row = 0; row < 15; row++) {
      for (let col = 0; col < 15; col++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        const premium = premiumSquares.find(sq => sq.row === row && sq.col === col);
        if (premium) {
          cell.classList.add(premium.type);
          const label = document.createElement("span");
          label.textContent = premium.label;
          label.classList.add("cell-label");
          cell.appendChild(label);
        }
        cell.setAttribute("data-row", row);
        cell.setAttribute("data-col", col);
        cell.setAttribute("data-locked", "false"); // Lock state
        cell.addEventListener("drop", handleDrop);
        cell.addEventListener("dragover", allowDrop);
        board.appendChild(cell);
      }
    }
  }

  function allowDrop(e) {
    e.preventDefault();
  }

  function handleDrop(e) {
    e.preventDefault();
    const letter = e.dataTransfer.getData("text");
    const tile = document.querySelector(`[data-letter="${letter}"]`);
    if (tile && e.target.getAttribute("data-locked") === "false") {
      e.target.appendChild(tile);
      e.target.setAttribute("data-locked", "true");
    }
  }

  function generateTiles() {
    rack.innerHTML = ""; // Clear rack
    for (let i = 0; i < 7; i++) {
      const letter = getRandomLetter();
      const tile = document.createElement("img");
      tile.src = `./graphics_data/Scrabble_Tiles/Scrabble_Tile_${letter}.jpg`;
      tile.classList.add("tile");
      tile.setAttribute("data-letter", letter);
      tile.setAttribute("draggable", "true");
      tile.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text", letter);
      });
      rack.appendChild(tile);
    }
  }

  function getRandomLetter() {
    const letters = Object.keys(ScrabbleTiles);
    const total = letters.reduce(
      (sum, key) => sum + ScrabbleTiles[key]["number-remaining"],
      0
    );

    let randomIndex = Math.floor(Math.random() * total);
    for (const letter of letters) {
      randomIndex -= ScrabbleTiles[letter]["number-remaining"];
      if (randomIndex < 0) {
        ScrabbleTiles[letter]["number-remaining"]--;
        return letter;
      }
    }
  }

  document.getElementById("new-game").addEventListener("click", () => {
    currentScore = 0;
    scoreElement.textContent = currentScore;
    generateTiles();
    generateBoard();
  });

  generateBoard();
  generateTiles();
});
