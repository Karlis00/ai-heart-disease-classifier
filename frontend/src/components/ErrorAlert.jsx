import React from 'react';

export function ErrorAlert({ error, onDismiss }) {
  if (!error) return null;
  return (
    <div style={{
      padding:'13px 15px', borderRadius:'var(--r-md)',
      background:'var(--red-dim)', border:'1px solid rgba(255,64,96,.35)',
      display:'flex', gap:'11px', alignItems:'flex-start',
    }}>
      <span style={{ color:'var(--red)', fontSize:'15px', flexShrink:0 }}>✕</span>
      <div style={{ flex:1 }}>
        <p style={{ fontFamily:'var(--mono)', fontSize:'11px', color:'var(--red)', marginBottom:'2px' }}>ERROR</p>
        <p style={{ fontSize:'12px', color:'var(--text-primary)', lineHeight:1.55 }}>{error}</p>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} style={{
          background:'none', border:'none', cursor:'pointer',
          color:'var(--text-muted)', fontSize:'18px', lineHeight:1, padding:'0', flexShrink:0,
        }}>×</button>
      )}
    </div>
  );
}
