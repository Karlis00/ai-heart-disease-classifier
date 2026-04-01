import React, { useRef, useEffect, useState } from 'react';

/* One colour per lead, neon palette */
const COLORS = [
  '#00D4FF','#00E5CC','#00F099','#4ADE80',
  '#86EFAC','#FCD34D','#FB923C','#F87171',
  '#E879F9','#A78BFA','#60A5FA','#34D399',
];

function LeadCanvas({ lead, index, height = 88 }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !lead?.data?.length) return;

    const W   = canvas.offsetWidth || 400;
    const H   = height;
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    /* Background */
    ctx.fillStyle = '#060F1C';
    ctx.fillRect(0, 0, W, H);

    /* ECG paper grid – minor */
    const minor = 16;
    ctx.strokeStyle = 'rgba(26,46,74,0.9)';
    ctx.lineWidth   = 0.5;
    for (let x = 0; x < W; x += minor) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = 0; y < H; y += minor) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    /* Major grid (5× minor) */
    ctx.strokeStyle = 'rgba(30,92,155,0.55)';
    ctx.lineWidth   = 0.8;
    for (let x = 0; x < W; x += minor * 5) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = 0; y < H; y += minor * 5) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    /* Dashed baseline */
    ctx.strokeStyle = 'rgba(0,212,255,0.13)';
    ctx.lineWidth   = 1;
    ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.moveTo(0, H/2); ctx.lineTo(W, H/2); ctx.stroke();
    ctx.setLineDash([]);

    /* Waveform */
    const data    = lead.data;
    const min     = Math.min(...data);
    const max     = Math.max(...data);
    const range   = (max - min) || 1;
    const pad     = H * 0.13;
    const color   = COLORS[index % COLORS.length];

    ctx.strokeStyle = color;
    ctx.lineWidth   = 1.6;
    ctx.shadowColor = color;
    ctx.shadowBlur  = 5;
    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const x = (i / (data.length - 1)) * W;
      const y = pad + ((max - data[i]) / range) * (H - pad * 2);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [lead, height, index]);

  return (
    <div style={{ position:'relative', borderRadius:'var(--r-sm)', overflow:'hidden', border:'1px solid var(--border)' }}>
      {/* Lead label overlay */}
      <span style={{
        position:'absolute', top:'5px', left:'7px', zIndex:1,
        fontFamily:'var(--mono)', fontSize:'10px', fontWeight:700,
        color: COLORS[index % COLORS.length],
        background:'rgba(6,15,28,0.82)', padding:'1px 5px', borderRadius:'3px',
        letterSpacing:'0.06em',
      }}>{lead.name}</span>
      <canvas ref={ref} style={{ display:'block', width:'100%', height:`${height}px` }} />
    </div>
  );
}

export function ECGDisplay({ ecgData }) {
  const [expanded, setExpanded] = useState(null);
  if (!ecgData) return null;
  const { leads, fs, duration } = ecgData;

  const rhythmLead = leads.find(l => l.name === 'II') || leads[1];

  return (
    <div className="fade-up" style={{ display:'flex', flexDirection:'column', gap:'14px' }}>

      {/* Header row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'8px' }}>
        <div>
          <h2 style={{ fontSize:'14px', color:'var(--text-primary)' }}>12-LEAD ECG VIEWER</h2>
          <p style={{ fontSize:'11px', color:'var(--text-secondary)', marginTop:'2px' }}>
            {fs} Hz &nbsp;·&nbsp; {duration.toFixed(1)} s &nbsp;·&nbsp; {leads.length} leads &nbsp;·&nbsp;
            <span style={{ color:'var(--text-muted)' }}>click a lead to enlarge</span>
          </p>
        </div>
        {/* Live indicator */}
        <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
          <div style={{ position:'relative', width:'8px', height:'8px' }}>
            <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'var(--green)', animation:'pulse-ring 1.6s infinite' }}/>
            <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'var(--green)' }}/>
          </div>
          <span style={{ fontSize:'10px', fontFamily:'var(--mono)', color:'var(--green)' }}>SIGNAL OK</span>
        </div>
      </div>

      {/* 2-column grid of 12 leads */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px' }}>
        {leads.slice(0, 12).map((lead, i) => (
          <div key={lead.name} onClick={() => setExpanded(expanded === i ? null : i)}
            style={{ cursor:'pointer' }}>
            <LeadCanvas lead={lead} index={i} height={expanded === i ? 160 : 88} />
          </div>
        ))}
      </div>

      {/* Rhythm strip */}
      {rhythmLead && (
        <div>
          <p style={{ fontSize:'10px', fontFamily:'var(--mono)', color:'var(--text-muted)', marginBottom:'5px' }}>
            RHYTHM STRIP — {rhythmLead.name}
          </p>
          <LeadCanvas lead={rhythmLead} index={1} height={72} />
        </div>
      )}
    </div>
  );
}
