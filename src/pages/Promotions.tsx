import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { formatPKR } from '../services/api';
import { Plus, Calendar as CalendarIcon, Filter, MessageSquare } from 'lucide-react';
import Modal from '../components/common/Modal';
import { useToastContext } from '../context/ToastContext';

export default function Promotions() {
  const { promotions, setPromotions, employees, setEmployees } = useData();
  const [modal, setModal] = useState(false);
  const { showToast } = useToastContext();
  
  // Modal Form States
  const [empId, setEmpId] = useState('EMP001');
  const [promoDate, setPromoDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDesig, setNewDesig] = useState('');
  const [newSalary, setNewSalary] = useState('');
  const [notes, setNotes] = useState(''); // Notes state

  // Filter States
  const [dateFilter, setDateFilter] = useState(''); 
  const [desigFilter, setDesigFilter] = useState('');

  const designationsList = ["Junior Developer", "Senior Developer", "Lead Developer", "Marketing Executive", "Marketing Manager", "HR Specialist"];

  const emp = employees.find((e: any) => e.id === empId);

  // Filter Logic
  const filteredPromotions = promotions.filter((p: any) => {
    const matchesDate = dateFilter ? p.date === dateFilter : true;
    const matchesDesig = desigFilter ? p.newDesignation === desigFilter : true;
    return matchesDate && matchesDesig;
  });

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); 
    setNewSalary(value);
  };

  const savePromo = () => {
    if (!newDesig || !newSalary) {
      showToast('Please fill all required fields');
      return;
    }

    const nSalary = parseInt(newSalary);

    // 1. Promotion History Update
    const newRecord = {
      id: 'PR' + String(promotions.length + 1).padStart(3, '0'),
      empId, 
      empName: emp?.name || '',
      oldDesignation: emp?.designation || '', 
      newDesignation: newDesig,
      oldSalary: emp?.salary.basic || 0, 
      newSalary: nSalary,
      date: promoDate,
      notes: notes, // Notes saved in record
      approvedBy: 'Super Admin',
    };

    setPromotions((prev: any) => [...prev, newRecord]);

    // 2. Employee Profile Update (Real-time)
    if (setEmployees) {
      setEmployees((prevEmps: any) => prevEmps.map((e: any) => {
        if (e.id === empId) {
          return {
            ...e,
            designation: newDesig,
            salary: { ...e.salary, basic: nSalary }
          };
        }
        return e;
      }));
    }

    showToast(`Promotion recorded for ${emp?.name}`); 
    setModal(false);
    setNewDesig(''); setNewSalary(''); setNotes('');
  };

  return (
    <div>
      <div className="pg-head">
        <div>
          <div className="pg-greet">Promotions</div>
          <div className="pg-sub">Track employee promotions and career growth</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          <Plus size={13} /> Record Promotion
        </button>
      </div>

      {/* --- Filter Bar --- */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', background: '#fff', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalendarIcon size={16} color="#64748b" />
          <input 
            type="date" 
            className="input" 
            style={{ width: '160px' }} 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} color="#64748b" />
          <select 
            className="input select-input" 
            style={{ width: '200px' }}
            value={desigFilter}
            onChange={(e) => setDesigFilter(e.target.value)}
          >
            <option value="">All Designations</option>
            {designationsList.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        {(dateFilter || desigFilter) && (
          <button className="btn btn-ghost" style={{ color: '#ef4444' }} onClick={() => {setDateFilter(''); setDesigFilter('');}}>Reset</button>
        )}
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Old Designation</th>
              <th>New Designation</th>
              <th>Before</th>
              <th>After</th>
              <th>Date</th>
              <th>Approved By</th>
            </tr>
          </thead>
          <tbody>
            {filteredPromotions.map((p: any, i: number) => (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>{p.empName}</td>
                <td>{p.oldDesignation}</td>
                <td>{p.newDesignation}</td>
                <td className="mono">{formatPKR(p.oldSalary)}</td>
                <td className="mono" style={{ color: 'var(--green)', fontWeight: 'bold' }}>{formatPKR(p.newSalary)}</td>
                <td className="mono">{p.date}</td>
                <td>{p.approvedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Promotion Modal with Notes & Old Designation --- */}
      <Modal 
        open={modal} 
        onClose={() => setModal(false)} 
        title="Record Promotion" 
        footer={<><button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-primary" onClick={savePromo}>Save</button></>}
      >
        <div className="form-group">
          <label className="form-label">Employee</label>
          <select className="input select-input" value={empId} onChange={e => setEmpId(e.target.value)}>
            {employees.map((e: any) => <option key={e.id} value={e.id}>{e.id} — {e.name}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Promotion Date</label>
          <input className="input" type="date" value={promoDate} onChange={e => setPromoDate(e.target.value)} />
        </div>

        <div className="form-row">
          {/* Displaying Old Designation */}
          <div className="form-group">
            <label className="form-label">Old Designation</label>
            <input className="input" value={emp?.designation || ''} disabled style={{ background: '#f8fafc' }} />
          </div>
          <div className="form-group">
            <label className="form-label">New Designation</label>
            <select className="input select-input" value={newDesig} onChange={e => setNewDesig(e.target.value)}>
              <option value="">Select Designation</option>
              {designationsList.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Old Salary</label>
            <input className="input mono" value={formatPKR(emp?.salary.basic || 0)} disabled style={{ background: '#f8fafc' }} />
          </div>
          <div className="form-group">
            <label className="form-label">New Salary</label>
            <input className="input mono" type="text" value={newSalary} onChange={handleSalaryChange} placeholder="Enter New Salary" />
          </div>
        </div>

        {/* Notes Field */}
        <div className="form-group">
          <label className="form-label">Notes / Remarks</label>
          <textarea 
            className="input" 
            rows={3} 
            value={notes} 
            onChange={e => setNotes(e.target.value)} 
            placeholder="Reason for promotion, performance notes, etc."
          />
        </div>
      </Modal>
    </div>
  );
}










