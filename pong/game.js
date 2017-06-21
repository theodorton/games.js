var PADDLE_WIDTH = 10;
var PADDLE_HEIGHT = 80;
var BALL_SPEED;

var previousTimestamp = null;
var canvas;
var canvasContext;
var canvasOffsetY;

var ballX;
var ballY;
var ballVX;
var ballVY;
var ballRadius = 10;

var humanPaddle;
var cpuPaddle;
var cpuAccuracy = null

var mouseY;

var IDLE = 1;
var PLAYING = 2;
var PAUSED = 3;
var WON = 4;
var LOST = 5;
var state = IDLE;
var previousState = state;

window.onload = function () {
  canvas = document.getElementById('gameCanvas');
  canvasContext = canvas.getContext('2d');
  humanPaddle = {
    x: 50,
    y: canvas.height / 2,
    score: 0,
    maxY: 2000,
  }
  cpuPaddle = {
    x: canvas.width - 50,
    y: canvas.height / 2,
    score: 0,
    maxY: 250,
  };

  canvasOffsetY = canvas.offsetTop - (canvas.height / 2);
  mouseY = canvas.height / 2;

  document.addEventListener('mousemove', (event) => {
    mouseY = event.clientY - canvasOffsetY;
  });

  document.addEventListener('keydown', (event) => {
    document.body.classList.remove('playing');
    if (event.keyCode === 32 && state !== PLAYING) {
      if (state === WON || state == LOST) {
        init()
      }
      state = PLAYING;
    }
    if (event.keyCode === 27) state = PAUSED;
    if (state === PLAYING) document.body.classList.add('playing');
  });

  init();
  requestAnimationFrame(tick);
}

function init() {
  ballX = 100;
  ballY = 300;
  humanPaddle.score = 0;
  cpuPaddle.score = 0;
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
    handleAI(deltaTime);
    handleBallCollisions();
  }
  previousTimestamp = timestamp;
  drawEverything();
  requestAnimationFrame(tick);
}

function movePaddle(paddle, y, deltaTime) {
  // var deltaY = paddle.y - y;
  // if (deltaTime) {
  //   deltaY *= deltaTime;
  // }
  // if (deltaY > 100) {
  //   deltaY = 100;
  // }
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
  movePaddle(humanPaddle, mouseY, deltaTime);
}

function handlePhysics(deltaTime) {
  // Move the ball
  ballX = ballX + ballVX * deltaTime;
  ballY = ballY + ballVY * deltaTime;
}

function handleAI(deltaTime) {
  const movingLeft = ballVX < 0;
  const movingRight = !movingLeft;
  const movingUp = ballVY < 0;
  const movingDown = !movingUp;
  if (movingLeft) return;

  const atTopSide = ballY < canvas.height / 2;
  const atBottomSide = !atTopSide;
  const atLeftSide = ballX < canvas.width / 3 * 2;

  if (atLeftSide) {
    if (atTopSide && movingUp) {
      return;
    } else if (atBottomSide && movingDown) {
      return;
    }
  }

  const deltaY = ballY - cpuPaddle.y;
  const above = deltaY < 0;
  if (Math.abs(deltaY) < PADDLE_HEIGHT / 4) {
    if ((above && !movingUp) || (!above && movingUp)) return;
  }

  movePaddle(cpuPaddle, ballY, deltaTime);
  // const distance = cpuPaddle.x - ballX;
  // const below = ballX > cpuPaddle.x;
  // const above = !below;
  // const movingUp = ballVX < 0;
  // const movingDown = ballVX > 0;
  // if (above)
  // if (movingUp && below) return;
  // expectedY = ballY + (ballVX / deltaTime) * (distance / deltaTime) + cpuAccuracy * PADDLE_HEIGHT;
}

function handleBallCollisions() {
  if (ballX - ballRadius > canvas.width) {
    humanPaddle.score += 1;
    if (humanPaddle.score - 1 > cpuPaddle.score && humanPaddle.score >= 11) {
      state = WON;
      return;
    }
    cpuPaddle.maxY += 25;
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballVX = -BALL_SPEED;
    ballVY = BALL_SPEED / 2;
    if (PADDLE_HEIGHT > 30) {
      PADDLE_HEIGHT -= 4;
    }
  } else if (ballX + ballRadius < 0) {
    cpuPaddle.score += 1;
    if (cpuPaddle.score - 1 > humanPaddle.score && cpuPaddle.score >= 11) {
      state = LOST;
      return;
    }
    BALL_SPEED += 25;
    ballX = canvas.width / 2;
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
  handlePaddleCollision(cpuPaddle);
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
  drawPaddle(canvasContext, cpuPaddle);

  // Draw scores
  canvasContext.textAlign = 'left';
  canvasContext.font = '24px sans-serif';
  canvasContext.fillText(`${humanPaddle.score}`, 10, 30);
  canvasContext.textAlign = 'right';
  canvasContext.fillText(`${cpuPaddle.score}`, canvas.width - 10, 30);

  // Win/lose/paused
  canvasContext.font = '40px sans-serif';
  canvasContext.textAlign = 'center';
  switch (state) {
    case WON:
      canvasContext.fillText(`VICTORY!`, canvas.width / 2, canvas.height / 3);
      break;
    case LOST:
      canvasContext.fillText(`DEFEAT!`, canvas.width / 2, canvas.height / 3);
      break;
    case PAUSED:
      canvasContext.fillText(`Paused`, canvas.width / 2, canvas.height / 3);
      break;
  }
  canvasContext.font = '24px sans-serif';
  switch (state) {
    case IDLE:
      canvasContext.fillText(`Press [SPACE] to start`, canvas.width / 2, canvas.height / 2);
      break;
    case PAUSED:
      canvasContext.fillText(`Press [SPACE] to resume`, canvas.width / 2, canvas.height / 2);
      break;
  }
  canvasContext.font = '12px sans-serif';
  switch (state) {
    case PLAYING:
      canvasContext.fillText(`Press [ESC] to pause`, canvas.width / 2, canvas.height - 12);
      break;
  }
}

function drawPaddle(ctx, paddle) {
  canvasContext.fillStyle = 'white';
  canvasContext.fillRect(paddle.x - (PADDLE_WIDTH / 2), paddle.y - (PADDLE_HEIGHT / 2), PADDLE_WIDTH, PADDLE_HEIGHT);
}
