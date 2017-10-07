import addControls from '../lib/addControls';

var canvas;
var ctx;

var IDLE = 1;
var PLAYING = 2;
var LOST = 3;
var state = IDLE;

var SIZE = 20;
var SPEED = 10;

var tail;
var tailLength;
var playerX;
var playerY;
var playerVX = 0;
var playerVY = 0;
var directionQueue = [];
var UP = 1;
var DOWN = 2;
var LEFT = 3;
var RIGHT = 4;

var appleX;
var appleY;

function preventZoomOnIOs() {
  document.addEventListener('gesturestart', function (e) {
    e.preventDefault();
  });
}

window.onload = function () {
  canvas = document.getElementById('gameCanvas');
  canvas.width = Math.min(320, Math.floor((window.innerWidth - SIZE) / SIZE) * SIZE);
  canvas.height = Math.min(320, Math.floor((window.innerHeight - SIZE) / SIZE) * SIZE);
  ctx = canvas.getContext('2d');
  preventZoomOnIOs();
  addControls({
    west() {
      if (playerVX > 0) return;
      directionQueue.unshift(LEFT);
    },
    north() {
      if (playerVY > 0) return;
      directionQueue.unshift(UP);
    },
    east() {
      if (playerVX < 0) return;
      directionQueue.unshift(RIGHT);
    },
    south() {
      if (playerVY < 0) return;
      directionQueue.unshift(DOWN);
    },
  });
  init();
  requestAnimationFrame(tick);
};

function init() {
  state = PLAYING;
  playerX = SIZE;
  playerY = SIZE;
  playerVX = SIZE;
  tail = [];
  tailLength = 2;
  placeApple();
}

function placeApple() {
  appleX = Math.floor(Math.random() * canvas.width / SIZE) * SIZE;
  appleY = Math.floor(Math.random() * canvas.height / SIZE) * SIZE;
  let overlap = false;
  for (let i = 0; i++; i < tail.length) {
    if (tail.x === appleX && tail.y === appleY) {
      overlap = true;
    }
  }
  if (overlap) placeApple();
}

function tick() {
  handleInputs();
  applyHunger();
  applyPhysics();
  render();
  setTimeout(() => {
    requestAnimationFrame(tick);
  }, 1000 / SPEED);
}

function handleInputs() {
  switch (directionQueue.pop()) {
  case UP:
    playerVX = 0;
    playerVY = -SIZE;
    break;
  case DOWN:
    playerVX = 0;
    playerVY = SIZE;
    break;
  case LEFT:
    playerVX = -SIZE;
    playerVY = 0;
    break;
  case RIGHT:
    playerVX = SIZE;
    playerVY = 0;
    break;
  }
}

function applyHunger() {
  if (playerX === appleX && playerY === appleY) {
    placeApple();
    tailLength += 1;
    SPEED = 10 + Math.floor(tailLength / 5);
  }
}

function applyPhysics() {
  if (state !== PLAYING) return;

  while (tail.length > tailLength) tail.shift();
  var nextX = playerX + playerVX;
  if (nextX < 0) {
    nextX = canvas.width - SIZE;
  } else if (nextX >= canvas.width) {
    nextX = 0;
  }
  var nextY = playerY + playerVY;
  if (nextY < 0) {
    nextY = canvas.height - SIZE;
  } else if (nextY >= canvas.height) {
    nextY = 0;
  }

  for (var i = 0; i < tail.length; i++) {
    const { x, y } = tail[i];
    if (nextX === x && nextY === y) {
      state = LOST;
      return;
    }
  }

  tail.push({ x: playerX, y: playerY });
  playerX = nextX;
  playerY = nextY;
}

function render() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'pink';
  ctx.fillRect(appleX, appleY, SIZE, SIZE);

  ctx.fillStyle = 'lime';
  ctx.fillRect(playerX, playerY, SIZE, SIZE);

  ctx.fillStyle = 'green';
  tail.forEach(({ x, y }) => {
    ctx.fillRect(x, y, SIZE, SIZE);
  });
}
