/* eslint no-undef: 1 */
var PF = require('pathfinding');
var canvas;
var ctx;
var SIZE = 20;
var grid;
var finder;
var player;
var ghosts;
var previousTimestamp;
var currentDirection;
var UP = 1;
var RIGHT = 2;
var DOWN = 3;
var LEFT = 4;
var COOLDOWN = 0.25;
var PLAYER_ADVANTAGE = 0.04;
var DEBUG = false;
var PLAYING = 1;
var LOST = 2;
var state = PLAYING;

var MAP = loadMap(require('text-loader!./pacman/map1.txt'));

function loadMap(txt) {
  return txt.trim().split('\n').map((line) => {
    return line.split('');
  });
}

function generateGrid(map) {
  return map.map(line =>
    line.map(char =>
      char === 'X' ? 1 : 0
    )
  );
}

window.onload = function () {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  canvas.width = SIZE * MAP[0].length;
  canvas.height = SIZE * MAP.length;
  addEventListeners();
  init();
  requestAnimationFrame(update);
};

function addEventListeners() {
  document.addEventListener('keydown', (event) => {
    switch (event.keyCode) {
    case 37: // LEFT
      currentDirection = LEFT;
      break;
    case 38: // UP
      currentDirection = UP;
      break;
    case 39: // RIGHT
      currentDirection = RIGHT;
      break;
    case 40: // DOWN
      currentDirection = DOWN;
      break;
    }
  });
}

function init() {
  var gridraw = generateGrid(MAP);
  grid = new PF.Grid(gridraw);
  finder = new PF.AStarFinder();
  currentDirection;
  player = {
    color: 'yellow',
    x: 14,
    y: 22,
    dx: 0,
    dy: 0,
    cooldown: COOLDOWN,
    blinkCooldown: COOLDOWN,
    visible: true,
  };
  ghosts = [{
    color: 'red',
    x: 11,
    y: 12,
    cooldown: COOLDOWN,
    initCooldown: 2,
  },{
    color: 'pink',
    x: 11,
    y: 14,
    cooldown: COOLDOWN,
    initCooldown: 6,
  },{
    color: 'cyan',
    x: 16,
    y: 12,
    cooldown: COOLDOWN,
    initCooldown: 9,
  },{
    color: 'orange',
    x: 16,
    y: 14,
    cooldown: COOLDOWN,
    initCooldown: 12,
  }];
}

function update(timestamp) {
  var deltaTime = (timestamp - previousTimestamp) / 1000 || 1/60;
  if (state === PLAYING) {
    updatePaths();
    moveObjects(deltaTime);
  } else if (state === LOST) {
    player.blinkCooldown -= deltaTime;
    if (player.blinkCooldown < 0) {
      player.blinkCooldown += COOLDOWN;
      player.visible = !player.visible;
    }
  }
  render();
  previousTimestamp = timestamp;
  requestAnimationFrame(update);
}

function updatePaths() {
  var redGhost = ghosts[0];
  setTarget(redGhost, player.x, player.y);

  var pinkGhost = ghosts[1];
  if (player.dy < 0) {
    setTarget(pinkGhost, player.x - 4, player.y - 4);
  } else {
    setTarget(pinkGhost, player.x + 4*player.dx, player.y + 4*player.dy);
  }

  var cyanGhost = ghosts[2];
  var targetX = player.x + player.dx - (redGhost.x - player.x);
  var targetY = player.y + player.dy - (redGhost.y - player.y);
  setTarget(cyanGhost, targetX, targetY);

  var orangeGhost = ghosts[3];
  var distanceX = orangeGhost.x - player.x;
  var distanceY = orangeGhost.y - player.y;
  var distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
  if (distance < 5) {
    setTarget(orangeGhost, 0, 15);
  } else {
    setTarget(orangeGhost, player.x, player.y);
  }
}

function setTarget(ghost, x, y) {
  var dot = getClosestWalkableDot(x, y);
  if (!dot) return;
  ghost.path = finder.findPath(
    ghost.x,
    ghost.y,
    dot.x,
    dot.y,
    grid.clone()
  );
}

function getClosestWalkableDot(x, y) {
  // Calculate distances
  var closestX;
  var closestY;
  var minDistance;
  MAP.forEach((row, y2) => {
    row.forEach((col, x2) => {
      if (col === 'X') return;
      var xDistance = Math.abs(x2 - x);
      var yDistance = Math.abs(y2 - y);
      var distance = Math.sqrt(xDistance * xDistance + yDistance * yDistance);
      if ((!minDistance && minDistance !== 0) || minDistance > distance) {
        minDistance = distance;
        closestX = x2;
        closestY = y2;
      }
    });
  });
  return {
    x: closestX,
    y: closestY,
  };
}

function moveObjects(deltaTime) {
  var newDx = 0;
  var newDy = 0;
  switch (currentDirection) {
  case UP:
    newDx = 0;
    newDy = -1;
    break;
  case RIGHT:
    newDx = 1;
    newDy = 0;
    break;
  case DOWN:
    newDx = 0;
    newDy = 1;
    break;
  case LEFT:
    newDx = -1;
    newDy = 0;
    break;
  }

  if (MAP[player.y+newDy][player.x+newDx] !== 'X') {
    player.dx = newDx;
    player.dy = newDy;
  }

  player.cooldown -= deltaTime;
  if (player.cooldown < 0) {
    player.cooldown += COOLDOWN - PLAYER_ADVANTAGE;
    var targetX = player.x+player.dx;
    var targetY = player.y+player.dy;
    var maxX = MAP[0].length - 1;
    if (targetX < 0) {
      targetX = maxX;
    } else if (targetX > maxX) {
      targetX = 0;
    }
    var maxY = MAP.length - 1;
    if (targetY < 0) {
      targetY = maxY;
    } else if (targetY > maxY) {
      targetY = 0;
    }
    if (MAP[targetY][targetX] !== 'X') {
      player.x = targetX;
      player.y = targetY;
    }
    MAP[player.y][player.x] = ' ';
  }

  ghosts.forEach((ghost) => {
    if (ghost.initCooldown > 0) {
      ghost.initCooldown -= deltaTime;
    } else {
      ghost.cooldown -= deltaTime;
      if (ghost.cooldown < 0 && ghost.path && ghost.path[1]) {
        ghost.cooldown += COOLDOWN;
        const newX = ghost.path[1][0];
        const newY = ghost.path[1][1];
        if (newX === player.x && newY === player.y) {
          state = LOST;
        } else {
          ghost.x = newX;
          ghost.y = newY;
        }
      }
    }
  });
}

function render() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  renderGrid();
  renderPlayer(player);
  ghosts.forEach((ghost) => {
    renderEntity(ghost);
    renderTarget(ghost);
  });
}

function renderEntity(ghost) {
  ctx.fillStyle = ghost.color;
  ctx.fillRect(ghost.x * SIZE, ghost.y * SIZE, SIZE, SIZE);
}

function renderPlayer(player) {
  if (!player.visible) return;
  var origoX = (player.x+0.5)*SIZE;
  var origoY = (player.y+0.5)*SIZE;
  ctx.beginPath();
  ctx.arc(origoX, origoY, SIZE/2, 2 * Math.PI, false);
  ctx.fillStyle = 'yellow';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(origoX, origoY, SIZE/2, 1.75 * Math.PI, 2.25 * Math.PI);
  ctx.fillStyle = 'black';
  ctx.fill();
}

function renderTarget(ghost) {
  if (!DEBUG) return;
  if (!ghost.path) return;
  var max = ghost.path.length - 1;
  if (!ghost.path[max]) return;
  renderDot(ghost.path[max][0], ghost.path[max][1], ghost.color);
}

function renderGrid() {
  MAP.forEach((row, y) => {
    row.forEach((col, x) => {
      switch (col) {
      case '.':
        renderDot(x, y, 'white');
        break;
      case 'X':
        renderWall(x, y);
        break;
      }
    });
  });
}

function renderDot(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(SIZE * x + SIZE/2 - 2, SIZE * y + SIZE/2 - 2, 4, 4);
}

function renderWall(x, y) {
  ctx.fillStyle = 'darkblue';
  ctx.fillRect(SIZE * x, SIZE * y, SIZE, SIZE);
}
