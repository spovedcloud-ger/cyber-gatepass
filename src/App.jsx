import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Upload, Trash2, Printer, Plus, ShieldCheck, Search, ListFilter, ClipboardList, LayoutDashboard, RotateCcw, Ghost, Edit3, X } from 'lucide-react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Link, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';

const API_BASE = '/api';

const CyberAlert = Swal.mixin({
  toast: true,
  position: 'bottom-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: '#0d1117',
  color: '#fff',
  didOpen: (toast) => {
    toast.style.borderLeft = '4px solid var(--accent)';
    toast.style.fontFamily = 'var(--font-display)';
    toast.style.fontSize = '0.8rem';
    toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
  }
});

function LoginPage({ setIsLoggedIn }) {
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginForm.username === 'admin' && loginForm.password === 'admin') {
      setIsLoggedIn(true);
      localStorage.setItem('gatepass_auth', 'true');
      setLoginError('');
      navigate('/gatepass');
    } else {
      setLoginError('ACCESS DENIED: INVALID CREDENTIALS');
    }
  };

  return (
    <div className="login-screen">
      <div className="bg-grid" />
      <div className="bg-glow" />
      <motion.div 
        className="glass-card login-card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <ShieldCheck size={48} className="text-accent" style={{ marginBottom: '1rem' }} />
          <h1 style={{ fontSize: '2rem' }}>Cyber Gatepass</h1>
          <p className="subtitle">Secure HUD Authentication Gateway</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Operator ID</label>
            <input 
              type="text" 
              value={loginForm.username}
              onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
              placeholder="Enter Username"
              required 
            />
          </div>
          <div className="form-group">
            <label>Security Key</label>
            <input 
              type="password" 
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              placeholder="Enter Password"
              required 
            />
          </div>
          {loginError && <div className="error-text">{loginError}</div>}
          <button type="submit" className="cyber-btn" style={{ marginTop: '1rem' }}>
            Initialize Uplink
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function Navigation({ handleLogout, deletedItemsCount }) {
  const location = useLocation();
  return (
    <nav className="main-nav">
      <div className="nav-container">
        <Link to="/gatepass" className="nav-brand" style={{ textDecoration: 'none' }}>
          <ShieldCheck className="text-accent" size={20} />
          <span>CYBER GATEPASS</span>
        </Link>
        
        <div className="nav-links">
          <Link to="/gatepass" className={location.pathname === '/gatepass' ? 'active' : ''}>
            DASHBOARD
          </Link>
          <Link to="/gatelogs" className={location.pathname === '/gatelogs' ? 'active' : ''}>
            STATUS CHECK
          </Link>
          <Link to="/trash" className={location.pathname === '/trash' ? 'active' : ''}>
            {deletedItemsCount > 0 ? `RECOVERY HUB (${deletedItemsCount})` : 'RECOVERY'}
          </Link>
        </div>

        <div className="nav-operator">
          <div className="operator-info">
            <span className="label">OPERATOR:</span>
            <span className="value">ADMIN</span>
          </div>
          <button onClick={handleLogout} className="logout-btn">DISCONNECT</button>
        </div>
      </div>
    </nav>
  );
}

function GatepassTracker({ items, refreshData, showToast }) {
  const [formData, setFormData] = useState({ title: '', assets: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch(`${API_BASE}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        filedDate: new Date().toLocaleString()
      })
    });
    
    if (response.ok) {
      setFormData({ title: '', assets: '' });
      refreshData();
      showToast('RECORD UPLINK ESTABLISHED', 'success');
    }
  };

  return (
    <div className="container">
      <div className="bg-grid" />
      <div className="bg-glow" />
      <header>
        <h1>Gatepass Tracker</h1>
        <p className="subtitle">Secure Asset Movement Authorization System</p>
      </header>

      <div className="main-layout">
        <aside>
          <motion.section 
            className="glass-card"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ position: 'sticky', top: '5rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <Plus className="text-accent" size={24} />
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', letterSpacing: '1px' }}>New Record</h2>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title / Subject</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. GATEPASS FOR PULL-OUT"
                  required 
                />
              </div>
              <div className="form-group">
                <label>Asset Details</label>
                <textarea 
                  rows="10" 
                  value={formData.assets}
                  onChange={(e) => setFormData({ ...formData, assets: e.target.value })}
                  placeholder="1x Monitor SN: VTV0WZYL..."
                  required 
                />
              </div>
              <button type="submit" className="cyber-btn">
                <Plus size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Submit Entry
              </button>
            </form>
          </motion.section>
        </aside>

        <main>
          <div className="tracker-list">
            <AnimatePresence mode="popLayout">
              {items.length === 0 ? (
                <motion.div className="empty-state">
                  <p>Database empty. Awaiting new records...</p>
                </motion.div>
              ) : (
                items.slice(0, 10).map((item) => (
                  <motion.div key={item._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="tracker-item">
                    <div className={`status-badge status-${item.status.toLowerCase().replace(' ', '-')}`}>
                      {item.status}
                    </div>
                    <div className="item-title">{item.title}</div>
                    <div className="item-details">{item.assets}</div>
                    <div className="item-footer">
                      <span>{item.filedDate}</span>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

function GateLogs({ items, refreshData, showToast }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
  const [editModal, setEditModal] = useState({ show: false, item: null });

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `gatepass_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        const dataArray = Array.isArray(imported) ? imported : (imported.items || []);
        
        if (dataArray.length > 0) {
          for (const item of dataArray) {
            await fetch(`${API_BASE}/items`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: item.title,
                assets: item.assets,
                status: item.status || 'In Process',
                filedDate: item.timestamp || item.filedDate || new Date().toLocaleString()
              })
            });
          }
          showToast('CLOUD SYNC: ALL RECORDS UPLOADED', 'success');
          refreshData();
        }
      } catch (err) { alert('ERROR: INVALID DATA FORMAT'); }
    };
    reader.readAsText(file);
  };

  const extractDate = (text) => {
    const dateRegex = /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})|((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4})|(\d{4}-\d{2}-\d{2})/gi;
    const match = text.match(dateRegex);
    return match ? match[0] : 'N/A';
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.assets.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.filedDate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item._id.includes(searchTerm)
    );
  }, [items, searchTerm]);

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'In Process' ? 'Completed' : 'In Process';
    const response = await fetch(`${API_BASE}/items?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    
    if (response.ok) refreshData();
  };

  const deleteItem = (id) => setDeleteConfirm({ show: true, id });
  
  const confirmDelete = async () => {
    const response = await fetch(`${API_BASE}/items?id=${deleteConfirm.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isDeleted: true })
    });
    
    if (response.ok) {
      refreshData();
      showToast('RECORD MOVED TO RECOVERY', 'warning');
    }
    setDeleteConfirm({ show: false, id: null });
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    const response = await fetch(`${API_BASE}/items?id=${editModal.item._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: editModal.item.title,
        assets: editModal.item.assets
      })
    });
    
    if (response.ok) {
      refreshData();
      showToast('RECORD DATA MODIFIED', 'success');
      setEditModal({ show: false, item: null });
    }
  };

  return (
    <div className="container">
      <div className="bg-grid" />
      <div className="bg-glow" />
      <header>
        <h1>Main Status Check</h1>
        <p className="subtitle">High-Density Operational Log Monitoring</p>
      </header>

      <main>
        <div className="tracking-header glass-card" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="search-bar" style={{ flex: 1, marginBottom: 0 }}>
            <Search size={18} className="text-secondary" />
            <input 
              type="text" 
              placeholder="Search by name, date, ref ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="action-group" style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-sm" onClick={exportData} title="Backup Database"><Download size={14} /> BACKUP</button>
            <button className="btn-sm" onClick={() => document.getElementById('importFile').click()} title="Restore Database"><Upload size={14} /> RESTORE</button>
            <input type="file" id="importFile" style={{ display: 'none' }} accept=".json" onChange={handleImport} />
          </div>
        </div>

        <div className="log-table-container glass-card">
          <table className="log-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Ref ID</th>
                <th>Title / Subject</th>
                <th>Date Needed</th>
                <th>Asset Details</th>
                <th>Filed Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item._id} className="log-row">
                  <td>
                    <span className={`status-dot ${item.status.toLowerCase().replace(' ', '-')}`} onClick={() => toggleStatus(item._id, item.status)}>
                      {item.status}
                    </span>
                  </td>
                  <td className="text-secondary" style={{ fontSize: '0.6rem' }}>{item._id}</td>
                  <td className="text-accent">{item.title}</td>
                  <td className="text-info" style={{ fontWeight: 'bold' }}>{extractDate(item.title + ' ' + item.assets)}</td>
                  <td className="text-secondary" style={{ fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>{item.assets}</td>
                  <td style={{ fontSize: '0.8rem' }}>{item.filedDate}</td>
                  <td>
                    <div className="action-group">
                      <button onClick={() => setEditModal({ show: true, item })} className="icon-btn" title="Edit Entry"><Edit3 size={14} /></button>
                      <button onClick={() => window.print()} className="icon-btn"><Printer size={14} /></button>
                      <button onClick={() => deleteItem(item._id)} className="icon-btn text-danger"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <AnimatePresence>
        {deleteConfirm.show && (
          <div className="modal-overlay">
            <motion.div className="modal-content glass-card" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)', marginBottom: '1rem' }}>Move to Recovery?</h3>
              <div className="modal-actions">
                <button className="btn-sm" onClick={() => setDeleteConfirm({ show: false, id: null })}>Cancel</button>
                <button className="cyber-btn" style={{ width: 'auto', padding: '0.75rem 2rem', background: '#ef4444' }} onClick={confirmDelete}>Confirm</button>
              </div>
            </motion.div>
          </div>
        )}

        {editModal.show && (
          <div className="modal-overlay">
            <motion.div className="modal-content glass-card" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} style={{ maxWidth: '600px', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>Edit Record</h3>
                <X style={{ cursor: 'pointer', opacity: 0.5 }} onClick={() => setEditModal({ show: false, item: null })} />
              </div>
              <form onSubmit={handleEditSave}>
                <div className="form-group">
                  <label>Title / Subject</label>
                  <input 
                    type="text" 
                    value={editModal.item.title}
                    onChange={(e) => setEditModal({ ...editModal, item: { ...editModal.item, title: e.target.value } })}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Asset Details</label>
                  <textarea 
                    rows="8" 
                    value={editModal.item.assets}
                    onChange={(e) => setEditModal({ ...editModal, item: { ...editModal.item, assets: e.target.value } })}
                    required 
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-sm" onClick={() => setEditModal({ show: false, item: null })}>Cancel</button>
                  <button type="submit" className="cyber-btn" style={{ width: 'auto', padding: '0.75rem 2rem' }}>Save Changes</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TrashBin({ deletedItems, refreshData, showToast }) {
  const restoreItem = async (id) => {
    const response = await fetch(`${API_BASE}/items?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isDeleted: false })
    });
    
    if (response.ok) {
      refreshData();
      showToast('RECORD RESTORED FROM TRASH', 'success');
    }
  };

  const permanentDelete = async (id) => {
    Swal.fire({
      title: 'INITIATE DATA WIPE?',
      text: "This action is irreversible. The record will be permanently erased from the MongoDB cloud.",
      icon: 'warning',
      iconColor: '#ef4444',
      background: '#0d1117',
      color: '#fff',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: 'rgba(255, 255, 255, 0.1)',
      confirmButtonText: 'CONFIRM WIPE',
      cancelButtonText: 'ABORT',
      customClass: {
        popup: 'cyber-swal-border',
        title: 'cyber-swal-title',
        confirmButton: 'cyber-btn-swal'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await fetch(`${API_BASE}/items?id=${id}`, { method: 'DELETE' });
        if (response.ok) {
          refreshData();
          showToast('RECORD PERMANENTLY WIPED', 'error');
        }
      }
    });
  };


  return (
    <div className="container">
      <div className="bg-grid" />
      <div className="bg-glow" />
      <header>
        <h1 style={{ color: '#ef4444' }}>Recovery Center</h1>
        <p className="subtitle">Secure Management for Archived Records</p>
      </header>

      <main>
        {deletedItems.length === 0 ? (
          <div className="empty-state glass-card" style={{ padding: '5rem' }}>
            <Ghost size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <p>Recovery center empty. No archived records detected.</p>
          </div>
        ) : (
          <div className="log-table-container glass-card">
            <table className="log-table">
              <thead>
                <tr>
                  <th>Ref ID</th>
                  <th>Title / Subject</th>
                  <th>Filed Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {deletedItems.map(item => (
                  <tr key={item._id} className="log-row">
                    <td className="text-secondary" style={{ fontSize: '0.6rem' }}>{item._id}</td>
                    <td className="text-accent">{item.title}</td>
                    <td>{item.filedDate}</td>
                    <td>
                      <div className="action-group">
                        <button onClick={() => restoreItem(item._id)} className="btn-sm" style={{ color: 'var(--success)', borderColor: 'var(--success)' }}>
                          <RotateCcw size={14} /> RESTORE
                        </button>
                        <button onClick={() => permanentDelete(item._id)} className="btn-sm" style={{ color: '#ef4444', borderColor: '#ef4444' }}>
                          <Ghost size={14} /> WIPE
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  const [items, setItems] = useState([]);
  const [deletedItems, setDeletedItems] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('gatepass_auth') === 'true');
  const [isLoading, setIsLoading] = useState(true);

  const showToast = (message, type = 'success') => {
    const colors = { success: 'var(--success)', warning: 'var(--warning)', error: '#ef4444' };
    CyberAlert.fire({
      title: message,
      icon: type,
      iconColor: colors[type],
      didOpen: (toast) => {
        toast.style.borderLeft = `4px solid ${colors[type]}`;
        toast.style.fontFamily = 'var(--font-display)';
      }
    });
  };

  const fetchData = async () => {
    try {
      const [itemsRes, trashRes] = await Promise.all([
        fetch(`${API_BASE}/items`),
        fetch(`${API_BASE}/trash`)
      ]);
      const itemsData = await itemsRes.json();
      const trashData = await trashRes.json();
      setItems(itemsData);
      setDeletedItems(trashData);
    } catch (err) { console.error('API ERROR:', err); }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isLoggedIn) fetchData();
    else setIsLoading(false);
  }, [isLoggedIn]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('gatepass_auth');
  };

  if (isLoading) return <div className="login-screen">INITIALIZING MONGODB UPLINK...</div>;

  return (
    <BrowserRouter>
      {isLoggedIn && <Navigation handleLogout={handleLogout} deletedItemsCount={deletedItems.length} />}
      <Routes>
        <Route path="/login" element={!isLoggedIn ? <LoginPage setIsLoggedIn={setIsLoggedIn} /> : <Navigate to="/gatepass" />} />
        <Route path="/gatepass" element={isLoggedIn ? <GatepassTracker items={items} refreshData={fetchData} showToast={showToast} /> : <Navigate to="/login" />} />
        <Route path="/gatelogs" element={isLoggedIn ? <GateLogs items={items} refreshData={fetchData} showToast={showToast} /> : <Navigate to="/login" />} />
        <Route path="/trash" element={isLoggedIn ? <TrashBin deletedItems={deletedItems} refreshData={fetchData} showToast={showToast} /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to="/gatepass" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
