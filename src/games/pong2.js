var PADDLE_WIDTH = 10;
var PADDLE_HEIGHT = 80;
var BALL_SPEED;

var previousTimestamp = null;
var canvas;
var canvasContext;

var ballX;
var ballY;
var ballVX;
var ballVY;
var ballRadius = 10;

var humanPaddle;
var opponentPaddle;

var kbdPlayer1Y = 0;
var kbdPlayer2Y = 0;

var IDLE = 1;
var PLAYING = 2;
var PAUSED = 3;
var WON = 4;
var LOST = 5;
var state = IDLE;

window.onload = function () {
  canvas = document.getElementById('gameCanvas');
  canvasContext = canvas.getContext('2d');
  humanPaddle = {
    x: 50,
    y: canvas.height / 2,
    score: 0,
    maxY: 400,
  };
  opponentPaddle = {
    x: canvas.width - 50,
    y: canvas.height / 2,
    score: 0,
    maxY: 400,
  };

  document.addEventListener('keydown', (event) => {
    document.body.classList.remove('playing');
    switch (event.keyCode) {
    case 32: // Space
      if (state !== PLAYING) {
        if (state === WON || state == LOST) {
          init();
        }
        state = PLAYING;
      }
      break;
    case 27: // Escape
      state = PAUSED;
      break;
    case 87: // W
      kbdPlayer1Y = -100;
      break;
    case 83: // S
      kbdPlayer1Y = 100;
      break;
    case 38: // Up
      kbdPlayer2Y = -100;
      break;
    case 40: // Down
      kbdPlayer2Y = 100;
      break;
    }
    if (state === PLAYING) document.body.classList.add('playing');
  });

  document.addEventListener('keyup', (event) => {
    switch (event.keyCode) {
    case 83:
    case 87: // W/S
      kbdPlayer1Y = 0;
      break;
    case 38:
    case 40: // Up/down
      kbdPlayer2Y = 0;
      break;
    }
  });

  init();
  requestAnimationFrame(tick);
};

function init() {
  ballX = 100;
  ballY = 300;
  humanPaddle.score = 0;
  opponentPaddle.score = 0;
  BALL_SPEED = 400;
  PADDLE_HEIGHT = 80;
  ballX = 100;
  ballY = 300;
  ballVX = -BALL_SPEED;
  ballVY = BALL_SPEED / 2;
}

function tick(timestamp) {
  var deltaTime = (timestamp - previousTimestamp) / 1000 || 1;
  if (state !== PAUSED) handleInputs(deltaTime);
  if (state === PLAYING) {
    handlePhysics(deltaTime);
    handleBallCollisions();
  }
  previousTimestamp = timestamp;
  drawEverything();
  requestAnimationFrame(tick);
}

function movePaddle(paddle, y, deltaTime) {
  var deltaY = (y - paddle.y) / deltaTime;
  if (deltaY > paddle.maxY) deltaY = paddle.maxY;
  if (deltaY < -paddle.maxY) deltaY = -paddle.maxY;
  paddle.y += deltaY * deltaTime; // deltaY * deltaTime;;
  if (paddle.y + (PADDLE_HEIGHT / 2) > canvas.height) {
    paddle.y = canvas.height - (PADDLE_HEIGHT / 2);
  } else if (paddle.y - (PADDLE_HEIGHT / 2) < 0) {
    paddle.y = (PADDLE_HEIGHT / 2);
  }
}

function handleInputs(deltaTime) {
  // Move the human paddle
  var targetY = humanPaddle.y + kbdPlayer1Y;
  movePaddle(humanPaddle, targetY, deltaTime);

  // Move the opponent paddle
  targetY = opponentPaddle.y + kbdPlayer2Y;
  movePaddle(opponentPaddle, targetY, deltaTime);
}

function handlePhysics(deltaTime) {
  // Move the ball
  ballX = ballX + ballVX * deltaTime;
  ballY = ballY + ballVY * deltaTime;
}

function handleBallCollisions() {
  if (ballX - ballRadius > canvas.width) {
    humanPaddle.score += 1;
    if (humanPaddle.score - 1 > opponentPaddle.score && humanPaddle.score >= 11) {
      state = WON;
      return;
    }
    opponentPaddle.maxY += 50;
    ballX = canvas.width - canvas.width / 4;
    ballY = canvas.height / 2;
    ballVX = -BALL_SPEED;
    ballVY = BALL_SPEED / 2;
    if (PADDLE_HEIGHT > 30) {
      PADDLE_HEIGHT -= 4;
    }
  } else if (ballX + ballRadius < 0) {
    opponentPaddle.score += 1;
    if (opponentPaddle.score - 1 > humanPaddle.score && opponentPaddle.score >= 11) {
      state = LOST;
      return;
    }
    humanPaddle.maxY += 50;
    ballX = canvas.width / 4;
    ballY = canvas.height / 2;
    ballVX = BALL_SPEED;
    ballVY = BALL_SPEED / 2;
    if (PADDLE_HEIGHT > 30) {
      PADDLE_HEIGHT -= 4;
    }
  }

  if (ballY + ballRadius > canvas.height || ballY - ballRadius < 0) {
    if (ballY - ballRadius < 0) {
      ballY = 0 + ballRadius;
    } else {
      ballY = canvas.height - ballRadius;
    }
    ballVY *= -1;
  }

  handlePaddleCollision(humanPaddle);
  handlePaddleCollision(opponentPaddle);
}

function handlePaddleCollision(paddle) {
  var withinRight = (ballX - ballRadius < paddle.x + (PADDLE_WIDTH / 2));
  var withinLeft = (ballX + ballRadius > paddle.x - (PADDLE_WIDTH / 2));
  var withinTop = (ballY - ballRadius < paddle.y + (PADDLE_HEIGHT / 2));
  var withinBottom = (ballY - ballRadius > paddle.y - (PADDLE_HEIGHT / 2));

  var overlap = withinRight && withinLeft && withinTop && withinBottom;

  if (overlap) {
    var deltaY = Math.abs(ballY - paddle.y);
    var movingUp = ballVX < 0;
    var above = paddle.y < ballY;
    if (deltaY < PADDLE_HEIGHT / 2) {
      ballVX *= -1;
    } else {
      if (movingUp && above || !movingUp && !above) {
        ballVX *= -0.8;
        ballVY *= 1.25;
      } else {
        ballVX *= -1.25;
        ballVY *= 0.8;
      }
    }
  }
}

function drawEverything() {
  canvasContext.fillStyle = 'black';
  canvasContext.fillRect(0, 0, canvas.width, canvas.height);

  // Draw ball
  canvasContext.beginPath();
  canvasContext.arc(ballX, ballY, ballRadius, 2 * Math.PI, false);
  canvasContext.fillStyle = 'white';
  canvasContext.fill();

  // Draw paddles
  drawPaddle(canvasContext, humanPaddle);
  drawPaddle(canvasContext, opponentPaddle);

  // Draw scores
  canvasContext.textAlign = 'left';
  canvasContext.font = '24px sans-serif';
  canvasContext.fillText(`${humanPaddle.score}`, 10, 30);
  canvasContext.textAlign = 'right';
  canvasContext.fillText(`${opponentPaddle.score}`, canvas.width - 10, 30);

  // Win/lose/paused
  canvasContext.font = '40px sans-serif';
  canvasContext.textAlign = 'center';
  switch (state) {
  case WON:
    canvasContext.fillText('PLAYER 1 WINS!', canvas.width / 2, canvas.height / 3);
    break;
  case LOST:
    canvasContext.fillText('PLAYER 2 WINS!', canvas.width / 2, canvas.height / 3);
    break;
  case PAUSED:
    canvasContext.fillText('Paused', canvas.width / 2, canvas.height / 3);
    break;
  }
  canvasContext.font = '24px sans-serif';
  switch (state) {
  case IDLE:
    canvasContext.fillText('Press [SPACE] to start', canvas.width / 2, canvas.height / 2);
    break;
  case PAUSED:
    canvasContext.fillText('Press [SPACE] to resume', canvas.width / 2, canvas.height / 2);
    break;
  }
  canvasContext.font = '12px sans-serif';
  switch (state) {
  case PLAYING:
    canvasContext.fillText('Press [ESC] to pause', canvas.width / 2, canvas.height - 12);
    break;
  }
}

function drawPaddle(ctx, paddle) {
  canvasContext.fillStyle = 'white';
  canvasContext.fillRect(paddle.x - (PADDLE_WIDTH / 2), paddle.y - (PADDLE_HEIGHT / 2), PADDLE_WIDTH, PADDLE_HEIGHT);
}
