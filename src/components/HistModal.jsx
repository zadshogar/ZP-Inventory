import { C } from '../constants.js';
import { BottomSheet, CloseButton, ModalHeader, EmptyState } from './ui.jsx';

export default function HistModal({ part, txns, onClose }) {
  const partTxns = txns.filter(t=>t.partId===part.id).sort((a,b)=>b.date.localeCompare(a.date));
  return (
    <BottomSheet onBackdropClick={onClose}>
      <CloseButton onClick={onClose} />
      <ModalHeader title={part.name}
        subtitle={`${part.sku?part.sku+' · ':''}${partTxns.length} transaction${partTxns.length!==1?'s':''}`} />
      {partTxns.length===0 ? <EmptyState icon="📋">No transactions recorded yet.</EmptyState>
        : partTxns.map(t => {
          const isAdd = t.type==='add';
          return (
            <div key={t.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom:`1px solid ${C.border}` }}>
              <div style={{ width:30, height:30, borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:14, flexShrink:0, background:isAdd?'rgba(61,224,138,.14)':'rgba(224,58,58,.14)' }}>{isAdd?'↑':'↓'}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {t.reason||(isAdd?'Stock added':'Stock removed')}</div>
                <div style={{ fontFamily:'monospace', fontSize:10, color:C.muted }}>{t.date}</div>
              </div>
              <div style={{ fontFamily:'monospace', fontWeight:500, fontSize:14, color:isAdd?C.green:C.red }}>
                {isAdd?'+':'-'}{t.qty}</div>
            </div>
          );
        })}
    </BottomSheet>
  );
}
