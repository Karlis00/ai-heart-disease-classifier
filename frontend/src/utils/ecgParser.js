/**
 * ecgParser.js
 * Pure browser WFDB format-16 parser (.hea + .dat → mV arrays).
 */

const STANDARD_LEADS = ['I','II','III','aVR','aVL','aVF','V1','V2','V3','V4','V5','V6'];

function parseHeader(heaText) {
  const lines = heaText.trim().split('\n').filter(l => l.trim() && !l.startsWith('#'));
  const top = lines[0].trim().split(/\s+/);

  const numSignals  = parseInt(top[1]) || 12;
  const fs          = parseFloat(top[2]) || 500;
  const numSamples  = parseInt(top[3]) || 0;

  const signals = [];
  for (let i = 1; i <= numSignals && i < lines.length; i++) {
    const p = lines[i].trim().split(/\s+/);
    const gainRaw = p[2] || '200';
    const gain    = parseFloat(gainRaw.split('/')[0]) || 200;
    const adcZero = parseInt(p[4]) || 0;
    const name    = p[8] || STANDARD_LEADS[i - 1] || `L${i}`;
    signals.push({ gain, adcZero, name });
  }

  return { numSignals, fs, numSamples, signals };
}

function parseDat(buffer, meta) {
  const { numSignals, numSamples, signals } = meta;
  const view   = new DataView(buffer);
  const total  = numSamples > 0
    ? numSamples
    : Math.floor(buffer.byteLength / 2 / numSignals);

  const leads = Array.from({ length: numSignals }, () => new Float32Array(total));

  for (let s = 0; s < total; s++) {
    for (let c = 0; c < numSignals; c++) {
      const offset = (s * numSignals + c) * 2;
      if (offset + 2 > buffer.byteLength) break;
      const raw = view.getInt16(offset, true);          // little-endian int16
      leads[c][s] = (raw - signals[c].adcZero) / signals[c].gain;  // → mV
    }
  }
  return leads;
}

function downsample(arr, max = 2000) {
  if (arr.length <= max) return arr;
  const k   = Math.ceil(arr.length / max);
  const out = new Float32Array(Math.ceil(arr.length / k));
  for (let i = 0; i < out.length; i++) {
    let sum = 0, n = 0;
    for (let j = 0; j < k && i * k + j < arr.length; j++) { sum += arr[i * k + j]; n++; }
    out[i] = sum / n;
  }
  return out;
}

/**
 * Main entry point.
 * @param {string}      heaText   — text of .hea file
 * @param {ArrayBuffer} datBuffer — binary .dat file
 * @returns {{ leads, fs, duration, numSignals }}
 */
export function parseECG(heaText, datBuffer) {
  const meta     = parseHeader(heaText);
  const rawLeads = parseDat(datBuffer, meta);
  const leads    = rawLeads.map((lead, i) => ({
    name:      meta.signals[i]?.name || STANDARD_LEADS[i] || `Lead ${i + 1}`,
    data:      downsample(lead, 2000),
    rawLength: lead.length,
  }));
  const rawLen = rawLeads[0]?.length || 0;
  return {
    leads,
    fs:         meta.fs,
    duration:   rawLen / meta.fs,
    numSignals: meta.numSignals,
  };
}
