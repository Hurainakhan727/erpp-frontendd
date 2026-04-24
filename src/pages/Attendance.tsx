import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import {
  Save, Undo2, Check, Download, Upload, Search
} from 'lucide-react';
import { useToastContext } from '../context/ToastContext';

type AttRow = {
  empId: string; name: string; dept: string; shift: string;
  expectedIn: string; checkIn: string; checkOut: string;
  status: string; lateBy: string; notes: string; acknowledged: boolean;
};

const STATUSES = ['Present', 'Late', 'Absent', 'Half Day', 'On Leave', 'Holiday'];

// Colors logic
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Present': return { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' }; // Green
    case 'Absent': return { bg: '#fef2f2', text: '#991b1b', border: '#fecaca' };  // Red
    case 'Late': return { bg: '#fffbeb', text: '#92400e', border: '#fef3c7' };    // Yellow/Amber
    case 'Half Day': return { bg: '#f5f3ff', text: '#5b21b6', border: '#ddd6fe' };
    case 'On Leave': return { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' };
    default: return { bg: 'transparent', text: '#64748b', border: '#e2e8f0' };
  }
};

export default function Attendance() {
  const { employees, departments, workLocations, shifts } = useData();
  const { showToast } = useToastContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState('daily');
  const [selectedDate, setSelectedDate] = useState('2026-03-03');
  const [deptFilter, setDeptFilter] = useState('');
  const [locFilter, setLocFilter] = useState('');
  const [shiftFilter, setShiftFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [rows, setRows] = useState<AttRow[]>([]);
  const [undoStack, setUndoStack] = useState<AttRow[][]>([]);

  const initRows = useCallback((): AttRow[] => {
    return employees.map((e: any) => {
      const s = shifts.find((sh: any) => sh.name === e.shift);
      return {
        empId: e.id, name: e.name, dept: e.department, shift: e.shift,
        expectedIn: s?.start || '09:00', checkIn: '-', checkOut: '-',
        status: '', lateBy: '', notes: '', acknowledged: false,
      };
    });
  }, [employees, shifts]);

  useEffect(() => {
    const savedData = localStorage.getItem('ems_attendanceSheet_' + selectedDate);
    if (savedData) { setRows(JSON.parse(savedData)); } 
    else { setRows(initRows()); }
  }, [selectedDate, initRows]);

  const filteredRows = rows.filter(r => {
    const emp = employees.find((e: any) => e.id === r.empId);
    if (deptFilter && r.dept !== deptFilter) return false;
    if (locFilter && emp?.workLocation !== locFilter) return false;
    if (shiftFilter && r.shift !== shiftFilter) return false;
    if (searchTerm && !r.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Summary Logic
  const stats = {
    total: filteredRows.length,
    present: filteredRows.filter(r => r.status === 'Present').length,
    absent: filteredRows.filter(r => r.status === 'Absent').length,
    late: filteredRows.filter(r => r.status === 'Late').length,
    others: filteredRows.filter(r => r.status && !['Present', 'Absent', 'Late'].includes(r.status)).length
  };

  const updateRow = (idx: number, field: keyof AttRow, value: any) => {
    setRows(prev => {
      const next = [...prev];
      const realIdx = rows.indexOf(filteredRows[idx]);
      next[realIdx] = { ...next[realIdx], [field]: value };
      if (field === 'status' && value === 'Present') {
        next[realIdx].checkIn = next[realIdx].expectedIn;
        next[realIdx].checkOut = next[realIdx].expectedIn; 
      }
      return next;
    });
  };

  const markAllPresent = () => {
    setUndoStack(prev => [...prev, [...rows]]);
    setRows(rows.map(r => {
      const isVisible = filteredRows.some(fr => fr.empId === r.empId);
      if (isVisible && (!r.status || r.status === 'Absent')) {
        return { ...r, status: 'Present', checkIn: r.expectedIn, checkOut: r.expectedIn };
      }
      return r;
    }));
  };

  return (
    <div className="attendance-page" style={{ padding: '20px', background: '#f8fafc', minHeight: '100vh' }}>
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".json" onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setRows(JSON.parse(ev.target?.result as string));
            reader.readAsText(file);
          }
      }} />
      
      <div className="pg-head" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Attendance</h1>
        <div style={{ position: 'relative', width: '350px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
          <input type="text" className="table-input" placeholder="Search..." style={{ paddingLeft: '40px', width: '100%' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
             <button className="btn-ghost" onClick={() => showToast("Exporting...")}><Download size={14} /> Export</button>
             <button className="btn-ghost" onClick={() => fileInputRef.current?.click()}><Upload size={14} /> Import</button>
        </div>
      </div>

      <div className="tabs" style={{ display: 'flex', gap: '25px', borderBottom: '1px solid #e2e8f0' }}>
        <button className={`tab-link ${tab === 'daily' ? 'active' : ''}`} onClick={() => setTab('daily')}>Daily Sheet</button>
        <button className={`tab-link ${tab === 'monthly' ? 'active' : ''}`} onClick={() => setTab('monthly')}>Monthly Report</button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <div className="filter-card" style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input type={tab === 'daily' ? "date" : "month"} className="table-input" value={selectedDate.slice(0, tab === 'daily' ? 10 : 7)} onChange={e => setSelectedDate(e.target.value)} />
          <select className="table-select" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map((d: any) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="table-select" value={locFilter} onChange={e => setLocFilter(e.target.value)}>
            <option value="">All Locations</option>
            {workLocations.map((l: any) => <option key={l} value={l}>{l}</option>)}
          </select>
          <select className="table-select" value={shiftFilter} onChange={e => setShiftFilter(e.target.value)}>
            <option value="">All Shifts</option>
            {shifts.map((s: any) => <option key={s.name} value={s.name}>{s.name}</option>)}
          </select>
          <div style={{ flex: 1 }} />
          {tab === 'daily' && (
            <button className="btn-primary" onClick={() => { localStorage.setItem('ems_attendanceSheet_' + selectedDate, JSON.stringify(rows)); showToast("Saved!"); }} style={{ background: '#2563eb', color: '#fff', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>Save Changes</button>
          )}
        </div>

        {tab === 'daily' && (
          <>
            {/* Daily Summary Row */}
            <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
              <div className="stat-badge" style={{ color: '#166534', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>Present: <b>{stats.present}</b></div>
              <div className="stat-badge" style={{ color: '#991b1b', background: '#fef2f2', border: '1px solid #fecaca' }}>Absent: <b>{stats.absent}</b></div>
              <div className="stat-badge" style={{ color: '#92400e', background: '#fffbeb', border: '1px solid #fef3c7' }}>Late: <b>{stats.late}</b></div>
              <div className="stat-badge" style={{ color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0' }}>Total: <b>{stats.total}</b></div>
            </div>

            <div className="actions-row" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button className="btn-action" onClick={markAllPresent}><Check size={14} /> Mark All Present</button>
              <button className="btn-action" onClick={() => { if(undoStack.length) setRows(undoStack.pop()!) }} disabled={undoStack.length === 0}><Undo2 size={14} /> Undo</button>
            </div>
          </>
        )}

        <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', marginTop: '15px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8fafc' }}>
              {tab === 'daily' ? (
                <tr>
                  <th style={thStyle}>EMP ID</th>
                  <th style={thStyle}>NAME</th>
                  <th style={thStyle}>DEPARTMENT</th>
                  <th style={thStyle}>SHIFT</th>
                  <th style={thStyle}>CHECK IN</th>
                  <th style={thStyle}>CHECK OUT</th>
                  <th style={thStyle}>STATUS</th>
                </tr>
              ) : (
                <tr>
                  <th style={thStyle}>EMP ID</th>
                  <th style={thStyle}>NAME</th>
                  <th style={thStyle}>TOTAL DAYS</th>
                  <th style={thStyle}>PRESENT</th>
                  <th style={thStyle}>ABSENT</th>
                  <th style={thStyle}>LATE</th>
                  <th style={thStyle}>LEAVES</th>
                </tr>
              )}
            </thead>
            <tbody>
              {filteredRows.map((r, i) => {
                const colors = getStatusColor(r.status);
                return (
                  <tr key={r.empId} style={{ borderTop: '1px solid #f1f5f9', backgroundColor: tab === 'daily' ? colors.bg : 'transparent' }}>
                    {tab === 'daily' ? (
                      <>
                        <td style={{ padding: '12px', fontSize: '12px' }}>{r.empId}</td>
                        <td style={{ padding: '12px', fontWeight: '600' }}>{r.name}</td>
                        <td style={{ padding: '12px', fontSize: '12px' }}>{r.dept}</td>
                        <td style={{ padding: '12px', fontSize: '12px' }}>{r.shift}</td>
                        <td style={{ padding: '12px' }}><input type="time" className="table-input" value={r.checkIn === '-' ? '' : r.checkIn} onChange={e => updateRow(i, 'checkIn', e.target.value)} /></td>
                        <td style={{ padding: '12px' }}><input type="time" className="table-input" value={r.checkOut === '-' ? '' : r.checkOut} onChange={e => updateRow(i, 'checkOut', e.target.value)} /></td>
                        <td style={{ padding: '12px' }}>
                          <select 
                            className="table-select" 
                            style={{ backgroundColor: colors.bg, color: colors.text, borderColor: colors.border, fontWeight: '600' }}
                            value={r.status} 
                            onChange={e => updateRow(i, 'status', e.target.value)}
                          >
                            <option value="" style={{color: '#64748b'}}>— Select —</option>
                            {STATUSES.map(s => <option key={s} value={s} style={{backgroundColor: '#fff', color: '#000'}}>{s}</option>)}
                          </select>
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ padding: '12px', fontSize: '12px' }}>{r.empId}</td>
                        <td style={{ padding: '12px', fontWeight: '600' }}>{r.name}</td>
                        <td style={{ padding: '12px', fontSize: '12px' }}>30</td>
                        <td style={{ padding: '12px', fontSize: '12px', color: '#10b981' }}>22</td>
                        <td style={{ padding: '12px', fontSize: '12px', color: '#ef4444' }}>2</td>
                        <td style={{ padding: '12px', fontSize: '12px', color: '#f59e0b' }}>4</td>
                        <td style={{ padding: '12px', fontSize: '12px', color: '#6366f1' }}>2</td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .tab-link { padding: 10px 5px; border: none; background: none; font-size: 14px; color: #64748b; cursor: pointer; position: relative; }
        .tab-link.active { color: #2563eb; font-weight: 600; }
        .tab-link.active::after { content: ''; position: absolute; bottom: -1px; left: 0; width: 100%; height: 2px; background: #2563eb; }
        .btn-action { display: flex; align-items: center; gap: 6px; padding: 7px 14px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 12px; cursor: pointer; }
        .btn-ghost { background: transparent; border: none; color: #64748b; padding: 6px 10px; cursor: pointer; display: flex; gap: 5px; align-items: center; font-size: 13px; }
        .table-input, .table-select { padding: 6px 8px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 11px; outline: none; }
        .stat-badge { padding: 6px 15px; borderRadius: 20px; font-size: 12px; display: flex; gap: 5px; border-radius: 20px; }
      `}</style>
    </div>
  );
}

const thStyle: React.CSSProperties = { padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' };