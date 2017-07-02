var canvas;
var ctx;
var previousTimestamp;
var droppingCooldown = 0;
var SIZE = 40;
var currBrick;
var frozenBricks;
var lastKeyPressed;
var state;
var INTERVAL;
var PLAYING = 0;
var LOST = 1;

var patterns = [
  [
    [1, 1, 1],
    [0, 1, 0],
  ],
  [
    [1, 1, 1, 1],
  ],
  [
    [1, 1],
    [1, 1],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
  [
    [0, 1, 1],
    [1, 1, 0],
  ],
  [
    [1, 0],
    [1, 0],
    [1, 1],
  ],
  [
    [0, 1],
    [0, 1],
    [1, 1],
  ],
];

var colors = [
  '#FD852D',
  '#FDB42D',
  '#2B57A8',
  '#1C9D8F',
  '#7E25A8',
  '#CE257E',
  '#A6EB2A',
  '#F6FC2D',
];

window.onload = function () {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  addEventListeners();
  init();
  requestAnimationFrame(update);
};

function addEventListeners() {
  document.addEventListener('keydown', (event) => {
    lastKeyPressed = event.keyCode;
  });
}

function spawnBrick() {
  const pattern = patterns[Math.floor(Math.random() * patterns.length)];
  const width = pattern[0].length - 1;
  currBrick = {
    color: colors[Math.floor(Math.random() * colors.length)],
    x: Math.floor((Math.random() * canvas.width) / SIZE - width) * SIZE,
    y: 0,
    pattern: pattern,
  };
}

function init() {
  frozenBricks = [];
  state = PLAYING;
  INTERVAL = 0.1;
  spawnBrick();
}

function update(timestamp) {
  var deltaTime = (timestamp - (previousTimestamp || 1)) / 1000;
  handleInputs();
  processTime(deltaTime);
  applyCollisions();
  removeBottom();
  render();
  previousTimestamp = timestamp;
  requestAnimationFrame(update);
}

function handleInputs() {
  if (state === LOST) return;
  switch (lastKeyPressed) {
  // TODO: Apply constraints when moving into an existing piece
  case 37: // Left
    currBrick.x -= SIZE;
    break;
  case 39: // Right
    currBrick.x += SIZE;
    break;
  case 32: // Space
    var newPattern = [];
    for (var row = 0; row < currBrick.pattern.length; row++) {
      for (var col = 0; col < currBrick.pattern[row].length; col++) {
        if (!newPattern[col]) newPattern[col] = [];
        newPattern[col][row] = currBrick.pattern[currBrick.pattern.length - 1 - row][col];
      }
    }
    currBrick.pattern = newPattern;
    break;
  }
}

function processTime(deltaTime) {
  if (state === LOST) return;
  droppingCooldown -= deltaTime;
  if (droppingCooldown < 0) {
    droppingCooldown += INTERVAL;
    currBrick.y += SIZE;
  }
}

function applyCollisions() {
  lastKeyPressed = null;
  try {
    eachBrickPart(currBrick, (x, y) => {
      if (x < 0) {
        currBrick.x = 0;
      } else if ((x + SIZE) > canvas.width) {
        currBrick.x = canvas.width - ((currBrick.pattern[0].length) * SIZE);
      }

      if (y + SIZE >= canvas.height) {
        throw new Error('Collision!');
      }

      frozenBricks.forEach((part) => {
        if (x === part.x && y + SIZE === part.y) {
          throw new Error('Collision!');
        }
      });
    });
  } catch (error) {
    freezeBrick(currBrick);
    if (currBrick.y > 0) {
      INTERVAL *= 0.98;
      spawnBrick();
    } else {
      state = LOST;
    }
  }
}

function removeBottom() {
  var yCounts = [];
  frozenBricks.forEach((part) => {
    if (!yCounts[part.y]) yCounts[part.y] = [];
    yCounts[part.y].push(part);
  });
  yCounts.forEach((parts, y) => {
    if (!parts) return;
    if (parts.length < canvas.width / SIZE) return;
    parts.forEach((part) => {
      var index = frozenBricks.indexOf(part);
      frozenBricks.splice(index, 1);
    });
    frozenBricks.forEach((part) => {
      if (part.y < y) {
        part.y += SIZE;
      }
    });
  });
}

function freezeBrick(brick) {
  eachBrickPart(brick, (x, y) => {
    frozenBricks.push({
      x: x,
      y: y,
      color: brick.color,
    });
  });
}

function render() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  renderBrick(currBrick);
  frozenBricks.forEach((part) => {
    renderPart(part.color, part.x, part.y);
  });
}

function renderBrick(brick) {
  eachBrickPart(brick, (x, y) => {
    renderPart(brick.color, x, y);
  });
}

function renderPart(color, x, y) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, SIZE, SIZE);
}

function eachBrickPart(brick, cb) {
  for (var row = 0; row < brick.pattern.length; row++) {
    for (var col = 0; col < brick.pattern[row].length; col++) {
      if (!brick.pattern[row][col]) continue;
      cb(brick.x + col*SIZE, brick.y + row*SIZE);
    }
  }
}
