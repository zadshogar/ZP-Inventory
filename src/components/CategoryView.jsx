
import { useState } from 'react';
import { C } from '../constants.js';
import { uid } from '../utils.js';
import PartCard from './PartCard.jsx';
import { EmptyState } from './ui.jsx';

export default function CategoryView({ categories, parts, onAddCategory, onDeleteCategory, onReorderCategories, onReorderParts, onAdd, onRemove, onHistory, onDelete }) {
  const [newCatName, setNewCatName] = useState('');
  const [showNewCat, setShowNewCat] = useState(false);
  const [collapsed, setCollapsed] = useState({});
  const [draggingCat, setDraggingCat] = useState(null);
  const [draggingPart, setDraggingPart] = useState(null);

  function toggleCollapse(id) {
    setCollapsed(c => ({ ...c, [id]: !c[id] }));
  }

  function handleAddCategory() {
    if (!newCatName.trim()) return;
    onAddCategory({ id: uid(), name: newCatName.trim(), position: categories.length });
    setNewCatName('');
    setShowNewCat(false);
  }

  // Category drag handlers
  function onCatDragStart(e, cat) {
    setDraggingCat(cat);
    e.dataTransfer.effectAllowed = 'move';
  }
  function onCatDragOver(e, cat) {
    e.preventDefault();
    if (!draggingCat || draggingCat.id === cat.id) return;
    const reordered = [...categories];
    const fromIdx = reordered.findIndex(c => c.id === draggingCat.id);
    const toIdx   = reordered.findIndex(c => c.id === cat.id);
    reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, draggingCat);
    onReorderCategories(reordered.map((c, i) => ({ ...c, position: i })));
  }
  function onCatDragEnd() { setDraggingCat(null); }

  // Part drag handlers
  function onPartDragStart(e, part) {
    setDraggingPart(part);
    e.dataTransfer.effectAllowed = 'move';
  }
  function onPartDragOver(e, part, catId) {
    e.preventDefault();
    if (!draggingPart || draggingPart.id === part.id) return;
    const catParts = parts.filter(p => (p.categoryId || '') === (catId || ''));
    const fromIdx  = catParts.findIndex(p => p.id === draggingPart.id);
    const toIdx    = catParts.findIndex(p => p.id === part.id);
    if (fromIdx === -1) return;
    catParts.splice(fromIdx, 1);
    catParts.splice(toIdx, 0, draggingPart);
    onReorderParts(catParts.map((p, i) => ({ ...p, position: i })));
  }
  function onPartDragEnd() { setDraggingPart(null); }

  const sortedCats = [...categories].sort((a, b) => a.position - b.position);
  const uncategorized = parts.filter(p => !p.categoryId).sort((a, b) => (a.position||0) - (b.position||0));

  function renderParts(catParts, catId) {
    if (catParts.length === 0) {
      return <div style={{ padding:'12px 0', fontSize:13, color:C.muted, textAlign:'center' }}>No parts in this category.</div>;
    }
    return catParts.map(p => (
      <div key={p.id} draggable
        onDragStart={e => onPartDragStart(e, p)}
        onDragOver={e => onPartDragOver(e, p, catId)}
        onDragEnd={onPartDragEnd}
        style={{ opacity: draggingPart?.id === p.id ? 0.4 : 1, cursor:'grab' }}>
        <PartCard part={p} onAdd={onAdd} onRemove={onRemove} onHistory={onHistory} onDelete={onDelete} />
      </div>
    ));
  }

  return (
    <div style={{ padding:14 }}>
      {/* Add category button */}
      {showNewCat ? (
        <div style={{ display:'flex', gap:8, marginBottom:12 }}>
          <input autoFocus value={newCatName} onChange={e=>setNewCatName(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&handleAddCategory()}
            placeholder="Category name…"
            style={{ flex:1, padding:'10px 12px', background:C.surface2, border:`1px solid ${C.accent}`,
              borderRadius:8, color:C.text, fontSize:14, outline:'none', fontFamily:'system-ui,sans-serif' }} />
          <button onClick={handleAddCategory}
            style={{ padding:'10px 14px', background:C.accent, color:'#000', border:'none',
              borderRadius:8, fontWeight:800, fontSize:14, cursor:'pointer' }}>Add</button>
          <button onClick={()=>setShowNewCat(false)}
            style={{ padding:'10px 14px', background:C.surface2, color:C.muted, border:`1px solid ${C.border}`,
              borderRadius:8, fontWeight:700, fontSize:14, cursor:'pointer' }}>Cancel</button>
        </div>
      ) : (
        <button onClick={()=>setShowNewCat(true)}
          style={{ width:'100%', padding:11, background:C.surface, border:`1px dashed ${C.accent}`,
            borderRadius:10, color:C.accent, fontWeight:700, fontSize:13, cursor:'pointer', marginBottom:12 }}>
          ＋ New Category
        </button>
      )}

      {/* Category sections */}
      {sortedCats.length === 0 && uncategorized.length === 0 && (
        <EmptyState icon="📦">No parts yet. Go to ➕ New Part to start.</EmptyState>
      )}

      {sortedCats.map(cat => {
        const catParts = parts.filter(p => p.categoryId === cat.id).sort((a,b) => (a.position||0)-(b.position||0));
        const isCollapsed = collapsed[cat.id];
        return (
          <div key={cat.id} draggable
            onDragStart={e => onCatDragStart(e, cat)}
            onDragOver={e => onCatDragOver(e, cat)}
            onDragEnd={onCatDragEnd}
            style={{ marginBottom:12, opacity: draggingCat?.id === cat.id ? 0.4 : 1 }}>
            <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, overflow:'hidden' }}>
              {/* Category header */}
              <div style={{ display:'flex', alignItems:'center', padding:'12px 14px', cursor:'grab',
                borderBottom: isCollapsed ? 'none' : `1px solid ${C.border}` }}>
                <span style={{ fontSize:16, marginRight:8, color:C.muted }}>☰</span>
                <div onClick={()=>toggleCollapse(cat.id)} style={{ flex:1, cursor:'pointer' }}>
                  <div style={{ fontSize:14, fontWeight:800, color:C.text }}>{cat.name}</div>
                  <div style={{ fontSize:11, color:C.muted, marginTop:1 }}>{catParts.length} part{catParts.length!==1?'s':''}</div>
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <button onClick={()=>onDeleteCategory(cat.id)}
                    style={{ background:'rgba(224,58,58,.1)', border:`1px solid rgba(224,58,58,.3)`,
                      borderRadius:6, padding:'4px 8px', color:C.red, fontSize:12, cursor:'pointer' }}>🗑</button>
                  <span onClick={()=>toggleCollapse(cat.id)}
                    style={{ fontSize:18, color:C.muted, cursor:'pointer', userSelect:'none' }}>
                    {isCollapsed ? '▶' : '▼'}
                  </span>
                </div>
              </div>
              {/* Parts list */}
              {!isCollapsed && (
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
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, overflow:'hidden' }}>
            <div style={{ display:'flex', alignItems:'center', padding:'12px 14px',
              borderBottom: collapsed['uncategorized'] ? 'none' : `1px solid ${C.border}` }}>
              <div onClick={()=>toggleCollapse('uncategorized')} style={{ flex:1, cursor:'pointer' }}>
                <div style={{ fontSize:14, fontWeight:800, color:C.muted }}>Uncategorized</div>
                <div style={{ fontSize:11, color:C.muted, marginTop:1 }}>{uncategorized.length} part{uncategorized.length!==1?'s':''}</div>
              </div>
              <span onClick={()=>toggleCollapse('uncategorized')}
                style={{ fontSize:18, color:C.muted, cursor:'pointer', userSelect:'none' }}>
                {collapsed['uncategorized'] ? '▶' : '▼'}
              </span>
            </div>
            {!collapsed['uncategorized'] && (
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
