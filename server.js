import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(__dirname));

// Simple health
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Save profile data to disk (simple fullstack demo)
const dataDir = path.join(__dirname, 'data');
const profilesPath = path.join(dataDir, 'profiles.json');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if (!fs.existsSync(profilesPath)) fs.writeFileSync(profilesPath, '[]');

app.post('/api/profile', (req, res) => {
  const { name, payload, type } = req.body || {};
  if (!name || !payload || !type) {
    return res.status(400).json({ error: 'name, payload, type wajib diisi' });
  }
  const item = { id: Date.now(), name, payload, type };
  const list = JSON.parse(fs.readFileSync(profilesPath, 'utf-8'));
  list.push(item);
  fs.writeFileSync(profilesPath, JSON.stringify(list, null, 2));
  res.json({ ok: true, item });
});

app.get('/api/profile', (req, res) => {
  const list = JSON.parse(fs.readFileSync(profilesPath, 'utf-8'));
  res.json(list);
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}/`);
});

