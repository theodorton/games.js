export default function preventZoom() {
  document.addEventListener('gesturestart', function (e) {
    e.preventDefault();
  });
}