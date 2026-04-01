import React from 'react';

export function FileStatus({ datFile, heaFile, ecgData }) {
  if (!datFile && !heaFile) return null;

  return (
    <div style={{
      padding:'14px 16px', background:'var(--bg-card)',
      border:'1px solid var(--border)', borderRadius:'var(--r-md)',
      display:'flex', flexDirection:'column', gap:'8px',
    }}>
      <p style={{ fontSize:'10px', fontFamily:'var(--mono)', color:'var(--text-muted)' }}>UPLOADED FILES</p>

      {[
        { file:datFile, ext:'.dat', color:'var(--cyan)' },
        { file:heaFile, ext:'.hea', color:'var(--amber)' },
      ].map(({ file, ext, color }) => (
        <div key={ext} style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          {/* Status dot */}
          <div style={{
            width:'8px', height:'8px', borderRadius:'50%', flexShrink:0,
            background: file ? 'var(--green)' : 'var(--text-muted)',
            boxShadow: file ? '0 0 6px var(--green)' : 'none',
          }}/>
          <span style={{ fontFamily:'var(--mono)', fontSize:'12px', color: file ? color : 'var(--text-muted)', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {file ? file.name : `Missing ${ext}`}
          </span>
          {file && (
            <span style={{ fontSize:'11px', color:'var(--text-muted)', flexShrink:0 }}>
              {(file.size / 1024).toFixed(1)} KB
            </span>
          )}
        </div>
      ))}

      {ecgData && (
        <div style={{
          marginTop:'4px', paddingTop:'10px', borderTop:'1px solid var(--border)',
          display:'flex', gap:'20px', flexWrap:'wrap',
        }}>
          {[
            { k:'LEADS',    v: ecgData.numSignals },
            { k:'SAMPLE RATE', v:`${ecgData.fs} Hz` },
            { k:'DURATION', v:`${ecgData.duration.toFixed(1)} s` },
          ].map(({ k, v }) => (
            <div key={k}>
              <p style={{ fontSize:'10px', fontFamily:'var(--mono)', color:'var(--text-muted)' }}>{k}</p>
              <p style={{ fontSize:'14px', fontFamily:'var(--mono)', color:'var(--cyan)' }}>{v}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
