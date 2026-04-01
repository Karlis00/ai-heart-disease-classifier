import React from 'react';
import { useECGUpload }   from './hooks/useECGUpload';
import { UploadZone }     from './components/UploadZone';
import { FileStatus }     from './components/FileStatus';
import { ECGDisplay }     from './components/ECGDisplay';
import { ResultDisplay }  from './components/ResultDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorAlert }     from './components/ErrorAlert';

export default function App() {
  const {
    datFile, heaFile, ecgData, result,
    status, error,
    handleFiles, runClassification, reset,
  } = useECGUpload();

  const canRun   = status === 'ready' || status === 'done' || (status === 'error' && ecgData);
  const canReset = status !== 'idle' && status !== 'parsing';

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>

      {/* ── Top bar ──────────────────────────────────────── */}
      <header style={{
        height:'54px', padding:'0 20px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        borderBottom:'1px solid var(--border)',
        background:'rgba(3,11,20,0.92)',
        backdropFilter:'blur(10px)',
        position:'sticky', top:0, zIndex:100,
      }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <rect width="26" height="26" rx="6" fill="var(--cyan-dim)" stroke="rgba(0,212,255,0.3)" strokeWidth="1"/>
            <polyline points="2,13 5,13 7,7 9,19 11,11 13,16 15,13 24,13"
              stroke="var(--cyan)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <span style={{ fontFamily:'var(--mono)', fontSize:'14px', fontWeight:700, color:'var(--text-primary)' }}>
            CARDIO<span style={{ color:'var(--cyan)' }}>SCAN</span>
            <span style={{ fontSize:'10px', color:'var(--text-muted)', marginLeft:'8px', fontWeight:400 }}>AI · ECG CLASSIFIER</span>
          </span>
        </div>

        {/* Right controls */}
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{
            display:'flex', alignItems:'center', gap:'6px',
            padding:'4px 10px', borderRadius:'20px',
            background:'var(--cyan-dim)', border:'1px solid rgba(0,212,255,0.2)',
          }}>
            <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'var(--green)', boxShadow:'0 0 5px var(--green)' }}/>
            <span style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--cyan)' }}>CNN-MAMBA v3</span>
          </div>
          {canReset && (
            <button onClick={reset} style={{
              padding:'5px 12px', background:'transparent',
              border:'1px solid var(--border)', borderRadius:'var(--r-sm)',
              color:'var(--text-secondary)', fontFamily:'var(--mono)', fontSize:'11px', cursor:'pointer',
            }}>↺ Reset</button>
          )}
        </div>
      </header>

      {/* ── Body ─────────────────────────────────────────── */}
      <main style={{
        flex:1,
        display:'grid',
        gridTemplateColumns:'340px 1fr',
        maxWidth:'1380px', width:'100%', margin:'0 auto',
      }}>

        {/* Left panel */}
        <aside style={{
          borderRight:'1px solid var(--border)',
          padding:'20px 18px',
          display:'flex', flexDirection:'column', gap:'14px',
          overflowY:'auto',
          maxHeight:'calc(100vh - 54px)',
          position:'sticky', top:'54px',
        }}>
          <Divider label="01 / UPLOAD" />
          <UploadZone onFiles={handleFiles} status={status} />
          <FileStatus datFile={datFile} heaFile={heaFile} ecgData={ecgData} />
          <ErrorAlert error={error} onDismiss={reset} />

          {/* Run button */}
          <button
            onClick={runClassification}
            disabled={!canRun || status === 'loading'}
            style={{
              padding:'13px 18px',
              background: canRun && status !== 'loading'
                ? 'linear-gradient(135deg, var(--cyan), #0099BB)'
                : 'var(--bg-card)',
              border:`1px solid ${canRun ? 'var(--cyan)' : 'var(--border)'}`,
              borderRadius:'var(--r-md)',
              color: canRun && status !== 'loading' ? '#000814' : 'var(--text-muted)',
              fontFamily:'var(--mono)', fontSize:'12px', fontWeight:700,
              cursor: canRun && status !== 'loading' ? 'pointer' : 'not-allowed',
              letterSpacing:'0.08em',
              transition:'all .2s',
              boxShadow: canRun && status !== 'loading' ? 'var(--glow-cyan)' : 'none',
            }}
          >
            {status === 'loading' ? '⟳  RUNNING INFERENCE…' : '▶  RUN CLASSIFICATION'}
          </button>

          {/* Model info */}
          <div style={{
            padding:'12px 14px', background:'var(--bg-card)',
            border:'1px solid var(--border)', borderRadius:'var(--r-md)',
            fontSize:'12px', color:'var(--text-secondary)', lineHeight:1.8,
          }}>
            <p style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--text-muted)', marginBottom:'5px' }}>MODEL</p>
            <p>Architecture <span style={{ color:'var(--cyan)', fontFamily:'var(--mono)' }}>CNN-Mamba v3</span></p>
            <p>Classes <span style={{ color:'var(--text-primary)' }}>NORM · MI · STTC · CD · HYP</span></p>
            <p>Input <span style={{ color:'var(--text-primary)' }}>12-lead · 100 Hz · 10 s</span></p>
            <p>Dataset <span style={{ color:'var(--text-primary)' }}>PTB-XL</span></p>
          </div>
        </aside>

        {/* Right panel */}
        <section style={{ padding:'22px', display:'flex', flexDirection:'column', gap:'26px', overflowY:'auto' }}>

          {status === 'idle' && <WelcomeScreen />}
          {status === 'parsing' && <LoadingSpinner message="Parsing ECG files…" />}

          {ecgData && (
            <div>
              <Divider label="02 / ECG WAVEFORM" />
              <div style={{ marginTop:'14px' }}>
                <ECGDisplay ecgData={ecgData} />
              </div>
            </div>
          )}

          {status === 'loading' && <LoadingSpinner message="Classifying ECG signal…" />}

          {result && (
            <div>
              <Divider label="03 / CLASSIFICATION RESULT" />
              <div style={{ marginTop:'14px' }}>
                <ResultDisplay result={result} />
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

/* ── Helpers ──────────────────────────────────── */

function Divider({ label }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
      <div style={{ flex:1, height:'1px', background:'var(--border)' }}/>
      <span style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--text-muted)', whiteSpace:'nowrap', letterSpacing:'0.08em' }}>{label}</span>
      <div style={{ flex:1, height:'1px', background:'var(--border)' }}/>
    </div>
  );
}

function WelcomeScreen() {
  return (
    <div style={{
      display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', flex:1, padding:'60px 32px',
      gap:'22px', textAlign:'center',
    }}>
      {/* Animated ECG line */}
      <svg width="280" height="56" viewBox="0 0 280 56" fill="none" style={{ opacity:.55 }}>
        <polyline
          points="0,28 35,28 50,28 62,4 74,52 84,14 94,28 108,28 140,28 172,28 182,28 194,6 206,50 216,18 226,28 242,28 280,28"
          stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"
          strokeDasharray="700"
          style={{ animation:'ecg-travel 3s ease-in-out infinite' }}
        />
      </svg>

      <div>
        <h1 style={{ fontSize:'26px', fontFamily:'var(--mono)', color:'var(--text-primary)', lineHeight:1.3, marginBottom:'10px' }}>
          12-Lead ECG<br/><span style={{ color:'var(--cyan)' }}>AI Classifier</span>
        </h1>
        <p style={{ fontSize:'14px', color:'var(--text-secondary)', maxWidth:'400px', lineHeight:1.75 }}>
          Upload a WFDB record (.dat + .hea), visualise all 12 leads,
          then classify with the CNN-Mamba model trained on PTB-XL.
        </p>
      </div>

      <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', justifyContent:'center' }}>
        {['NORM','MI','STTC','CD','HYP'].map(l => (
          <span key={l} style={{
            fontFamily:'var(--mono)', fontSize:'11px', padding:'3px 11px',
            borderRadius:'20px', background:'var(--bg-card)',
            border:'1px solid var(--border)', color:'var(--text-secondary)',
          }}>{l}</span>
        ))}
      </div>

      <p style={{ fontSize:'11px', color:'var(--text-muted)', fontFamily:'var(--mono)' }}>
        ← Drop your .dat + .hea files in the left panel
      </p>
    </div>
  );
}
