import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Save, Camera } from 'lucide-react';
import { useToastContext } from '../context/ToastContext';

export default function MyProfile() {
  const { employees } = useData();
  const emp = employees[0];
  const { showToast } = useToastContext();
  const [editing, setEditing] = useState(false);
  const [contact, setContact] = useState(emp.contact1);
  const [ice1, setIce1] = useState(emp.emergency1);
  const [ice2, setIce2] = useState(emp.emergency2 || '');
  const [bankName, setBankName] = useState(emp.bankName || '');
  const [bankAcc, setBankAcc] = useState(emp.bankAccount || '');

  const handleSave = () => {
    localStorage.setItem('ems_profile_contact', contact);
    localStorage.setItem('ems_profile_ice1', ice1);
    localStorage.setItem('ems_profile_ice2', ice2);
    localStorage.setItem('ems_profile_bank', bankName);
    localStorage.setItem('ems_profile_bankAcc', bankAcc);
    showToast('Profile updated');
    setEditing(false);
  };

  const InfoItem = ({ label, value, editable, editValue, onEdit }: { label: string; value: string; editable?: boolean; editValue?: string; onEdit?: (v: string) => void }) => (
    <div>
      <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--t3)', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
      {editing && editable ? (
        <input className="input" value={editValue} onChange={e => onEdit?.(e.target.value)} style={{ fontSize: 13 }} />
      ) : (
        <div style={{ fontSize: 13 }}>{value}</div>
      )}
    </div>
  );

  return (
    <div>
      <div className="pg-head">
        <div><div className="pg-greet">My Profile</div><div className="pg-sub">View and update your information</div></div>
        {editing ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}><Save size={13} /> Save Changes</button>
          </div>
        ) : (
          <button className="btn btn-secondary" onClick={() => setEditing(true)}>Edit Profile</button>
        )}
      </div>

      {/* Avatar header */}
      <div className="card" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ position: 'relative' }}>
          <div className="avatar avatar-lg" style={{ background: 'var(--p)' }}>{emp.avatar}</div>
          {editing && (
            <div style={{ position: 'absolute', bottom: -2, right: -2, width: 22, height: 22, borderRadius: '50%', background: 'var(--p)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid white' }}>
              <Camera size={10} />
            </div>
          )}
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{emp.name}</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--t3)' }}>{emp.id} · {emp.department} · {emp.designation}</div>
        </div>
      </div>

      {/* Personal Info (read-only) */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', marginBottom: 12 }}>Personal Information</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <InfoItem label="Full Name" value={emp.name} />
          <InfoItem label="Father Name" value={emp.fatherName} />
          <InfoItem label="Date of Birth" value={emp.dob} />
          <InfoItem label="CNIC" value={emp.cnic} />
          <InfoItem label="Gender" value={emp.gender} />
          <InfoItem label="Blood Group" value={emp.bloodGroup} />
        </div>
      </div>

      {/* Contact (editable) */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', marginBottom: 12 }}>Contact Details</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <InfoItem label="Phone" value={contact} editable editValue={contact} onEdit={setContact} />
          <InfoItem label="Emergency Contact 1" value={ice1} editable editValue={ice1} onEdit={setIce1} />
          <InfoItem label="Emergency Contact 2" value={ice2 || 'N/A'} editable editValue={ice2} onEdit={setIce2} />
        </div>
      </div>

      {/* Bank (editable with note) */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', marginBottom: 12 }}>Bank Details</div>
        {editing && <div style={{ fontSize: 11, color: 'var(--amber)', marginBottom: 8, background: 'var(--amberl)', padding: '6px 10px', borderRadius: 'var(--rxs)' }}>⚠ Bank detail changes require HR approval</div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <InfoItem label="Bank Name" value={bankName || 'Not provided'} editable editValue={bankName} onEdit={setBankName} />
          <InfoItem label="Account Number" value={bankAcc || 'Not provided'} editable editValue={bankAcc} onEdit={setBankAcc} />
          <InfoItem label="Payment Mode" value={emp.paymentMode} />
        </div>
      </div>

      {/* Job Info (read-only) */}
      <div className="card">
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', marginBottom: 12 }}>Job Information</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          {[['Department', emp.department], ['Designation', emp.designation], ['Work Mode', emp.workMode], ['Shift', emp.shift], ['Date of Joining', emp.dateOfJoining], ['Reporting Manager', emp.reportingManager]].map(([l, v], i) => (
            <InfoItem key={i} label={l} value={v} />
          ))}
        </div>
      </div>
    </div>
  );
}











