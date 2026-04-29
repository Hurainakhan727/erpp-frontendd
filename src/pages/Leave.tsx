import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { getStatusColor } from '../services/api';
import { Plus, Check, X, Pencil, RotateCcw, CalendarDays, Users } from 'lucide-react';
import Modal from '../components/common/Modal';
import DecisionBanner from '../components/common/DecisionBanner';
import { useToastContext } from '../context/ToastContext';

function calcDays(from: string, to: string): number {
  if (!from || !to) return 0;
  const a = new Date(from), b = new Date(to);
  if (b < a) return 0;
  return Math.round((b.getTime() - a.getTime()) / 86400000) + 1;
}

const getInitials = (name: string) => {
  return name.split(' ').filter(Boolean).map(part => part[0]).join('').slice(0, 2).toUpperCase();
};

export default function Leave() {
  const { leaveRequests: data, setLeaveRequests: setData, employees, leaveTypes } = useData();
  const [tab, setTab] = useState('all');
  const { showToast } = useToastContext();
  const getEmployeeAvatar = (id: string) => {
    const emp = employees.find((e: any) => e.id === id);
    return emp?.avatar || getInitials(emp?.name || '');
  };
  const [newModal, setNewModal] = useState(false);
  const [editModal, setEditModal] = useState<any | null>(null);
  const [earlyModal, setEarlyModal] = useState<any | null>(null);
  const [rejectModal, setRejectModal] = useState<any | null>(null);
  const [rejectComment, setRejectComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [newEmp, setNewEmp] = useState('');
  const [newType, setNewType] = useState('Annual');
  const [newFrom, setNewFrom] = useState('');
  const [newTo, setNewTo] = useState('');
  const [newReason, setNewReason] = useState('');
  const [editType, setEditType] = useState('');
  const [editFrom, setEditFrom] = useState('');
  const [editTo, setEditTo] = useState('');
  const [editReason, setEditReason] = useState('');
  const [earlyDate, setEarlyDate] = useState('');
  const [calDeptFilter, setCalDeptFilter] = useState('');

  const counts = useMemo(() => ({
    total: data.length,
    pending: data.filter((l: any) => l.status === 'Pending').length,
    approved: data.filter((l: any) => l.status === 'Approved').length,
    rejected: data.filter((l: any) => l.status === 'Rejected').length,
    onLeaveToday: 2,
  }), [data]);

  const filtered = tab === 'all' ? data : tab === 'calendar' ? data : tab === 'balances' ? data : data.filter((l: any) => l.status.toLowerCase() === tab);

  function handleApprove(id: string) { setData(prev => prev.map((l: any) => l.id === id ? { ...l, status: 'Approved' } : l)); showToast('Leave approved'); }
  function handleReject(id: string) {
    if (!rejectComment.trim()) { showToast('Please provide a reason for rejection', 'error'); return; }
    setData(prev => prev.map((l: any) => l.id === id ? { ...l, status: 'Rejected' } : l));
    showToast('Leave rejected', 'error');
    setRejectModal(null); setRejectComment('');
  }

  function openEdit(row: any) { setEditType(row.leaveType); setEditFrom(row.from); setEditTo(row.to); setEditReason(row.reason); setEditModal(row); }

  function saveEdit() {
    if (!editModal) return;
    setSaving(true);
    setTimeout(() => { setData(prev => prev.map((l: any) => l.id === editModal.id ? { ...l, leaveType: editType, from: editFrom, to: editTo, days: calcDays(editFrom, editTo), reason: editReason } : l)); setSaving(false); setEditModal(null); showToast('Leave request updated'); }, 600);
  }

  function openEarly(row: any) { setEarlyDate(''); setEarlyModal(row); }

  function confirmEarly() {
    if (!earlyModal || !earlyDate) return;
    setSaving(true);
    setTimeout(() => { const actualDays = calcDays(earlyModal.from, earlyDate); setData(prev => prev.map((l: any) => l.id === earlyModal.id ? { ...l, to: earlyDate, days: actualDays } : l)); setSaving(false); setEarlyModal(null); showToast('Early return recorded'); }, 600);
  }

  const newDays = calcDays(newFrom, newTo);

  function submitNew() {
    if (!newEmp || !newFrom || !newTo || !newReason) { showToast('Please fill all required fields', 'error'); return; }
    setSaving(true);
    setTimeout(() => { const emp = employees.find((e: any) => e.id === newEmp); setData(prev => [{ id: 'LR' + String(prev.length + 1).padStart(3, '0'), empId: newEmp, empName: emp?.name || '', leaveType: newType, from: newFrom, to: newTo, days: newDays, reason: newReason, appliedOn: new Date().toISOString().split('T')[0], status: 'Pending' }, ...prev]); setSaving(false); setNewModal(false); setNewEmp(''); setNewType('Annual'); setNewFrom(''); setNewTo(''); setNewReason(''); showToast('Leave request submitted'); }, 600);
  }

  const earlyOrigDays = earlyModal ? calcDays(earlyModal.from, earlyModal.to) : 0;
  const earlyActual = earlyModal && earlyDate ? calcDays(earlyModal.from, earlyDate) : earlyOrigDays;
  const earlyRestore = earlyOrigDays - earlyActual;

  // Leave balance overview
  const empBalances = employees.map((e: any) => {
    const empLeaves = data.filter((l: any) => l.empId === e.id && l.status === 'Approved');
    const annual = empLeaves.filter((l: any) => l.leaveType === 'Annual').reduce((s: number, l: any) => s + l.days, 0);
    const casual = empLeaves.filter((l: any) => l.leaveType === 'Casual').reduce((s: number, l: any) => s + l.days, 0);
    const medical = empLeaves.filter((l: any) => l.leaveType.includes('Medical') || l.leaveType.includes('Sick')).reduce((s: number, l: any) => s + l.days, 0);
    return { id: e.id, name: e.name, dept: e.department, annual: { used: annual, total: 12 }, casual: { used: casual, total: 12 }, medical: { used: medical, total: 8 } };
  });

  // Calendar data
  const approvedLeaves = data.filter((l: any) => l.status === 'Approved' && (!calDeptFilter || employees.find((e: any) => e.id === l.empId)?.department === calDeptFilter));
  const calDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const leaveColors: Record<string, string> = { Annual: 'var(--pl)', Casual: 'var(--greenl)', Sick: 'var(--redl)', Medical: 'var(--redl)' };

  return (
    <div>
      <div className="pg-head">
        <div><div className="pg-greet">Leave Management</div><div className="pg-sub">Manage leave requests and approvals</div></div>
        <button className="btn btn-primary" onClick={() => setNewModal(true)}><Plus size={13} /> New Leave Request</button>
      </div>

      <div className="kpi-strip" style={{ marginBottom: 12 }}>
        {[{ l: 'Total', v: counts.total, c: 'k1' }, { l: 'Pending', v: counts.pending, c: 'k3' }, { l: 'Approved', v: counts.approved, c: 'k2' }, { l: 'Rejected', v: counts.rejected, c: 'k4' }, { l: 'On Leave Today', v: counts.onLeaveToday, c: 'k1' }].map((k, i) => (
          <div key={i} className={`kpi-item ${k.c}`}><div><div className="kpi-val">{k.v}</div><div className="kpi-lbl">{k.l}</div></div></div>
        ))}
      </div>

      <div className="tabs">
        {['all', 'pending', 'approved', 'rejected', 'calendar', 'balances'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'calendar' ? '📅 Calendar' : t === 'balances' ? '📊 Balances' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Calendar View */}
      {tab === 'calendar' && (
        <div className="card">
          <div className="ch">
            <div className="ct"><div className="ct-ico blue"><CalendarDays size={13} /></div>March 2026 — Leave Calendar</div>
            <select className="input select-input" style={{ width: 160 }} value={calDeptFilter} onChange={e => setCalDeptFilter(e.target.value)}>
              <option value="">All Departments</option>
              {['Engineering', 'Marketing', 'HR', 'Sales', 'Finance'].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, textAlign: 'center' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => <div key={i} style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', padding: 6 }}>{d}</div>)}
            {calDays.map(day => {
              const dateStr = `2026-03-${String(day).padStart(2, '0')}`;
              const leaves = approvedLeaves.filter((l: any) => l.from <= dateStr && l.to >= dateStr);
              return (
                <div key={day} style={{ padding: 6, borderRadius: 6, background: leaves.length > 0 ? 'var(--pl)' : 'var(--inp)', minHeight: 50, textAlign: 'left' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t2)' }}>{day}</div>
                  {leaves.slice(0, 2).map((l: any, i: number) => (
                    <div key={i} style={{ fontSize: 8, padding: '1px 3px', borderRadius: 3, background: leaveColors[l.leaveType] || 'var(--steell)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={`${l.empName} - ${l.leaveType}`}>{l.empName?.split(' ')[0]}</div>
                  ))}
                  {leaves.length > 2 && <div style={{ fontSize: 7, color: 'var(--t3)', marginTop: 1 }}>+{leaves.length - 2} more</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Balance Overview */}
      {tab === 'balances' && (
        <div className="card">
          <div className="ch">
            <div className="ct"><div className="ct-ico green"><Users size={13} /></div>Leave Balance Overview</div>
            <button className="btn btn-sm btn-ghost">Export</button>
          </div>
          <table>
            <thead><tr><th>Employee</th><th>Department</th><th>Annual (used/total)</th><th>Casual (used/total)</th><th>Medical (used/total)</th></tr></thead>
            <tbody>
              {empBalances.map((e, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>
                    <div className="table-avatar-cell">
                      <div className="table-avatar table-avatar-small">{getEmployeeAvatar(e.id)}</div>
                      <div>
                        <div>{e.name}</div>
                        <div className="mono" style={{ fontSize: 10, color: 'var(--t3)' }}>{e.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>{e.dept}</td>
                  <td className="mono"><span style={{ color: (e.annual.total - e.annual.used) < 3 ? 'var(--red)' : 'var(--t1)' }}>{e.annual.used}/{e.annual.total}</span>{(e.annual.total - e.annual.used) < 3 && <span style={{ fontSize: 9, color: 'var(--red)', marginLeft: 4 }}>⚠ Low</span>}</td>
                  <td className="mono"><span style={{ color: (e.casual.total - e.casual.used) < 3 ? 'var(--red)' : 'var(--t1)' }}>{e.casual.used}/{e.casual.total}</span></td>
                  <td className="mono"><span style={{ color: (e.medical.total - e.medical.used) < 3 ? 'var(--red)' : 'var(--t1)' }}>{e.medical.used}/{e.medical.total}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Table views */}
      {!['calendar', 'balances'].includes(tab) && (
        <div className="card">
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--t3)' }}><CalendarDays size={32} style={{ margin: '0 auto 8px', opacity: .4 }} /><div style={{ fontSize: 13 }}>No leave requests found</div></div>
          ) : (
            <table>
              <thead><tr><th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Applied</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((l: any) => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 600 }}>
                      <div className="table-avatar-cell">
                        <div className="table-avatar table-avatar-small">{getEmployeeAvatar(l.empId)}</div>
                        <div>
                          <div>{l.empName}</div>
                          <div className="mono" style={{ fontSize: 10, color: 'var(--t3)' }}>{l.empId}</div>
                        </div>
                      </div>
                    </td>
                    <td>{l.leaveType}</td><td className="mono">{l.from}</td><td className="mono">{l.to}</td><td className="mono">{l.days}</td>
                    <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.reason}</td>
                    <td className="mono">{l.appliedOn}</td>
                    <td><span className={`pill ${getStatusColor(l.status)}`}>{l.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {l.status === 'Pending' && <>
                          <button className="ico-btn" title="Approve" style={{ background: 'var(--greenl)', color: 'var(--green)', border: 'none', width: 28, height: 28 }} onClick={() => handleApprove(l.id)}><Check size={13} /></button>
                          <button className="ico-btn" title="Reject" style={{ background: 'var(--redl)', color: 'var(--red)', border: 'none', width: 28, height: 28 }} onClick={() => setRejectModal(l)}><X size={13} /></button>
                          <button className="ico-btn" title="Edit" style={{ width: 28, height: 28 }} onClick={() => openEdit(l)}><Pencil size={13} /></button>
                        </>}
                        {l.status === 'Approved' && <button className="btn btn-sm btn-ghost" onClick={() => openEarly(l)}><RotateCcw size={12} /> Early Return</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Reject modal with comment */}
      <Modal open={!!rejectModal} onClose={() => setRejectModal(null)} title="Reject Leave Request" footer={<><button className="btn btn-secondary" onClick={() => setRejectModal(null)}>Cancel</button><button className="btn btn-danger" onClick={() => handleReject(rejectModal?.id)}>Reject</button></>}>
        <div style={{ fontSize: 12.5, marginBottom: 12 }}><strong>{rejectModal?.empName}</strong> — {rejectModal?.leaveType} Leave ({rejectModal?.from} to {rejectModal?.to})</div>
        <div className="form-group"><label className="form-label">Reason for Rejection *</label><textarea className="input" rows={3} value={rejectComment} onChange={e => setRejectComment(e.target.value)} placeholder="Required — provide reason..." /></div>
      </Modal>

      <Modal open={newModal} onClose={() => setNewModal(false)} title="New Leave Request" footer={<><button className="btn btn-secondary" onClick={() => setNewModal(false)}>Cancel</button><button className="btn btn-primary" onClick={submitNew} disabled={saving}>{saving ? 'Submitting...' : 'Submit Request'}</button></>}>
        <div className="form-group"><label className="form-label">Employee *</label><select className="input select-input" value={newEmp} onChange={e => setNewEmp(e.target.value)}><option value="">Select employee...</option>{employees.map((e: any) => <option key={e.id} value={e.id}>{e.name} ({e.id})</option>)}</select></div>
        <div className="form-group"><label className="form-label">Leave Type</label><select className="input select-input" value={newType} onChange={e => setNewType(e.target.value)}>{leaveTypes.filter((t: any) => t.active).map((t: any) => <option key={t.code} value={t.name.replace(' Leave', '')}>{t.name}</option>)}</select></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group"><label className="form-label">From Date *</label><input className="input" type="date" value={newFrom} onChange={e => setNewFrom(e.target.value)} /></div>
          <div className="form-group"><label className="form-label">To Date *</label><input className="input" type="date" value={newTo} onChange={e => setNewTo(e.target.value)} /></div>
        </div>
        {newFrom && newTo && <div style={{ fontSize: 12, marginBottom: 8, color: 'var(--p)', fontWeight: 600 }}>Days Requested: <span className="mono">{newDays}</span></div>}
        {newEmp && <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 8 }}>Remaining balance shown on approval screen</div>}
        <div className="form-group"><label className="form-label">Reason *</label><textarea className="input" rows={3} value={newReason} onChange={e => setNewReason(e.target.value)} placeholder="Enter reason for leave..." /></div>
      </Modal>

      <Modal open={!!editModal} onClose={() => setEditModal(null)} title="Edit Leave Request" footer={<><button className="btn btn-secondary" onClick={() => setEditModal(null)}>Cancel</button><button className="btn btn-primary" onClick={saveEdit} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button></>}>
        <DecisionBanner>DECISION NEEDED — HR Edit Permissions: Which fields can HR edit? Please confirm in meeting.</DecisionBanner>
        <div style={{ marginTop: 12 }} />
        <div className="form-group"><label className="form-label">Employee</label><input className="input" value={editModal?.empName || ''} disabled style={{ opacity: .7 }} /></div>
        <div className="form-group"><label className="form-label">Leave Type</label><select className="input select-input" value={editType} onChange={e => setEditType(e.target.value)}>{leaveTypes.filter((t: any) => t.active).map((t: any) => <option key={t.code} value={t.name.replace(' Leave', '')}>{t.name}</option>)}</select></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group"><label className="form-label">From</label><input className="input" type="date" value={editFrom} onChange={e => setEditFrom(e.target.value)} /></div>
          <div className="form-group"><label className="form-label">To</label><input className="input" type="date" value={editTo} onChange={e => setEditTo(e.target.value)} /></div>
        </div>
        {editFrom && editTo && <div style={{ fontSize: 12, marginBottom: 8, color: 'var(--p)', fontWeight: 600 }}>Days: <span className="mono">{calcDays(editFrom, editTo)}</span></div>}
        <div className="form-group"><label className="form-label">Reason</label><textarea className="input" rows={3} value={editReason} onChange={e => setEditReason(e.target.value)} /></div>
      </Modal>

      <Modal open={!!earlyModal} onClose={() => setEarlyModal(null)} title="Mark Early Return" footer={<><button className="btn btn-secondary" onClick={() => setEarlyModal(null)}>Cancel</button><button className="btn btn-primary" onClick={confirmEarly} disabled={saving || !earlyDate}>{saving ? 'Saving...' : 'Confirm Early Return'}</button></>}>
        <div style={{ background: 'var(--inp)', padding: 12, borderRadius: 'var(--rsm)', marginBottom: 12, fontSize: 12.5 }}>
          <div style={{ fontWeight: 600, marginBottom: 2 }}>{earlyModal?.empName} — {earlyModal?.leaveType} Leave</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--t3)' }}>Original: {earlyModal?.from} to {earlyModal?.to} ({earlyOrigDays} days)</div>
        </div>
        <div className="form-group"><label className="form-label">Employee returned on:</label><input className="input" type="date" value={earlyDate} onChange={e => setEarlyDate(e.target.value)} min={earlyModal?.from} max={earlyModal?.to} /></div>
        {earlyDate && <div style={{ display: 'flex', gap: 20, fontSize: 12.5, padding: '8px 0' }}><div>Days Actually Taken: <strong className="mono">{earlyActual}</strong></div><div>Days to Restore: <strong className="mono" style={{ color: 'var(--green)' }}>{earlyRestore > 0 ? earlyRestore : 0}</strong></div></div>}
        <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 8 }}>The original leave approval is preserved. The early return date is recorded separately.</div>
      </Modal>
    </div>
  );
}











