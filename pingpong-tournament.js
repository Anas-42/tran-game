const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game settings
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

// Game state
let score1 = 0, score2 = 0;
const winningScore = 5;
let gameOver = false;
let gameStarted = false;
const keys = { w: false, s: false, ArrowUp: false, ArrowDown: false };

// Tournament mode
let tournament = {
  round: 1, // 1=Quarterfinals, 2=Semifinals, 3=Final
  matches: [],
  currentMatch: 0,
  players: [
    { name: "Player 1" }, { name: "Player 2" }, 
    { name: "Player 3" }, { name: "Player 4" },
    { name: "Player 5" }, { name: "Player 6" },
    { name: "Player 7" }, { name: "Player 8" }
  ]
};

// Initialize tournament matches
function initTournament() {
  tournament.matches = [
    [0, 1], [2, 3], [4, 5], [6, 7],  // Quarterfinals (Match 1-4)
    [0, 2], [4, 6],                   // Semifinals (Match 5-6)
    [0, 4]                            // Final (Match 7)
  ];
  updateMatchDisplay();
  startCountdown();
}

function startCountdown() {
  let count = 3;
  const countdownElement = document.querySelector('.countdown');
  const overlay = document.querySelector('.countdown-overlay');
  
  // Reset paddle positions during countdown
  player1Y = canvas.height / 2 - paddleHeight / 2;
  player2Y = canvas.height / 2 - paddleHeight / 2;
  
  // Reset ball position but keep it hidden
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  
  const countdownInterval = setInterval(() => {
    countdownElement.textContent = count;
    
    if (count <= 0) {
      clearInterval(countdownInterval);
      countdownElement.textContent = "GO!";
      
      setTimeout(() => {
        overlay.style.display = 'none';
        gameStarted = true;
        document.body.classList.add('game-started');
        
        // Reset ball to random direction when game starts
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

function updateMatchDisplay() {
  const oldDisplay = document.querySelector('.round-info');
  if (oldDisplay) oldDisplay.remove();
  
  const roundNames = ["Quarterfinals", "Semifinals", "Championship"];
  const matchInfo = tournament.matches[tournament.currentMatch];
  
  const roundInfo = document.createElement("div");
  roundInfo.className = "round-info";
  roundInfo.innerHTML = `
    <h3>${roundNames[tournament.round-1]} - Match ${tournament.currentMatch+1}</h3>
    <p>${tournament.players[matchInfo[0]].name} vs ${tournament.players[matchInfo[1]].name}</p>
  `;
  document.body.insertBefore(roundInfo, canvas);
}

// Main game loop
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

  // Ball collisions
  if (ballY <= 0 || ballY >= canvas.height - ballSize) ballSpeedY *= -1;

  if ((ballX <= 20 && ballY > player1Y && ballY < player1Y + paddleHeight) ||
      (ballX >= canvas.width - 20 && ballY > player2Y && ballY < player2Y + paddleHeight)) {
    ballSpeedX *= -1.1;
  }

  // Scoring
  if (ballX <= 0) { score2++; resetBall(); }
  if (ballX >= canvas.width) { score1++; resetBall(); }

  // Check for winner
  if (score1 >= winningScore || score2 >= winningScore) {
    gameOver = true;
    gameStarted = false;
    handleMatchEnd();
    return;
  }

  // Draw game
  ctx.fillStyle = "#00ffcc";
  ctx.fillRect(10, player1Y, paddleWidth, paddleHeight);
  ctx.fillStyle = "#ff007f";
  ctx.fillRect(canvas.width - 20, player2Y, paddleWidth, paddleHeight);
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballSize, 0, Math.PI * 2);
  ctx.fill();

  updateScoreDisplay();
  requestAnimationFrame(gameLoop);
}

function updateScoreDisplay() {
  const match = tournament.matches[tournament.currentMatch];
  document.getElementById("score").textContent = 
    `${tournament.players[match[0]].name}: ${score1} | ${tournament.players[match[1]].name}: ${score2}`;
}

function handleMatchEnd() {
  const match = tournament.matches[tournament.currentMatch];
  const player1Index = match[0];
  const player2Index = match[1];
  
  const winnerIndex = score1 >= winningScore ? 0 : 1;
  const winnerPlayerIndex = match[winnerIndex];
  const winner = tournament.players[winnerPlayerIndex];
  
  winner.isWinner = true;

  tournament.winners = tournament.winners || [];
  tournament.winners.push(winnerPlayerIndex);

  if (tournament.currentMatch < tournament.matches.length - 1) {
    tournament.currentMatch++;
    
    if (tournament.currentMatch === 4) {
      tournament.round = 2;
      tournament.matches[4] = [
        tournament.matches[0][tournament.winners[0] === tournament.matches[0][0] ? 0 : 1],
        tournament.matches[1][tournament.winners[1] === tournament.matches[1][0] ? 0 : 1]
      ];
    } 
    else if (tournament.currentMatch === 5) {
      tournament.matches[5] = [
        tournament.matches[2][tournament.winners[2] === tournament.matches[2][0] ? 0 : 1],
        tournament.matches[3][tournament.winners[3] === tournament.matches[3][0] ? 0 : 1]
      ];
    }
    else if (tournament.currentMatch === 6) {
      tournament.round = 3;
      const sf1Winner = tournament.matches[4][
        tournament.winners[4] === tournament.matches[4][0] ? 0 : 1
      ];
      const sf2Winner = tournament.matches[5][
        tournament.winners[5] === tournament.matches[5][0] ? 0 : 1
      ];
      tournament.matches[6] = [sf1Winner, sf2Winner];
    }

    showTournamentResult(winner, false);
  } else {
    showTournamentResult(winner, true);
  }
}

function showTournamentResult(winner, isFinal) {
  const resultDiv = document.createElement("div");
  resultDiv.className = "tournament-result";
  resultDiv.innerHTML = `
    <h2>${winner.name} wins!</h2>
    ${isFinal ? '<div class="trophy">🏆</div><h3>Tournament Champion!</h3>' : ''}
    <button class="continue-btn">
      ${isFinal ? 'Finish Tournament' : 'Next Match'}
    </button>
  `;
  
  document.body.appendChild(resultDiv);
  
  document.querySelector(".continue-btn").addEventListener("click", () => {
    resultDiv.remove();
    if (isFinal) {
      window.location.href = "pingpong-menu.html";
    } else {
      resetGame();
    }
  });
}

function resetBall() {
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  ballSpeedX = 5 * (Math.random() > 0.5 ? 1 : -1);
  ballSpeedY = 3 * (Math.random() > 0.5 ? 1 : -1);
}

function resetGame() {
  score1 = 0;
  score2 = 0;
  gameOver = false;
  gameStarted = false;
  resetBall();
  player1Y = canvas.height / 2 - paddleHeight / 2;
  player2Y = canvas.height / 2 - paddleHeight / 2;
  
  updateMatchDisplay();
  
  const overlay = document.querySelector('.countdown-overlay');
  const countdownElement = document.querySelector('.countdown');
  overlay.style.display = 'flex';
  countdownElement.textContent = '3';
  document.body.classList.remove('game-started');
  
  startCountdown();
}

// Control handlers
document.addEventListener("keydown", (e) => {
  if (['w', 's', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
    e.preventDefault();
    keys[e.key] = true;
  }
});

document.addEventListener("keyup", (e) => {
  if (['w', 's', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
    e.preventDefault();
    keys[e.key] = false;
  }
});

// Initialize game
initTournament();