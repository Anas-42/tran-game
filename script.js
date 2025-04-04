const board = Array(3).fill().map(() => Array(3).fill(null));
const moves = { X: [], O: [] };
let currentPlayer = 'X';

function createBoard() {
  const boardElement = document.querySelector(".board");
  boardElement.innerHTML = "";
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.addEventListener("click", () => makeMove(row, col, cell));
      boardElement.appendChild(cell);
    }
  }
}

function makeMove(row, col, cell) {
  if (board[row][col] !== null) return;

  // Before placing a new mark, if current player already has 3 marks,
  // remove blinking from their oldest mark since it will be replaced.
  if (moves[currentPlayer].length === 3) {
    const [blinkRow, blinkCol] = moves[currentPlayer][0];
    const blinkingCell = document.querySelector(`[data-row="${blinkRow}"][data-col="${blinkCol}"]`);
    if (blinkingCell) blinkingCell.classList.remove("blinking");
  }

  board[row][col] = currentPlayer;
  moves[currentPlayer].push([row, col]);
  cell.textContent = currentPlayer;
  cell.classList.add(currentPlayer); // Set color based on player

  // Enforce the "only 3 marks" rule:
  if (moves[currentPlayer].length > 3) {
    const [oldRow, oldCol] = moves[currentPlayer].shift();
    board[oldRow][oldCol] = null;
    const oldCell = document.querySelector(`[data-row="${oldRow}"][data-col="${oldCol}"]`);
    if (oldCell) {
      oldCell.textContent = "";
      oldCell.classList.remove("X", "O", "blinking");
    }
  }

  if (checkWin(currentPlayer)) {
    // Instead of alert, show a crazy animated win message.
    setTimeout(() => {
      showWinMessage(currentPlayer);
    }, 100);
    return;
  }

  // Switch player
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  document.getElementById("status").textContent = `Current Player: ${currentPlayer}`;

  // When the new current player already has 3 marks, add blinking to their oldest mark
  if (moves[currentPlayer].length === 3) {
    const [r, c] = moves[currentPlayer][0];
    const blinkingCell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
    if (blinkingCell) blinkingCell.classList.add("blinking");
  }
}

function checkWin(player) {
  const positions = new Set(moves[player].map(([r, c]) => `${r},${c}`));
  const winPatterns = [
    [[0, 0], [0, 1], [0, 2]], [[1, 0], [1, 1], [1, 2]], [[2, 0], [2, 1], [2, 2]], // Rows
    [[0, 0], [1, 0], [2, 0]], [[0, 1], [1, 1], [2, 1]], [[0, 2], [1, 2], [2, 2]], // Columns
    [[0, 0], [1, 1], [2, 2]], [[0, 2], [1, 1], [2, 0]]  // Diagonals
  ];

  return winPatterns.some(pattern => pattern.every(([r, c]) => positions.has(`${r},${c}`)));
}

function showWinMessage(player) {
  const winMessage = document.getElementById("winMessage");
  winMessage.textContent = `${player} wins!`;
  winMessage.style.display = "block";
  // The CSS animation runs automatically. After 2 seconds, reset the game.
  setTimeout(() => {
    winMessage.style.display = "none";
    resetBoard();
  }, 2000);
}

function resetBoard() {
  board.forEach(row => row.fill(null));
  moves.X = [];
  moves.O = [];
  currentPlayer = 'X';
  document.getElementById("status").textContent = "Current Player: X";
  createBoard();
}

createBoard();
document.getElementById("reset").addEventListener("click", resetBoard);

