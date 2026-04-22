import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { getStatusColor } from '../services/api';
import { Download } from 'lucide-react';

const actionColors: Record<string, string> = { CREATE: 'pill-green', UPDATE: 'pill-blue', DELETE: 'pill-red', LOGIN: 'pill-steel', LOGOUT: 'pill-steel' };

export default function AuditLog() {
  const { auditLog } = useData();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filtered = auditLog.filter((log: any) => {
    if (userFilter && log.user !== userFilter) return false;
    if (actionFilter && log.action !== actionFilter) return false;
    if (moduleFilter && log.module !== moduleFilter) return false;
    if (dateFrom && log.timestamp < dateFrom) return false;
    if (dateTo && log.timestamp > dateTo + ' 23:59:59') return false;
    return true;
  });

  const users = [...new Set(auditLog.map((l: any) => l.user))];
  const modules = [...new Set(auditLog.map((l: any) => l.module))];

  const exportCSV = () => {
    const csv = 'Timestamp,User,Role,Action,Module,Record,Summary\n' +
      filtered.map((l: any) => `"${l.timestamp}","${l.user}","${l.role}","${l.action}","${l.module}","${l.recordId}","${l.summary}"`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'audit_log.csv'; a.click();
  };

  return (
    <div>
      <div className="pg-head">
        <div><div className="pg-greet">Audit Log</div><div className="pg-sub">Track all system activities</div></div>
        
      </div>
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input className="input" type="date" style={{ width: 150 }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} placeholder="From" />
          <input className="input" type="date" style={{ width: 150 }} value={dateTo} onChange={e => setDateTo(e.target.value)} placeholder="To" />
          <select className="input select-input" style={{ width: 140 }} value={userFilter} onChange={e => setUserFilter(e.target.value)}>
            <option value="">All Users</option>{users.map(u => <option key={u}>{u}</option>)}
          </select>
          <select className="input select-input" style={{ width: 140 }} value={actionFilter} onChange={e => setActionFilter(e.target.value)}>
            <option value="">All Actions</option>{['CREATE','UPDATE','DELETE','LOGIN','LOGOUT'].map(a => <option key={a}>{a}</option>)}
          </select>
          <select className="input select-input" style={{ width: 140 }} value={moduleFilter} onChange={e => setModuleFilter(e.target.value)}>
            <option value="">All Modules</option>{modules.map(m => <option key={m}>{m}</option>)}
          </select>
          {(userFilter || actionFilter || moduleFilter || dateFrom || dateTo) && (
            <button className="btn btn-sm btn-ghost" onClick={() => { setUserFilter(''); setActionFilter(''); setModuleFilter(''); setDateFrom(''); setDateTo(''); }}>Clear</button>
          )}
        </div>
      </div>
      <div className="card">
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--t3)', fontSize: 13 }}>No audit log entries match your filters</div>
        ) : (
          <table>
            <thead><tr><th>Timestamp</th><th>User</th><th>Role</th><th>Action</th><th>Module</th><th>Record</th><th>Summary</th></tr></thead>
            <tbody>
              {filtered.map((log: any) => (
                <React.Fragment key={log.id}>
                  <tr style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === log.id ? null : log.id)}>
                    <td className="mono" style={{ fontSize: 11 }}>{log.timestamp}</td>
                    <td style={{ fontWeight: 600 }}>{log.user}</td>
                    <td><span className="pill pill-blue">{log.role}</span></td>
                    <td><span className={`pill ${actionColors[log.action] || 'pill-steel'}`}>{log.action}</span></td>
                    <td>{log.module}</td>
                    <td className="mono">{log.recordId}</td>
                    <td>{log.summary}</td>
                  </tr>
                  {expanded === log.id && log.before && (
                    <tr><td colSpan={7} style={{ background: 'var(--inp)', padding: 12 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 12 }}>
                        <div><div style={{ fontWeight: 600, color: 'var(--t3)', marginBottom: 4 }}>BEFORE</div>{Object.entries(log.before).map(([k, v]) => <div key={k}>{k}: <span className="mono">{String(v)}</span></div>)}</div>
                        <div><div style={{ fontWeight: 600, color: 'var(--t3)', marginBottom: 4 }}>AFTER</div>{log.after && Object.entries(log.after).map(([k, v]) => <div key={k} style={{ background: 'var(--amberl)', padding: '2px 4px', borderRadius: 3 }}>{k}: <span className="mono">{String(v)}</span></div>)}</div>
                      </div>
                    </td></tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}











