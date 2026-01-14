const nameInput = document.getElementById('displayName');
const typeSelect = document.getElementById('ppType');
const payloadInput = document.getElementById('ppPayload');
const sizeSelect = document.getElementById('ppSize');
const generateBtn = document.getElementById('ppGenerate');
const downloadBtn = document.getElementById('ppDownload');
const canvas = document.getElementById('ppCanvas');
const API_BASE = '';

function setCanvasSize(s) {
  const n = parseInt(s, 10);
  canvas.width = n;
  canvas.height = n;
}

function clearCanvas(ctx) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawName(ctx, text, y) {
  const size = Math.round(canvas.width * 0.055);
  const mont = `600 ${size}px Montserrat, Arial, sans-serif`;
  const akira = `700 ${size}px 'Akira Expanded', 'Akira Expanded Demo', Arial, sans-serif`;
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'left';
  const chars = Array.from(text);
  let widths = [];
  chars.forEach(ch => {
    ctx.font = ch === '.' ? akira : mont;
    widths.push(ctx.measureText(ch).width);
  });
  const total = widths.reduce((a, b) => a + b, 0);
  let x = (canvas.width - total) / 2;
  chars.forEach((ch, i) => {
    ctx.font = ch === '.' ? akira : mont;
    ctx.fillText(ch, x, y);
    x += widths[i];
  });
}

function drawBarcode(data, displayText) {
  const tmp = document.createElement('canvas');
  JsBarcode(tmp, data, { format: 'code128', lineColor: '#000000', width: Math.max(2, Math.floor(canvas.width / 480)), height: Math.floor(canvas.width * 0.18), displayValue: false, margin: 10 });
  const ctx = canvas.getContext('2d');
  clearCanvas(ctx);
  const maxW = canvas.width * 0.82;
  const scale = Math.min(maxW / tmp.width, 2);
  const w = tmp.width * scale;
  const h = tmp.height * scale;
  const x = (canvas.width - w) / 2;
  const y = Math.round(canvas.height * 0.42 - h / 2);
  ctx.drawImage(tmp, x, y, w, h);
  drawName(ctx, displayText, Math.round(y + h + canvas.width * 0.11));
}

function drawQR(data, displayText) {
  const size = Math.round(canvas.width * 0.52);
  const tmp = document.createElement('canvas');
  tmp.width = size;
  tmp.height = size;
  const ctx = canvas.getContext('2d');
  clearCanvas(ctx);
  QRCode.toCanvas(tmp, data, { width: size, margin: 2, color: { dark: '#000000', light: '#ffffff' } }).then(() => {
    const x = Math.round((canvas.width - size) / 2);
    const y = Math.round(canvas.height * 0.36 - size / 2);
    ctx.drawImage(tmp, x, y, size, size);
    drawName(ctx, displayText, Math.round(y + size + canvas.width * 0.11));
  });
}

function generate() {
  const dName = (nameInput.value || '').trim() || 'Nama';
  const data = (payloadInput.value || '').trim() || dName;
  if (typeSelect.value === 'barcode') drawBarcode(data, dName);
  else drawQR(data, dName);
  try {
    fetch(`${API_BASE}/api/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: dName, payload: data, type: typeSelect.value })
    });
  } catch {}
}

function downloadPNG() {
  const link = document.createElement('a');
  link.download = 'foto-profil.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

sizeSelect.addEventListener('change', () => setCanvasSize(sizeSelect.value));
generateBtn.addEventListener('click', generate);
downloadBtn.addEventListener('click', downloadPNG);
setCanvasSize(sizeSelect.value);
