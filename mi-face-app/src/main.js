import * as faceapi from 'face-api.js';

const video = document.getElementById('video');

// URL de los modelos (puedes usar '/models' si descargaste los archivos a public/models)
const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';

async function init() {
  console.log('Cargando modelos...');
  
  // 1. Cargar las redes neuronales necesarias
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
  ]);

  console.log('Modelos cargados. Iniciando webcam...');
  startVideo();
}

function startVideo() {
  navigator.mediaDevices
    .getUserMedia({ video: {} })
    .then((stream) => {
      video.srcObject = stream;
    })
    .catch((err) => console.error('Error al acceder a la cámara:', err));
}

// 2. Cuando el video empiece a reproducirse, iniciar el canvas de detección
video.addEventListener('play', () => {
  // Crear el canvas ajustado a la cámara
  const canvas = faceapi.createCanvasFromMedia(video);
  document.querySelector('.video-container').append(canvas);

  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  // Bucle de detección continuo
  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    // Escalar detecciones al tamaño visible
    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    // Limpiar el frame anterior
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar resultados
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
  }, 100);
});

init();