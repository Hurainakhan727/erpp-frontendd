import React, { useState, useCallback, useEffect, useRef } from 'react';

import { useData } from '../context/DataContext';

import {

  Save, Copy, Undo2, Check, Table as TableIcon,

  Calendar as CalendarIcon, Download, Upload, Filter, Search

} from 'lucide-react';

import { useToastContext } from '../context/ToastContext';



type AttRow = {

  empId: string;

  name: string;

  dept: string;

  shift: string;

  expectedIn: string;

  checkIn: string;

  checkOut: string;

  status: string;

  lateBy: string;

  notes: string;

  acknowledged: boolean;

};



const STATUSES = ['Present', 'Late', 'Absent', 'Half Day', 'On Leave', 'Holiday'];



// --- Helper Functions (No Change) ---

function calcLateBy(expectedIn: string, checkIn: string, lateAfter: number): string {

  if (!checkIn || checkIn === '-' || checkIn === '') return '';

  const [eh, em] = expectedIn.split(':').map(Number);

  const [ch, cm] = checkIn.split(':').map(Number);

  const diff = (ch * 60 + cm) - (eh * 60 + em);

  if (diff > lateAfter) return `${diff} min`;

  return '';

}



function autoStatus(expectedIn: string, checkIn: string, lateAfter: number, currentStatus: string): string {

  if (!checkIn || checkIn === '-' || checkIn === '') return currentStatus;

  const late = calcLateBy(expectedIn, checkIn, lateAfter);

  if (late && !['Absent', 'On Leave', 'Holiday'].includes(currentStatus)) return 'Late';

  return currentStatus === '' ? 'Present' : currentStatus;

}



export default function Attendance() {

  const { employees, departments, workLocations, shifts } = useData();

  const { showToast } = useToastContext();

  const fileInputRef = useRef<HTMLInputElement>(null);

 

  const [tab, setTab] = useState('daily');

  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');

  const [selectedDate, setSelectedDate] = useState('2026-03-03');

  const [deptFilter, setDeptFilter] = useState('');

  const [locFilter, setLocFilter] = useState('');

  const [shiftFilter, setShiftFilter] = useState('');

  const [searchTerm, setSearchTerm] = useState('');

 

  const [rows, setRows] = useState<AttRow[]>([]);

  const [undoStack, setUndoStack] = useState<AttRow[][]>([]);



  // 1. Memoized rows (No Change)

  const initRows = useCallback((): AttRow[] => {

    return employees.map((e: any) => {

      const s = shifts.find((sh: any) => sh.name === e.shift);

      return {

        empId: e.id,

        name: e.name,

        dept: e.department,

        shift: e.shift,

        expectedIn: s?.start || '09:00',

        checkIn: '-',

        checkOut: '-',

        status: '',

        lateBy: '',

        notes: '',

        acknowledged: false,

      };

    });

  }, [employees, shifts]);



  // 2. Load Data (No Change)

  useEffect(() => {

    const savedData = localStorage.getItem('ems_attendanceSheet_' + selectedDate);

    if (savedData) {

      setRows(JSON.parse(savedData));

    } else {

      setRows(initRows());

    }

    setUndoStack([]);

  }, [selectedDate, initRows]);



  // 3. Filter Logic (Same logic)

  const filteredRows = rows.filter(r => {

    const emp = employees.find((e: any) => e.id === r.empId);

    if (deptFilter && r.dept !== deptFilter) return false;

    if (locFilter && emp?.workLocation !== locFilter) return false;

    if (shiftFilter && r.shift !== shiftFilter) return false;

    if (searchTerm && !r.name.toLowerCase().includes(searchTerm.toLowerCase()) && !r.empId.toLowerCase().includes(searchTerm.toLowerCase())) return false;

    return true;

  });



  // 4. Summary (No Change)

  const summary = {

    Present: filteredRows.filter(r => r.status === 'Present').length,

    Absent: filteredRows.filter(r => r.status === 'Absent').length,

    Late: filteredRows.filter(r => r.status === 'Late').length,

    'On Leave': filteredRows.filter(r => r.status === 'On Leave').length,

    Holiday: filteredRows.filter(r => r.status === 'Holiday').length,

    Unmarked: filteredRows.filter(r => !r.status || r.status === '').length,

  };



  // 5. Update Row (No Change)

  const updateRow = (idx: number, field: keyof AttRow, value: any) => {

    setRows(prev => {

      const next = [...prev];

      const realIdx = rows.indexOf(filteredRows[idx]);

      next[realIdx] = { ...next[realIdx], [field]: value };

      if (field === 'status' && value === 'Present') {

        next[realIdx].checkIn = next[realIdx].expectedIn;

        next[realIdx].checkOut = '18:00';

      }

      if (field === 'checkIn') {

        const s = shifts.find((sh: any) => sh.name === next[realIdx].shift);

        const lateThreshold = s?.lateAfter || 15;

        next[realIdx].lateBy = calcLateBy(next[realIdx].expectedIn, value as string, lateThreshold);

        next[realIdx].status = autoStatus(next[realIdx].expectedIn, value as string, lateThreshold, next[realIdx].status);

      }

      return next;

    });

  };



  // 6. Action Functions (No logic change)

  const handleImportClick = () => fileInputRef.current?.click();

 

  const handleExport = () => {

    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;

    link.download = `Attendance_${selectedDate}.json`;

    link.click();

    showToast("Exporting...");

  };



  const saveAll = () => {

    localStorage.setItem('ems_attendanceSheet_' + selectedDate, JSON.stringify(rows));

    showToast(`Attendance saved!`);

  };



  const markAllPresent = () => {

    setUndoStack(prev => [...prev, [...rows]]);

    const updatedRows = rows.map(r => {

      const isVisible = filteredRows.some(fr => fr.empId === r.empId);

      if (isVisible && (!r.status || r.status === 'Absent')) {

        return { ...r, status: 'Present', checkIn: r.expectedIn, checkOut: '18:00' };

      }

      return r;

    });

    setRows(updatedRows);

  };



  const undo = () => {

    if (undoStack.length > 0) {

      setRows(undoStack[undoStack.length - 1]);

      setUndoStack(p => p.slice(0, -1));

    }

  };



  return (

    <div className="attendance-page" style={{ padding: '20px', background: '#f8fafc', minHeight: '100vh' }}>

      <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={() => {}} />



      {/* HEADER: Yellow Banner Removed, Search Activated */}

      <div className="pg-head" style={{ marginBottom: '20px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

          <div style={{ flexShrink: 0 }}>

            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Attendance</h1>

            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Track and manage employee attendance</p>

          </div>



          {/* ACTIVE SEARCH: Header ke center mein */}

          <div style={{ position: 'relative', width: '400px', margin: '0 20px' }}>

            <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />

            <input

              type="text"

              className="table-input"

              placeholder="Search employees, records, reports..."

              style={{ paddingLeft: '40px', width: '100%', height: '36px' }}

              value={searchTerm}

              onChange={(e) => setSearchTerm(e.target.value)}

            />

          </div>



          <div className="header-actions" style={{ display: 'flex', gap: '10px' }}>

             <button className="btn btn-ghost" onClick={handleExport} style={{ fontSize: '12px' }}><Download size={14} /> Export</button>

             <button className="btn btn-ghost" onClick={handleImportClick} style={{ fontSize: '12px' }}><Upload size={14} /> Import</button>

          </div>

        </div>

      </div>



      {/* TABS (Same) */}

      <div className="tabs" style={{ marginTop: '20px', display: 'flex', gap: '25px', borderBottom: '1px solid #e2e8f0' }}>

        <button className={`tab-link ${tab === 'daily' ? 'active' : ''}`} onClick={() => setTab('daily')}>Daily Sheet</button>

        <button className={`tab-link ${tab === 'monthly' ? 'active' : ''}`} onClick={() => setTab('monthly')}>Monthly Report</button>

      </div>



      {tab === 'daily' && (

        <div className="tab-content" style={{ marginTop: '20px' }}>

         

          {/* FILTERS (Same) */}

          <div className="filter-card" style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>

            <div style={{ position: 'relative' }}>

              <input type="date" className="table-input" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ width: '160px', paddingLeft: '35px' }} />

              <CalendarIcon size={14} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />

            </div>



            <select className="table-select" value={deptFilter} onChange={e => setDeptFilter(e.target.value)} style={{ width: '160px' }}>

              <option value="">All Departments</option>

              {departments.map((d: string) => <option key={d} value={d}>{d}</option>)}

            </select>



            <select className="table-select" value={locFilter} onChange={e => setLocFilter(e.target.value)} style={{ width: '150px' }}>

              <option value="">All Locations</option>

              {workLocations.map((l: string) => <option key={l} value={l}>{l}</option>)}

            </select>



            <select className="table-select" value={shiftFilter} onChange={e => setShiftFilter(e.target.value)} style={{ width: '140px' }}>

              <option value="">All Shifts</option>

              {shifts.map((s: any) => <option key={s.name} value={s.name}>{s.name}</option>)}

            </select>



            <div style={{ flex: 1 }} />



            <div className="view-toggle" style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>

              <button onClick={() => setViewMode('table')} className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}><TableIcon size={14} /> Table</button>

              <button onClick={() => setViewMode('calendar')} className={`toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}><CalendarIcon size={14} /> Calendar</button>

            </div>



            <button className="btn btn-primary" onClick={saveAll} style={{ background: '#2563eb', color: '#fff', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>

              <Save size={16} /> Save All Changes

            </button>

          </div>



          {/* BULK ACTIONS (Same) */}

          <div className="actions-row" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>

            <button className="btn-action" onClick={markAllPresent}><Check size={14} /> Mark All Present</button>

            <button className="btn-action"><Copy size={14} /> Copy Previous Day</button>

            <button className="btn-action" onClick={undo} disabled={undoStack.length === 0}><Undo2 size={14} /> Undo</button>

          </div>



          {/* SUMMARY PILLS (Same) */}

          <div className="summary-pills" style={{ display: 'flex', gap: '18px', marginTop: '15px', marginBottom: '15px' }}>

            <span className="pill" style={{ color: '#10b981' }}>Present: <b>{summary.Present}</b></span>

            <span className="pill" style={{ color: '#ef4444' }}>Absent: <b>{summary.Absent}</b></span>

            <span className="pill" style={{ color: '#f59e0b' }}>Late: <b>{summary.Late}</b></span>

            <span className="pill" style={{ color: '#3b82f6' }}>On Leave: <b>{summary['On Leave']}</b></span>

            <span className="pill" style={{ color: '#64748b' }}>Holiday: <b>{summary.Holiday}</b></span>

            <span className="pill" style={{ color: '#94a3b8' }}>Unmarked: <b>{summary.Unmarked}</b></span>

          </div>



          {/* TABLE (Same) */}

          <div className="card" style={{ padding: 0, borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#fff' }}>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>

              <thead style={{ background: '#f8fafc' }}>

                <tr>

                  <th style={thStyle}>#</th>

                  <th style={thStyle}>EMPLOYEE</th>

                  <th style={thStyle}>SHIFT</th>

                  <th style={thStyle}>EXPECTED IN</th>

                  <th style={thStyle}>CHECK IN</th>

                  <th style={thStyle}>CHECK OUT</th>

                  <th style={thStyle}>STATUS</th>

                  <th style={thStyle}>LATE BY</th>

                  <th style={thStyle}>NOTES</th>

                  <th style={thStyle}>ACK</th>

                </tr>

              </thead>

              <tbody>

                {filteredRows.map((r, i) => (

                  <tr key={r.empId} style={{ borderTop: '1px solid #f1f5f9' }}>

                    <td style={{ padding: '12px', fontSize: '13px', color: '#94a3b8' }}>{i + 1}</td>

                    <td style={{ padding: '12px' }}>

                      <div style={{ fontWeight: '600', fontSize: '13px', color: '#1e293b' }}>{r.name}</div>

                      <div style={{ fontSize: '11px', color: '#64748b' }}>{r.empId} • {r.dept}</div>

                    </td>

                    <td style={{ padding: '12px', fontSize: '12px' }}>{r.shift}</td>

                    <td style={{ padding: '12px', fontSize: '12px', fontFamily: 'monospace' }}>{r.expectedIn}</td>

                    <td style={{ padding: '12px' }}>

                      <input type="time" className="table-input" value={r.checkIn === '-' ? '' : r.checkIn} onChange={e => updateRow(i, 'checkIn', e.target.value)} />

                    </td>

                    <td style={{ padding: '12px' }}>

                      <input type="time" className="table-input" value={r.checkOut === '-' ? '' : r.checkOut} onChange={e => updateRow(i, 'checkOut', e.target.value)} />

                    </td>

                    <td style={{ padding: '12px' }}>

                      <select className="table-select" value={r.status} onChange={e => updateRow(i, 'status', e.target.value)} style={{ borderLeft: `3px solid ${getStatusBorder(r.status)}` }}>

                        <option value="">— Select —</option>

                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}

                      </select>

                    </td>

                    <td style={{ padding: '12px', color: '#f59e0b', fontSize: '12px', fontWeight: '500' }}>{r.lateBy || '-'}</td>

                    <td style={{ padding: '12px' }}>

                      <input className="table-input" style={{ width: '120px' }} value={r.notes} onChange={e => updateRow(i, 'notes', e.target.value)} placeholder="Add note..." />

                    </td>

                    <td style={{ padding: '12px', textAlign: 'center' }}>

                      <input type="checkbox" checked={r.acknowledged} onChange={e => updateRow(i, 'acknowledged', e.target.checked)} />

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      )}



      {/* Internal Styles (No Change) */}

      <style>{`

        .tab-link { padding: 10px 5px; border: none; background: none; font-size: 14px; color: #64748b; cursor: pointer; position: relative; }

        .tab-link.active { color: #2563eb; font-weight: 600; }

        .tab-link.active::after { content: ''; position: absolute; bottom: -1px; left: 0; width: 100%; height: 2px; background: #2563eb; }

        .btn-action { display: flex; align-items: center; gap: 6px; padding: 7px 14px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 12px; font-weight: 500; color: #475569; cursor: pointer; }

        .btn-action:hover { background: #f8fafc; }

        .toggle-btn { display: flex; align-items: center; gap: 6px; padding: 6px 12px; border: none; border-radius: 6px; font-size: 12px; cursor: pointer; color: #64748b; background: transparent; }

        .toggle-btn.active { background: #fff; color: #1e293b; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }

        .pill { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }

        .table-input { padding: 6px 8px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 12px; outline: none; }

        .table-select { padding: 6px 8px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 12px; background: #fff; cursor: pointer; }

        .btn-ghost { background: transparent; border: 1px solid transparent; color: #64748b; padding: 6px 10px; border-radius: 6px; cursor: pointer; display: flex; gap: 5px; align-items: center; }

        .btn-ghost:hover { background: #f1f5f9; color: #1e293b; }

      `}</style>

    </div>

  );

}



const thStyle: React.CSSProperties = {

  padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em'

};



const getStatusBorder = (status: string) => {

  switch (status) {

    case 'Present': return '#10b981';

    case 'Late': return '#f59e0b';

    case 'Absent': return '#ef4444';

    case 'On Leave': return '#3b82f6';

    default: return '#e2e8f0';

  }

};












