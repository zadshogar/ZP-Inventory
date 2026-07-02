import { useState, useRef } from 'react';
import { C } from '../constants.js';
import { uid } from '../utils.js';
import PartCard from './PartCard.jsx';
import { EmptyState } from './ui.jsx';

export default function CategoryView({ categories, parts, onAddCategory, onDeleteCategory, onRenameCategory, onReorderCategories, onReorderParts, onAdd, onRemove, onHistory, onDelete, onEdit }) {
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

  // Category drag (desktop)
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

  // Part drag (desktop)
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

  // Touch drag (mobile)
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
