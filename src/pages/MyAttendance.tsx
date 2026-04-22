import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { getStatusColor } from '../data/dummyData';
import Modal from '../components/Modal';
import { useToastContext } from '../contexts/ToastContext';

export default function MyAttendance() {
  const { attendanceData } = useData();
  const empAtt = attendanceData.filter((a: any) => a.empId === 'EMP001');
  const [monthFilter, setMonthFilter] = useState('March');
  const [regModal, setRegModal] = useState(false);
  const [regDate, setRegDate] = useState('');
  const [regReason, setRegReason] = useState('');
  const [regIn, setRegIn] = useState('');
  const [regOut, setRegOut] = useState('');
  const { showToast } = useToastContext();

  const present = empAtt.filter((a: any) => a.status === 'Present').length;
  const absent = empAtt.filter((a: any) => a.status === 'Absent').length;
  const late = empAtt.filter((a: any) => a.status === 'Late').length;

  const submitReg = () => {
    if (!regDate || !regReason) { showToast('Please fill all fields', 'error'); return; }
    showToast('Regularization request submitted');
    setRegModal(false); setRegDate(''); setRegReason(''); setRegIn(''); setRegOut('');
  };

  return (
    <div>
      <div className="pg-head">
        <div><div className="pg-greet">My Attendance</div><div className="pg-sub">View your attendance history</div></div>
        <button className="btn btn-secondary" onClick={() => setRegModal(true)}>Request Correction</button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div className="card" style={{ padding: '12px 16px', textAlign: 'center' }}>
          <div className="mono" style={{ fontSize: 24, fontWeight: 800, color: 'var(--green)' }}>{present}</div>
          <div style={{ fontSize: 11, color: 'var(--t3)' }}>Present Days</div>
          <div style={{ fontSize: 9, color: 'var(--green)', marginTop: 4 }}><TrendingUp size={10} style={{ verticalAlign: 'middle' }} /> +2 vs last month</div>
        </div>
        <div className="card" style={{ padding: '12px 16px', textAlign: 'center' }}>
          <div className="mono" style={{ fontSize: 24, fontWeight: 800, color: 'var(--red)' }}>{absent}</div>
          <div style={{ fontSize: 11, color: 'var(--t3)' }}>Absent Days</div>
          <div style={{ fontSize: 9, color: 'var(--red)', marginTop: 4 }}><TrendingDown size={10} style={{ verticalAlign: 'middle' }} /> -1 vs last month</div>
        </div>
        <div className="card" style={{ padding: '12px 16px', textAlign: 'center' }}>
          <div className="mono" style={{ fontSize: 24, fontWeight: 800, color: 'var(--amber)' }}>{late}</div>
          <div style={{ fontSize: 11, color: 'var(--t3)' }}>Late Arrivals</div>
          <div style={{ fontSize: 9, color: 'var(--amber)', marginTop: 4 }}>Same as last month</div>
        </div>
        <div className="card" style={{ padding: '12px 16px', textAlign: 'center' }}>
          <div className="mono" style={{ fontSize: 24, fontWeight: 800, color: 'var(--teal)' }}>0</div>
          <div style={{ fontSize: 11, color: 'var(--t3)' }}>Overtime Hours</div>
        </div>
      </div>

      <div className="card">
        <div className="ch">
          <div className="ct"><div className="ct-ico blue"><Calendar size={13} /></div>Attendance Details</div>
          <select className="input select-input" style={{ width: 120 }} value={monthFilter} onChange={e => setMonthFilter(e.target.value)}>
            <option>March</option><option>February</option><option>January</option>
          </select>
        </div>
        <table>
          <thead><tr><th>Date</th><th>Day</th><th>Check In</th><th>Check Out</th><th>Status</th><th>Late By</th><th>Remarks</th></tr></thead>
          <tbody>{empAtt.map((a: any, i: number) => (
            <tr key={i} style={a.status === 'Late' ? { background: 'var(--amberl)' } : {}}>
              <td className="mono">{a.date}</td><td>{a.day}</td><td className="mono">{a.checkIn}</td><td className="mono">{a.checkOut}</td>
              <td><span className={`pill ${getStatusColor(a.status)}`}>{a.status}</span></td>
              <td className="mono">{a.lateBy || '-'}</td><td style={{ fontSize: 11, color: 'var(--t3)' }}>{a.notes || '-'}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      <Modal open={regModal} onClose={() => setRegModal(false)} title="Request Attendance Correction" footer={<><button className="btn btn-secondary" onClick={() => setRegModal(false)}>Cancel</button><button className="btn btn-primary" onClick={submitReg}>Submit Request</button></>}>
        <div className="form-group"><label className="form-label">Date</label><input className="input" type="date" value={regDate} onChange={e => setRegDate(e.target.value)} /></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Correct Check-In</label><input className="input mono" type="time" value={regIn} onChange={e => setRegIn(e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Correct Check-Out</label><input className="input mono" type="time" value={regOut} onChange={e => setRegOut(e.target.value)} /></div>
        </div>
        <div className="form-group"><label className="form-label">Reason *</label><textarea className="input" rows={3} value={regReason} onChange={e => setRegReason(e.target.value)} placeholder="Explain why correction is needed..." /></div>
      </Modal>
    </div>
  );
}
