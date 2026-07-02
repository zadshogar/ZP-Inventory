import { useState, useEffect } from 'react';
import { C } from './constants.js';
import { uid, getStatus } from './utils.js';
import { supabase } from './supabase.js';
import PartCard       from './components/PartCard.jsx';
import TxModal        from './components/TxModal.jsx';
import HistModal      from './components/HistModal.jsx';
import NewPartView    from './components/NewPartView.jsx';
import ConfirmDialog  from './components/ConfirmDialog.jsx';
import CategoryView   from './components/CategoryView.jsx';
import EditPartModal  from './components/EditPartModal.jsx';
import { EmptyState, SectionTitle } from './components/ui.jsx';

const TABS = [
  { id:'inventory', label:'📦 Parts'   },
  { id:'log',       label:'📋 Log'     },
  { id:'alerts',    label:'⚠️ Alerts'  },
  { id:'addpart',   label:'➕ New Part' },
];

export default function App() {
  const [parts,        setParts]        = useState([]);
  const [txns,         setTxns]         = useState([]);
  const [categories,   setCategories]   = useState([]);
  const [tab,          setTab]          = useState('inventory');
  const [search,       setSearch]       = useState('');
  const [loading,      setLoading]      = useState(true);
  const [txModal,      setTxModal]      = useState(null);
  const [histModal,    setHistModal]    = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editPart,     setEditPart]     = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [{ data: partsData }, { data: txnsData }, { data: catsData }] = await Promise.all([
        supabase.from('parts').select('*').order('position', { ascending: true }),
        supabase.from('transactions').select('*').order('date', { ascending: false }),
        supabase.from('categories').select('*').order('position', { ascending: true }),
      ]);
      setParts((partsData || []).map(dbToPart));
      setTxns((txnsData  || []).map(dbToTxn));
      setCategories(catsData || []);
      setLoading(false);
    }
    loadData();
  }, []);

  function dbToPart(row) {
    return {
      id:            row.id,
      name:          row.name,
      sku:           row.sku            || '',
      qty:           row.qty            || 0,
      unit:          row.unit           || 'pcs',
      lowLevel:      row.low_level      || 10,
      criticalLevel: row.critical_level || 5,
      location:      row.location       || '',
      notes:         row.notes          || '',
      addedDate:     row.added_date     || '',
      categoryId:    row.category_id    || null,
      position:      row.position       || 0,
    };
  }

  function dbToTxn(row) {
    return {
      id:       row.id,
      partId:   row.part_id,
      partName: row.part_name,
      type:     row.type,
      qty:      row.qty,
      date:     row.date,
      reason:   row.reason || '',
    };
  }

  function txnToDb(txn) {
    return {
      id:        txn.id,
      part_id:   txn.partId,
      part_name: txn.partName,
      type:      txn.type,
      qty:       txn.qty,
      date:      txn.date,
      reason:    txn.reason,
    };
  }

  async function handleTxConfirm({ qty, date, reason }) {
    const { part, type } = txModal;
    const delta  = type === 'add' ? qty : -qty;
    const newQty = Math.max(0, part.qty + delta);
    const newTxn = { id:uid(), partId:part.id, partName:part.name, type, qty, date, reason };
    setParts(ps => ps.map(p => p.id===part.id ? {...p, qty:newQty} : p));
    setTxns(ts => [newTxn, ...ts]);
    setTxModal(null);
    await Promise.all([
      supabase.from('parts').update({ qty: newQty }).eq('id', part.id),
      supabase.from('transactions').insert(txnToDb(newTxn)),
    ]);
  }

  async function handleAddPart(data) {
    const id      = uid();
    const newPart = { id, ...data, position: parts.length };
    const newTxn  = data.qty > 0
      ? { id:uid(), partId:id, partName:data.name, type:'add', qty:data.qty, date:data.addedDate, reason:'Initial stock' }
      : null;
    setParts(ps => [newPart, ...ps]);
    if (newTxn) setTxns(ts => [newTxn, ...ts]);
    setTab('inventory');
    await supabase.from('parts').insert({
      id:             newPart.id,
      name:           newPart.name,
      sku:            newPart.sku,
      qty:            newPart.qty,
      unit:           newPart.unit,
      low_level:      newPart.lowLevel,
      critical_level: newPart.criticalLevel,
      location:       newPart.location,
      notes:          newPart.notes,
      added_date:     newPart.addedDate,
      category_id:    newPart.categoryId || null,
      position:       newPart.position   || 0,
    });
    if (newTxn) await supabase.from('transactions').insert(txnToDb(newTxn));
  }

  async function handleEditPart(updated) {
    setParts(ps => ps.map(p => p.id === updated.id ? updated : p));
    await supabase.from('parts').update({
      name:           updated.name,
      sku:            updated.sku,
      notes:          updated.notes,
      low_level:      updated.lowLevel,
      critical_level: updated.criticalLevel,
      category_id:    updated.categoryId || null,
    }).eq('id', updated.id);
  }

  async function confirmDelete() {
    const id = deleteTarget.id;
    setParts(ps => ps.filter(p => p.id !== id));
    setTxns(ts => ts.filter(t => t.partId !== id));
    setDeleteTarget(null);
    await supabase.from('parts').delete().eq('id', id);
  }

  async function handleAddCategory(cat) {
    setCategories(cs => [...cs, cat]);
    await supabase.from('categories').insert(cat);
  }

  async function handleDeleteCategory(catId) {
    setCategories(cs => cs.filter(c => c.id !== catId));
    setParts(ps => ps.map(p => p.categoryId === catId ? {...p, categoryId: null} : p));
    await supabase.from('categories').delete().eq('id', catId);
    await supabase.from('parts').update({ category_id: null }).eq('category_id', catId);
  }

  async function handleRenameCategory(catId, newName) {
    setCategories(cs => cs.map(c => c.id === catId ? {...c, name: newName} : c));
    await supabase.from('categories').update({ name: newName }).eq('id', catId);
  }

  async function handleReorderCategories(reordered) {
    setCategories(reordered);
    await Promise.all(reordered.map(c =>
      supabase.from('categories').update({ position: c.position }).eq('id', c.id)
    ));
  }

  async function handleReorderParts(reorderedParts) {
    setParts(ps => {
      const ids = new Set(reorderedParts.map(p => p.id));
      return [...ps.filter(p => !ids.has(p.id)), ...reorderedParts];
    });
    await Promise.all(reorderedParts.map(p =>
      supabase.from('parts').update({ position: p.position }).eq('id', p.id)
    ));
  }

  const q             = search.toLowerCase().trim();
  const filtered      = parts.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.sku      || '').toLowerCase().includes(q) ||
    (p.location || '').toLowerCase().includes(q)
  );
  const lowParts      = parts.filter(p => getStatus(p) === 'low');
  const criticalParts = parts.filter(p => getStatus(p) === 'critical');
  const alertParts    = [
    ...criticalParts.map(p => ({...p, _st:'critical'})),
    ...lowParts.map(p      => ({...p, _st:'low'})),
  ];
  const totalUnits = parts.reduce((s, p) => s + p.qty, 0);
  const sortedTxns = [...txns].sort((a,b) =>
    b.date.localeCompare(a.date) || b.id.localeCompare(a.id)
  );

  if (loading) {
    return (
      <div style={{ background:C.bg, minHeight:'100vh', display:'flex', alignItems:'center',
        justifyContent:'center', flexDirection:'column', gap:16, color:C.muted,
        fontFamily:'system-ui,sans-serif' }}>
        <div style={{ fontSize:32 }}>📦</div>
        <div style={{ fontSize:14 }}>Loading inventory…</div>
      </div>
    );
  }

  return (
    <div style={{ background:C.bg, minHeight:'100vh', color:C.text,
      fontFamily:'system-ui,sans-serif', fontSize:15, paddingBottom:60 }}>

      <div style={{ background:C.surface, borderBottom:`2px solid ${C.accent}`,
        padding:'12px 16px', display:'flex', alignItems:'center',
        justifyContent:'space-between', position:'sticky', top:0, zIndex:100 }}>
        <div>
          <div style={{ fontSize:17, fontWeight:800 }}>
            Zadik <span style={{color:C.accent}}>Precision</span>
          </div>
          <div style={{ fontSize:9, letterSpacing:2, textTransform:'uppercase',
            color:C.muted, marginTop:1 }}>LLC — Inventory Control</div>
        </div>
        <div style={{ fontFamily:'monospace', fontSize:11, color:C.muted, textAlign:'right' }}>
          <div><b style={{color:C.accent}}>{parts.length}</b> parts</div>
          <div><b style={{color:C.accent}}>{txns.length}</b> transactions</div>
        </div>
      </div>

      <div style={{ display:'flex', background:C.surface, borderBottom:`1px solid ${C.border}`,
        overflowX:'auto', position:'sticky', top:57, zIndex:99 }}>
        {TABS.map(t => (
          <div key={t.id} onClick={()=>setTab(t.id)}
            style={{ flex:1, padding:'11px 8px', textAlign:'center', fontSize:11,
              fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', userSelect:'none',
              color: tab===t.id ? C.accent : C.muted,
              borderBottom: tab===t.id ? `2px solid ${C.accent}` : '2px solid transparent' }}>
            {t.label}
          </div>
        ))}
      </div>

      {tab==='inventory' && (
        <div>
          <div style={{ padding:'14px 14px 0' }}>
            <div style={{position:'relative', marginBottom:12}}>
              <span style={{position:'absolute', left:11, top:'50%',
                transform:'translateY(-50%)', color:C.muted, pointerEvents:'none'}}>🔍</span>
              <input
                style={{width:'100%', padding:'10px 12px 10px 34px', background:C.surface2,
                  border:`1px solid ${C.border}`, borderRadius:8, color:C.text,
                  fontSize:14, outline:'none', boxSizing:'border-box'}}
                placeholder="Search by name, part #, or location…"
                value={search}
                onChange={e=>setSearch(e.target.value)}
              />
            </div>
          </div>
          {search.trim() ? (
            <div style={{padding:'0 14px'}}>
              {filtered.length===0
                ? <EmptyState icon="📦">No results.</EmptyState>
                : filtered.map(p => (
                    <PartCard key={p.id} part={p}
                      onAdd={p=>setTxModal({part:p,type:'add'})}
                      onRemove={p=>setTxModal({part:p,type:'remove'})}
                      onHistory={p=>setHistModal(p)}
                      onDelete={p=>setDeleteTarget(p)}
                      onEdit={p=>setEditPart(p)} />
                  ))
              }
            </div>
          ) : (
            <CategoryView
              categories={categories}
              parts={parts}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
              onRenameCategory={handleRenameCategory}
              onReorderCategories={handleReorderCategories}
              onReorderParts={handleReorderParts}
              onAdd={p=>setTxModal({part:p,type:'add'})}
              onRemove={p=>setTxModal({part:p,type:'remove'})}
              onHistory={p=>setHistModal(p)}
              onDelete={p=>setDeleteTarget(p)}
              onEdit={p=>setEditPart(p)}
            />
          )}
        </div>
      )}

      {tab==='log' && (
        <div style={{padding:14}}>
          <SectionTitle>Transaction Log</SectionTitle>
          {sortedTxns.length===0
            ? <EmptyState icon="📋">No transactions yet.</EmptyState>
            : sortedTxns.map(t => {
                const isAdd = t.type==='add';
                return (
                  <div key={t.id} style={{display:'flex', alignItems:'center', gap:10,
                    padding:'9px 0', borderBottom:`1px solid ${C.border}`}}>
                    <div style={{width:30, height:30, borderRadius:7, display:'flex',
                      alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0,
                      background:isAdd?'rgba(61,224,138,.14)':'rgba(224,58,58,.14)'}}>
                      {isAdd?'↑':'↓'}
                    </div>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontSize:13, fontWeight:600, overflow:'hidden',
                        textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{t.partName}</div>
                      <div style={{fontFamily:'monospace', fontSize:10, color:C.muted}}>
                        {t.date}{t.reason?' · '+t.reason:''}
                      </div>
                    </div>
                    <div style={{fontFamily:'monospace', fontWeight:500, fontSize:14,
                      color:isAdd?C.green:C.red}}>{isAdd?'+':'-'}{t.qty}</div>
                  </div>
                );
              })
          }
        </div>
      )}

      {tab==='alerts' && (
        <div style={{padding:14}}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14}}>
            {[
              {val:parts.length,        lbl:'TOTAL PARTS', c:C.text},
              {val:totalUnits,           lbl:'TOTAL UNITS', c:C.text},
              {val:lowParts.length,      lbl:'LOW STOCK',   c:C.accent},
              {val:criticalParts.length, lbl:'CRITICAL',    c:C.red},
            ].map(({val,lbl,c}) => (
              <div key={lbl} style={{background:C.surface, border:`1px solid ${C.border}`,
                borderRadius:12, padding:12, textAlign:'center'}}>
                <div style={{fontFamily:'monospace', fontSize:24, fontWeight:500, color:c}}>{val}</div>
                <div style={{fontSize:10, color:C.muted, marginTop:2, letterSpacing:0.5}}>{lbl}</div>
              </div>
            ))}
          </div>
          <SectionTitle>Stock Alerts</SectionTitle>
          {alertParts.length===0
            ? <EmptyState icon="✅">All stock levels are healthy.</EmptyState>
            : alertParts.map(p => (
                <div key={p.id} style={{display:'flex', alignItems:'center', gap:9,
                  padding:'9px 12px', marginBottom:7, borderRadius:8,
                  background:p._st==='critical'?'rgba(224,58,58,.07)':'rgba(232,160,32,.07)',
                  border:p._st==='critical'?'1px solid rgba(224,58,58,.2)':'1px solid rgba(232,160,32,.2)'}}>
                  <span>{p._st==='critical'?'🔴':'🟡'}</span>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700, fontSize:13}}>{p.name}</div>
                    <div style={{fontSize:11, color:C.muted, marginTop:1}}>
                      {p.qty} {p.unit||'pcs'} · {p._st==='critical'?'CRITICAL':'LOW STOCK'}
                    </div>
                  </div>
                  <button onClick={()=>setTxModal({part:p,type:'add'})}
                    style={{padding:'6px 10px', background:'rgba(61,224,138,.13)', color:C.green,
                      border:`1px solid rgba(61,224,138,.28)`, borderRadius:8, fontWeight:700,
                      fontSize:11, cursor:'pointer', fontFamily:'system-ui,sans-serif'}}>
                    Restock
                  </button>
                </div>
              ))
          }
        </div>
      )}

      {tab==='addpart' && <NewPartView onAdd={handleAddPart} categories={categories} />}

      {txModal   && <TxModal       part={txModal.part}  type={txModal.type} onClose={()=>setTxModal(null)}   onConfirm={handleTxConfirm} />}
      {histModal && <HistModal     part={histModal}      txns={txns}         onClose={()=>setHistModal(null)} />}
      {editPart  && <EditPartModal part={editPart}       categories={categories} onClose={()=>setEditPart(null)} onSave={handleEditPart} />}

      {deleteTarget && (
        <ConfirmDialog
          title={`Delete "${deleteTarget.name}"?`}
          message="This will permanently remove the part and all its transaction history. This cannot be undone."
          confirmLabel="Yes, Delete"
          danger
          onConfirm={confirmDelete}
          onCancel={()=>setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
