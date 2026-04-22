import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useToastContext } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const SECTIONS = ['employee', 'contact', 'bank', 'job', 'salary', 'medical', 'attachments'];
const FIELD_TYPES = ['Text', 'Textarea', 'Number', 'Date', 'Dropdown', 'Checkbox', 'File'];

export default function CustomFields() {
  const { activeRole } = useAuth();
  const navigate = useNavigate();
  const { customFields, setCustomFields } = useData();
  const [tab, setTab] = useState('employee');
  const [modal, setModal] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldType, setFieldType] = useState('Text');
  const [fieldSection, setFieldSection] = useState('employee');
  const [fieldRequired, setFieldRequired] = useState(false);
  const [fieldOrder, setFieldOrder] = useState(1);
  const [fieldOptions, setFieldOptions] = useState('');
  const { showToast } = useToastContext();

  if (activeRole !== 'super_admin') {
    showToast('Access Denied', 'error');
    navigate('/dashboard');
    return null;
  }

  const tabs = SECTIONS;
  const fields = customFields[tab as keyof typeof customFields] || [];

  const openAdd = () => {
    setFieldLabel(''); setFieldType('Text'); setFieldSection(tab); setFieldRequired(false); setFieldOrder(fields.length + 1); setFieldOptions('');
    setEditIdx(null); setModal(true);
  };

  const openEdit = (idx: number) => {
    const f = fields[idx] as any;
    setFieldLabel(f.label); setFieldType(f.type); setFieldSection(tab); setFieldRequired(f.required); setFieldOrder(f.display_order || idx + 1); setFieldOptions(f.options?.join(', ') || '');
    setEditIdx(idx); setModal(true);
  };

  const handleSave = () => {
    const newField = {
      id: editIdx !== null ? (fields[editIdx] as any).id : 'cf_' + Date.now(),
      label: fieldLabel, type: fieldType, required: fieldRequired,
      section: tab.charAt(0).toUpperCase() + tab.slice(1) + ' Info',
      active: true, display_order: fieldOrder,
      options: fieldType === 'Dropdown' ? fieldOptions.split(',').map(o => o.trim()).filter(Boolean) : undefined,
    };
    if (editIdx !== null) {
      setCustomFields(prev => ({ ...prev, [tab]: (prev[tab as keyof typeof prev] || []).map((f: any, i: number) => i === editIdx ? newField : f) }));
      showToast('Field updated');
    } else {
      setCustomFields(prev => ({ ...prev, [tab]: [...(prev[tab as keyof typeof prev] || []), newField] }));
      showToast('Field added');
    }
    setModal(false);
  };

  const handleDelete = () => {
    if (deleteIdx !== null) {
      setCustomFields(prev => ({ ...prev, [tab]: (prev[tab as keyof typeof prev] || []).filter((_: any, i: number) => i !== deleteIdx) }));
      showToast('Field deleted'); setDeleteIdx(null);
    }
  };

  return (
    <div>
      <div className="pg-head">
        <div><div className="pg-greet">Custom Fields</div><div className="pg-sub">Configure additional fields for employee forms</div></div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={13} /> Add Field</button>
      </div>
      <div className="tabs">{tabs.map(t => <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>)}</div>
      <div className="card">
        {fields.length === 0 ? <div className="empty-state"><p>No custom fields added for this section</p></div> :
          <table><thead><tr><th>Label</th><th>Type</th><th>Required</th><th>Active</th><th>Actions</th></tr></thead>
          <tbody>{fields.map((f: any, i: number) => <tr key={i}>
            <td style={{ fontWeight: 600 }}>{f.label}</td><td>{f.type}</td>
            <td><span className={`pill ${f.required ? 'pill-amber' : 'pill-steel'}`}>{f.required ? 'Yes' : 'No'}</span></td>
            <td><span className="pill pill-green">Active</span></td>
            <td><div style={{ display: 'flex', gap: 4 }}>
              <button className="ico-btn" style={{ width: 28, height: 28 }} onClick={() => openEdit(i)}><Pencil size={13} /></button>
              <button className="ico-btn" style={{ width: 28, height: 28 }} onClick={() => setDeleteIdx(i)}><Trash2 size={13} /></button>
            </div></td>
          </tr>)}</tbody></table>
        }
      </div>
      <div className="card" style={{ marginTop: 12, background: 'var(--pl)', border: '1px solid var(--p2)' }}><div style={{ fontSize: 12, color: 'var(--p)' }}>ℹ Custom fields appear in the relevant form sections of the employee wizard.</div></div>
      <Modal open={modal} onClose={() => setModal(false)} title={editIdx !== null ? 'Edit Custom Field' : 'Add Custom Field'} footer={
        <><button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>Save</button></>
      }>
        <div className="form-group"><label className="form-label">Field Label</label><input className="input" value={fieldLabel} onChange={e => setFieldLabel(e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Field Type</label><select className="input select-input" value={fieldType} onChange={e => setFieldType(e.target.value)}>{FIELD_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
        <div className="form-group"><label className="form-label">Section</label><select className="input select-input" value={fieldSection} onChange={e => { setFieldSection(e.target.value); setTab(e.target.value); }}>{SECTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}</select></div>
        {fieldType === 'Dropdown' && <div className="form-group"><label className="form-label">Options (comma-separated)</label><input className="input" value={fieldOptions} onChange={e => setFieldOptions(e.target.value)} placeholder="Option 1, Option 2, Option 3" /></div>}
        <div className="form-group"><label className="form-label">Display Order</label><input className="input" type="number" value={fieldOrder} onChange={e => setFieldOrder(+e.target.value)} /></div>
        <div className="form-group"><label style={{ fontSize: 12, cursor: 'pointer' }}><input type="checkbox" checked={fieldRequired} onChange={e => setFieldRequired(e.target.checked)} /> Required</label></div>
      </Modal>
      <ConfirmDialog open={deleteIdx !== null} title="Delete Field" message="Are you sure you want to delete this custom field?" onConfirm={handleDelete} onCancel={() => setDeleteIdx(null)} />
    </div>
  );
}
