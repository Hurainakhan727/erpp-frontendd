import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { getStatusColor, formatPKR } from '../data/dummyData';
import { Pencil, Trash2, UserX, Plus, ChevronDown, FileText, Download, Printer, Clock, TrendingUp } from 'lucide-react';
import Modal from '../components/Modal';
import DecisionBanner from '../components/DecisionBanner';
import { useToastContext } from '../contexts/ToastContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const deptColors: Record<string, string> = { Engineering: '#1565c0', Marketing: '#e67e22', HR: '#1b7a4e', Sales: '#b71c1c', Finance: '#00695c' };

const activityLog = [
  { action: 'Salary Updated', date: '2026-03-19 09:20', by: 'Super Admin', before: 'PKR 120,000', after: 'PKR 150,000', type: 'UPDATE' },
  { action: 'Leave Approved', date: '2026-03-15 14:30', by: 'Super Admin', before: 'Pending', after: 'Approved', type: 'UPDATE' },
  { action: 'Promoted', date: '2024-01-01 10:00', by: 'Super Admin', before: 'Senior Developer', after: 'Lead Developer', type: 'UPDATE' },
  { action: 'Shift Changed', date: '2023-06-15 11:20', by: 'HR1', before: 'Evening Shift', after: 'Morning Shift', type: 'UPDATE' },
  { action: 'Employee Created', date: '2020-01-15 09:00', by: 'Super Admin', before: '-', after: 'EMP001', type: 'CREATE' },
];

const documents = [
  { name: 'CNIC Copy', category: 'CNIC', file: 'cnic_scan.pdf', uploaded: true },
  { name: 'Profile Photo', category: 'Education', file: 'ahmed_photo.jpg', uploaded: true },
  { name: 'Degree Certificate', category: 'Education', file: 'degree.pdf', uploaded: true },
  { name: 'Employment Contract', category: 'Contract', file: '', uploaded: false },
  { name: 'Electric Bill', category: 'Medical', file: '', uploaded: false },
];

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToastContext();
  const { employees, attendanceData, leaveRequests, payrollData, promotions, penalties, setPromotions, setPenalties } = useData();
  const emp = employees.find(e => e.id === id) || employees[0];
  const [tab, setTab] = useState('personal');
  const [promoModal, setPromoModal] = useState(false);
  const [penaltyModal, setPenaltyModal] = useState(false);
  const [promoDesig, setPromoDesig] = useState('');
  const [promoSalary, setPromoSalary] = useState('');
  const [promoDate, setPromoDate] = useState('');
  const [promoNotes, setPromoNotes] = useState('');
  const [penaltyChecks, setPenaltyChecks] = useState<boolean[]>([false, false, false, false]);
  const [penaltyOtherDesc, setPenaltyOtherDesc] = useState('');
  const [penaltyOtherFine, setPenaltyOtherFine] = useState('');
  const [actionsOpen, setActionsOpen] = useState(false);

  const tabs = ['Personal', 'Job Info', 'Medical', 'Attendance', 'Leave', 'Payslips', 'Promotions', 'Penalties', 'Activity', 'Documents'];
  const empPayroll = payrollData.filter((p: any) => p.empId === emp.id);
  const empPromos = promotions.filter((p: any) => p.empId === emp.id);
  const empPenalties = penalties.filter((p: any) => p.empId === emp.id);
  const empLeaves = leaveRequests.filter((l: any) => l.empId === emp.id);
  const empAttendance = attendanceData.filter((a: any) => a.empId === emp.id);

  const savePromo = () => {
    setPromotions(prev => [...prev, { id: 'PR' + String(prev.length + 1).padStart(3, '0'), empId: emp.id, empName: emp.name, oldDesignation: emp.designation, newDesignation: promoDesig, oldSalary: emp.salary.basic, newSalary: parseInt(promoSalary) || 0, date: promoDate || new Date().toISOString().split('T')[0], approvedBy: 'Super Admin' }]);
    showToast('Promotion recorded'); setPromoModal(false);
    setPromoDesig(''); setPromoSalary(''); setPromoDate(''); setPromoNotes('');
  };

  const savePenalty = () => {
    const penaltyNames = ['Late 3+ days', 'Eating at desk', 'Smoking in office', 'Drinking at desk'];
    const fines = [2000, 500, 1000, 500];
    penaltyChecks.forEach((checked, i) => {
      if (checked) {
        setPenalties(prev => [...prev, { id: 'PN' + String(prev.length + 1).padStart(3, '0'), empId: emp.id, empName: emp.name, type: penaltyNames[i], amount: fines[i], date: new Date().toISOString().split('T')[0], appliedBy: 'HR1', status: 'Active' }]);
      }
    });
    if (penaltyOtherDesc && penaltyOtherFine) {
      setPenalties(prev => [...prev, { id: 'PN' + String(prev.length + 1).padStart(3, '0'), empId: emp.id, empName: emp.name, type: penaltyOtherDesc, amount: parseInt(penaltyOtherFine) || 0, date: new Date().toISOString().split('T')[0], appliedBy: 'HR1', status: 'Active' }]);
    }
    showToast('Penalty applied'); setPenaltyModal(false);
    setPenaltyChecks([false, false, false, false]); setPenaltyOtherDesc(''); setPenaltyOtherFine('');
  };

  // Analytics data
  const attChart = [
    { month: 'Oct', present: 20, absent: 1, late: 2 }, { month: 'Nov', present: 19, absent: 2, late: 1 },
    { month: 'Dec', present: 18, absent: 3, late: 1 }, { month: 'Jan', present: 21, absent: 0, late: 1 },
    { month: 'Feb', present: 20, absent: 1, late: 1 }, { month: 'Mar', present: 18, absent: 1, late: 2 },
  ];
  const salaryProgression = empPromos.map((p: any) => ({ date: p.date.substring(0, 7), salary: p.newSalary }));
  if (salaryProgression.length === 0) salaryProgression.push({ date: emp.dateOfJoining?.substring(0, 7) || '2020-01', salary: emp.salary.basic });

  const InfoGrid = ({ items }: { items: [string, string][] }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
      {items.map(([label, value], i) => (
        <div key={i}><div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>{label}</div><div style={{ fontSize: 13 }}>{value}</div></div>
      ))}
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="card" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div className="avatar avatar-lg" style={{ background: deptColors[emp.department] || 'var(--p)' }}>{emp.avatar}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18, fontWeight: 800 }}>{emp.name}</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--t3)' }}>{emp.id}</span>
            <span className={`pill ${getStatusColor(emp.jobStatus)}`}>{emp.jobStatus}</span>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--t2)', marginTop: 4 }}>{emp.department} · {emp.designation}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, position: 'relative' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/employees/add')}><Pencil size={13} /> Edit</button>
          <div style={{ position: 'relative' }}>
            <button className="btn btn-secondary" onClick={() => setActionsOpen(!actionsOpen)}>Quick Actions <ChevronDown size={12} /></button>
            {actionsOpen && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, background: 'var(--card)', border: '1px solid var(--br)', borderRadius: 'var(--rsm)', boxShadow: 'var(--sh2)', zIndex: 10, minWidth: 180, padding: 4 }}>
                {[
                  { label: 'Generate Payslip', action: () => navigate('/payroll') },
                  { label: 'Mark Attendance', action: () => navigate('/attendance') },
                  { label: 'Apply Leave', action: () => navigate('/leave') },
                  { label: 'Promote Employee', action: () => { setPromoModal(true); setActionsOpen(false); } },
                  { label: 'Add Penalty', action: () => { setPenaltyModal(true); setActionsOpen(false); } },
                ].map((item, i) => (
                  <button key={i} onClick={() => { item.action(); setActionsOpen(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--t2)', borderRadius: 4 }} onMouseOver={e => (e.currentTarget.style.background = 'var(--hover)')} onMouseOut={e => (e.currentTarget.style.background = 'none')}>{item.label}</button>
                ))}
              </div>
            )}
          </div>
          <button className="btn btn-danger"><UserX size={13} /> Deactivate</button>
        </div>
      </div>

      <div className="tabs" style={{ overflowX: 'auto' }}>
        {tabs.map(t => <button key={t} className={`tab ${tab === t.toLowerCase().replace(' ', '-') ? 'active' : ''}`} onClick={() => setTab(t.toLowerCase().replace(' ', '-'))}>{t}</button>)}
      </div>

      {tab === 'personal' && <div className="card"><InfoGrid items={[['Full Name', emp.name], ['Father Name', emp.fatherName], ['Date of Birth', emp.dob], ['CNIC', emp.cnic], ['Gender', emp.gender], ['Contact 1', emp.contact1], ['Contact 2', emp.contact2 || 'N/A'], ['Emergency 1', emp.emergency1], ['Emergency 2', emp.emergency2 || 'N/A'], ['Permanent Address', emp.permanentAddress], ['Bank Name', emp.bankName || 'Not provided'], ['Bank Account', emp.bankAccount || 'Not provided'], ['Payment Mode', emp.paymentMode]]} /></div>}

      {tab === 'job-info' && (
        <div className="card">
          <InfoGrid items={[['Department', emp.department], ['Designation', emp.designation], ['Employment Type', emp.employmentType], ['Job Status', emp.jobStatus], ['Work Mode', emp.workMode], ['Work Location', emp.workLocation], ['Shift', emp.shift], ['Reporting Manager', emp.reportingManager], ['Date of Joining', emp.dateOfJoining], ['Commission Eligible', emp.commissionEligible ? 'Yes' : 'No']]} />
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', marginBottom: 8 }}>Salary Structure</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {[['Basic', emp.salary.basic], ['House Rent', emp.salary.houseRent], ['Medical', emp.salary.medical], ['Conveyance', emp.salary.conveyance], ['Commission', emp.salary.commission]].map(([l, v], i) => (
                <div key={i}><span style={{ fontSize: 11, color: 'var(--t3)' }}>{l}: </span><span className="mono" style={{ fontWeight: 600 }}>{formatPKR(v as number)}</span></div>
              ))}
              <div><span style={{ fontSize: 11, color: 'var(--t3)' }}>Total: </span><span className="mono" style={{ fontWeight: 700, color: 'var(--p)' }}>{formatPKR(emp.salary.basic + emp.salary.houseRent + emp.salary.medical + emp.salary.conveyance + emp.salary.commission)}</span></div>
            </div>
          </div>
        </div>
      )}

      {tab === 'medical' && <div className="card"><InfoGrid items={[['Blood Group', emp.bloodGroup], ['Allergies', emp.allergies], ['Chronic Conditions', emp.chronicConditions], ['Medications', emp.medications]]} /></div>}

      {tab === 'attendance' && (
        <div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            {[{ label: 'Present', val: empAttendance.filter((a: any) => a.status === 'Present').length, cls: 'pill-green' }, { label: 'Absent', val: empAttendance.filter((a: any) => a.status === 'Absent').length, cls: 'pill-red' }, { label: 'Late', val: empAttendance.filter((a: any) => a.status === 'Late').length, cls: 'pill-amber' }].map((s, i) => (
              <span key={i} className={`pill ${s.cls}`}>{s.label}: {s.val}</span>
            ))}
          </div>
          {/* Attendance Chart */}
          <div className="card" style={{ marginBottom: 12 }}>
            <div className="ch"><div className="ct"><div className="ct-ico blue"><TrendingUp size={13} /></div>Attendance (Last 6 Months)</div></div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={attChart}><CartesianGrid strokeDasharray="3 3" stroke="#e8edf8" /><XAxis dataKey="month" tick={{ fontSize: 10, fill: '#7590a8' }} /><YAxis tick={{ fontSize: 10, fill: '#7590a8' }} /><Tooltip /><Bar dataKey="present" fill="#1565c0" radius={[3,3,0,0]} barSize={14} /><Bar dataKey="absent" fill="#e53935" radius={[3,3,0,0]} barSize={14} /><Bar dataKey="late" fill="#e67e22" radius={[3,3,0,0]} barSize={14} /></BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <table><thead><tr><th>Date</th><th>Day</th><th>Check In</th><th>Check Out</th><th>Status</th><th>Late By</th></tr></thead>
            <tbody>{empAttendance.map((a: any, i: number) => <tr key={i}><td className="mono">{a.date}</td><td>{a.day}</td><td className="mono">{a.checkIn}</td><td className="mono">{a.checkOut}</td><td><span className={`pill ${getStatusColor(a.status)}`}>{a.status}</span></td><td className="mono">{a.lateBy || '-'}</td></tr>)}</tbody></table>
          </div>
        </div>
      )}

      {tab === 'leave' && (
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            {[{ type: 'Annual', used: 5, total: 12, color: 'var(--p)' }, { type: 'Casual', used: 2, total: 12, color: 'var(--green)' }, { type: 'Medical', used: 0, total: 8, color: 'var(--teal)' }].map((b, i) => (
              <div key={i} className="card" style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 4 }}>{b.type}</div>
                <div className="mono" style={{ fontSize: 18, fontWeight: 800, color: b.color }}>{b.total - b.used}<span style={{ fontSize: 12, color: 'var(--t3)' }}> / {b.total}</span></div>
                <div className="progress-bar" style={{ marginTop: 6 }}><div className="progress-fill" style={{ width: `${((b.total - b.used) / b.total) * 100}%`, background: b.color }} /></div>
              </div>
            ))}
          </div>
          <div className="card"><table><thead><tr><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th></tr></thead>
          <tbody>{empLeaves.map((l: any, i: number) => <tr key={i}><td>{l.leaveType}</td><td className="mono">{l.from}</td><td className="mono">{l.to}</td><td className="mono">{l.days}</td><td>{l.reason}</td><td><span className={`pill ${getStatusColor(l.status)}`}>{l.status}</span></td></tr>)}</tbody></table></div>
        </div>
      )}

      {tab === 'payslips' && <div className="card"><table><thead><tr><th>Period</th><th>Gross</th><th>Net</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>{empPayroll.map((p: any, i: number) => { const g = p.basic + p.houseRent + p.medical + p.conveyance + p.commission; const d = p.absentDeduction + p.tax + p.loan + p.advance + p.latePenalty + p.otherDeduction; return <tr key={i}><td>March 2026</td><td className="mono">{formatPKR(g)}</td><td className="mono" style={{ fontWeight: 600, color: 'var(--green)' }}>{formatPKR(g - d)}</td><td><span className={`pill ${getStatusColor(p.status)}`}>{p.status}</span></td><td><button className="btn btn-sm btn-ghost">View Payslip</button></td></tr>; })}</tbody></table></div>}

      {tab === 'promotions' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div />
            <button className="btn btn-primary" onClick={() => setPromoModal(true)}><Plus size={13} /> Record Promotion</button>
          </div>
          {/* Salary progression chart */}
          {salaryProgression.length > 1 && (
            <div className="card" style={{ marginBottom: 12 }}>
              <div className="ch"><div className="ct"><div className="ct-ico green"><TrendingUp size={13} /></div>Salary Progression</div></div>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={salaryProgression}><CartesianGrid strokeDasharray="3 3" stroke="#e8edf8" /><XAxis dataKey="date" tick={{ fontSize: 10, fill: '#7590a8' }} /><YAxis tick={{ fontSize: 10, fill: '#7590a8' }} /><Tooltip formatter={(v: number) => formatPKR(v)} /><Line type="monotone" dataKey="salary" stroke="#1b7a4e" strokeWidth={2} dot={{ r: 4, fill: '#1b7a4e' }} /></LineChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="card">
            {empPromos.length === 0 ? <div className="empty-state"><p>No promotions recorded</p></div> :
              empPromos.map((p: any, i: number) => (
                <div key={i} style={{ display: 'flex', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--br2)', alignItems: 'flex-start' }}>
                  <div style={{ width: 3, height: 40, background: 'var(--p)', borderRadius: 2, marginTop: 4 }} />
                  <div>
                    <div className="mono" style={{ fontSize: 10, color: 'var(--t3)' }}>{p.date}</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{p.oldDesignation} → {p.newDesignation}</div>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--t2)' }}>{formatPKR(p.oldSalary)} → {formatPKR(p.newSalary)}</div>
                    <div style={{ fontSize: 10.5, color: 'var(--t3)' }}>Approved by {p.approvedBy}</div>
                  </div>
                </div>
              ))}
          </div>
          <div style={{ marginTop: 12 }}><DecisionBanner>DECISION NEEDED — Promotion Trigger: Manual / Automatic / Both? Confirm in meeting.</DecisionBanner></div>
          <Modal open={promoModal} onClose={() => setPromoModal(false)} title="Record Promotion" footer={<><button className="btn btn-secondary" onClick={() => setPromoModal(false)}>Cancel</button><button className="btn btn-primary" onClick={savePromo}>Save</button></>}>
            <div className="form-group"><label className="form-label">Promotion Date</label><input className="input" type="date" value={promoDate} onChange={e => setPromoDate(e.target.value)} /></div>
            <div className="form-row"><div className="form-group"><label className="form-label">Old Designation</label><input className="input" value={emp.designation} disabled /></div><div className="form-group"><label className="form-label">New Designation</label><input className="input" value={promoDesig} onChange={e => setPromoDesig(e.target.value)} /></div></div>
            <div className="form-row"><div className="form-group"><label className="form-label">Old Salary</label><input className="input mono" value={formatPKR(emp.salary.basic)} disabled /></div><div className="form-group"><label className="form-label">New Salary</label><input className="input mono" value={promoSalary} onChange={e => setPromoSalary(e.target.value)} placeholder="PKR" /></div></div>
            <div className="form-group"><label className="form-label">Notes</label><textarea className="input" rows={2} value={promoNotes} onChange={e => setPromoNotes(e.target.value)} /></div>
          </Modal>
        </div>
      )}

      {tab === 'penalties' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}><button className="btn btn-primary" onClick={() => setPenaltyModal(true)}><Plus size={13} /> Add Penalty</button></div>
          <div className="card">
            {empPenalties.length === 0 ? <div className="empty-state"><p>No penalties recorded</p></div> :
              <table><thead><tr><th>Date</th><th>Type</th><th>Fine</th><th>Applied By</th><th>Status</th></tr></thead>
              <tbody>{empPenalties.map((p: any, i: number) => <tr key={i}><td className="mono">{p.date}</td><td>{p.type}</td><td className="mono">{formatPKR(p.amount)}</td><td>{p.appliedBy}</td><td><span className={`pill ${getStatusColor(p.status)}`}>{p.status}</span></td></tr>)}</tbody></table>}
          </div>
          <div style={{ marginTop: 12 }}><DecisionBanner>DECISION NEEDED — Half-day Penalty Amount formula. Confirm in meeting.</DecisionBanner></div>
          <Modal open={penaltyModal} onClose={() => setPenaltyModal(false)} title="Add Penalty" footer={<><button className="btn btn-secondary" onClick={() => setPenaltyModal(false)}>Cancel</button><button className="btn btn-primary" onClick={savePenalty}>Apply Penalties</button></>}>
            {['Late 3+ days this month — Fine: TBD', 'Eating at desk — Fine: PKR 500', 'Smoking in office — Fine: PKR 1,000', 'Drinking at desk — Fine: PKR 500'].map((p, i) => (
              <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--br2)', fontSize: 12.5, cursor: 'pointer' }}><input type="checkbox" checked={penaltyChecks[i]} onChange={e => { const c = [...penaltyChecks]; c[i] = e.target.checked; setPenaltyChecks(c); }} /><span>{p}</span></label>
            ))}
            <div className="form-group" style={{ marginTop: 12 }}><label className="form-label">Other</label><div className="form-row"><input className="input" placeholder="Description" value={penaltyOtherDesc} onChange={e => setPenaltyOtherDesc(e.target.value)} /><input className="input mono" placeholder="PKR" value={penaltyOtherFine} onChange={e => setPenaltyOtherFine(e.target.value)} /></div></div>
          </Modal>
        </div>
      )}

      {tab === 'activity' && (
        <div className="card">
          <div className="ch"><div className="ct"><div className="ct-ico blue"><Clock size={13} /></div>Activity Log</div></div>
          {activityLog.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: i < activityLog.length - 1 ? '1px solid var(--br2)' : 'none' }}>
              <div style={{ width: 3, background: a.type === 'CREATE' ? 'var(--green)' : 'var(--p)', borderRadius: 2, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{a.action}</span>
                  <span className={`pill ${a.type === 'CREATE' ? 'pill-green' : 'pill-blue'}`}>{a.type}</span>
                </div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--t3)', marginTop: 2 }}>{a.date} · by {a.by}</div>
                {a.before !== '-' && (
                  <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: 11 }}>
                    <span style={{ color: 'var(--t3)' }}>Before: <span style={{ color: 'var(--red)' }}>{a.before}</span></span>
                    <span style={{ color: 'var(--t3)' }}>After: <span style={{ color: 'var(--green)' }}>{a.after}</span></span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'documents' && (
        <div className="card">
          <div className="ch">
            <div className="ct"><div className="ct-ico blue"><FileText size={13} /></div>Documents</div>
            <button className="btn btn-sm btn-ghost" disabled><Download size={12} /> Download All (Coming Soon)</button>
          </div>
          {documents.map((doc, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--br2)' }}>
              <FileText size={16} style={{ color: 'var(--t3)' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{doc.name}</div>
                <div style={{ fontSize: 10, color: 'var(--t3)' }}>{doc.category}</div>
              </div>
              {doc.uploaded ? (
                <>
                  <span className="pill pill-green">✓ {doc.file}</span>
                  <button className="btn btn-sm btn-ghost">View</button>
                  <button className="btn btn-sm btn-ghost"><Download size={12} /></button>
                </>
              ) : (
                <>
                  <span className="pill pill-amber">⚠ Missing</span>
                  <button className="btn btn-sm btn-ghost">Upload</button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
