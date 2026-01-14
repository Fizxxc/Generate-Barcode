import { BrowserMultiFormatReader, BrowserQRCodeReader, BarcodeFormat, DecodeHintType } from 'https://unpkg.com/@zxing/library@0.20.0/esm/index.js';

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const cameraSelect = document.getElementById('cameraSelect');
const formatSelect = document.getElementById('formatSelect');
const video = document.getElementById('preview');
const resultEl = document.getElementById('result');
const fileInput = document.getElementById('fileInput');
const decodeFileBtn = document.getElementById('decodeFile');

let reader;
let controls;

async function listCamerasWithPermission() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  stream.getTracks().forEach(t => t.stop());
  const devices = await navigator.mediaDevices.enumerateDevices();
  const cams = devices.filter(d => d.kind === 'videoinput');
  cameraSelect.innerHTML = '';
  cams.forEach((c, i) => {
    const opt = document.createElement('option');
    opt.value = c.deviceId;
    opt.textContent = c.label || `Kamera ${i + 1}`;
    cameraSelect.appendChild(opt);
  });
}

function createReader() {
  const mode = formatSelect.value;
  if (mode === 'qr') {
    reader = new BrowserQRCodeReader();
    return;
  }
  if (mode === 'barcode') {
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E
    ]);
    reader = new BrowserMultiFormatReader(hints);
    return;
  }
  reader = new BrowserMultiFormatReader();
}

async function start() {
  createReader();
  resultEl.textContent = '';
  const deviceId = cameraSelect.value || undefined;
  controls = await reader.decodeFromVideoDevice(deviceId, video, res => {
    if (res) {
      resultEl.textContent = res.getText();
      try {
        const url = new URL(res.getText());
        resultEl.innerHTML = `<a href="${url.href}" target="_blank">${url.href}</a>`;
      } catch {}
    }
  });
}

function stop() {
  if (controls) {
    controls.stop();
    controls = null;
  }
}

async function decodeFromFile() {
  if (!fileInput.files || fileInput.files.length === 0) return;
  createReader();
  const img = document.createElement('img');
  img.style.display = 'none';
  const url = URL.createObjectURL(fileInput.files[0]);
  img.src = url;
  document.body.appendChild(img);
  try {
    const res = await reader.decodeFromImage(img);
    if (res) {
      resultEl.textContent = res.getText();
      try {
        const u = new URL(res.getText());
        resultEl.innerHTML = `<a href="${u.href}" target="_blank">${u.href}</a>`;
      } catch {}
    } else {
      resultEl.textContent = 'Tidak ditemukan kode pada gambar.';
    }
  } catch (e) {
    resultEl.textContent = 'Gagal membaca gambar.';
  } finally {
    URL.revokeObjectURL(url);
    document.body.removeChild(img);
  }
}

startBtn.addEventListener('click', start);
stopBtn.addEventListener('click', stop);
decodeFileBtn.addEventListener('click', decodeFromFile);
listCamerasWithPermission();
