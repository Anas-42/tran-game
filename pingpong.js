const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 400;

// Game objects
const paddleHeight = 80, paddleWidth = 10;
let player1Y = canvas.height / 2 - paddleHeight / 2;
let player2Y = canvas.height / 2 - paddleHeight / 2;
const paddleSpeed = 8;

let ballX = canvas.width / 2, ballY = canvas.height / 2;
let ballSpeedX = 5, ballSpeedY = 3;
const ballSize = 10;

// Scores
let score1 = 0, score2 = 0;
const winningScore = 5;

// Game state
let gameOver = false;
let gameStarted = false;
let countdownCompleted = false;

// Controls
const keys = { w: false, s: false, ArrowUp: false, ArrowDown: false };

// Countdown before first game start
function startCountdown() {
  let count = 3;
  const countdownElement = document.querySelector('.countdown');
  const overlay = document.querySelector('.countdown-overlay');
  
  // Reset positions during countdown
  player1Y = canvas.height / 2 - paddleHeight / 2;
  player2Y = canvas.height / 2 - paddleHeight / 2;
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;

  overlay.style.display = 'flex';
  countdownElement.textContent = count;

  const countdownInterval = setInterval(() => {
    countdownElement.textContent = count;
    
    if (count <= 0) {
      clearInterval(countdownInterval);
      countdownElement.textContent = "GO!";
      
      setTimeout(() => {
        overlay.style.display = 'none';
        gameStarted = true;
        countdownCompleted = true;
        
        // Random ball direction when game starts
        ballSpeedX = 5 * (Math.random() > 0.5 ? 1 : -1);
        ballSpeedY = 3 * (Math.random() > 0.5 ? 1 : -1);
        
        if (!gameOver) {
          gameLoop();
        }
      }, 500);
      return;
    }
    count--;
  }, 1000);
}

// ... (previous code remains the same until the event listeners) ...

// Modified Event Listeners
document.addEventListener("keydown", (e) => {
	const urlParams = new URLSearchParams(window.location.search);
	const mode = urlParams.get("mode");
	
	// Always allow player 1 controls (W/S)
	if (['w', 's'].includes(e.key)) {
	  e.preventDefault();
	  keys[e.key] = true;
	}
	
	// Only allow player 2 controls (ArrowUp/ArrowDown) in 2-player mode
	if (mode !== "1player" && ['ArrowUp', 'ArrowDown'].includes(e.key)) {
	  e.preventDefault();
	  keys[e.key] = true;
	}
  });
  
  document.addEventListener("keyup", (e) => {
	const urlParams = new URLSearchParams(window.location.search);
	const mode = urlParams.get("mode");
	
	// Always allow player 1 controls (W/S)
	if (['w', 's'].includes(e.key)) {
	  e.preventDefault();
	  keys[e.key] = false;
	}
	
	// Only allow player 2 controls (ArrowUp/ArrowDown) in 2-player mode
	if (mode !== "1player" && ['ArrowUp', 'ArrowDown'].includes(e.key)) {
	  e.preventDefault();
	  keys[e.key] = false;
	}
  });
  
  // ... (rest of the code remains the same) ...

// Game Loop
function gameLoop() {
  if (gameOver || !gameStarted) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Move paddles
  if (keys.w && player1Y > 0) player1Y -= paddleSpeed;
  if (keys.s && player1Y < canvas.height - paddleHeight) player1Y += paddleSpeed;
  if (keys.ArrowUp && player2Y > 0) player2Y -= paddleSpeed;
  if (keys.ArrowDown && player2Y < canvas.height - paddleHeight) player2Y += paddleSpeed;

  // Move ball
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  // Ball collision with top & bottom
  if (ballY <= 0 || ballY >= canvas.height - ballSize) ballSpeedY *= -1;

  // Ball collision with paddles
  if (
    (ballX <= 20 && ballY > player1Y && ballY < player1Y + paddleHeight) ||
    (ballX >= canvas.width - 20 && ballY > player2Y && ballY < player2Y + paddleHeight)
  ) {
    ballSpeedX *= -1.1;
  }

  // Score Update
  if (ballX <= 0) { 
    score2++; 
    resetBallAfterScore(); 
  }
  if (ballX >= canvas.width) { 
    score1++; 
    resetBallAfterScore(); 
  }

  // Check for winner
  if (score1 >= winningScore || score2 >= winningScore) {
    gameOver = true;
    gameStarted = false;
    showWinnerMessage();
    return;
  }

  // Draw paddles
  ctx.fillStyle = "#00ffcc";
  ctx.fillRect(10, player1Y, paddleWidth, paddleHeight);
  ctx.fillStyle = "#ff007f";
  ctx.fillRect(canvas.width - 20, player2Y, paddleWidth, paddleHeight);

  // Draw ball
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballSize, 0, Math.PI * 2);
  ctx.fill();

  // Update Score
  updateScoreDisplay();

  // AI Movement (for 1-player mode)
  moveAIPaddle();

  requestAnimationFrame(gameLoop);
}

function resetBallAfterScore() {
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  player1Y = canvas.height / 2 - paddleHeight / 2;
  player2Y = canvas.height / 2 - paddleHeight / 2;
  
  // Only reset ball direction, no countdown
  ballSpeedX = 5 * (Math.random() > 0.5 ? 1 : -1);
  ballSpeedY = 3 * (Math.random() > 0.5 ? 1 : -1);
}

function updateScoreDisplay() {
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get("mode");
  
  if (mode === "1player") {
    document.getElementById("score").innerText = `Player: ${score1} | Computer: ${score2}`;
  } else {
    document.getElementById("score").innerText = `Player 1: ${score1} | Player 2: ${score2}`;
  }
}

// AI Logic for 1-player mode
function moveAIPaddle() {
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get("mode");

  if (mode === "1player") {
    const paddleCenter = player2Y + paddleHeight / 2;
    const targetY = ballY - paddleHeight / 2 + (Math.random() * 40 - 20);

    if (Math.random() > 0.3) {
      if (paddleCenter < targetY) {
        player2Y += paddleSpeed * 0.6;
      } else if (paddleCenter > targetY) {
        player2Y -= paddleSpeed * 0.6;
      }
    }

    if (player2Y < 0) player2Y = 0;
    if (player2Y > canvas.height - paddleHeight) player2Y = canvas.height - paddleHeight;
  }
}

// Show Winner Message
function showWinnerMessage() {
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get("mode");
  
  let winner;
  if (mode === "1player") {
    winner = score1 >= winningScore ? "Player" : "Computer";
  } else {
    winner = score1 >= winningScore ? "Player 1" : "Player 2";
  }
  
  const winMessage = document.createElement("div");
  winMessage.id = "winMessage";
  winMessage.innerHTML = `
    <div>${winner} Wins!</div>
    <button id="restartButton">Play Again</button>
  `;
  
  document.body.appendChild(winMessage);
  
  document.getElementById("restartButton").addEventListener("click", () => {
    document.body.removeChild(winMessage);
    resetGame();
  });
}

// Reset Game (called when starting new game)
function resetGame() {
  score1 = 0;
  score2 = 0;
  gameOver = false;
  gameStarted = false;
  countdownCompleted = false;
  
  const overlay = document.querySelector('.countdown-overlay');
  overlay.style.display = 'flex';
  const countdownElement = document.querySelector('.countdown');
  countdownElement.textContent = '3';
  
  startCountdown();
}

// Start the initial countdown
startCountdown();