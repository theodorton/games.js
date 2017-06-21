var canvas;
var ctx;
var paddle;
var previousTimestamp;
var clientWidth = document.body.clientWidth;
var mouseX;
var ball;
var bricks;
var score;
var lives;
var IDLE = 0;
var PLAYING = 1;
var WON = 2;
var LOST = 3;
var state = IDLE;

window.onload = function () {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  init();
  requestAnimationFrame(tick);
};

document.addEventListener('mousemove', (event) => {
  mouseX = event.clientX / clientWidth * canvas.width;
});

document.addEventListener('keydown', (event) => {
  if (state !== IDLE) return;
  switch (event.keyCode) {
  case 32: // Space
    document.body.classList.add('playing');
    state = PLAYING;
    ball.vx = 200;
    ball.vy = 500;
    break;
  }
});

function resetBall() {
  ball = {
    x: paddle.x - 40,
    y: paddle.y - 40,
    vx: 0,
    vy: 0,
    h: 20,
    w: 20,
  };
}

function init() {
  score = 0;
  lives = 3;
  paddle = {
    x: canvas.width / 2,
    y: canvas.height - 40,
    score: 0,
    maxY: 2000,
    h: 20,
    w: 100,
  };
  bricks = [];
  for (var i = 0; i < 6; i++) {
    for (var j = 0; j < 4; j++) {
      bricks.push({
        x: 140 + i * 100,
        y: 100 + j * 50,
        w: 80,
        h: 30,
        score: 100 * (4 - j),
      });
    }
  }
  resetBall();
}

function tick(timestamp) {
  var deltaTime = (timestamp - previousTimestamp) / 1000 || 1;
  previousTimestamp = timestamp;
  handleInputs();
  applyPhysics(deltaTime);
  handleCollisions(deltaTime);
  render();
  requestAnimationFrame(tick);
}

function handleInputs() {
  if (state !== LOST) {
    paddle.x = mouseX;
    if (paddle.x < (paddle.w / 2)) {
      paddle.x = paddle.w / 2;
    } else if (paddle.x > canvas.width - (paddle.w / 2)) {
      paddle.x = canvas.width - (paddle.w / 2);
    }
  }
}

function applyPhysics(deltaTime) {
  ball.x += ball.vx * deltaTime;
  ball.y += ball.vy * deltaTime;

  if (ball.x < 0) {
    ball.x = 0;
    ball.vx *= -1;
  } else if (ball.x > canvas.width) {
    ball.x = canvas.width;
    ball.vx *= -1;
  }

  if (ball.y < 0) {
    ball.y = 0;
    ball.vy *= -1;
  } else if (ball.y > canvas.height) {
    lives -= 1;
    if (lives > 0) {
      resetBall();
      state = IDLE;
    } else {
      state = LOST;
    }
  }
}

function handleCollisions(deltaTime) {
  const ballColl = collision(deltaTime, ball, paddle, 1, -1);
  if (ballColl) {
    ball.vx = ballColl.xOffset * (8 * (100 / paddle.w));
  }

  bricks.forEach((brick, i) => {
    if (collision(deltaTime, ball, brick, 1, -1)) {
      bricks.splice(i, 1);
      score += brick.score;
      paddle.w = 100 - (score / 100);
      if (ball.vx < 0) {
        ball.vx = -200 - (score / 200);
      } else {
        ball.vx = 200 + (score / 200);
      }
      if (bricks.length === 0) {
        state = WON;
      }
    }
  });
}

function bounds(body) {
  return {
    top: body.y - body.h / 2,
    bottom: body.y + body.h / 2,
    left: body.x - body.w / 2,
    right: body.x + body.w / 2,
  };
}

function overlap(bodyA, bodyB) {
  var boundsA = bounds(bodyA);
  var boundsB = bounds(bodyB);
  if (boundsA.top > boundsB.bottom) return false;
  if (boundsA.bottom < boundsB.top) return false;
  if (boundsA.right < boundsB.left) return false;
  if (boundsA.left > boundsB.right) return false;

  var leftOf = bodyA.x < boundsB.left;
  var rightOf = bodyA.x > boundsB.right;
  var topOf = bodyA.y < boundsB.top;
  var bottomOf = bodyA.y > boundsB.bottom;

  if (leftOf) return 'left';
  if (rightOf) return 'right';
  if (topOf) return 'top';
  if (bottomOf) return 'bottom';
  return 'corner';
}

function collision(deltaTime, bodyA, bodyB) {
  const coll = overlap(bodyA, bodyB);
  if (coll) {
    switch (coll) {
    case 'left':
    case 'right':
      bodyA.vx *= -1.0;
      break;
    case 'top':
    case 'bottom':
      bodyA.vy *= -1.0;
      break;
    default:
      bodyA.vy *= -1.0;
      bodyA.vx *= -1.0;
    }

    return {
      xOffset: bodyA.x - bodyB.x,
    };
  }
}

function render() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Paddle
  ctx.fillStyle = 'white';
  ctx.fillRect(paddle.x - 50, paddle.y - 10, paddle.w, paddle.h);

  // Ball
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.h/2, 2 * Math.PI, false);
  ctx.fillStyle = 'white';
  ctx.fill();

  // Bricks
  bricks.forEach((brick) => {
    ctx.fillStyle = 'red';
    ctx.fillRect(brick.x-brick.w/2, brick.y-brick.h/2, brick.w, brick.h);
  });

  // Scores
  ctx.font = '20px courier';
  ctx.fillStyle = 'pink';
  ctx.textAlign = 'left';
  var livesString = [];
  for (var i = 0; i < lives; i++) {
    livesString.push('<3');
  }
  ctx.fillText(livesString.join(' '), 10, 26);

  // Lives
  ctx.font = '40px courier';
  ctx.fillStyle = 'green';
  ctx.textAlign = 'right';
  ctx.fillText(score, canvas.width - 10, 40);

  if (state === LOST) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '40px courier';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('Game over', canvas.width / 2, canvas.height / 2);
  }
}
