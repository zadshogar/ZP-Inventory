import { C } from '../constants.js';

export function Input({ style={}, ...props }) {
  return <input {...props} style={{ width:'100%', padding:'10px 12px', background:C.surface2,
    border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:14, outline:'none',
    boxSizing:'border-box', fontFamily:'system-ui,sans-serif', ...style }} />;
}
export function Label({ children }) {
  return <label style={{ display:'block', fontSize:11, fontWeight:700, color:C.muted,
    marginBottom:4, letterSpacing:0.8, textTransform:'uppercase' }}>{children}</label>;
}
export function Field({ label, children, style={} }) {
  return <div style={{ marginBottom:12, ...style }}><Label>{label}</Label>{children}</div>;
}
export function ErrorBanner({ message }) {
  if (!message) return null;
  return <div style={{ background:'rgba(224,58,58,.12)', border:'1px solid rgba(224,58,58,.3)',
    borderRadius:8, padding:'8px 12px', fontSize:13, color:C.red, marginBottom:12 }}>{message}</div>;
}
export function BottomSheet({ onBackdropClick, children }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.8)', zIndex:300,
      display:'flex', alignItems:'flex-end' }}
      onClick={e => e.target===e.currentTarget && onBackdropClick?.()}>
      <div style={{ background:C.surface, border:`1px solid ${C.border}`,
        borderTop:`2px solid ${C.accent}`, borderRadius:'20px 20px 0 0',
        padding:18, width:'100%', maxHeight:'85vh', overflowY:'auto', position:'relative' }}>
        {children}
      </div>
    </div>
  );
}
export function CloseButton({ onClick }) {
  return <button onClick={onClick} style={{ position:'absolute', top:14, right:14,
    background:C.surface2, border:`1px solid ${C.border}`, borderRadius:'50%', width:30, height:30,
    color:C.muted, cursor:'pointer', fontSize:14, display:'flex', alignItems:'center',
    justifyContent:'center' }}>✕</button>;
}
export function ModalHeader({ title, subtitle }) {
  return (<>
    <div style={{ fontSize:16, fontWeight:800, marginBottom:3 }}>{title}</div>
    {subtitle && <div style={{ fontSize:12, color:C.muted, marginBottom:16 }}>{subtitle}</div>}
  </>);
}
export function EmptyState({ icon, children }) {
  return <div style={{ textAlign:'center', padding:'36px 20px', color:C.muted, fontSize:14 }}>
    <div style={{ fontSize:32, marginBottom:8 }}>{icon}</div>{children}</div>;
}
export function SectionTitle({ children }) {
  return <div style={{ fontSize:10, fontWeight:800, letterSpacing:2,
    textTransform:'uppercase', color:C.muted, marginBottom:8 }}>{children}</div>;
}
