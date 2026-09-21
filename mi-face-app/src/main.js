import * as faceapi from 'face-api.js';
const video = document.getElementById('video');
const errorContainer = document.getElementById('error-container');
const videoContainer = document.getElementById('video-container');
const retryBtn = document.getElementById('retry-btn');

let detectionInterval;
let timeoutId;

const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
  faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
]).then(startVideo)
  .catch(err => console.error("Error al cargar los modelos:", err));

function startVideo() {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
    })
    .catch(err => console.error("Error al acceder a la cámara:", err));
}
function stopProcess() {
  clearInterval(detectionInterval);
  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
  }
}

video.addEventListener('play', () => {
  timeoutId = setTimeout(() => {
    stopProcess();
    videoContainer.style.display = 'none';
    errorContainer.style.display = 'block';
  }, 5000);
  detectionInterval = setInterval(async () => {
    const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();

    if (detection) {
      const happyScore = detection.expressions.happy;
      if (happyScore > 0.94) {
        clearTimeout(timeoutId); 
        stopProcess();
        window.location.href = '/dashboard.html';
      }
    }
  }, 150); 
});
retryBtn.addEventListener('click', () => {
  errorContainer.style.display = 'none';
  videoContainer.style.display = 'block';
  startVideo();
});