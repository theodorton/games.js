const TOUCH_OFFSET_TRIGGER = 50;
var touchOrigoX;
var touchOrigoY;

function setTouchOrigo({ clientX, clientY }) {
  touchOrigoX = clientX;
  touchOrigoY = clientY;
}

export default function addControls({
  west,
  north,
  east,
  south,
}) {
  // Keyboard controls
  document.addEventListener('keydown', (event) => {
    switch (event.keyCode) {
    case 37: // Left
    case 65: // A
      west();
      break;
    case 38: // Up
    case 87: // W
      north();
      break;
    case 39: // Right
    case 68: // D
      east();
      break;
    case 40: // bottom
    case 83: // S
      south();
      break;
    }
  });
  // Mobile controls
  document.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) return;
    const [touch] = e.touches;
    setTouchOrigo(touch);
  });
  document.addEventListener('touchmove', function (e) {
    e.preventDefault();
    if (e.touches.length > 1) return;
    const [touch] = e.touches;
    const touchDeltaX = touchOrigoX - touch.clientX;
    const touchDeltaY = touchOrigoY - touch.clientY;
    if (touchDeltaY > TOUCH_OFFSET_TRIGGER) {
      north();
      setTouchOrigo(touch);
    } else if (touchDeltaY < -TOUCH_OFFSET_TRIGGER) {
      south();
      setTouchOrigo(touch);
    } else if (touchDeltaX > TOUCH_OFFSET_TRIGGER) {
      west();
      setTouchOrigo(touch);
    } else if (touchDeltaX < -TOUCH_OFFSET_TRIGGER) {
      east();
      setTouchOrigo(touch);
    }
  });
}