import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { getStatusColor } from '../services/api';
import { Plus, Search, Eye, Pencil, ChevronUp, ChevronDown, ArrowUpDown, UserX } from 'lucide-react';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToastContext } from '../context/ToastContext';

const getInitials = (name: string) => {
  return name.split(' ').filter(Boolean).map(part => part[0]).join('').slice(0, 2).toUpperCase();
};

type SortKey = 'id' | 'name' | 'department' | 'designation' | 'employmentType' | 'jobStatus' | 'shift' | 'dateOfJoining';
type SortDir = 'asc' | 'desc';

export default function Employees() {
  const navigate = useNavigate();
  const { showToast } = useToastContext();
  const { employees, setEmployees, departments, jobStatuses, workModes } = useData();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modeFilter, setModeFilter] = useState('');
  const [showTerminated, setShowTerminated] = useState(false);
  const [terminateConfirm, setTerminateConfirm] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(25);

  const filtered = useMemo(() => {
    let list = employees.filter(e => {
      if (!showTerminated && e.jobStatus === 'Terminated') return false;
      if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.id.toLowerCase().includes(search.toLowerCase())) return false;
      if (deptFilter && e.department !== deptFilter) return false;
      if (statusFilter && e.jobStatus !== statusFilter) return false;
      if (modeFilter && e.workMode !== modeFilter) return false;
      return true;
    });
    list.sort((a: any, b: any) => {
      const av = a[sortKey] || '';
      const bv = b[sortKey] || '';
      const cmp = typeof av === 'string' ? av.localeCompare(bv) : av - bv;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [employees, search, deptFilter, statusFilter, modeFilter, sortKey, sortDir, showTerminated]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice(page * perPage, (page + 1) * perPage);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const selectAll = () => {
    if (selected.size === paged.length) setSelected(new Set());
    else setSelected(new Set(paged.map(e => e.id)));
  };

  const terminateSelected = () => {
    setEmployees(prev => prev.map(e => selected.has(e.id) ? { ...e, jobStatus: 'Terminated' } : e));
    showToast(`${selected.size} employee(s) terminated successfully`);
    setSelected(new Set());
    setTerminateConfirm(false);
  };

  const clearFilters = () => { setSearch(''); setDeptFilter(''); setStatusFilter(''); setModeFilter(''); };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown size={10} style={{ opacity: .3, marginLeft: 3 }} />;
    return sortDir === 'asc' ? <ChevronUp size={10} style={{ marginLeft: 3, color: 'var(--p)' }} /> : <ChevronDown size={10} style={{ marginLeft: 3, color: 'var(--p)' }} />;
  };

  const activeCount = employees.filter(e => e.jobStatus !== 'Terminated').length;

  return (
    <div>
      <div className="pg-head">
        <div><div className="pg-greet">Employees</div><div className="pg-sub">Manage all employees in your organization · {activeCount} active</div></div>
        <button className="btn btn-primary" onClick={() => navigate('/employees/add')}><Plus size={13} /> Add Employee</button>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)' }} />
            <input className="input" style={{ paddingLeft: 32 }} placeholder="Search by name or ID..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} />
          </div>
          <select className="input select-input" style={{ width: 160 }} value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setPage(0); }}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d}>{d}</option>)}
          </select>
          <select className="input select-input" style={{ width: 140 }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }}>
            <option value="">All Statuses</option>
            {jobStatuses.map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="input select-input" style={{ width: 140 }} value={modeFilter} onChange={e => { setModeFilter(e.target.value); setPage(0); }}>
            <option value="">All Work Modes</option>
            {workModes.map(m => <option key={m}>{m}</option>)}
          </select>
          <label style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', color: 'var(--t3)' }}>
            <input type="checkbox" checked={showTerminated} onChange={e => setShowTerminated(e.target.checked)} />
            Show terminated
          </label>
          {(search || deptFilter || statusFilter || modeFilter) && (
            <button className="btn btn-sm btn-ghost" onClick={clearFilters}>Clear All</button>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {selected.size > 0 && (
        <div className="card" style={{ marginBottom: 12, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--pl)', border: '1px solid var(--p3)' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--p)' }}>{selected.size} selected</span>
          <div style={{ flex: 1 }} />
          <button className="btn btn-sm btn-danger" onClick={() => setTerminateConfirm(true)}><UserX size={12} /> Terminate Selected</button>
        </div>
      )}

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: 36 }}><input type="checkbox" checked={paged.length > 0 && selected.size === paged.length} onChange={selectAll} /></th>
                <th onClick={() => toggleSort('id')} style={{ cursor: 'pointer' }}>Emp ID <SortIcon col="id" /></th>
                <th onClick={() => toggleSort('name')} style={{ cursor: 'pointer' }}>Name <SortIcon col="name" /></th>
                <th onClick={() => toggleSort('department')} style={{ cursor: 'pointer' }}>Department <SortIcon col="department" /></th>
                <th onClick={() => toggleSort('designation')} style={{ cursor: 'pointer' }}>Designation <SortIcon col="designation" /></th>
                <th onClick={() => toggleSort('employmentType')} style={{ cursor: 'pointer' }}>Type <SortIcon col="employmentType" /></th>
                <th onClick={() => toggleSort('jobStatus')} style={{ cursor: 'pointer' }}>Status <SortIcon col="jobStatus" /></th>
                <th>Shift</th>
                <th onClick={() => toggleSort('dateOfJoining')} style={{ cursor: 'pointer' }}>Joined <SortIcon col="dateOfJoining" /></th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: 40, color: 'var(--t3)' }}>No employees match your filters</td></tr>
              ) : paged.map(e => (
                <tr key={e.id} style={{ ...(selected.has(e.id) ? { background: 'var(--pl)' } : {}), ...(e.jobStatus === 'Terminated' ? { opacity: 0.5 } : {}) }}>
                  <td><input type="checkbox" checked={selected.has(e.id)} onChange={() => toggleSelect(e.id)} /></td>
                  <td className="mono">{e.id}</td>
                  <td style={{ fontWeight: 600 }}>
                    <div className="table-avatar-cell">
                      <div className="table-avatar table-avatar-small">{e.avatar || getInitials(e.name)}</div>
                      <div>{e.name}</div>
                    </div>
                  </td>
                  <td>{e.department}</td>
                  <td>{e.designation}</td>
                  <td>{e.employmentType}</td>
                  <td><span className={`pill ${getStatusColor(e.jobStatus)}`}>{e.jobStatus}</span></td>
                  <td style={{ fontSize: 11.5 }}>{e.shift}</td>
                  <td className="mono">{e.dateOfJoining}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="ico-btn" style={{ width: 28, height: 28 }} onClick={() => navigate(`/employees/${e.id}`)}><Eye size={13} /></button>
                      <button className="ico-btn" style={{ width: 28, height: 28 }} onClick={() => navigate('/employees/add')}><Pencil size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, fontSize: 12, color: 'var(--t3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Showing {filtered.length === 0 ? 0 : page * perPage + 1}–{Math.min((page + 1) * perPage, filtered.length)} of {filtered.length}</span>
            <select className="input select-input" style={{ width: 70, padding: '4px 6px', fontSize: 11 }} value={perPage} onChange={e => { setPerPage(+e.target.value); setPage(0); }}>
              {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <span>per page</span>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="btn btn-sm btn-ghost" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
              <button key={i} className={`btn btn-sm ${page === i ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPage(i)}>{i + 1}</button>
            ))}
            <button className="btn btn-sm btn-ghost" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        </div>
      </div>

      <ConfirmDialog open={terminateConfirm} title="Terminate Selected Employees" message={`Are you sure you want to terminate ${selected.size} selected employee(s)? Their status will be set to Terminated and they will be hidden from the active list.`}
        onConfirm={terminateSelected} onCancel={() => setTerminateConfirm(false)} />
    </div>
  );
}











