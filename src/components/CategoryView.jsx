import { useState, useRef } from 'react';
import { C } from '../constants.js';
import { uid } from '../utils.js';
import PartCard from './PartCard.jsx';
import { EmptyState } from './ui.jsx';

export default function CategoryView({
  categories, parts, onAddCategory, onDeleteCategory, onRenameCategory,
  onReorderCategories, onReorderParts, onAdd, onRemove, onHistory, onDelete, onEdit
}) {
  const [newCatName,  setNewCatName]  = useState('');
  const [showNewCat,  setShowNewCat]  = useState(false);
  const [collapsed,   setCollapsed]   = useState({});
  const [editCat,     setEditCat]     = useState(null);
  const [editCatName, setEditCatName] = useState('');
  const [dragCat,     setDragCat]     = useState(null);
  const [dragPart,    setDragPart]    = useState(null);
  const [overCat,     setOverCat]     = useState(null);
  const [overPart,    setOverPart]    = useState(null);
  const longPressTimer                = useRef(null);

  function toggleCollapse(id) {
    setCollapsed(c => ({ ...c, [id]: !c[id] }));
  }
  function isOpen(id) { return collapsed[id] === true; }

  function handleAddCategory() {
    if (!newCatName.trim()) return;
    onAddCategory({ id: uid(), name: newCatName.trim(), position: categories.length });
    setNewCatName('');
    setShowNewCat(false);
  }

  function startEditCat(e, cat) {
    e.stopPropagation();
    setEditCat(cat);
    setEditCatName(cat.name);
  }

  function saveEditCat() {
    if (editCatName.trim()) onRenameCategory(editCat.id, editCatName.trim());
    setEditCat(null);
    setEditCatName('');
  }

  function cancelEditCat() {
    setEditCat(null);
    setEditCatName('');
  }

  function onCatDragStart(e, cat) { setDragCat(cat); e.dataTransfer.effectAllowed = 'move'; }
  function onCatDragOver(e, cat) {
    e.preventDefault(); setOverCat(cat.id);
    if (!dragCat || dragCat.id === cat.id) return;
    const r = [...categories];
    const fi = r.findIndex(c => c.id === dragCat.id);
    const ti = r.findIndex(c => c.id === cat.id);
    r.splice(fi, 1); r.splice(ti, 0, dragCat);
    onReorderCategories(r.map((c, i) => ({ ...c, position: i })));
  }
  function onCatDragEnd() { setDragCat(null); setOverCat(null); }

  function onPartDragStart(e, part) { setDragPart(part); e.dataTransfer.effectAllowed = 'move'; }
  function onPartDragOver(e, part, catId) {
    e.preventDefault(); setOverPart(part.id);
    if (!dragPart || dragPart.id === part.id) return;
    const cp = parts.filter(p => (p.categoryId||null) === (catId||null));
    const fi = cp.findIndex(p => p.id === dragPart.id);
    const ti = cp.findIndex(p => p.id === part.id);
    if (fi === -1) return;
    cp.splice(fi, 1); cp.splice(ti, 0, dragPart);
    onReorderParts(cp.map((p, i) => ({ ...p, position: i })));
  }
  function onPartDragEnd() { setDragPart(null); setOverPart(null); }

  function onTouchStartCat(e, cat) {
    longPressTimer.current = setTimeout(() => {
      setDragCat(cat);
      navigator.vibrate && navigator.vibrate(40);
    }, 500);
  }
  function onTouchMoveCat(e) {
    if (!dragCat) { clearTimeout(longPressTimer.current); return; }
    e.preventDefault();
    const t = e.touches[0];
    const el = document.elementFromPoint(t.clientX, t.clientY)?.closest('[data-catid]');
    if (el) {
      const target = categories.find(c => c.id === el.dataset.catid);
      if (target && target.id !== dragCat.id) {
        const r = [...categories];
        const fi = r.findIndex(c => c.id === dragCat.id);
        const ti = r.findIndex(c => c.id === target.id);
        r.splice(fi, 1); r.splice(ti, 0, dragCat);
        onReorderCategories(r.map((c, i) => ({ ...c, position: i })));
      }
    }
  }
  function onTouchEndCat() { clearTimeout(longPressTimer.current); setDragCat(null); }

  function onTouchStartPart(e, part) {
    longPressTimer.current = setTimeout(() => {
      setDragPart(part);
      navigator.vibrate && navigator.vibrate(40);
    }, 500);
  }
  function onTouchMovePart(e, catId) {
    if (!dragPart) { clearTimeout(longPressTimer.current); return; }
    e.preventDefault();
    const t = e.touches[0];
    const el = document.elementFromPoint(t.clientX, t.clientY)?.closest('[data-partid]');
    if (el) {
      const cp = parts.filter(p => (p.categoryId||null) === (catId||null));
      const target = cp.find(p => p.id === el.dataset.partid);
      if (target && target.id !== dragPart.id) {
        const fi = cp.findIndex(p => p.id === dragPart.id);
        const ti = cp.findIndex(p => p.id === target.id);
        if (fi === -1) return;
        cp.splice(fi, 1); cp.splice(ti, 0, dragPart);
        onReorderParts(cp.map((p, i) => ({ ...p, position: i })));
      }
    }
  }
  function onTouchEndPart() { clearTimeout(longPressTimer.current); setDragPart(null); }

  const sortedCats    = [...categories].sort((a, b) => a.position - b.position);
  const uncategorized = parts.filter(p => !p.categoryId).sort((a, b) => (a.position||0) - (b.position||0));

  function renderParts(catParts, catId) {
    if (catParts.length === 0) {
      return (
        <div style={{ padding:'12px 0', fontSize:13, color:C.muted, textAlign:'center' }}>
          No parts in this category.
        </div>
      );
    }
    return catParts.map(p => (
      <div key={p.id} data-partid={p.id} draggable
        onDragStart={e => onPartDragStart(e, p)}
        onDragOver={e => onPartDragOver(e, p, catId)}
        onDragEnd={onPartDragEnd}
        onTouchStart={e => onTouchStartPart(e, p)}
        onTouchMove={e => onTouchMovePart(e, catId)}
        onTouchEnd={onTouchEndPart}
        style={{
          opacity: dragPart?.id === p.id ? 0.4 : 1,
          outline: overPart === p.id && dragPart?.id !== p.id ? `2px dashed ${C.accent}` : 'none',
          borderRadius: 12,
        }}>
        <PartCard
          part={p}
          onAdd={onAdd}
          onRemove={onRemove}
          onHistory={onHistory}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      </div>
    ));
  }

  return (
    <div style={{ padding:14 }}>

      {/* Edit Category Dialog */}
      {editCat && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.85)', zIndex:1000,
          display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ background:C.surface, border:`1px solid ${C.border}`,
            borderTop:`3px solid ${C.accent}`, borderRadius:16, padding:24,
            maxWidth:340, width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,.6)' }}>
            <div style={{ fontSize:16, fontWeight:800, marginBottom:16, color:C.text }}>
              Rename Category
            </div>
            <input
              autoFocus
              value={editCatName}
              onChange={e => setEditCatName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') saveEditCat();
                if (e.key === 'Escape') cancelEditCat();
              }}
              style={{ width:'100%', padding:'10px 12px', background:C.surface2,
                border:`1px solid ${C.accent}`, borderRadius:8, color:C.text, fontSize:14,
                outline:'none', boxSizing:'border-box', fontFamily:'system-ui,sans-serif',
                marginBottom:16 }}
            />
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={cancelEditCat}
                style={{ flex:1, padding:12, background:C.surface2, border:`1px solid ${C.border}`,
                  borderRadius:10, color:C.text, fontWeight:700, fontSize:14, cursor:'pointer',
                  fontFamily:'system-ui,sans-serif' }}>
                Cancel
              </button>
              <button onClick={saveEditCat}
                style={{ flex:1, padding:12, background:C.accent, border:'none',
                  borderRadius:10, color:'#000', fontWeight:800, fontSize:14, cursor:'pointer',
                  fontFamily:'system-ui,sans-serif' }}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Category */}
      {showNewCat ? (
        <div style={{ display:'flex', gap:8, marginBottom:12 }}>
          <input autoFocus value={newCatName}
            onChange={e => setNewCatName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
            placeholder="Category name…"
            style={{ flex:1, padding:'10px 12px', background:C.surface2,
              border:`1px solid ${C.accent}`, borderRadius:8, color:C.text,
              fontSize:14, outline:'none', fontFamily:'system-ui,sans-serif' }} />
          <button onClick={handleAddCategory}
            style={{ padding:'10px 14px', background:C.accent, color:'#000',
              border:'none', borderRadius:8, fontWeight:800, fontSize:14, cursor:'pointer' }}>
            Add
          </button>
          <button onClick={() => setShowNewCat(false)}
            style={{ padding:'10px 14px', background:C.surface2, color:C.muted,
              border:`1px solid ${C.border}`, borderRadius:8, fontWeight:700,
              fontSize:14, cursor:'pointer' }}>
            Cancel
          </button>
        </div>
      ) : (
        <button onClick={() => setShowNewCat(true)}
          style={{ width:'100%', padding:11, background:C.surface,
            border:`1px dashed ${C.accent}`, borderRadius:10, color:C.accent,
            fontWeight:700, fontSize:13, cursor:'pointer', marginBottom:12 }}>
          ＋ New Category
        </button>
      )}

      {sortedCats.length === 0 && uncategorized.length === 0 && (
        <EmptyState icon="📦">No parts yet. Go to ➕ New Part to start.</EmptyState>
      )}

      {/* Categories */}
      {sortedCats.map(cat => {
        const catParts = parts
          .filter(p => p.categoryId === cat.id)
          .sort((a, b) => (a.position||0) - (b.position||0));
        const open     = isOpen(cat.id);
        const dragging = dragCat?.id === cat.id;
        return (
          <div key={cat.id} data-catid={cat.id} draggable
            onDragStart={e => onCatDragStart(e, cat)}
            onDragOver={e => onCatDragOver(e, cat)}
            onDragEnd={onCatDragEnd}
            onTouchStart={e => onTouchStartCat(e, cat)}
            onTouchMove={onTouchMoveCat}
            onTouchEnd={onTouchEndCat}
            style={{
              marginBottom: 12,
              opacity: dragging ? 0.4 : 1,
              outline: overCat === cat.id && !dragging ? `2px dashed ${C.accent}` : 'none',
              borderRadius: 12,
            }}>
            <div style={{ background:C.surface, border:`1px solid ${C.border}`,
              borderRadius:12, overflow:'hidden' }}>
              <div style={{ display:'flex', alignItems:'center', padding:'12px 14px',
                borderBottom: open ? `1px solid ${C.border}` : 'none', userSelect:'none' }}>
                <span style={{ fontSize:16, marginRight:10, color:C.muted }}>☰</span>
                <div onClick={() => toggleCollapse(cat.id)} style={{ flex:1, cursor:'pointer' }}>
                  <div style={{ fontSize:14, fontWeight:800, color:C.text }}>{cat.name}</div>
                  <div style={{ fontSize:11, color:C.muted, marginTop:1 }}>
                    {catParts.length} part{catParts.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center', marginLeft:8 }}>
                  <button onClick={e => startEditCat(e, cat)}
                    style={{ background:C.surface2, border:`1px solid ${C.border}`,
                      borderRadius:6, padding:'4px 10px', color:C.accent, fontSize:11,
                      fontWeight:700, cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>
                    Edit
                  </button>
                  <button onClick={() => onDeleteCategory(cat.id)}
                    style={{ background:'rgba(224,58,58,.1)', border:`1px solid rgba(224,58,58,.3)`,
                      borderRadius:6, padding:'4px 8px', color:C.red, fontSize:12, cursor:'pointer' }}>
                    🗑
                  </button>
                  <span onClick={() => toggleCollapse(cat.id)}
                    style={{ fontSize:16, color:C.muted, cursor:'pointer' }}>
                    {open ? '▼' : '▶'}
                  </span>
                </div>
              </div>
              {open && (
                <div style={{ padding:'8px 10px' }}>
                  {renderParts(catParts, cat.id)}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Uncategorized */}
      {uncategorized.length > 0 && (
        <div style={{ marginBottom:12 }}>
          <div style={{ background:C.surface, border:`1px solid ${C.border}`,
            borderRadius:12, overflow:'hidden' }}>
            <div style={{ display:'flex', alignItems:'center', padding:'12px 14px',
              borderBottom: isOpen('uncategorized') ? `1px solid ${C.border}` : 'none' }}>
              <div onClick={() => toggleCollapse('uncategorized')} style={{ flex:1, cursor:'pointer' }}>
                <div style={{ fontSize:14, fontWeight:800, color:C.muted }}>Uncategorized</div>
                <div style={{ fontSize:11, color:C.muted, marginTop:1 }}>
                  {uncategorized.length} part{uncategorized.length !== 1 ? 's' : ''}
                </div>
              </div>
              <span onClick={() => toggleCollapse('uncategorized')}
                style={{ fontSize:16, color:C.muted, cursor:'pointer' }}>
                {isOpen('uncategorized') ? '▼' : '▶'}
              </span>
            </div>
            {isOpen('uncategorized') && (
              <div style={{ padding:'8px 10px' }}>
                {renderParts(uncategorized, null)}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
