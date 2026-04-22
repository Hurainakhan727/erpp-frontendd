import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { getStatusColor, formatPKR, numberToWords } from '../data/dummyData';
import { Plus, Eye, Pencil, Lock, Printer, Download } from 'lucide-react';
import Modal from '../components/Modal';
import DecisionBanner from '../components/DecisionBanner';
import { useToastContext } from '../contexts/ToastContext';

export default function Payroll() {
  const { showToast } = useToastContext();
  const { payrollData, setPayrollData, employees } = useData();
  const [genModal, setGenModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [viewEmp, setViewEmp] = useState(payrollData[0]);
  const [statusFilter, setStatusFilter] = useState('');
  const [saving, setSaving] = useState(false);

  const [selEmp, setSelEmp] = useState('EMP001');
  const [workingDays] = useState(31);
  const [empWorkingDays, setEmpWorkingDays] = useState(28);
  const [absents, setAbsents] = useState(3);
  const [clUsed, setClUsed] = useState(0);
  const [mlUsed, setMlUsed] = useState(0);
  const [alUsed, setAlUsed] = useState(0);
  const [basic, setBasic] = useState(150000);
  const [houseRent, setHouseRent] = useState(30000);
  const [medical, setMedical] = useState(10000);
  const [conveyance, setConveyance] = useState(5000);
  const [commission, setCommission] = useState(0);
  const [advance, setAdvance] = useState(0);
  const [loanInstallment, setLoanInstallment] = useState(0);
  const [tax, setTax] = useState(12000);
  const [otherDed, setOtherDed] = useState(0);
  const latePenalty = 0;

  const paidDays = empWorkingDays;
  const absentDeduction = absents > 0 ? (basic / workingDays) * absents : 0;
  const totalEarnings = basic + houseRent + medical + conveyance + commission;
  const totalDeductions = absentDeduction + latePenalty + advance + loanInstallment + tax + otherDed;
  const grossSalary = totalEarnings;
  const netSalary = grossSalary - totalDeductions;

  const filtered = payrollData.filter((p: any) => !statusFilter || p.status === statusFilter);

  const openView = (p: any) => { setViewEmp(p); setViewModal(true); };

  const loadSalary = () => {
    const emp = employees.find((e: any) => e.id === selEmp);
    if (emp) { setBasic(emp.salary.basic); setHouseRent(emp.salary.houseRent); setMedical(emp.salary.medical); setConveyance(emp.salary.conveyance); setCommission(emp.salary.commission); }
  };

  const savePayroll = (status: string) => {
    setSaving(true);
    setTimeout(() => {
      const emp = employees.find((e: any) => e.id === selEmp);
      const existing = payrollData.findIndex((p: any) => p.empId === selEmp);
      const newRecord = {
        empId: selEmp, name: emp?.name || '', workingDays, paidDays, absents,
        clUsed, mlUsed, alUsed,
        basic, houseRent, medical, conveyance, commission,
        absentDeduction, tax, loan: loanInstallment, advance, latePenalty, otherDeduction: otherDed,
        status, paymentMode: emp?.paymentMode || 'Online Transfer',
      };
      if (existing >= 0) {
        setPayrollData(prev => prev.map((p: any, i: number) => i === existing ? newRecord : p));
      } else {
        setPayrollData(prev => [...prev, newRecord]);
      }
      setSaving(false); setGenModal(false);
      showToast(status === 'Draft' ? 'Saved as draft' : 'Payroll finalized');
    }, 600);
  };

  const finalize = (empId: string) => {
    setPayrollData(prev => prev.map((p: any) => p.empId === empId ? { ...p, status: 'Finalized' } : p));
    showToast('Payroll finalized');
  };

  return (
    <div>
      <div className="pg-head">
        <div><div className="pg-greet">Payroll</div><div className="pg-sub">March 2026</div></div>
        <button className="btn btn-primary" onClick={() => { loadSalary(); setGenModal(true); }}><Plus size={13} /> Generate Payroll</button>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <select className="input select-input" style={{ width: 140 }}><option>March</option><option>February</option><option>January</option></select>
          <input className="input mono" style={{ width: 80 }} value="2026" readOnly />
          <select className="input select-input" style={{ width: 120 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All</option><option>Draft</option><option>Finalized</option>
          </select>
        </div>
      </div>

      <div className="card">
        <table>
          <thead><tr><th>Emp ID</th><th>Name</th><th>Working Days</th><th>Paid Days</th><th>Gross</th><th>Deductions</th><th>Net</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map((p: any, i: number) => {
              const g = p.basic + p.houseRent + p.medical + p.conveyance + p.commission;
              const d = p.absentDeduction + p.tax + p.loan + p.advance + p.latePenalty + p.otherDeduction;
              return (
                <tr key={i}>
                  <td className="mono">{p.empId}</td><td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td className="mono">{p.workingDays}</td><td className="mono">{p.paidDays}</td>
                  <td className="mono" style={{ fontWeight: 600 }}>{formatPKR(g)}</td>
                  <td className="mono" style={{ color: 'var(--red)' }}>{formatPKR(d)}</td>
                  <td className="mono" style={{ fontWeight: 600, color: 'var(--green)' }}>{formatPKR(g - d)}</td>
                  <td><span className={`pill ${getStatusColor(p.status)}`}>{p.status}</span></td>
                  <td><div style={{ display: 'flex', gap: 4 }}>
                    <button className="ico-btn" style={{ width: 28, height: 28 }} title="View" onClick={() => openView(p)}><Eye size={13} /></button>
                    {p.status === 'Draft' && <button className="ico-btn" style={{ width: 28, height: 28 }} title="Finalize" onClick={() => finalize(p.empId)}><Lock size={13} /></button>}
                  </div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Generate Modal */}
      <Modal open={genModal} onClose={() => setGenModal(false)} title="Generate Payroll — March 2026" wide footer={
        <><button className="btn btn-secondary" onClick={() => savePayroll('Draft')} disabled={saving}>{saving ? 'Saving...' : 'Save as Draft'}</button>
        <button className="btn btn-primary" onClick={() => savePayroll('Finalized')} disabled={saving}>{saving ? 'Saving...' : 'Finalize & Lock'}</button></>
      }>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Employee</label>
            <select className="input select-input" value={selEmp} onChange={e => setSelEmp(e.target.value)}>
              {employees.map((e: any) => <option key={e.id} value={e.id}>{e.id} — {e.name}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={loadSalary}>Load Salary</button>
          </div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', marginBottom: 8, marginTop: 12 }}>Working Days</div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Total Working Days</label><input className="input mono" value={workingDays} readOnly style={{ background: 'var(--steell)', width: 80 }} /></div>
          <div className="form-group"><label className="form-label">Employee Working Days</label><input className="input mono" type="number" value={empWorkingDays} onChange={e => setEmpWorkingDays(+e.target.value)} style={{ width: 80 }} /></div>
          <div className="form-group"><label className="form-label">Absents</label><input className="input mono" type="number" value={absents} onChange={e => setAbsents(+e.target.value)} style={{ width: 80 }} /></div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', marginBottom: 8, marginTop: 12 }}>Earnings</div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Basic</label><input className="input mono" type="number" value={basic} onChange={e => setBasic(+e.target.value)} /></div>
          <div className="form-group"><label className="form-label">House Rent</label><input className="input mono" type="number" value={houseRent} onChange={e => setHouseRent(+e.target.value)} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Medical</label><input className="input mono" type="number" value={medical} onChange={e => setMedical(+e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Conveyance</label><input className="input mono" type="number" value={conveyance} onChange={e => setConveyance(+e.target.value)} /></div>
        </div>
        <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 600, marginTop: 4 }}>Total Earnings: <span className="mono" style={{ color: 'var(--green)' }}>{formatPKR(totalEarnings)}</span></div>

        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', marginBottom: 8, marginTop: 12 }}>Deductions</div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Absent Deduction (auto)</label><input className="input mono" value={formatPKR(absentDeduction)} disabled style={{ background: 'var(--amberl)' }} /></div>
          <div className="form-group"><label className="form-label">Tax</label><input className="input mono" type="number" value={tax} onChange={e => setTax(+e.target.value)} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Advance</label><input className="input mono" type="number" value={advance} onChange={e => setAdvance(+e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Loan</label><input className="input mono" type="number" value={loanInstallment} onChange={e => setLoanInstallment(+e.target.value)} /></div>
        </div>
        <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 600, marginTop: 4 }}>Total Deductions: <span className="mono" style={{ color: 'var(--red)' }}>{formatPKR(totalDeductions)}</span></div>

        <div style={{ background: 'var(--inp)', padding: 14, borderRadius: 'var(--rsm)', marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span style={{ fontSize: 12, fontWeight: 600 }}>Gross Salary</span><span className="mono" style={{ fontSize: 14, fontWeight: 700, color: 'var(--p)' }}>{formatPKR(grossSalary)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span style={{ fontSize: 12, fontWeight: 600 }}>Total Deductions</span><span className="mono" style={{ fontSize: 14, fontWeight: 700, color: 'var(--red)' }}>{formatPKR(totalDeductions)}</span></div>
          <div style={{ borderTop: '1px solid var(--br)', paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 13, fontWeight: 700 }}>NET SALARY</span><span className="mono" style={{ fontSize: 18, fontWeight: 800, color: 'var(--green)' }}>{formatPKR(netSalary)}</span></div>
          <div style={{ fontSize: 11, fontStyle: 'italic', color: 'var(--t3)', marginTop: 6 }}>Amount in Words: {numberToWords(Math.floor(netSalary))}</div>
        </div>
        <div style={{ marginTop: 12 }}><DecisionBanner>DECISION NEEDED — Pro-Rated Salary & Tax formulas. Confirm in meeting.</DecisionBanner></div>
      </Modal>

      {/* Payslip View */}
      <Modal open={viewModal} onClose={() => setViewModal(false)} title="" wide>
        {viewEmp && <PayslipView data={viewEmp} employees={employees} onClose={() => setViewModal(false)} />}
      </Modal>
    </div>
  );
}

function PayslipView({ data, employees, onClose }: { data: any; employees: any[]; onClose: () => void }) {
  const emp = employees.find((e: any) => e.id === data.empId) || employees[0];
  const grossEarnings = data.basic + data.houseRent + data.medical + data.conveyance + data.commission;
  const totalDed = data.absentDeduction + data.tax + data.loan + data.advance + data.latePenalty + data.otherDeduction;
  const net = grossEarnings - totalDed;
  const cellStyle: React.CSSProperties = { padding: '6px 10px', fontSize: 12, borderBottom: '1px solid var(--br)' };
  const headerStyle: React.CSSProperties = { background: 'var(--sb)', color: '#fff', padding: '6px 10px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 12 }}>
        <button className="btn btn-ghost"><Printer size={13} /> Print</button>
      </div>
      <div style={{ border: '2px solid var(--sb)', borderRadius: 'var(--rsm)', overflow: 'hidden' }}>
        <div style={{ ...headerStyle, textAlign: 'center', fontSize: 14, padding: '10px' }}>PAY SLIP</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <div>
            <div style={headerStyle}>Employee Details</div>
            {[['Employee Code', emp.id], ['Name', emp.name], ['Designation', emp.designation], ['Department', emp.department], ['DOJ', emp.dateOfJoining]].map(([l, v], i) => (
              <div key={i} style={{ ...cellStyle, display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--t3)' }}>{l}</span><span className="mono" style={{ fontWeight: 500 }}>{v}</span></div>
            ))}
          </div>
          <div style={{ borderLeft: '1px solid var(--br)' }}>
            <div style={headerStyle}>Slip Information</div>
            {[['Slip No', '25'], ['Dated', 'Thursday, Mar 31, 2026'], ['Pay Slip for', 'March'], ['Year', '2026']].map(([l, v], i) => (
              <div key={i} style={{ ...cellStyle, display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--t3)' }}>{l}</span><span className="mono">{v}</span></div>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <div>
            <div style={headerStyle}>Working Days</div>
            {[['Working Days', data.workingDays], ['CL', data.clUsed], ['ML', data.mlUsed], ['AL', data.alUsed], ['Absents', data.absents], ['Total Paid Days', data.paidDays]].map(([l, v], i) => (
              <div key={i} style={{ ...cellStyle, display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--t3)' }}>{l}</span><span className="mono">{v}</span></div>
            ))}
          </div>
          <div style={{ borderLeft: '1px solid var(--br)' }}>
            <div style={headerStyle}>Salary Structure</div>
            {[['Basic Salary', data.basic], ['House Rent All.', data.houseRent], ['Medical All.', data.medical], ['Conveyance', data.conveyance], ['Commission', data.commission]].map(([l, v], i) => (
              <div key={i} style={{ ...cellStyle, display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--t3)' }}>{l}</span><span className="mono">{formatPKR(v as number)}</span></div>
            ))}
            <div style={{ ...cellStyle, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}><span>Total</span><span className="mono">{formatPKR(grossEarnings)}</span></div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <div>
            <div style={headerStyle}>Earnings</div>
            <div style={{ ...cellStyle, display: 'flex', justifyContent: 'space-between' }}><span>Gross Salary</span><span className="mono">{formatPKR(grossEarnings)}</span></div>
            <div style={{ ...cellStyle, display: 'flex', justifyContent: 'space-between' }}><span>Deduction</span><span className="mono" style={{ color: 'var(--red)' }}>{formatPKR(totalDed)}</span></div>
            <div style={{ ...cellStyle, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}><span>Net Salary</span><span className="mono" style={{ color: 'var(--green)', fontSize: 14 }}>{formatPKR(net)}</span></div>
          </div>
          <div style={{ borderLeft: '1px solid var(--br)' }}>
            <div style={headerStyle}>Deductions</div>
            {[['Advance', data.advance], ['Loan', data.loan], ['Absents', data.absentDeduction], ['Tax', data.tax], ['Late Penalty', data.latePenalty]].map(([l, v], i) => (
              <div key={i} style={{ ...cellStyle, display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--t3)' }}>{l}</span><span className="mono">{formatPKR(v as number)}</span></div>
            ))}
            <div style={{ ...cellStyle, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}><span>Total</span><span className="mono" style={{ color: 'var(--red)' }}>{formatPKR(totalDed)}</span></div>
          </div>
        </div>
        <div style={{ ...cellStyle, fontStyle: 'italic', fontSize: 11, padding: '8px 10px' }}>Amount in Words: {numberToWords(Math.floor(net))}</div>
        <div style={{ display: 'flex', justifyContent: 'space-around', padding: '20px 10px 10px', borderTop: '1px solid var(--br)' }}>
          {['Prepared By:', 'Employee Sign:', 'Issued By:'].map((l, i) => (
            <div key={i} style={{ textAlign: 'center' }}><div style={{ width: 120, borderBottom: '1px solid var(--t3)', marginBottom: 4 }} /><div style={{ fontSize: 10, color: 'var(--t3)' }}>{l}</div></div>
          ))}
        </div>
      </div>
    </div>
  );
}
