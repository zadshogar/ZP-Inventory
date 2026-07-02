import { C } from '../constants.js';
import { getStatus } from '../utils.js';

const STATUS_COLORS = {
  ok:       { bg:'rgba(61,224,138,.1)',  color:C.green  },
  low:      { bg:'rgba(232,160,32,.12)', color:C.accent },
  critical: { bg:'rgba(224,58,58,.12)',  color:C.red    },
};
const BAR_COLORS = { ok:C.green, low:C.accent, critical:C.red };

export default function PartCard({ part, onAdd, onRemove, onHistory, onDelete, onEdit }) {
  const status = getStatus(part);
  const max = Math.max(part.qty, (part.lowLevel||0)*2, 100);
  const pct = Math.min(100, Math.round((part.qty/max)*100));
  const sub = [part.sku, part.location].filter(Boolean).join(' · ');
  const btn = { padding:9, border:'none', borderRadius:8, fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'system-ui,sans-serif' };

  return (
    <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:14, marginBottom:10 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
        <div style={{ flex:1, minWidth:0, paddingRight:10 }}>
          <div style={{ fontSize:15, fontWeight:700 }}>{part.name}</div>
          {sub && <div style={{ fontFamily:'monospace', fontSize:10, color:C.muted, marginTop:2 }}>{sub}</div>}
        </div>
        <div style={{ textAlign:'center', flexShrink:0 }}>
          <div style={{ fontFamily:'monospace', fontWeight:500, fontSize:21, padding:'5px 10px',
            borderRadius:8, background:STATUS_COLORS[status].bg, color:STATUS_COLORS[status].color, minWidth:54, textAlign:'center' }}>
            {part.qty}
          </div>
          <div style={{ fontSize:9, color:C.muted, marginTop:2 }}>{part.unit||'pcs'}</div>
        </div>
      </div>
      <div style={{ height:3, background:C.border, borderRadius:2, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, background:BAR_COLORS[status], borderRadius:2, transition:'width .4s' }} />
      </div>
      <div style={{ display:'flex', gap:7, marginTop:10 }}>
        <button style={{ ...btn, flex:1, background:'rgba(224,58,58,.13)', color:C.red,   border:`1px solid rgba(224,58,58,.28)` }} onClick={()=>onRemove(part)}>− Remove</button>
        <button style={{ ...btn, flex:1, background:'rgba(61,224,138,.13)', color:C.green, border:`1px solid rgba(61,224,138,.28)` }} onClick={()=>onAdd(part)}>+ Add</button>
        <button style={{ ...btn, flex:1, background:`rgba(232,160,32,.13)`, color:C.accent, border:`1px solid rgba(232,160,32,.28)` }} onClick={()=>onEdit(part)}>Edit</button>
        <button style={{ ...btn, flex:1, background:C.surface2, color:C.muted, border:`1px solid ${C.border}` }} onClick={()=>onHistory(part)}>📋</button>
        <button style={{ ...btn, flex:'none', width:36, background:'rgba(224,58,58,.1)', color:C.red, border:`1px solid rgba(224,58,58,.3)` }} onClick={()=>onDelete(part)}>🗑</button>
      </div>
    </div>
  );
}
