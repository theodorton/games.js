// @flow
import KeyCode from 'key-code';

let canvas: HTMLCanvasElement;
let ctx : CanvasRenderingContext2D;
let image : Image;
let track : Image;

const player = {
  x: 1300,
  y: 300,
  r: 0,
  dx: 0,
};

const SPEED = 2.5;
const DRAG = 0.8;
const TURN_SPEED = 0.3;
const CAMERA_SPEED = 4;

let cameraX;
let cameraY;

const keys = {
  [KeyCode.SPACE]: false,
  [KeyCode.W]: false,
  [KeyCode.A]: false,
  [KeyCode.S]: false,
  [KeyCode.D]: false,
};

window.onload = function () {
  canvas = (document.getElementById('gameCanvas'): any);
  ctx = canvas.getContext('2d');
  addEventListeners();
  // init();
  requestAnimationFrame(update);
  image = new Image();
  image.src = '/assets/car.png';
  track = new Image();
  track.src = '/assets/racetrac.jpg';
  cameraX = player.x;
  cameraY = player.y + 200;
};

let previousTimestamp: number = performance.now();

function addEventListeners() {
  window.addEventListener('keydown', (event: KeyboardEvent) => {
    keys[event.keyCode] = true;
  });

  window.addEventListener('keyup', (event: KeyboardEvent) => {
    keys[event.keyCode] = false;
  });
}

function update(timestamp: number) {
  const deltaTime = (timestamp - previousTimestamp) / 1000 || 1/60;
  handleInputs(deltaTime);
  applyPhysics(deltaTime);
  moveCamera(deltaTime);
  render();
  previousTimestamp = timestamp;
  requestAnimationFrame(update);
}

function handleInputs(deltaTime: number) {
  if (keys[KeyCode.W]) {
    player.dx += deltaTime * SPEED;
  } else if (keys[KeyCode.S]) {
    player.dx -= deltaTime * SPEED / 2;
  }
  player.dx *= 1 - (DRAG * deltaTime);

  if (keys[KeyCode.D]) {
    player.r += deltaTime * TURN_SPEED;
  } else if (keys[KeyCode.A]) {
    player.r -= deltaTime * TURN_SPEED;
  }
}

function applyPhysics(deltaTime: number) {
  const rad = (360 * player.r) * Math.PI / 180;
  player.x += player.dx * deltaTime * 200 * Math.cos(rad);
  player.y += player.dx * deltaTime * 200 * Math.sin(rad);
}

function moveCamera(deltaTime) {
  const deltaX = player.x - cameraX;
  const deltaY = player.y - cameraY;
  cameraX += deltaTime * deltaX * CAMERA_SPEED;
  cameraY += deltaTime * deltaY * CAMERA_SPEED;
}

function render() {
  ctx.translate(canvas.width / 2 - cameraX, canvas.height / 2 - cameraY);
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(track, 0, 0);
  renderCar(player);
}

function renderCar(entity: *) {
  ctx.fillStyle = 'white';
  const width = 40;
  const height = 20;
  ctx.translate(entity.x, entity.y);
  ctx.rotate((360 * entity.r) * Math.PI / 180);
  ctx.translate(-width*0.6, -height/2);
  ctx.drawImage(image, 0, 0, width, height);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
