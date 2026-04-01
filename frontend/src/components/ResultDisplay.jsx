import React from 'react';

const META = {
  NORM: { label:'Normal Sinus Rhythm',    color:'var(--green)',  bg:'var(--green-dim)' },
  MI:   { label:'Myocardial Infarction',  color:'var(--red)',    bg:'var(--red-dim)'   },
  STTC: { label:'ST/T-wave Change',       color:'var(--amber)',  bg:'rgba(255,176,32,0.10)' },
  CD:   { label:'Conduction Disturbance', color:'var(--purple)', bg:'rgba(168,85,247,0.10)' },
  HYP:  { label:'Hypertrophy',            color:'var(--cyan)',   bg:'var(--cyan-dim)'  },
};
const ORDER = ['NORM','MI','STTC','CD','HYP'];

export function ResultDisplay({ result }) {
  if (!result) return null;
  const { probabilities, predictions, labels } = result;
  const normal = labels.length === 1 && labels[0] === 'NORM';

  return (
    <div className="fade-up" style={{ display:'flex', flexDirection:'column', gap:'14px' }}>

      {/* Summary banner */}
      <div style={{
        padding:'15px 18px',
        borderRadius:'var(--r-lg)',
        border:`1px solid ${normal ? 'rgba(0,255,136,.3)' : 'rgba(255,64,96,.3)'}`,
        background: normal ? 'var(--green-dim)' : 'var(--red-dim)',
        display:'flex', alignItems:'center', gap:'14px',
      }}>
        <div style={{
          width:'38px', height:'38px', borderRadius:'50%', flexShrink:0,
          border:`2px solid ${normal ? 'var(--green)' : 'var(--red)'}`,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:'18px', color: normal ? 'var(--green)' : 'var(--red)',
        }}>
          {normal ? '✓' : '!'}
        </div>
        <div>
          <p style={{ fontFamily:'var(--mono)', fontSize:'12px', color: normal ? 'var(--green)' : 'var(--red)', marginBottom:'2px' }}>
            {normal ? 'NO PATHOLOGY DETECTED' : `${labels.length} CONDITION(S) FLAGGED`}
          </p>
          <p style={{ fontSize:'13px', color:'var(--text-secondary)', lineHeight:1.5 }}>
            {labels.map(l => META[l]?.label || l).join(' · ') || 'No conditions above threshold'}
          </p>
        </div>
      </div>

      {/* Probability bars */}
      <div style={{
        padding:'16px', background:'var(--bg-card)',
        border:'1px solid var(--border)', borderRadius:'var(--r-lg)',
      }}>
        <p style={{ fontSize:'10px', fontFamily:'var(--mono)', color:'var(--text-muted)', marginBottom:'14px' }}>
          CLASSIFICATION PROBABILITIES  <span style={{ color:'var(--text-muted)', fontWeight:400 }}>(threshold 0.5)</span>
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:'13px' }}>
          {ORDER.map((code, i) => {
            const prob      = probabilities[i] ?? 0;
            const predicted = predictions[i] === 1;
            const { label, color, bg } = META[code] || { label:code, color:'var(--cyan)', bg:'var(--cyan-dim)' };
            const pct = Math.round(prob * 100);
            return (
              <div key={code}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'5px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    {predicted && (
                      <span style={{
                        fontSize:'9px', padding:'1px 6px', borderRadius:'3px',
                        background:bg, color, border:`1px solid ${color}44`,
                        fontFamily:'var(--mono)', letterSpacing:'0.05em',
                      }}>DETECTED</span>
                    )}
                    <span style={{ fontFamily:'var(--mono)', fontSize:'12px', color: predicted ? color : 'var(--text-muted)' }}>{code}</span>
                    <span style={{ fontSize:'12px', color:'var(--text-secondary)' }}>{label}</span>
                  </div>
                  <span style={{ fontFamily:'var(--mono)', fontSize:'13px', color: predicted ? color : 'var(--text-secondary)', fontWeight: predicted ? 700 : 400 }}>
                    {pct}%
                  </span>
                </div>
                {/* Bar track */}
                <div style={{ height:'5px', background:'var(--bg-secondary)', borderRadius:'3px', overflow:'hidden' }}>
                  <div style={{
                    height:'100%', width:`${pct}%`,
                    background: predicted ? `linear-gradient(90deg,${color}99,${color})` : 'var(--border-glow)',
                    borderRadius:'3px',
                    transition:'width 0.9s cubic-bezier(.16,1,.3,1)',
                    boxShadow: predicted ? `0 0 8px ${color}55` : 'none',
                  }}/>
                </div>
                {/* 50% threshold marker */}
                <div style={{ position:'relative', height:'6px' }}>
                  <div style={{
                    position:'absolute', left:'50%', top:0,
                    width:'1px', height:'6px',
                    background:'rgba(255,176,32,0.35)',
                  }}/>
                </div>
              </div>
            );
          })}
        </div>
        {/* Threshold annotation */}
        <p style={{ fontSize:'10px', color:'var(--text-muted)', marginTop:'4px', textAlign:'center', fontFamily:'var(--mono)' }}>
          ▲ 50% decision boundary
        </p>
      </div>

      {/* Disclaimer */}
      <div style={{
        padding:'10px 14px', borderRadius:'var(--r-md)',
        background:'rgba(255,176,32,0.06)', border:'1px solid rgba(255,176,32,0.22)',
        display:'flex', gap:'10px', alignItems:'flex-start',
      }}>
        <span style={{ color:'var(--amber)', fontSize:'14px', flexShrink:0, marginTop:'1px' }}>⚠</span>
        <p style={{ fontSize:'11px', color:'var(--text-secondary)', lineHeight:1.65 }}>
          For <strong style={{ color:'var(--amber)' }}>research and educational purposes only</strong>.
          This output does not constitute medical advice. Always consult a qualified cardiologist.
        </p>
      </div>
    </div>
  );
}
