import React, { useState } from 'react';
import { formatPKR, numberToWords } from '../services/api';
import Modal from '../components/common/Modal';
import { Printer, Download, Mail } from 'lucide-react';

const payslips = [
  { period: 'March 2026', gross: 195000, deductions: 17000, net: 178000, status: 'Draft', basic: 150000, houseRent: 30000, medical: 10000, conveyance: 5000, commission: 0, tax: 12000, absent: 3333, loan: 0, advance: 0, late: 0, other: 1667 },
  { period: 'February 2026', gross: 195000, deductions: 14000, net: 181000, status: 'Finalized', basic: 150000, houseRent: 30000, medical: 10000, conveyance: 5000, commission: 0, tax: 12000, absent: 0, loan: 0, advance: 0, late: 2000, other: 0 },
  { period: 'January 2026', gross: 185000, deductions: 15000, net: 170000, status: 'Finalized', basic: 140000, houseRent: 28000, medical: 10000, conveyance: 5000, commission: 2000, tax: 10000, absent: 0, loan: 5000, advance: 0, late: 0, other: 0 },
];

export default function MyPayslips() {
  const [viewIdx, setViewIdx] = useState<number | null>(null);
  const slip = viewIdx !== null ? payslips[viewIdx] : null;

  const cellStyle: React.CSSProperties = { padding: '6px 10px', fontSize: 12, borderBottom: '1px solid var(--br)' };
  const headerStyle: React.CSSProperties = { background: 'var(--sb)', color: '#fff', padding: '6px 10px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' };

  return (
    <div>
      <div className="pg-head">
        <div><div className="pg-greet">My Payslips</div><div className="pg-sub">View your salary details</div></div>
        
      </div>
      <div className="card">
        <table>
          <thead><tr><th>Period</th><th>Gross</th><th>Deductions</th><th>Net</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{payslips.map((p, i) => (
            <tr key={i}>
              <td style={{ fontWeight: 600 }}>{p.period}</td>
              <td className="mono">{formatPKR(p.gross)}</td>
              <td className="mono" style={{ color: 'var(--red)' }}>{formatPKR(p.deductions)}</td>
              <td className="mono" style={{ fontWeight: 600, color: 'var(--green)' }}>{formatPKR(p.net)}</td>
              <td><span className={`pill ${p.status === 'Finalized' ? 'pill-green' : 'pill-amber'}`}>{p.status}</span></td>
              <td>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn btn-sm btn-ghost" onClick={() => setViewIdx(i)}>View</button>
                  <button className="btn btn-sm btn-ghost"><Download size={11} /></button>
                </div>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      <Modal open={viewIdx !== null} onClose={() => setViewIdx(null)} title="" wide>
        {slip && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 12 }}>
              <button className="btn btn-ghost"><Printer size={13} /> Print</button>
              <button className="btn btn-ghost"><Download size={13} /> Download PDF</button>
              <button className="btn btn-ghost"><Mail size={13} /> Email</button>
            </div>
            <div style={{ border: '2px solid var(--sb)', borderRadius: 'var(--rsm)', overflow: 'hidden' }}>
              <div style={{ ...headerStyle, textAlign: 'center', fontSize: 14, padding: '10px' }}>PAY SLIP — {slip.period}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                <div>
                  <div style={headerStyle}>Employee Details</div>
                  {[['Name', 'Ahmed Ali'], ['Employee Code', 'EMP001'], ['Designation', 'Senior Developer'], ['Department', 'Engineering']].map(([l, v], i) => (
                    <div key={i} style={{ ...cellStyle, display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--t3)' }}>{l}</span><span className="mono">{v}</span></div>
                  ))}
                </div>
                <div style={{ borderLeft: '1px solid var(--br)' }}>
                  <div style={headerStyle}>Salary Structure</div>
                  {[['Basic Salary', slip.basic], ['House Rent', slip.houseRent], ['Medical', slip.medical], ['Conveyance', slip.conveyance], ['Commission', slip.commission]].map(([l, v], i) => (
                    <div key={i} style={{ ...cellStyle, display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--t3)' }}>{l}</span><span className="mono">{formatPKR(v as number)}</span></div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                <div>
                  <div style={headerStyle}>Earnings Summary</div>
                  <div style={{ ...cellStyle, display: 'flex', justifyContent: 'space-between' }}><span>Gross Salary</span><span className="mono">{formatPKR(slip.gross)}</span></div>
                  <div style={{ ...cellStyle, display: 'flex', justifyContent: 'space-between' }}><span>Deductions</span><span className="mono" style={{ color: 'var(--red)' }}>{formatPKR(slip.deductions)}</span></div>
                  <div style={{ ...cellStyle, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}><span>Net Salary</span><span className="mono" style={{ color: 'var(--green)', fontSize: 14 }}>{formatPKR(slip.net)}</span></div>
                </div>
                <div style={{ borderLeft: '1px solid var(--br)' }}>
                  <div style={headerStyle}>Deductions</div>
                  {[['Tax', slip.tax], ['Absent Deduction', slip.absent], ['Loan', slip.loan], ['Late Penalty', slip.late], ['Other', slip.other]].map(([l, v], i) => (
                    <div key={i} style={{ ...cellStyle, display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--t3)' }}>{l}</span><span className="mono">{formatPKR(v as number)}</span></div>
                  ))}
                </div>
              </div>
              <div style={{ ...cellStyle, fontStyle: 'italic', fontSize: 11 }}>Amount in Words: {numberToWords(Math.floor(slip.net))}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}











