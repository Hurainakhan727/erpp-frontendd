import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { getStatusColor } from '../services/api';
import { Plus } from 'lucide-react';
import Modal from '../components/common/Modal';
import { useToastContext } from '../context/ToastContext';

export default function Accounts() {
  const { hrAccounts, setHrAccounts, employees } = useData();
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [linkedEmp, setLinkedEmp] = useState('');
  const { showToast } = useToastContext();

  const handleAdd = () => {
    if (!username || !password) { showToast('Username and password required', 'error'); return; }
    if (password !== confirmPw) { showToast('Passwords do not match', 'error'); return; }
    setSaving(true);
    setTimeout(() => {
      setHrAccounts(prev => [...prev, {
        id: 'ACC' + String(prev.length + 1).padStart(3, '0'),
        username, role: 'hr', linkedEmployee: linkedEmp || '-',
        status: 'Active', created: new Date().toISOString().split('T')[0],
      }]);
      setSaving(false); setModal(false); showToast('Account created');
      setUsername(''); setPassword(''); setConfirmPw(''); setLinkedEmp('');
    }, 500);
  };

  const toggleStatus = (id: string) => {
    setHrAccounts(prev => prev.map((a: any) => a.id === id ? { ...a, status: a.status === 'Active' ? 'Inactive' : 'Active' } : a));
    showToast('Account status updated');
  };

  return (
    <div>
      <div className="pg-head">
        <div><div className="pg-greet">HR Accounts</div><div className="pg-sub">Manage system user accounts</div></div>
        <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={13} /> Add HR Account</button>
      </div>
      <div className="card">
        <table>
          <thead><tr><th>ID</th><th>Username</th><th>Role</th><th>Linked Employee</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
          <tbody>
            {hrAccounts.map((a: any) => (
              <tr key={a.id}><td className="mono">{a.id}</td><td style={{ fontWeight: 600 }}>{a.username}</td><td><span className="pill pill-blue">{a.role}</span></td><td>{a.linkedEmployee}</td><td><span className={`pill ${getStatusColor(a.status)}`}>{a.status}</span></td><td className="mono">{a.created}</td>
                <td>{a.role !== 'super_admin' && <button className="btn btn-sm btn-danger" onClick={() => toggleStatus(a.id)}>{a.status === 'Active' ? 'Deactivate' : 'Activate'}</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="Add HR Account" footer={
        <><button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleAdd} disabled={saving}>{saving ? 'Creating...' : 'Create Account'}</button></>
      }>
        <div className="form-group"><label className="form-label">Username</label><input className="input" value={username} onChange={e => setUsername(e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Password</label><input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Confirm Password</label><input className="input" type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Link to Employee (optional)</label>
          <select className="input select-input" value={linkedEmp} onChange={e => setLinkedEmp(e.target.value)}>
            <option value="">None</option>
            {employees.map((e: any) => <option key={e.id} value={`${e.id} - ${e.name}`}>{e.id} — {e.name}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">Role</label><input className="input" value="hr" disabled /></div>
      </Modal>
    </div>
  );
}











