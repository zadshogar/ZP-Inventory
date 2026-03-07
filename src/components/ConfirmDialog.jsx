import { C } from '../constants.js';

export default function ConfirmDialog({ title, message, confirmLabel='Confirm', danger=false, onConfirm, onCancel }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.88)', zIndex:1000,
      display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
      onClick={e => e.target===e.currentTarget && onCancel?.()}>
      <div style={{ background:C.surface, border:`1px solid ${C.border}`,
        borderTop:`3px solid ${danger ? C.red : C.accent}`, borderRadius:16, padding:24,
        maxWidth:340, width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,.6)' }}>
        {title && <div style={{ fontSize:16, fontWeight:800, marginBottom:8, color:C.text }}>{title}</div>}
        <div style={{ fontSize:14, color:C.muted, lineHeight:1.6, marginBottom:20 }}>{message}</div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onCancel} style={{ flex:1, padding:12, background:C.surface2,
            border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontWeight:700,
            fontSize:14, cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex:1, padding:12, background:danger ? C.red : C.accent,
            border:'none', borderRadius:10, color:danger ? '#fff' : '#000', fontWeight:800,
            fontSize:14, cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
