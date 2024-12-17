# Homework 5

Link To deployed app: https://ejagojo.github.io/hw5_gui1/

Link to the Github Repo: https://github.com/ejagojo/hw5_gui1



## Extra Credit
1. Full Scrabble Board lines
- Instead of displaying just a single row from the Scrabble board, I implemented the full 15x15 Scrabble board. Each cell on the board is accurately represented and includes the appropriate bonus squares (such as double letter, triple letter, double word, and triple word squares). The center cell is also designated and highlighted as required by the rules (the first placed tile must be on this center cell).
2. Word Validation
- I included logic to validate the formed words on the board by checking them against an online dictionary API (https://api.dictionaryapi.dev/). Whenever the player clicks "Validate Word," the code extracts all complete words formed either horizontally or vertically and then queries the API to confirm if they are valid English words.
- Although the original specification mentions using the dictionary from /usr/share/dict/words, I used a free online dictionary API for convenience and accessibility. This means whenever a new word is validated, the code sends a request to the dictionary API. If the response confirms the word’s existence, the word is considered valid. If not, the user is informed that their word is invalid. While this does not use the local system dictionary file, it still implements a robust form of word validation.
3. Garbage Bin
    - The "Garbage Bin" icon allows the player to discard any unwanted tile by dragging it from the rack and dropping it into the bin. Doing so removes that tile from the game and automatically draws a replacement tile from the remaining distribution, thus maintaining a full rack of seven tiles.
4. Live letter Counter4. Live letter Counter
    - A live letter counter is displayed to the user, showing the distribution of all Scrabble tiles. It keeps track of how many of each letter have been used and how many remain. This feature updates dynamically as the player uses tiles, discards tiles, or refreshes their rack. This helps the player understand the current availability of each letter in the “bag” and strategize accordingly.

## Buttons
- Validate Word
    - After placing one or more tiles on the board to form a word (or words), click "Validate Word" to check their validity.
- New Game
    - Clicking the "New Game" button resets the entire game state. This includes:
        - Clearing the board of placed tiles.
        - Resetting the tile distribution to its original state.
        - Resetting the score and words count.
        - Regenerating a fresh rack of seven tiles for the player.
- Recall tile 
    - The "Recall Tile" button allows the user to undo their last tile placement on the board. This is helpful if the user accidentally places a tile in the wrong spot or changes their mind before validating a word. The recalled tile is automatically returned to the player’s rack, and if the tile was on a bonus square, the bonus label is restored to the board cell.
    - Note: A tile that has already been validated as part of a valid word cannot be recalled.
- Refresh Tiles
    - The "Refresh Tiles" icon (represented by a refresh image) discards the current set of tiles in the player’s rack and draws new ones, filling the rack back up to seven tiles (if enough tiles remain in the distribution). This can help if a player’s current rack is unfavorable and they want a fresh start on their hand. However, once this action is performed, recalling previously placed tiles is disabled for fairness.
- Garbage Bin
    - The "Garbage Bin" icon allows the player to discard any unwanted tile by dragging it from the rack and dropping it into the bin. Doing so removes that tile from the game and automatically draws a replacement tile from the remaining distribution, thus maintaining a full rack of seven tiles.




