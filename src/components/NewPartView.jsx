import { useState } from 'react';
import { C } from '../constants.js';
import { today } from '../utils.js';
import { Input, Field, ErrorBanner } from './ui.jsx';

export default function NewPartView({ onAdd }) {
  const blank = { name:'', sku:'', qty:'', unit:'', lowLevel:'', criticalLevel:'', location:'', notes:'', addedDate:today() };
  const [f, setF] = useState(blank);
  const [err, setErr] = useState(null);
  const set = k => e => setF(p=>({...p,[k]:e.target.value}));

  function handleAdd() {
    if (!f.name.trim()) { setErr('Part Name is required.'); return; }
    onAdd({ ...f, qty:parseInt(f.qty,10)||0, lowLevel:parseInt(f.lowLevel,10)||10,
      criticalLevel:parseInt(f.criticalLevel,10)||5, unit:f.unit||'pcs', addedDate:f.addedDate||today() });
    setF(blank); setErr(null);
  }

  return (
    <div style={{ padding:14 }}>
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:14 }}>
        <div style={{ fontSize:16, fontWeight:800, marginBottom:3 }}>Register New Part</div>
        <div style={{ fontSize:12, color:C.muted, marginBottom:16 }}>Add a component to Zadik Precision inventory</div>
        <ErrorBanner message={err} />
        <Field label="Part Name *"><Input placeholder="e.g. M6 Hex Bolt SS" value={f.name} onChange={set('name')} /></Field>
        <Field label="Part Number / SKU"><Input placeholder="e.g. ZP-BOLT-M6-001" value={f.sku} onChange={set('sku')} /></Field>
        <div style={{ display:'flex', gap:9 }}>
          <Field label="Initial Qty *" style={{ flex:1 }}><Input type="number" min="0" placeholder="0" value={f.qty} onChange={set('qty')} /></Field>
          <Field label="Unit" style={{ flex:1 }}><Input placeholder="pcs / kg / m" value={f.unit} onChange={set('unit')} /></Field>
        </div>
        <div style={{ display:'flex', gap:9 }}>
          <Field label="Low Alert At" style={{ flex:1 }}><Input type="number" min="0" placeholder="10" value={f.lowLevel} onChange={set('lowLevel')} /></Field>
          <Field label="Critical At" style={{ flex:1 }}><Input type="number" min="0" placeholder="5" value={f.criticalLevel} onChange={set('criticalLevel')} /></Field>
        </div>
        <Field label="Location / Bin"><Input placeholder="e.g. Shelf A3 / Bin 12" value={f.location} onChange={set('location')} /></Field>
        <Field label="Date Added"><Input type="date" value={f.addedDate} onChange={set('addedDate')} /></Field>
        <Field label="Notes"><Input placeholder="Optional" value={f.notes} onChange={set('notes')} /></Field>
        <button onClick={handleAdd} style={{ width:'100%', padding:13, background:C.accent, color:'#000', border:'none',
          borderRadius:10, fontWeight:800, fontSize:14, cursor:'pointer', marginTop:4, fontFamily:'system-ui,sans-serif' }}>
          ✚ Register Part
        </button>
      </div>
    </div>
  );
}
