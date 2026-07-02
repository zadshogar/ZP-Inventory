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
      setParts((partsData
