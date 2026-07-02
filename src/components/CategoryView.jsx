import { useState } from 'react';
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

  // Move category up or down
  function moveCat(cat, dir) {
    const sorted = [...categories].sort((a, b) => a.position - b.position);
    const idx = sorted.findIndex(c => c.id === cat.id);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= sorted.length) return;
    const reordered = [...sorted];
    reordered.splice(idx, 1);
    reordered.splice(newIdx, 0, cat);
    onReorderCategories(reordered.map((c, i) => ({ ...c, position: i })));
  }

  // Move part up or down within its category
  function movePart(part, dir, catId) {
    const catParts = parts
      .filter(p => (p.categoryId || null) === (catId || null))
      .sort((a, b) => (a.position||0) - (b.position||0));
    const idx = catParts.findIndex(p => p.id === part.id);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= catParts.length) return;
    const reordered = [...catParts];
    reordered.splice(idx, 1);
    reordered.splice(newIdx, 0, part);
    onReorderParts(reordered.map((p, i) => ({ ...p, position: i })));
  }

  const sortedCats    = [...categories].sort((a, b) => a.position - b.position);
  const uncategorized = parts
    .filter(p => !p.categoryId)
    .sort((a, b) => (a.position||0) - (b.position||0));

  const arrowBtn = (label, onClick) => (
    <button onClick={onClick}
      style={{ background:C.surface2, border:`1px solid ${C.border}`, borderRadius:6,
        padding:'3px 7px', color:C.muted, fontSize:13, cursor:'pointer',
        fontFamily:'system-ui,sans-serif', lineHeight:1 }}>
      {label}
    </button>
  );

  function renderParts(catParts, catId) {
    if (catParts.length === 0) {
      return (
        <div style={{ padding:'12px 0', fontSize:13, color:C.muted, textAlign:'center' }}>
          No parts in this category.
        </div>
      );
    }
    return catParts.map((p, idx) => (
      <div key={p.id} style={{ position:'relative' }}>
        <div style={{ position:'absolute', top:14, right:14, display:'flex',
          flexDirection:'column', gap:3, zIndex:10 }}>
          {idx > 0 && arrowBtn('▲', () => movePart(p, -1, catId))}
          {idx < catParts.length - 1 && arrowBtn('▼', () => movePart(p, 1, catId))}
        </div>
        <div style={{ paddingRight: 36 }}>
          <PartCard
            part={p}
            onAdd={onAdd}
            onRemove={onRemove}
            onHistory={onHistory}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        </div>
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
      {sortedCats.map((cat, catIdx) => {
        const catParts = parts
          .filter(p => p.categoryId === cat.id)
          .sort((a, b) => (a.position||0) - (b.position||0));
        const open = isOpen(cat.id);
        return (
          <div key={cat.id} style={{ marginBottom:12 }}>
            <div style={{ background:C.surface, border:`1px solid ${C.border}`,
              borderRadius:12, overflow:'hidden' }}>
              <div style={{ display:'flex', alignItems:'center', padding:'12px 14px',
                borderBottom: open ? `1px solid ${C.border}` : 'none', userSelect:'none' }}>

                {/* Up/Down arrows for category */}
                <div style={{ display:'flex', flexDirection:'column', gap:3, marginRight:10 }}>
                  {catIdx > 0 && arrowBtn('▲', () => moveCat(cat, -1))}
                  {catIdx < sortedCats.length - 1 && arrowBtn('▼', () => moveCat(cat, 1))}
                </div>

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
