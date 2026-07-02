import { useState } from 'react';
import { C } from '../constants.js';
import { Input, Field, ErrorBanner, BottomSheet, CloseButton, ModalHeader } from './ui.jsx';

export default function EditPartModal({ part, categories, onClose, onSave }) {
  const [name,          setName]          = useState(part.name);
  const [sku,           setSku]           = useState(part.sku || '');
  const [notes,         setNotes]         = useState(part.notes || '');
  const [lowLevel,      setLowLevel]      = useState(String(part.lowLevel || 10));
  const [criticalLevel, setCriticalLevel] = useState(String(part.criticalLevel || 5));
  const [categoryId,    setCategoryId]    = useState(part.categoryId || '');
  const [err,           setErr]           = useState(null);

  function handleSave() {
    if (!name.trim()) { setErr('Part Name is required.'); return; }
    onSave({
      ...part,
      name:          name.trim(),
      sku:           sku.trim(),
      notes:         notes.trim(),
      lowLevel:      parseInt(lowLevel,  10) || 10,
      criticalLevel: parseInt(criticalLevel, 10) || 5,
      categoryId:    categoryId || null,
    });
    onClose();
  }

  return (
    <BottomSheet onBackdropClick={onClose}>
      <CloseButton onClick={onClose} />
      <ModalHeader title="Edit Part" subtitle={part.name} />
      <ErrorBanner message={err} />

      <Field label="Part Name *">
        <Input value={name} onChange={e=>{setName(e.target.value);setErr(null);}} placeholder="Part name" />
      </Field>
      <Field label="Part Number / SKU">
        <Input value={sku} onChange={e=>setSku(e.target.value)} placeholder="e.g. ZP-BOLT-M6-001" />
      </Field>
      <Field label="Category">
        <select value={categoryId} onChange={e=>setCategoryId(e.target.value)}
          style={{ width:'100%', padding:'10px 12px', background:C.surface2, border:`1px solid ${C.border}`,
            borderRadius:8, color: categoryId ? C.text : C.muted, fontSize:14, outline:'none',
            boxSizing:'border-box', fontFamily:'system-ui,sans-serif' }}>
          <option value="">— Uncategorized —</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </Field>
      <div style={{ display:'flex', gap:9 }}>
        <Field label="Low Alert At" style={{ flex:1 }}>
          <Input type="number" min="0" value={lowLevel} onChange={e=>setLowLevel(e.target.value)} placeholder="10" />
        </Field>
        <Field label="Critical At" style={{ flex:1 }}>
          <Input type="number" min="0" value={criticalLevel} onChange={e=>setCriticalLevel(e.target.value)} placeholder="5" />
        </Field>
      </div>
      <Field label="Notes">
        <Input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Optional notes" />
      </Field>

      <button onClick={handleSave}
        style={{ width:'100%', padding:13, background:C.accent, color:'#000', border:'none',
          borderRadius:10, fontWeight:800, fontSize:14, cursor:'pointer', marginTop:4,
          fontFamily:'system-ui,sans-serif' }}>
        Save Changes
      </button>
    </BottomSheet>
  );
}
