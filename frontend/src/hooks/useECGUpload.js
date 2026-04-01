import { useState, useCallback } from 'react';
import { parseECG }     from '../utils/ecgParser';
import { classifyECG }  from '../utils/api';

/**
 * States: idle → parsing → ready → loading → done
 *                         ↓ (any error) → error
 */
export function useECGUpload() {
  const [datFile,  setDatFile]  = useState(null);
  const [heaFile,  setHeaFile]  = useState(null);
  const [ecgData,  setEcgData]  = useState(null);
  const [result,   setResult]   = useState(null);
  const [status,   setStatus]   = useState('idle');
  const [error,    setError]    = useState(null);

  const reset = useCallback(() => {
    setDatFile(null); setHeaFile(null);
    setEcgData(null); setResult(null);
    setStatus('idle'); setError(null);
  }, []);

  const handleFiles = useCallback(async (files) => {
    setError(null); setResult(null); setEcgData(null);

    let dat = null, hea = null;
    for (const f of files) {
      if (f.name.endsWith('.dat')) dat = f;
      else if (f.name.endsWith('.hea')) hea = f;
    }

    if (!dat || !hea) {
      const missing = !dat && !hea ? '.dat and .hea files' : !dat ? '.dat file' : '.hea file';
      setError(`Missing ${missing}. Please upload both files together.`);
      setStatus('error');
      return;
    }

    setDatFile(dat); setHeaFile(hea);
    setStatus('parsing');

    try {
      const [heaText, datBuffer] = await Promise.all([hea.text(), dat.arrayBuffer()]);
      setEcgData(parseECG(heaText, datBuffer));
      setStatus('ready');
    } catch (err) {
      setError(`Parse error: ${err.message}`);
      setStatus('error');
    }
  }, []);

  const runClassification = useCallback(async () => {
    if (!datFile || !heaFile) return;
    setStatus('loading'); setError(null);
    try {
      const res = await classifyECG(datFile, heaFile);
      setResult(res);
      setStatus('done');
    } catch (err) {
      setError(err.message || 'Classification failed. Is the backend running?');
      setStatus('error');
    }
  }, [datFile, heaFile]);

  return { datFile, heaFile, ecgData, result, status, error, handleFiles, runClassification, reset };
}
