import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useData } from '../context/DataContext';
import {
  Undo2, Check, Download, Upload, Search, ChevronLeft, ChevronRight, Users
} from 'lucide-react';
import { useToastContext } from '../context/ToastContext';

type AttRow = {
  empId: string; name: string; dept: string; shift: string;
  expectedIn: string; checkIn: string; checkOut: string;
  status: string; lateBy: string; notes: string; acknowledged: boolean;
};

const STATUSES = ['Present', 'Late', 'Absent', 'Half Day', 'On Leave', 'Holiday'];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Present': return { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' };
    case 'Absent': return { bg: '#fef2f2', text: '#991b1b', border: '#fecaca' };
    case 'Late': return { bg: '#fffbeb', text: '#92400e', border: '#fef3c7' };
    case 'Half Day': return { bg: '#f5f3ff', text: '#5b21b6', border: '#ddd6fe' };
    case 'On Leave': return { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' };
    default: return { bg: 'transparent', text: '#64748b', border: '#e2e8f0' };
  }
};

const getInitials = (name: string) => {
  return name.split(' ').filter(Boolean).map(part => part[0]).join('').slice(0, 2).toUpperCase();
};

const shiftCycle = ['Morning', 'Evening', 'Night', 'Off'];
const rosterShiftCycle = ['M', 'E', 'N', 'Off'];
const statusChips = ['All Staff', 'Present', 'Late', 'Absent', 'On Leave'];

export default function Attendance() {
  const { employees, departments, workLocations, shifts } = useData();
  const { showToast } = useToastContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedDate, setSelectedDate] = useState('2026-03-03');
  const [deptFilter, setDeptFilter] = useState('');
  const [locFilter, setLocFilter] = useState('');
  const [shiftFilter, setShiftFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Staff');
  const [searchTerm, setSearchTerm] = useState('');
  const [rows, setRows] = useState<AttRow[]>([]);
  const [undoStack, setUndoStack] = useState<AttRow[][]>([]);
  const [openNoteId, setOpenNoteId] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState('');
  const [roster, setRoster] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getEmployeeAvatar = (id: string) => {
    const emp = employees.find((e: any) => e.id === id);
    return emp?.avatar || getInitials(emp?.name || '');
  };

  const initRows = useCallback((): AttRow[] => {
    return employees.map((e: any) => {
      const s = shifts.find((sh: any) => sh.name === e.shift);
      return {
        empId: e.id, name: e.name, dept: e.department, shift: e.shift || 'Morning',
        expectedIn: s?.start || '09:00', checkIn: '-', checkOut: '-',
        status: '', lateBy: '', notes: '', acknowledged: false,
      };
    });
  }, [employees, shifts]);

  useEffect(() => {
    const savedData = localStorage.getItem('ems_attendanceSheet_' + selectedDate);
    if (savedData) {
      setRows(JSON.parse(savedData));
    } else {
      setRows(initRows());
    }
    setCurrentPage(1);
  }, [selectedDate, initRows]);

  useEffect(() => {
    const mapShift = (value: string) => {
      const lower = value?.toLowerCase() || '';
      if (lower.includes('morning')) return 'M';
      if (lower.includes('evening')) return 'E';
      if (lower.includes('night')) return 'N';
      return 'M';
    };

    setRoster(employees.slice(0, 6).map((e: any) => ({
      empId: e.id,
      name: e.name,
      initials: getInitials(e.name),
      schedule: Array(6).fill(mapShift(e.shift))
    })));
  }, [employees]);

  const updateRowById = (empId: string, field: keyof AttRow, value: any) => {
    setRows(prev => prev.map(r => {
      if (r.empId !== empId) return r;
      const updated = { ...r, [field]: value };
      if (field === 'status' && value === 'Present') {
        updated.checkIn = updated.expectedIn;
        updated.checkOut = updated.expectedIn;
      }
      return updated;
    }));
  };

  const filteredRows = useMemo(() => {
    return rows.filter(r => {
      const emp = employees.find((e: any) => e.id === r.empId);
      if (deptFilter && r.dept !== deptFilter) return false;
      if (locFilter && emp?.workLocation !== locFilter) return false;
      if (shiftFilter && r.shift !== shiftFilter) return false;
      if (searchTerm && !`${r.name} ${r.empId} ${r.dept}`.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (statusFilter !== 'All Staff' && r.status !== statusFilter) return false;
      return true;
    });
  }, [rows, deptFilter, locFilter, shiftFilter, searchTerm, statusFilter, employees]);

  const totalPages = Math.ceil(filteredRows.length / itemsPerPage);
  const paginatedRows = filteredRows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const stats = {
    total: filteredRows.length,
    present: filteredRows.filter(r => r.status === 'Present').length,
    absent: filteredRows.filter(r => r.status === 'Absent').length,
    late: filteredRows.filter(r => r.status === 'Late').length,
    onLeave: filteredRows.filter(r => r.status === 'On Leave').length,
  };

  const penaltyDays = Math.floor(stats.late / 3);
  const penaltyLabel = stats.late > 0 ? `${stats.late} Lates = ${penaltyDays} Day Cut` : 'No penalties yet';
  const bannerMessage = `Live: ${stats.absent} absent today · ${stats.late} late check-ins flagged · ${penaltyDays ? `${penaltyDays} penalty${penaltyDays > 1 ? 's' : ''} pending` : 'No penalty pending'}`;

  const toggleShift = (empId: string) => {
    const current = rows.find(r => r.empId === empId);
    if (!current) return;
    const index = shiftCycle.indexOf(current.shift || 'Morning');
    const next = shiftCycle[(index + 1) % shiftCycle.length];
    updateRowById(empId, 'shift', next);
  };

  const toggleRosterShift = (empId: string, dayIndex: number) => {
    setRoster(prev => prev.map(item => {
      if (item.empId !== empId) return item;
      const current = item.schedule[dayIndex];
      const next = rosterShiftCycle[(rosterShiftCycle.indexOf(current) + 1) % rosterShiftCycle.length] || 'M';
      const schedule = [...item.schedule];
      schedule[dayIndex] = next;
      return { ...item, schedule };
    }));
  };

  const toggleNoteRow = (empId: string, existingNote: string) => {
    setOpenNoteId(prev => prev === empId ? null : empId);
    setNoteValue(existingNote || '');
  };

  const handleSaveNote = () => {
    if (!openNoteId) return;
    updateRowById(openNoteId, 'notes', noteValue);
    setOpenNoteId(null);
    showToast('Note updated');
  };

  const markAllPresent = () => {
    setUndoStack(prev => [...prev, [...rows]]);
    setRows(prev => prev.map(r => {
      const isVisible = filteredRows.some(fr => fr.empId === r.empId);
      if (isVisible && (!r.status || r.status === 'Absent')) {
        return { ...r, status: 'Present', checkIn: r.expectedIn, checkOut: r.expectedIn };
      }
      return r;
    }));
  };

  return (
    <div className="attendance-page">
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".json" onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => setRows(JSON.parse(ev.target?.result as string));
          reader.readAsText(file);
        }
      }} />

      <div className="attendance-header">
        <div>
          <div className="attendance-title">Daily Attendance Grid</div>
          <div className="attendance-sub">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
        </div>
        <div className="attendance-header-actions">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search name, dept, ID..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <button className="btn btn-primary" onClick={() => { setRows(initRows()); showToast('Attendance reset'); }}>Reset</button>
        </div>
      </div>

      <div className="attendance-summary-cards">
        <div className="summary-card summary-card-blue">
          <div className="summary-label">Present</div>
          <div className="summary-value">{stats.present}</div>
        </div>
        <div className="summary-card summary-card-amber">
          <div className="summary-label">Late</div>
          <div className="summary-value">{stats.late}</div>
        </div>
        <div className="summary-card summary-card-red">
          <div className="summary-label">Absent</div>
          <div className="summary-value">{stats.absent}</div>
        </div>
        <div className="summary-card summary-card-teal">
          <div className="summary-label">On Leave</div>
          <div className="summary-value">{stats.onLeave}</div>
        </div>
        <div className="summary-card summary-card-steel">
          <div className="summary-label">Auto Penalties</div>
          <div className="summary-value">{penaltyDays}</div>
          <div className="summary-note">{penaltyLabel}</div>
        </div>
      </div>

      <div className="attendance-banner">
        <span>{bannerMessage}</span>
        <button className="btn btn-sm btn-ghost">Review</button>
      </div>

      <div className="filter-chips">
        {statusChips.map(label => (
          <button
            key={label}
            className={`filter-chip ${statusFilter === label ? 'active' : ''}`}
            onClick={() => { setStatusFilter(label); setCurrentPage(1); }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="card attendance-table-card">
        <div className="attendance-table-actions">
          <div>
            <select className="table-select" value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setCurrentPage(1); }}>
              <option value="">All Departments</option>
              {departments.map((d: any) => <option key={d} value={d}>{d}</option>)}
            </select>
            <select className="table-select" value={locFilter} onChange={e => { setLocFilter(e.target.value); setCurrentPage(1); }}>
              <option value="">All Locations</option>
              {workLocations.map((l: any) => <option key={l} value={l}>{l}</option>)}
            </select>
            <select className="table-select" value={shiftFilter} onChange={e => { setShiftFilter(e.target.value); setCurrentPage(1); }}>
              <option value="">All Shifts</option>
              {shifts.map((s: any) => <option key={s.name} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div className="attendance-actions-right">
            <button className="btn btn-secondary" onClick={markAllPresent}><Check size={14} /> Mark All Present</button>
            <button className="btn btn-secondary" disabled={undoStack.length === 0} onClick={() => { if (undoStack.length) setRows(undoStack.pop()!); }}><Undo2 size={14} /> Undo</button>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={thStyle}>Employee</th>
                <th style={thStyle}>Shift</th>
                <th style={thStyle}>Check In</th>
                <th style={thStyle}>Check Out</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Notes</th>
                <th style={thStyle}>Lates</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--t3)' }}>No attendance records available</td></tr>
              ) : paginatedRows.map((r, i) => {
                const colors = getStatusColor(r.status);
                const lateCount = r.status === 'Late' ? 1 : 0;
                return (
                  <React.Fragment key={r.empId}>
                    <tr>
                      <td>
                        <div className="table-avatar-cell">
                          <div className="table-avatar table-avatar-small">{getEmployeeAvatar(r.empId)}</div>
                          <div>
                            <div style={{ fontWeight: 700 }}>{r.name}</div>
                            <div className="mono" style={{ fontSize: 11, color: 'var(--t3)' }}>{r.empId} · {r.dept}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <button className="shift-chip" onClick={() => toggleShift(r.empId)}>{r.shift}</button>
                      </td>
                      <td><input type="time" className="table-input" value={r.checkIn === '-' ? '' : r.checkIn} onChange={e => updateRowById(r.empId, 'checkIn', e.target.value)} /></td>
                      <td><input type="time" className="table-input" value={r.checkOut === '-' ? '' : r.checkOut} onChange={e => updateRowById(r.empId, 'checkOut', e.target.value)} /></td>
                      <td>
                        <span className={`pill ${r.status === 'Present' ? 'pill-green' : r.status === 'Late' ? 'pill-amber' : r.status === 'Absent' ? 'pill-red' : r.status === 'On Leave' ? 'pill-blue' : 'pill-steel'}`}>{r.status || 'Pending'}</span>
                      </td>
                      <td>
                        <button className="note-button" onClick={() => toggleNoteRow(r.empId, r.notes)}>{r.notes ? r.notes : 'Add note'}</button>
                      </td>
                      <td className="mono">{lateCount}</td>
                    </tr>
                    {openNoteId === r.empId && (
                      <tr className="note-row">
                        <td colSpan={7}>
                          <div className="note-panel">
                            <textarea className="input" rows={3} value={noteValue} onChange={e => setNoteValue(e.target.value)} placeholder="Enter note or reason..." />
                            <div className="note-actions">
                              <button className="btn btn-secondary" onClick={() => setOpenNoteId(null)}>Cancel</button>
                              <button className="btn btn-primary" onClick={handleSaveNote}>Save Note</button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="attendance-pagination">
          <div style={{ color: 'var(--t3)' }}>Showing {paginatedRows.length} of {filteredRows.length}</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="btn btn-sm btn-ghost" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>← Prev</button>
            <span style={{ fontSize: 12, fontWeight: 600 }}>Page {currentPage} of {totalPages || 1}</span>
            <button className="btn btn-sm btn-ghost" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)}>Next →</button>
          </div>
        </div>
      </div>

      <div className="card roster-card">
        <div className="ch" style={{ marginBottom: 16 }}>
          <div className="ct"><div className="ct-ico blue"><Users size={13} /></div>Duty Roster — 1st Week</div>
          <div style={{ fontSize: 12, color: 'var(--t3)' }}>Date-mapped shifts · click to cycle M/E/N/Off</div>
        </div>
        <div className="roster-grid">
          <div className="roster-header">Staff</div>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="roster-header">{day}</div>
          ))}
          {roster.map(item => (
            <React.Fragment key={item.empId}>
              <div className="roster-person">
                <div className="table-avatar table-avatar-small">{item.initials}</div>
                <div>
                  <div style={{ fontWeight: 600 }}>{item.name.split(' ')[0]}</div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--t3)' }}>{item.empId}</div>
                </div>
              </div>
              {item.schedule.map((value: string, index: number) => (
                <button
                  key={`${item.empId}-${index}`}
                  className={`roster-chip ${value === 'M' ? 'roster-chip-m' : value === 'E' ? 'roster-chip-e' : value === 'N' ? 'roster-chip-n' : 'roster-chip-off'}`}
                  onClick={() => toggleRosterShift(item.empId, index)}
                >
                  {value}
                </button>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = { padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' };