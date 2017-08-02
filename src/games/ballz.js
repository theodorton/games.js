// @flow

type State = 'aiming' | 'shooting' | 'transitioning' | 'collecting';
type Ball = {
  x: number,
  y: number,
  r: number,
  vx: number,
  vy: number,
  state: 'active' | 'falling',
  cooldown: number,
}

type Obstacle = {
  x: number,
  y: number,
  w: number,
  h: number,
}

type Block = Obstacle & {
  colour: string,
  value: number,
}

type Pickup = Obstacle & {
  hidden: boolean,
};

let canvas: HTMLCanvasElement;
let ctx : CanvasRenderingContext2D;
let state: State;
let roundNo: number;
let balls: Ball[];
let mouseState: 'up' | 'down';
let mouseOriginX: number;
let mouseOriginY: number;
let mouseX: number;
let mouseY: number;
let walls: Obstacle[];
let blocks: Block[];
let pickups: Pickup[];
let transitionPixels;

window.onload = function () {
  canvas = (document.getElementById('gameCanvas'): any);
  ctx = canvas.getContext('2d');
  addEventListeners();
  init();
  requestAnimationFrame(update);
};

function addEventListeners() {
  window.addEventListener('mousedown', (event: MouseEvent) => {
    mouseState = 'down';
    mouseOriginX = event.clientX;
    mouseOriginY = event.clientY;
    mouseX = 0;
    mouseY = 0;
  });
  window.addEventListener('mousemove', (event: MouseEvent) => {
    if (mouseState === 'up') return;
    mouseX = event.clientX - mouseOriginX;
    mouseY = event.clientY - mouseOriginY;
  });
  window.addEventListener('mouseup', () => {
    mouseState = 'up';
    if (state !== 'aiming') return;
    const power = Math.sqrt(Math.pow(mouseX, 2) + Math.pow(mouseY, 2));
    if (power < 100) return;
    state = 'shooting';
    balls.forEach((ball) => {
      ball.vx = -mouseX / power * 500;
      ball.vy = -mouseY / power * 500;
    });
  });
}

function init() {
  balls = [{ x: canvas.width / 2, y: canvas.height - 20, vx: 0, vy: 0, r: 10, cooldown: 0, state: 'active' }];
  state = 'aiming';
  roundNo = 1;
  mouseState = 'up';
  transitionPixels = 0;
  walls = [{
    x: -10,
    y: 0,
    w: 10,
    h: canvas.height,
  },{
    x: canvas.width,
    y: 0,
    w: 10,
    h: canvas.height,
  },{
    x: 0,
    y: -10,
    w: canvas.width,
    h: 10,
  }];
  blocks = [];
  pickups = [];
  const max = 2 + Math.random() * 4;
  for (let i = 0; i < max; i++) {
    generateBlock();
  }
}

function generateFreePosition() {
  const x = 5 + Math.floor(Math.random() * 10) * 60;
  const y = 5 + Math.floor(Math.random() * 3) * 60;
  const existingBlock = blocks.find(({ x: x2, y: y2 }) => x === x2 && y === y2);
  const existingPickup = pickups.find(({ x: x2, y: y2 }) => x === x2 && y === y2);
  if (existingBlock || existingPickup) {
    return generateFreePosition();
  }
  return { x, y };
}

function generateBlock() {
  const { x, y } = generateFreePosition();
  blocks.push({
    x,
    y,
    w: 50,
    h: 50,
    colour: 'lime',
    value: Math.floor(roundNo + Math.random() * 3),
  });
}

function generatePickup() {
  const { x, y } = generateFreePosition();
  pickups.push({
    x,
    y,
    w: 50,
    h: 50,
    hidden: false,
  });
}

let previousTimestamp: number = performance.now();
function update(timestamp) {
  const deltaTime = (timestamp - previousTimestamp) / 1000 || 1/60;
  handleInputs();
  updatePhysics(deltaTime);
  render();
  previousTimestamp = timestamp;
  requestAnimationFrame(update);
}

function handleInputs() {

}

function updatePhysics(deltaTime) {
  if (state === 'shooting') updatePhysicsShooting(deltaTime);
  if (state === 'transitioning') updatePhysicsTransitioning(deltaTime);
  if (state === 'collecting') updatePhysicsCollecting(deltaTime);
}

function updatePhysicsShooting(deltaTime) {
  balls.forEach((ball) => {
    if (ball.cooldown > 0) {
      ball.cooldown -= deltaTime;
      return;
    }
    ball.x += ball.vx * deltaTime;
    ball.y += ball.vy * deltaTime;
    if (ball.state === 'active') {
      [{
        x: ball.x,
        y: ball.y - ball.r,
        mx: 1,
        my: -1,
      }, {
        x: ball.x,
        y: ball.y + ball.r,
        mx: 1,
        my: -1,
      }, {
        x: ball.x - ball.r,
        y: ball.y,
        mx: -1,
        my: 1,
      }, {
        x: ball.x + ball.r,
        y: ball.y,
        mx: -1,
        my: 1,
      }].forEach((collisionEdge) => {
        walls.forEach((wall) => {
          if (collision(collisionEdge, wall)) {
            ball.vx *= collisionEdge.mx;
            ball.vy *= collisionEdge.my;
          }
        });
        blocks.forEach((block) => {
          if (block.value <= 0) return;
          if (collision(collisionEdge, block)) {
            ball.vx *= collisionEdge.mx;
            ball.vy *= collisionEdge.my;
            block.value -= 1;
          }
        });
        pickups.forEach((pickup) => {
          if (pickup.hidden) return;
          if (collision(collisionEdge, pickup)) {
            pickup.hidden = true;
            balls.push({
              x: pickup.x + pickup.w / 2,
              y: pickup.y + pickup.h / 2,
              r: 10,
              vx: 0,
              vy: 500,
              state: 'falling',
              cooldown: 0,
            });
          }
        });
      });
    }
    if (ball.y > canvas.height - 20) {
      ball.y = canvas.height - 20;
      ball.vx = 0;
      ball.vy = 0;
    }
  });

  if (balls.filter((b) => Math.abs(b.vx) > 0 || Math.abs(b.vy) > 0).length === 0) {
    state = 'transitioning';
  }
}

function updatePhysicsTransitioning(deltaTime) {
  const deltaY = deltaTime * 60 * 2;
  transitionPixels += deltaY;
  blocks.forEach((block) => {
    block.y += deltaY;
  });
  pickups.forEach((block) => {
    block.y += deltaY;
  });
  if (transitionPixels >= 60) {
    transitionPixels = 0;
    roundNo += 1;
    for (let i = 0; i < 5; i++) generateBlock();
    if (Math.random() > 0.5) generatePickup();
    state = 'collecting';
    return;
  }
}

function updatePhysicsCollecting(deltaTime) {
  const targetX = balls[0].x;
  balls.forEach((ball) => {
    if (ball.x < targetX - 5) {
      ball.x += deltaTime * 400;
    } else if (ball.x > targetX + 5) {
      ball.x -= deltaTime * 400;
    } else {
      ball.x = targetX;
    }
  });

  if (balls.filter((b) => b.x !== targetX).length === 0) {
    state = 'aiming';
    balls.forEach((b, index) => {
      b.cooldown = index * 0.20;
      b.state = 'active';
    });
  }
}

function collision(edge, obstacle) {
  const x1 = obstacle.x;
  const x2 = x1 + obstacle.w;
  const y1 = obstacle.y;
  const y2 = y1 + obstacle.h;
  return x1 < edge.x && edge.x < x2 && y1 < edge.y && edge.y < y2;
}

function render() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  blocks.forEach((block) => {
    if (block.value <= 0) return;
    ctx.fillStyle = `rgb(${block.value*3}, ${255-block.value*3}, ${128+block.value*4})`;
    ctx.fillRect(block.x, block.y, block.w, block.h);
    ctx.font = '20px arial';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.fillText(`${block.value}`, block.x+block.w/2, block.y+block.w/2+6);
  });
  balls.forEach((ball) => {
    drawCircle(ball.x, ball.y, ball.r);
  });
  pickups.forEach((pickup) => {
    if (pickup.hidden) return;
    drawCircle(pickup.x + pickup.w/2, pickup.y + pickup.h / 2, pickup.h / 3);
    drawCircle(pickup.x + pickup.w/2, pickup.y + pickup.h / 2, pickup.h / 4, 'black');
    drawCircle(pickup.x + pickup.w/2, pickup.y + pickup.h / 2, pickup.h / 6, 'white');
  });
  ctx.font = '15px arial';
  drawAim();
}

function drawAim() {
  if (mouseState !== 'down') return;
  if (state !== 'aiming') return;
  drawCircle(balls[0].x - mouseX, balls[0].y - mouseY, 5);
}

function drawCircle(x, y, radius, color = 'white') {
  ctx.beginPath();
  ctx.arc(x, y, radius, 2 * Math.PI, 0);
  ctx.fillStyle = color;
  ctx.fill();
}
