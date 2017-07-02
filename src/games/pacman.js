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

var MAP = [
  // Whitespace for data
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  // Game level
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
  [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,0,1],
  [1,0,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1],
  [1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1],
  [1,1,1,1,1,1,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,1,1,1,1,1,1],
  [1,1,1,1,1,1,0,1,1,0,1,1,1,0,0,1,1,1,0,1,1,0,1,1,1,1,1,1],
  [1,1,1,1,1,1,0,1,1,0,1,0,0,0,0,0,0,1,0,1,1,0,1,1,1,1,1,1],
  [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],
  [1,1,1,1,1,1,0,1,1,0,1,0,0,0,0,0,0,1,0,1,1,0,1,1,1,1,1,1],
  [1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1],
  [1,1,1,1,1,1,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,1,1,1,1,1,1],
  [1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1],
  [1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
  [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
  [1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,1],
  [1,1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,1,1],
  [1,1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,1,1],
  [1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1],
  [1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  // Whitespace for lives and cherry
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

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
  grid = new PF.Grid(MAP);
  finder = new PF.AStarFinder();
  currentDirection;
  player = {
    color: 'yellow',
    x: 14,
    y: 19,
    dx: 0,
    dy: 0,
    cooldown: COOLDOWN,
  };
  ghosts = [{
    color: 'red',
    x: 12,
    y: 15,
    cooldown: COOLDOWN,
    initCooldown: 2,
  },{
    color: 'pink',
    x: 12,
    y: 17,
    cooldown: COOLDOWN,
    initCooldown: 6,
  },{
    color: 'cyan',
    x: 15,
    y: 15,
    cooldown: COOLDOWN,
    initCooldown: 9,
  },{
    color: 'orange',
    x: 15,
    y: 17,
    cooldown: COOLDOWN,
    initCooldown: 12,
  }];
}

function update(timestamp) {
  var deltaTime = (timestamp - previousTimestamp) / 1000 || 1/60;
  updatePaths();
  moveObjects(deltaTime);
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
      if (col !== 0) return;
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
  switch (currentDirection) {
  case UP:
    player.dx = 0;
    player.dy = -1;
    break;
  case RIGHT:
    player.dx = 1;
    player.dy = 0;
    break;
  case DOWN:
    player.dx = 0;
    player.dy = 1;
    break;
  case LEFT:
    player.dx = -1;
    player.dy = 0;
    break;
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
    if (MAP[targetY][targetX] === 0) {
      player.x = targetX;
      player.y = targetY;
    }
    grid.nodes[player.y][player.x].eaten = true;
  }

  ghosts.forEach((ghost) => {
    if (ghost.initCooldown > 0) {
      ghost.initCooldown -= deltaTime;
    } else {
      ghost.cooldown -= deltaTime;
      if (ghost.cooldown < 0 && ghost.path && ghost.path[1]) {
        ghost.cooldown += COOLDOWN;
        ghost.x = ghost.path[1][0];
        ghost.y = ghost.path[1][1];
      }
    }
  });
}

function render() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  renderGrid();
  renderEntity(player);
  ghosts.forEach((ghost) => {
    renderEntity(ghost);
    if (DEBUG) renderTarget(ghost);
  });
}

function renderEntity(ghost) {
  ctx.fillStyle = ghost.color;
  ctx.fillRect(ghost.x * SIZE, ghost.y * SIZE, SIZE, SIZE);
}

function renderTarget(ghost) {
  if (!ghost.path) return;
  var max = ghost.path.length - 1;
  if (!ghost.path[max]) return;
  renderDot(ghost.path[max][0], ghost.path[max][1], ghost.color);
}

function renderGrid() {
  grid.nodes.forEach((rows, y) => {
    rows.forEach((col, x) => {
      if (!col.walkable) return;
      if (col.eaten) {
        renderDot(x, y, 'gray');
      } else {
        renderDot(x, y, 'white');
      }
    });
  });
}

function renderDot(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(SIZE * x + SIZE/2 - 2, SIZE * y + SIZE/2 - 2, 4, 4);
}
