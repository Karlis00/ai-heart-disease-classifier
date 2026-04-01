import React, { useCallback, useState } from 'react';

const LEADS = ['I','II','III','aVR','aVL','aVF','V1','V2','V3','V4','V5','V6'];

export function UploadZone({ onFiles, status }) {
  const [dragging, setDragging] = useState(false);
  const disabled = status === 'loading' || status === 'parsing';

  const onDrop = useCallback(e => {
    e.preventDefault(); setDragging(false);
    onFiles(Array.from(e.dataTransfer.files));
  }, [onFiles]);

  const onChange = useCallback(e => onFiles(Array.from(e.target.files)), [onFiles]);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>

      {/* Drop zone */}
      <label
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{
          display:'flex', flexDirection:'column', alignItems:'center',
          justifyContent:'center', gap:'12px', padding:'34px 18px',
          border:`1.5px dashed ${dragging ? 'var(--cyan)' : 'var(--border-glow)'}`,
          borderRadius:'var(--r-lg)',
          background: dragging ? 'var(--cyan-dim)' : 'var(--bg-card)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.55 : 1,
          transition:'all .2s',
          boxShadow: dragging ? 'var(--glow-cyan)' : 'none',
        }}>
        <input type="file" multiple accept=".dat,.hea"
          onChange={onChange} disabled={disabled} style={{ display:'none' }} />

        {/* Upload icon */}
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          <circle cx="22" cy="22" r="21"
            stroke={dragging ? 'var(--cyan)' : 'var(--border-glow)'} strokeWidth="1.5"/>
          <path d="M22 29V17M16 23l6-6 6 6"
            stroke={dragging ? 'var(--cyan)' : 'var(--text-secondary)'}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 31h16"
            stroke={dragging ? 'var(--cyan)' : 'var(--text-secondary)'}
            strokeWidth="2" strokeLinecap="round"/>
        </svg>

        <div style={{ textAlign:'center' }}>
          <p style={{ fontFamily:'var(--mono)', fontSize:'12px', color:'var(--cyan)', marginBottom:'3px' }}>
            {dragging ? 'DROP FILES HERE' : 'DRAG & DROP ECG FILES'}
          </p>
          <p style={{ fontSize:'13px', color:'var(--text-secondary)' }}>
            or <span style={{ color:'var(--cyan)', textDecoration:'underline' }}>click to browse</span>
          </p>
          <p style={{ fontSize:'11px', color:'var(--text-muted)', marginTop:'6px', fontFamily:'var(--mono)' }}>
            Upload one <code style={{color:'var(--amber)'}}>*.dat</code> &amp; one <code style={{color:'var(--amber)'}}>*.hea</code>
          </p>
        </div>
      </label>

      {/* Format pills */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
        {[
          { ext:'.dat', desc:'Binary signal data',   color:'var(--cyan)' },
          { ext:'.hea', desc:'Header — leads & gain', color:'var(--amber)' },
        ].map(({ ext, desc, color }) => (
          <div key={ext} style={{
            padding:'9px 12px', background:'var(--bg-secondary)',
            borderRadius:'var(--r-md)', border:'1px solid var(--border)',
            display:'flex', alignItems:'center', gap:'8px',
          }}>
            <span style={{ fontFamily:'var(--mono)', fontSize:'12px', color, fontWeight:700 }}>{ext}</span>
            <span style={{ fontSize:'11px', color:'var(--text-secondary)' }}>{desc}</span>
          </div>
        ))}
      </div>

      {/* Lead legend */}
      <div style={{ padding:'10px 12px', background:'var(--bg-card)', borderRadius:'var(--r-md)', border:'1px solid var(--border)' }}>
        <p style={{ fontSize:'10px', color:'var(--text-muted)', fontFamily:'var(--mono)', marginBottom:'6px' }}>
          EXPECTED 12-LEAD LAYOUT
        </p>
        <div style={{ display:'flex', flexWrap:'wrap', gap:'4px' }}>
          {LEADS.map(l => (
            <span key={l} style={{
              fontSize:'11px', fontFamily:'var(--mono)', padding:'1px 7px',
              borderRadius:'3px', background:'var(--cyan-dim)', color:'var(--cyan)',
              border:'1px solid rgba(0,212,255,0.2)',
            }}>{l}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
