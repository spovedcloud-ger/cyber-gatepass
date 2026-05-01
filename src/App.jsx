import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Trash2, RotateCcw, ShieldCheck, Download, Upload, ListFilter, Edit3, X, Printer, Ghost } from 'lucide-react';
import Swal from 'sweetalert2';

const API_BASE = '/api';

const CyberAlert = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: '#ffffff',
  color: '#0f172a',
  didOpen: (toast) => {
    toast.style.borderLeft = '4px solid var(--accent)';
    toast.style.fontFamily = 'var(--font-display)';
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
          <Link to="/gategraph" className={location.pathname === '/gategraph' ? 'active' : ''}>
            ANALYTICS
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
                      <span style={{ fontStyle: 'italic' }}>{item.filedDate}</span>
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
  const [selectedMonth, setSelectedMonth] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
  const [editModal, setEditModal] = useState({ show: false, item: null });

  // Fixed Year Range: 2014 to current
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const range = [];
    for (let y = currentYear; y >= 2014; y--) {
      range.push(y.toString());
    }
    return range;
  }, []);

  // Set initial year to current year
  useEffect(() => {
    if (selectedYear === 'ALL' && years.length > 0) {
      setSelectedYear(new Date().getFullYear().toString());
    }
  }, [years]);

  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `gatepass_backup_${new Date().toLocaleDateString()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    showToast('DATABASE BACKUP GENERATED', 'success');
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);
        const response = await fetch(`${API_BASE}/items/import`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (response.ok) {
          refreshData();
          showToast('DATABASE RESTORED', 'success');
        }
      } catch (err) { showToast('INVALID BACKUP FILE', 'error'); }
    };
    reader.readAsText(file);
  };

  const extractDate = (text) => {
    const dateRegex = /\d{2}\/\d{2}\/\d{4}/;
    const match = text.match(dateRegex);
    return match ? match[0] : 'N/A';
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const date = item.createdAt ? new Date(item.createdAt) : new Date(item.filedDate);
      const itemMonth = date.toLocaleString('default', { month: 'short' }).toUpperCase();
      const itemYear = date.getFullYear().toString();
      
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.assets.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.filedDate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item._id.includes(searchTerm);
      
      const matchesMonth = selectedMonth === 'ALL' || itemMonth === selectedMonth;
      const matchesYear = selectedYear === 'ALL' || itemYear === selectedYear;

      return matchesSearch && matchesMonth && matchesYear;
    });
  }, [items, searchTerm, selectedMonth, selectedYear]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedMonth, selectedYear]);

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'In Process' ? 'Completed' : 'In Process';
    
    const getStatusColor = (status) => status === 'In Process' ? 'var(--warning)' : 'var(--success)';
    
    Swal.fire({
      title: 'UPDATE STATUS?',
      html: `Are you sure you want to change the status from <br/> <b style="color: ${getStatusColor(currentStatus)}">[${currentStatus.toUpperCase()}]</b> to <b style="color: ${getStatusColor(newStatus)}">[${newStatus.toUpperCase()}]</b>?`,
      icon: 'question',
      iconColor: 'var(--accent)',
      background: '#0d1117',
      color: '#ffffff',
      showCancelButton: true,
      confirmButtonColor: 'var(--accent)',
      cancelButtonColor: 'rgba(255, 255, 255, 0.1)',
      confirmButtonText: 'CONFIRM UPDATE',
      cancelButtonText: 'ABORT',
      customClass: {
        popup: 'cyber-swal-border',
        title: 'cyber-swal-title',
        confirmButton: 'cyber-btn-swal'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await fetch(`${API_BASE}/items?id=${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
        
        if (response.ok) {
          refreshData();
          showToast(`STATUS UPDATED TO ${newStatus.toUpperCase()}`, 'success');
        }
      }
    });
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
        <div className="tracking-header glass-card" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center', overflow: 'visible', position: 'relative', zIndex: 100 }}>
          <div className="search-bar" style={{ flex: 1, marginBottom: 0 }}>
            <Search size={18} className="text-secondary" />
            <input 
              type="text" 
              placeholder="Search records..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ position: 'relative', zIndex: showFilterModal ? 9999 : 1 }}>
            <button 
              className={`btn-sm ${selectedMonth !== 'ALL' || selectedYear !== 'ALL' ? 'active-filter' : ''} ${showFilterModal ? 'filter-active' : ''}`}
              onClick={() => setShowFilterModal(!showFilterModal)}
              style={{ minWidth: '130px', justifyContent: 'center', gap: '0.75rem' }}
            >
              <ListFilter size={16} /> 
              <span>Filter</span>
            </button>

            <AnimatePresence>
              {showFilterModal && (
                <>
                  <div className="filter-overlay-transparent" onClick={() => setShowFilterModal(false)} />
                  <motion.div 
                    className="glass-card mini-calendar-popover"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    style={{ zIndex: 10000 }}
                  >
                    <div className="popover-header">
                      <label>PERIOD FILTER</label>
                      <X size={14} onClick={() => setShowFilterModal(false)} style={{ cursor: 'pointer' }} />
                    </div>

                    <div className="popover-section">
                      <select 
                        value={selectedYear} 
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="popover-year-select"
                      >
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>

                    <div className="popover-grid">
                      {months.map(m => (
                        <button 
                          key={m} 
                          className={`popover-month ${selectedMonth === m ? 'active' : ''}`}
                          onClick={() => { setSelectedMonth(m); setShowFilterModal(false); }}
                        >
                          {m}
                        </button>
                      ))}
                    </div>

                    <button className="popover-reset" onClick={() => { setSelectedMonth('ALL'); setSelectedYear(new Date().getFullYear().toString()); setShowFilterModal(false); }}>RESET ALL</button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="action-group" style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-sm" onClick={exportData} title="Backup Database"><Download size={14} /> BACKUP</button>
            <button className="btn-sm" onClick={() => document.getElementById('importFile').click()} title="Restore Database"><Upload size={14} /> RESTORE</button>
            <input type="file" id="importFile" style={{ display: 'none' }} accept=".json" onChange={handleImport} />
          </div>
        </div>

        <div className="log-table-container glass-card" style={{ position: 'relative', zIndex: 1 }}>
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
              {currentItems.map(item => (
                <tr key={item._id} className="log-row">
                  <td>
                    <span className={`status-dot ${item.status.toLowerCase().replace(' ', '-')}`} onClick={() => toggleStatus(item._id, item.status)}>
                      {item.status}
                    </span>
                  </td>
                  <td className="text-secondary" style={{ fontSize: '0.6rem' }}>{item._id}</td>
                  <td className="text-accent">{item.title}</td>
                  <td className="text-info" style={{ fontWeight: 'bold' }}>{extractDate(item.title + ' ' + item.assets)}</td>
                  <td className="text-primary" style={{ fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>{item.assets}</td>
                  <td style={{ fontSize: '0.8rem', fontStyle: 'italic' }}>{item.filedDate}</td>
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

        {filteredItems.length > itemsPerPage && (
          <div className="pagination-container">
            <button 
              className="pagination-btn" 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              PREV
            </button>
            <div className="page-indicator">
              PAGE <span className="text-accent">{currentPage}</span> OF {totalPages}
            </div>
            <button 
              className="pagination-btn" 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              NEXT
            </button>
          </div>
        )}
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
      color: '#ffffff',
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
        <h1>Recovery Center</h1>
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
                    <td style={{ fontStyle: 'italic' }}>{item.filedDate}</td>
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

function GateGraph({ items }) {
  const stats = useMemo(() => {
    const monthCounts = {};
    const now = new Date();
    const currentMonthKey = now.toLocaleString('default', { month: 'short', year: 'numeric' });

    items.forEach(item => {
      // Prioritize createdAt if it's a date, otherwise parse filedDate
      const date = item.createdAt ? new Date(item.createdAt) : new Date(item.filedDate);
      if (isNaN(date.getTime())) return;
      
      const key = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      monthCounts[key] = (monthCounts[key] || 0) + 1;
    });

    // Sort months chronologically for the graph
    const sortedMonths = Object.entries(monthCounts).sort((a, b) => new Date(a[0]) - new Date(b[0]));
    
    // Status Counts
    const inProcessCount = items.filter(i => i.status === 'In Process').length;
    const completedCount = items.filter(i => i.status === 'Completed').length;
    
    // Find highest and lowest volume months
    const volumes = Object.values(monthCounts);
    const maxVol = volumes.length > 0 ? Math.max(...volumes) : 0;
    
    const peakMonth = sortedMonths.find(m => m[1] === maxVol) || ['N/A', 0];
    const currentMonthTotal = monthCounts[currentMonthKey] || 0;

    return {
      total: items.length,
      currentMonth: currentMonthTotal,
      currentMonthLabel: currentMonthKey,
      peakMonth: peakMonth,
      byMonth: sortedMonths,
      maxVol: maxVol,
      inProcess: inProcessCount,
      completed: completedCount
    };
  }, [items]);

  return (
    <div className="container">
      <div className="bg-grid" />
      <div className="bg-glow" />
      <header>
        <h1>Operational Trends</h1>
        <p className="subtitle">Monthly Authorization Volume & System Activity</p>
      </header>

      <main className="single-column-layout">
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
           <div className="glass-card stat-item" style={{ borderTop: '2px solid var(--accent)', boxShadow: '0 -5px 15px rgba(0, 242, 255, 0.1)' }}>
              <label style={{ color: 'var(--accent)' }}>This Month ({stats.currentMonthLabel})</label>
              <div className="stat-value text-accent">{stats.currentMonth}</div>
              <small className="text-secondary">Records filed</small>
           </div>
           <div className="glass-card stat-item" style={{ borderTop: '2px solid var(--warning)', boxShadow: '0 -5px 15px rgba(255, 170, 0, 0.1)' }}>
              <label style={{ color: 'var(--warning)' }}>In Process</label>
              <div className="stat-value text-warning">{stats.inProcess}</div>
              <small className="text-secondary">Active authorizations</small>
           </div>
           <div className="glass-card stat-item" style={{ borderTop: '2px solid var(--success)', boxShadow: '0 -5px 15px rgba(0, 255, 170, 0.1)' }}>
              <label style={{ color: 'var(--success)' }}>Completed</label>
              <div className="stat-value text-success">{stats.completed}</div>
              <small className="text-secondary">Closed records</small>
           </div>
           <div className="glass-card stat-item" style={{ borderTop: '2px solid var(--neon-purple)', boxShadow: '0 -5px 15px rgba(157, 0, 255, 0.1)' }}>
              <label style={{ color: 'var(--neon-purple)' }}>Peak Activity</label>
              <div className="stat-value" style={{ color: 'var(--neon-purple)', fontSize: '1rem' }}>{stats.peakMonth[0]}</div>
              <small className="text-secondary">{stats.peakMonth[1]} records</small>
           </div>
           <div className="glass-card stat-item" style={{ borderTop: '2px solid var(--neon-pink)', boxShadow: '0 -5px 15px rgba(255, 0, 229, 0.1)' }}>
              <label style={{ color: 'var(--neon-pink)' }}>Total Archive</label>
              <div className="stat-value" style={{ color: 'var(--neon-pink)' }}>{stats.total}</div>
              <small className="text-secondary">All-time logs</small>
           </div>
        </div>

        <div className="glass-card" style={{ marginTop: '2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', marginBottom: '2.5rem', color: 'var(--accent)', letterSpacing: '2px' }}>MONTHLY VOLUME TREND</h2>
          <div className="graph-container">
            {stats.byMonth.length === 0 ? (
               <p className="empty-state">No historical data available for trend analysis.</p>
            ) : (
              stats.byMonth.map(([month, count], index) => {
                const colors = ['#00f2ff', '#9d00ff', '#ff00e5', '#3b82f6', '#6366f1'];
                const barColor = colors[index % colors.length];
                const isCurrentMonth = month === stats.currentMonthLabel;

                return (
                  <div key={month} className="graph-row">
                    <div className="graph-label" style={{ color: isCurrentMonth ? 'var(--success)' : 'var(--text-secondary)' }}>
                      {month} {isCurrentMonth && '•'}
                    </div>
                    <div className="graph-bar-wrapper">
                      <motion.div 
                        className="graph-bar"
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / stats.maxVol) * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        style={{ 
                          background: isCurrentMonth 
                            ? 'linear-gradient(90deg, var(--success), #00ffaa)' 
                            : `linear-gradient(90deg, ${barColor}, #2a2a2a)`,
                          boxShadow: isCurrentMonth 
                            ? '0 0 15px rgba(0, 255, 170, 0.3)' 
                            : `0 0 10px ${barColor}44`
                        }}
                      />
                      <span className="graph-count" style={{ color: isCurrentMonth ? 'var(--success)' : barColor }}>{count}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function App() {
  const [items, setItems] = useState([]);
  const [deletedItems, setDeletedItems] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('gatepass_auth') === 'true');
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);

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
    setDataLoaded(true);
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
      const interval = setInterval(() => {
        setLoadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + Math.floor(Math.random() * 10) + 1;
        });
      }, 150);
    } else {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (dataLoaded && loadProgress === 100) {
      setTimeout(() => setIsLoading(false), 500);
    }
  }, [dataLoaded, loadProgress]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('gatepass_auth');
    setLoadProgress(0);
    setDataLoaded(false);
  };

  if (isLoading) return (
    <div className="login-screen" style={{ flexDirection: 'column', gap: '2rem' }}>
      <div className="bg-grid" />
      <div className="bg-glow" />
      <motion.div 
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 2 }}
        style={{ 
          fontFamily: 'var(--font-display)', 
          color: 'var(--accent)', 
          letterSpacing: '6px', 
          fontSize: '1.5rem', 
          fontWeight: '900',
          textShadow: '0 0 20px var(--accent-glow)',
          textAlign: 'center',
          textTransform: 'uppercase'
        }}
      >
        SYNCHRONIZING CYBER GATEPASS...
      </motion.div>
      
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: '350px', height: '4px', background: 'rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <motion.div 
            initial={{ width: '0%' }}
            animate={{ width: `${loadProgress}%` }}
            transition={{ type: 'spring', stiffness: 50 }}
            style={{ 
              height: '100%', 
              background: 'linear-gradient(90deg, var(--accent), var(--info))',
              boxShadow: '0 0 20px var(--accent)' 
            }}
          />
        </div>
        <div style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)', fontSize: '2rem', fontWeight: '900', fontStyle: 'italic' }}>
          {loadProgress}%
        </div>
      </div>
    </div>
  );

  return (
    <BrowserRouter>
      {isLoggedIn && <Navigation handleLogout={handleLogout} deletedItemsCount={deletedItems.length} />}
      <Routes>
        <Route path="/login" element={!isLoggedIn ? <LoginPage setIsLoggedIn={setIsLoggedIn} /> : <Navigate to="/gatepass" />} />
        <Route path="/gatepass" element={isLoggedIn ? <GatepassTracker items={items} refreshData={fetchData} showToast={showToast} /> : <Navigate to="/login" />} />
        <Route path="/gatelogs" element={isLoggedIn ? <GateLogs items={items} refreshData={fetchData} showToast={showToast} /> : <Navigate to="/login" />} />
        <Route path="/gategraph" element={isLoggedIn ? <GateGraph items={items} /> : <Navigate to="/login" />} />
        <Route path="/trash" element={isLoggedIn ? <TrashBin deletedItems={deletedItems} refreshData={fetchData} showToast={showToast} /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to="/gatepass" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
