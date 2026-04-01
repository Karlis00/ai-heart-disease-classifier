/**
 * api.js — calls to FastAPI backend
 * VITE_API_URL="" in dev (Vite proxy handles /predict → localhost:8000)
 * Set VITE_API_URL=https://your-backend.com for production builds.
 */
const BASE = import.meta.env.VITE_API_URL || '';

export async function classifyECG(datFile, heaFile) {
  const form = new FormData();
  form.append('dat_file', datFile);
  form.append('hea_file', heaFile);

  const res = await fetch(`${BASE}/predict/`, { method: 'POST', body: form });

  if (!res.ok) {
    let msg = `Server error ${res.status}`;
    try { const e = await res.json(); msg = e.detail || msg; } catch {}
    throw new Error(msg);
  }
  return res.json(); // { probabilities, predictions, labels }
}

export async function healthCheck() {
  const res = await fetch(`${BASE}/`);
  if (!res.ok) throw new Error('Backend unreachable');
  return res.json();
}
