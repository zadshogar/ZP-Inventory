import { useState } from 'react';
import { C } from '../constants.js';
import { today } from '../utils.js';
import { Input, Field, ErrorBanner, BottomSheet, CloseButton, ModalHeader } from './ui.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';

export default function TxModal({ part, type, onClose, onConfirm }) {
  const [qty, setQty]       = useState('');
  const [date, setDate]     = useState(today());
  const [reason, setReason] = useState('');
  const [err, setErr]       = useState(null);
  const [overQty, setOverQty] = useState(false);
  const isRemove = type === 'remove';

  function submit() {
    const q = parseInt(qty, 10);
    if (!q || q <= 0) { setErr('Please enter a quantity greater than 0.'); return; }
    if (!date)        { setErr('Date is required.'); return; }
    if (isRemove && q > part.qty) { setOverQty(true); return; }
    onConfirm({ qty:q, date, reason });
  }

  return (
    <BottomSheet onBackdropClick={onClose}>
      <CloseButton onClick={onClose} />
      <ModalHeader title={isRemove ? '− Remove Stock' : '+ Add Stock'}
        subtitle={`${part.name} · Current: ${part.qty} ${part.unit||'pcs'}`} />
      <ErrorBanner message={err} />
      <Field label="Quantity *"><Input type="number" min="1" placeholder="Enter quantity"
        value={qty} onChange={e=>{setQty(e.target.value);setErr(null);}} autoFocus /></Field>
      <Field label="Date *"><Input type="date" value={date} onChange={e=>setDate(e.target.value)} /></Field>
      <Field label="Work Order / Reference"><Input type="text" placeholder="e.g. WO-2026-041"
        value={reason} onChange={e=>setReason(e.target.value)} /></Field>
      <button onClick={submit} style={{ width:'100%', padding:13, background:isRemove?C.red:C.accent,
        color:isRemove?'#fff':'#000', border:'none', borderRadius:10, fontWeight:800,
        fontSize:14, cursor:'pointer', marginTop:4, fontFamily:'system-ui,sans-serif' }}>Confirm</button>
      {overQty && <ConfirmDialog title="Not enough stock"
        message={`Only ${part.qty} ${part.unit||'pcs'} in stock. Remove all ${part.qty}?`}
        confirmLabel={`Remove all ${part.qty}`} danger
        onConfirm={()=>{ setOverQty(false); onConfirm({ qty:part.qty, date, reason }); }}
        onCancel={()=>setOverQty(false)} />}
    </BottomSheet>
  );
}
