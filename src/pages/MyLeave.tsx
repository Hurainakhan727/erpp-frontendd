import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { getStatusColor } from '../data/dummyData';
import { Plus, CalendarDays } from 'lucide-react';
import Modal from '../components/Modal';
import { useToastContext } from '../contexts/ToastContext';

export default function MyLeave() {
  const { leaveRequests, setLeaveRequests } = useData();
  const myLeaves = leaveRequests.filter((l: any) => l.empId === 'EMP001');
  const { showToast } = useToastContext();
  const [modal, setModal] = useState(false);
  const [leaveType, setLeaveType] = useState('Annual');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');

  const balances = [
    { type: 'Annual', remaining: 7, total: 12, color: 'var(--p)' },
    { type: 'Casual', remaining: 10, total: 12, color: 'var(--green)' },
    { type: 'Medical', remaining: 8, total: 8, color: 'var(--teal)' },
  ];

  const calcDays = () => {
    if (!fromDate || !toDate) return 0;
    return Math.max(0, Math.round((new Date(toDate).getTime() - new Date(fromDate).getTime()) / 86400000) + 1);
  };
  const days = calcDays();
  const bal = balances.find(b => b.type === leaveType);
  const over = bal && days > bal.remaining;

  const submit = () => {
    if (!fromDate || !toDate || !reason) { showToast('Fill all fields', 'error'); return; }
    if (over) { showToast('Exceeds balance', 'error'); return; }
    setLeaveRequests(prev => [{
      id: 'LR' + String(prev.length + 1).padStart(3, '0'),
      empId: 'EMP001', empName: 'Ahmed Ali', leaveType,
      from: fromDate, to: toDate, days, reason,
      appliedOn: new Date().toISOString().split('T')[0], status: 'Pending',
    }, ...prev]);
    showToast('Leave submitted'); setModal(false); setFromDate(''); setToDate(''); setReason('');
  };

  return (
    <div>
      <div className="pg-head">
        <div><div className="pg-greet">My Leave</div><div className="pg-sub">View and apply for leave</div></div>
        <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={13} /> Apply for Leave</button>
      </div>

      {/* Balance cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
        {balances.map((b, i) => (
          <div key={i} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 4 }}>{b.type} Leave</div>
            <div className="mono" style={{ fontSize: 22, fontWeight: 800, color: b.color }}>{b.remaining}<span style={{ fontSize: 13, color: 'var(--t3)' }}> / {b.total}</span></div>
            <div className="progress-bar" style={{ marginTop: 8 }}><div className="progress-fill" style={{ width: `${(b.remaining / b.total) * 100}%`, background: b.color }} /></div>
            {b.remaining < 3 && <div style={{ fontSize: 9, color: 'var(--red)', marginTop: 4 }}>⚠ Low balance</div>}
          </div>
        ))}
      </div>

      <div className="card">
        {myLeaves.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--t3)' }}><CalendarDays size={32} style={{ margin: '0 auto 8px', opacity: .4 }} /><p>No leave requests yet</p></div>
        ) : (
          <table>
            <thead><tr><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Applied</th><th>Status</th></tr></thead>
            <tbody>{myLeaves.map((l: any, i: number) => <tr key={i}><td>{l.leaveType}</td><td className="mono">{l.from}</td><td className="mono">{l.to}</td><td className="mono">{l.days}</td><td>{l.reason}</td><td className="mono">{l.appliedOn}</td><td><span className={`pill ${getStatusColor(l.status)}`}>{l.status}</span></td></tr>)}</tbody>
          </table>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Apply for Leave" footer={<><button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-primary" onClick={submit} disabled={!!over}>Submit</button></>}>
        <div style={{ marginBottom: 16 }}>
          {balances.map((b, i) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12 }}><span>{b.type}</span><span className="mono" style={{ color: b.color, fontWeight: 600 }}>{b.remaining} remaining</span></div>)}
        </div>
        <div className="form-group"><label className="form-label">Leave Type</label><select className="input select-input" value={leaveType} onChange={e => setLeaveType(e.target.value)}>{balances.map(b => <option key={b.type} value={b.type}>{b.type} ({b.remaining} remaining)</option>)}</select></div>
        <div className="form-row"><div className="form-group"><label className="form-label">From</label><input className="input" type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} /></div><div className="form-group"><label className="form-label">To</label><input className="input" type="date" value={toDate} onChange={e => setToDate(e.target.value)} /></div></div>
        {days > 0 && <div style={{ fontSize: 12, marginBottom: 8, color: over ? 'var(--red)' : 'var(--p)', fontWeight: 600 }}>{days} day(s) requested{over ? ` — exceeds balance of ${bal?.remaining}` : ` — ${(bal?.remaining || 0) - days} will remain`}</div>}
        <div className="form-group"><label className="form-label">Reason *</label><textarea className="input" rows={3} value={reason} onChange={e => setReason(e.target.value)} /></div>
      </Modal>
    </div>
  );
}
