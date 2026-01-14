export default function handler(req, res) {
  const method = req.method || 'GET';
  if (method === 'POST') {
    const { name, payload, type } = req.body || {};
    if (!name || !payload || !type) {
      return res.status(400).json({ error: 'name, payload, type wajib diisi' });
    }
    const item = { id: Date.now(), name, payload, type };
    // Catatan: di Vercel, penyimpanan tetap butuh KV/Postgres/external DB.
    // Di sini hanya echo kembali item.
    return res.status(200).json({ ok: true, item });
  }
  if (method === 'GET') {
    // Tanpa DB, kembalikan list kosong.
    return res.status(200).json([]);
  }
  return res.status(405).json({ error: 'Method Not Allowed' });
}

