const payload = document.getElementById('payload');
const type = document.getElementById('type');
const generateBtn = document.getElementById('generate');
const downloadBtn = document.getElementById('download');
const canvas = document.getElementById('outputCanvas');

function clearCanvas(ctx) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawBarcode(data) {
  const tmpCanvas = document.createElement('canvas');
  JsBarcode(tmpCanvas, data, { format: 'code128', lineColor: '#000000', width: 3, height: 180, displayValue: false, margin: 10 });
  const ctx = canvas.getContext('2d');
  clearCanvas(ctx);
  const scale = Math.min(canvas.width / tmpCanvas.width, 1.6);
  const w = tmpCanvas.width * scale;
  const h = tmpCanvas.height * scale;
  const x = (canvas.width - w) / 2;
  const y = (canvas.height - h) / 2 - 30;
  ctx.drawImage(tmpCanvas, x, y, w, h);
  const size = 44;
  const mont = `600 ${size}px Montserrat, Arial, sans-serif`;
  const akira = `700 ${size}px 'Akira Expanded', 'Akira Expanded Demo', Arial, sans-serif`;
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'left';
  const chars = Array.from(data);
  let widths = [];
  chars.forEach(ch => {
    ctx.font = ch === '.' ? akira : mont;
    widths.push(ctx.measureText(ch).width);
  });
  const total = widths.reduce((a, b) => a + b, 0);
  let tx = (canvas.width - total) / 2;
  const ty = y + h + 48;
  chars.forEach((ch, i) => {
    ctx.font = ch === '.' ? akira : mont;
    ctx.fillText(ch, tx, ty);
    tx += widths[i];
  });
}

function drawQR(data) {
  const ctx = canvas.getContext('2d');
  clearCanvas(ctx);
  const size = Math.min(canvas.height - 80, canvas.width - 80);
  const tmpCanvas = document.createElement('canvas');
  tmpCanvas.width = size;
  tmpCanvas.height = size;
  QRCode.toCanvas(tmpCanvas, data, { width: size, margin: 2, color: { dark: '#000000', light: '#ffffff' } }).then(() => {
    const x = (canvas.width - size) / 2;
    const y = (canvas.height - size) / 2 - 20;
    ctx.drawImage(tmpCanvas, x, y, size, size);
  });
}

function generate() {
  const data = (payload.value || '').trim();
  if (!data) return;
  if (type.value === 'barcode') drawBarcode(data);
  else drawQR(data);
}

function downloadPNG() {
  const link = document.createElement('a');
  link.download = 'kode.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

generateBtn.addEventListener('click', generate);
downloadBtn.addEventListener('click', downloadPNG);
