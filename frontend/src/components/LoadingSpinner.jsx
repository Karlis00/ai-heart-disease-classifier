import React from 'react';

export function LoadingSpinner({ message = 'Processing…' }) {
  return (
    <div style={{
      display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', gap:'16px', padding:'40px',
    }}>
      {/* Dual-ring spinner */}
      <div style={{ position:'relative', width:'56px', height:'56px' }}>
        <div style={{
          position:'absolute', inset:0,
          border:'2px solid var(--border)',
          borderTopColor:'var(--cyan)',
          borderRadius:'50%',
          animation:'spin 0.75s linear infinite',
        }}/>
        <div style={{
          position:'absolute', inset:'9px',
          border:'1.5px solid var(--border)',
          borderBottomColor:'var(--green)',
          borderRadius:'50%',
          animation:'spin 1.1s linear infinite reverse',
        }}/>
        {/* Heart in centre */}
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--red)" opacity="0.85">
            <path d="M12 21C12 21 3 14 3 8a4.5 4.5 0 0 1 9-1 4.5 4.5 0 0 1 9 1c0 6-9 13-9 13z"/>
          </svg>
        </div>
      </div>

      <div style={{ textAlign:'center' }}>
        <p style={{ fontFamily:'var(--mono)', fontSize:'13px', color:'var(--cyan)' }}>{message}</p>
        <p style={{ fontSize:'12px', color:'var(--text-muted)', marginTop:'3px' }}>CNN-Mamba inference running…</p>
      </div>

      {/* Shimmer bar */}
      <div style={{ width:'180px', height:'3px', background:'var(--border)', borderRadius:'2px', overflow:'hidden' }}>
        <div style={{
          height:'100%', width:'60%',
          background:'linear-gradient(90deg, transparent, var(--cyan), transparent)',
          backgroundSize:'200% 100%',
          animation:'shimmer 1.1s ease infinite',
        }}/>
      </div>
    </div>
  );
}
