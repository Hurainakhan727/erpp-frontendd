import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { formatPKR } from '../services/api';
import { Check, Lock, Upload, FileText, X, ChevronLeft, ChevronRight } from 'lucide-react';
import DecisionBanner from '../components/common/DecisionBanner';
import { useToastContext } from '../context/ToastContext';

const STEPS = ['Personal', 'Contact', 'Bank', 'Job Info', 'Salary', 'Medical', 'Attachments', 'Account'];

export default function AddEmployee() {
  const navigate = useNavigate();
  const { showToast } = useToastContext();
  const { departments, designations, employmentTypes, jobStatuses, workModes, workLocations, shifts, reportingManagers, addEmployee } = useData();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [animating, setAnimating] = useState(false);
const handleNumberChange = (val: string, setter: (v: string) => void) => {
    // Pehle sirf digits rakho
    const digits = val.replace(/\D/g, ''); 
    
    // Phir check karo ke length 11 se zyada na ho
    if (digits.length <= 11) {
      setter(digits);
    }
  };
  // Sirf Alphabets ke liye (Bank Name ke liye)
  const handleTextChange = (val: string, setter: (v: string) => void) => {
    const letters = val.replace(/[^a-zA-Z\s]/g, ''); // Numbers aur symbols ko delete kar dega
    setter(letters);
  };
  const [fullName, setFullName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [cnic, setCnic] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [contact1, setContact1] = useState('');
  const [contact2, setContact2] = useState('');
  const [ice1, setIce1] = useState('');
  const [ice2, setIce2] = useState('');
  const [permAddress, setPermAddress] = useState('');
  const [postAddress, setPostAddress] = useState('');
  const [sameAddress, setSameAddress] = useState(false);
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Online Transfer');
  const [dept, setDept] = useState(departments[0] || '');
  const [desig, setDesig] = useState(designations[0] || '');
  const [empType, setEmpType] = useState(employmentTypes[0] || '');
  const [jobStat, setJobStat] = useState(jobStatuses[0] || '');
  const [wMode, setWMode] = useState(workModes[0] || '');
  const [wLoc, setWLoc] = useState(workLocations[0] || '');
  const [rm, setRm] = useState(reportingManagers[0] || '');
  const [shift, setShift] = useState(shifts[0]?.name || '');
  const [doj, setDoj] = useState('');
  const [doe, setDoe] = useState('');
  const [commissionEligible, setCommissionEligible] = useState(false);
  const [salBasic, setSalBasic] = useState(0);
  const [salHouse, setSalHouse] = useState(0);
  const [salMedical, setSalMedical] = useState(0);
  const [salConveyance, setSalConveyance] = useState(0);
  const [salCommission, setSalCommission] = useState(0);
  const [bloodGroup, setBloodGroup] = useState('');
  const [allergies, setAllergies] = useState('');
  const [chronic, setChronic] = useState('');
  const [medications, setMedications] = useState('');
  const [accountMethod, setAccountMethod] = useState<'A' | 'B'>('A');
  const [username, setUsername] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedShift = shifts.find((s: any) => s.name === shift);
  const totalSalary = salBasic + salHouse + salMedical + salConveyance + (commissionEligible ? salCommission : 0);

  const formatCnic = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 13);
    if (digits.length <= 5) return digits;
    if (digits.length <= 12) return digits.slice(0, 5) + '-' + digits.slice(5);
    return digits.slice(0, 5) + '-' + digits.slice(5, 12) + '-' + digits.slice(12);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (step === 0) { if (!fullName.trim()) e.fullName = 'Required'; if (!cnic.trim()) e.cnic = 'Required'; }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => { if (!validate()) return; if (step < STEPS.length - 1) { setDirection('right'); setAnimating(true); setTimeout(() => { setStep(step + 1); setAnimating(false); }, 300); } };
  const goBack = () => { if (step > 0) { setDirection('left'); setAnimating(true); setTimeout(() => { setStep(step - 1); setAnimating(false); }, 300); } };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      addEmployee({
        id: 'EMP' + String(Date.now()).slice(-3),
        name: fullName, fatherName, dob, cnic, gender, department: dept, designation: desig,
        employmentType: empType, jobStatus: jobStat, workMode: wMode, workLocation: wLoc,
        shift, reportingManager: rm, dateOfJoining: doj, dateOfExit: doe || undefined,
        contact1, contact2, emergency1: ice1, emergency2: ice2,
        permanentAddress: permAddress, postalAddress: sameAddress ? permAddress : postAddress,
        bankName, bankAccount, paymentMode, bloodGroup, allergies, chronicConditions: chronic,
        medications, avatar: fullName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
        commissionEligible,
        salary: { basic: salBasic, houseRent: salHouse, medical: salMedical, conveyance: salConveyance, commission: commissionEligible ? salCommission : 0 },
      });
      setSaving(false); showToast('Employee saved successfully'); navigate('/employees');
    }, 800);
  };

  // Render step content (same as before but using data from context)
  const renderStep = () => {
    switch (step) {
      case 0: return (<div>
        <div className="form-row-3">
          <div className="form-group"><label className="form-label">Employee ID</label><div style={{ position: 'relative' }}><input className="input mono" value="EMP006" disabled style={{ background: 'var(--steell)', paddingRight: 32 }} /><Lock size={12} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)' }} /></div></div>
          <div className="form-group"><label className="form-label">Full Name <span style={{ color: 'var(--red)' }}>*</span></label><input className="input" placeholder="Enter full name" value={fullName} onChange={e => setFullName(e.target.value)} style={errors.fullName ? { borderColor: 'var(--red)' } : {}} />{errors.fullName && <div style={{ color: 'var(--red)', fontSize: 11, marginTop: 4 }}>{errors.fullName}</div>}</div>
          <div className="form-group"><label className="form-label">Father Name</label><input className="input" value={fatherName} onChange={e => setFatherName(e.target.value)} /></div>
        </div>
        <div className="form-row-3">
          <div className="form-group"><label className="form-label">CNIC <span style={{ color: 'var(--red)' }}>*</span></label><input className="input mono" placeholder="00000-0000000-0" value={cnic} onChange={e => setCnic(formatCnic(e.target.value))} style={errors.cnic ? { borderColor: 'var(--red)' } : {}} />{errors.cnic && <div style={{ color: 'var(--red)', fontSize: 11, marginTop: 4 }}>{errors.cnic}</div>}</div>
          <div className="form-group"><label className="form-label">Date of Birth</label><input className="input" type="date" value={dob} onChange={e => setDob(e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Gender</label><select className="input select-input" value={gender} onChange={e => setGender(e.target.value)}><option>Male</option><option>Female</option></select></div>
        </div>
      </div>);
  case 1: return (<div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Contact 1 *</label>
            <input className="input" value={contact1} onChange={e => handleNumberChange(e.target.value, setContact1)} />
          </div>
          <div className="form-group">
            <label className="form-label">Contact 2</label>
            <input className="input" value={contact2} onChange={e => handleNumberChange(e.target.value, setContact2)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">ICE 1</label>
            <input className="input" value={ice1} onChange={e => handleNumberChange(e.target.value, setIce1)} />
          </div>
          <div className="form-group">
            <label className="form-label">ICE 2</label>
            <input className="input" value={ice2} onChange={e => handleNumberChange(e.target.value, setIce2)} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Permanent Address</label>
          <textarea className="input" rows={2} value={permAddress} onChange={e => setPermAddress(e.target.value)} />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, margin: '8px 0' }}>
          <input type="checkbox" checked={sameAddress} onChange={e => { setSameAddress(e.target.checked); if (e.target.checked) setPostAddress(permAddress); }} /> Same as permanent
        </label>
        <div className="form-group">
          <label className="form-label">Postal Address</label>
          <textarea className="input" rows={2} value={sameAddress ? permAddress : postAddress} onChange={e => setPostAddress(e.target.value)} disabled={sameAddress} />
        </div>
      </div>);
case 2: return (<div>
        <div className="form-row">
          {/* Bank Name: Sirf Alphabets allow honge */}
          <div className="form-group">
            <label className="form-label">Bank Name</label>
            <input 
              className="input" 
              placeholder="e.g. HBL, Alfalah"
              value={bankName} 
              onChange={e => handleTextChange(e.target.value, setBankName)} 
            />
          </div>

          {/* Account Number: Sirf Numbers allow honge (11 digits limit) */}
          <div className="form-group">
            <label className="form-label">Account Number</label>
            <input 
              className="input mono" 
              placeholder="Numbers only"
              value={bankAccount} 
              onChange={e => handleNumberChange(e.target.value, setBankAccount)} 
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Payment Mode</label>
          <select 
            className="input select-input" 
            value={paymentMode} 
            onChange={e => setPaymentMode(e.target.value)}
          >
            <option>Cash</option>
            <option>Online Transfer</option>
            <option>Cheque</option>
          </select>
        </div>
      </div>);
      case 3: return (<div>
        <div className="form-row-3">
          <div className="form-group"><label className="form-label">Department *</label><select className="input select-input" value={dept} onChange={e => setDept(e.target.value)}>{departments.map((d: string) => <option key={d}>{d}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Designation *</label><select className="input select-input" value={desig} onChange={e => setDesig(e.target.value)}>{designations.map((d: string) => <option key={d}>{d}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Employment Type</label><select className="input select-input" value={empType} onChange={e => setEmpType(e.target.value)}>{employmentTypes.map((d: string) => <option key={d}>{d}</option>)}</select></div>
        </div>
        <div className="form-row-3">
          <div className="form-group"><label className="form-label">Job Status</label><select className="input select-input" value={jobStat} onChange={e => setJobStat(e.target.value)}>{jobStatuses.map((d: string) => <option key={d}>{d}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Work Location *</label><select className="input select-input" value={wLoc} onChange={e => setWLoc(e.target.value)}>{workLocations.map((d: string) => <option key={d}>{d}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Work Mode</label><select className="input select-input" value={wMode} onChange={e => setWMode(e.target.value)}>{workModes.map((d: string) => <option key={d}>{d}</option>)}</select></div>
        </div>
        <div className="form-row-3">
          <div className="form-group"><label className="form-label">Reporting Manager *</label><select className="input select-input" value={rm} onChange={e => setRm(e.target.value)}>{reportingManagers.map((d: string) => <option key={d}>{d}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Shift *</label><select className="input select-input" value={shift} onChange={e => setShift(e.target.value)}>{shifts.map((s: any) => <option key={s.name}>{s.name}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Timing</label><input className="input mono" value={selectedShift ? `${selectedShift.start} – ${selectedShift.end} PKT` : ''} readOnly style={{ background: 'var(--steell)' }} /></div>
        </div>
        <div className="form-row-3">
          <div className="form-group"><label className="form-label">Date of Joining *</label><input className="input" type="date" value={doj} onChange={e => setDoj(e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Date of Exit</label><input className="input" type="date" value={doe} onChange={e => setDoe(e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Commission Eligible</label><div style={{ display: 'flex', gap: 12, marginTop: 6 }}><label style={{ fontSize: 12.5, cursor: 'pointer' }}><input type="radio" checked={commissionEligible} onChange={() => setCommissionEligible(true)} /> Yes</label><label style={{ fontSize: 12.5, cursor: 'pointer' }}><input type="radio" checked={!commissionEligible} onChange={() => setCommissionEligible(false)} /> No</label></div></div>
        </div>
      </div>);
      case 4: return (<div>
        <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 12 }}>Salary components are configurable from Settings → Payroll Components</div>
        <div className="card" style={{ padding: 0 }}><table><thead><tr><th>Component</th><th>Monthly Amount (PKR)</th><th>Include</th></tr></thead><tbody>
          <tr><td>Basic Salary</td><td><input className="input mono" type="number" value={salBasic || ''} onChange={e => setSalBasic(+e.target.value)} style={{ width: 160 }} /></td><td><input type="checkbox" defaultChecked /></td></tr>
          <tr><td>House Rent</td><td><input className="input mono" type="number" value={salHouse || ''} onChange={e => setSalHouse(+e.target.value)} style={{ width: 160 }} /></td><td><input type="checkbox" defaultChecked /></td></tr>
          <tr><td>Medical</td><td><input className="input mono" type="number" value={salMedical || ''} onChange={e => setSalMedical(+e.target.value)} style={{ width: 160 }} /></td><td><input type="checkbox" defaultChecked /></td></tr>
          <tr><td>Conveyance</td><td><input className="input mono" type="number" value={salConveyance || ''} onChange={e => setSalConveyance(+e.target.value)} style={{ width: 160 }} /></td><td><input type="checkbox" defaultChecked /></td></tr>
          {commissionEligible && <tr><td>Commission</td><td><input className="input mono" type="number" value={salCommission || ''} onChange={e => setSalCommission(+e.target.value)} style={{ width: 160 }} /></td><td><input type="checkbox" defaultChecked /></td></tr>}
        </tbody></table></div>
        <div style={{ background: 'var(--inp)', padding: 14, borderRadius: 'var(--rsm)', marginTop: 12, display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 13, fontWeight: 600 }}>Total Monthly Package</span><span className="mono" style={{ fontSize: 18, fontWeight: 800, color: 'var(--p)' }}>{formatPKR(totalSalary)}</span></div>
        <div style={{ marginTop: 12 }}><DecisionBanner>DECISION NEEDED — Salary Components: Same for all or per person? Confirm in meeting.</DecisionBanner></div>
      </div>);
 case 5: return (<div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Blood Group</label>
            <select className="input select-input" value={bloodGroup} onChange={e => setBloodGroup(e.target.value)}>
              <option value="">Select</option>
              {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Allergies</label>
            <textarea 
              className="input" 
              rows={2} 
              placeholder="No numbers allowed"
              value={allergies} 
              onChange={e => handleTextChange(e.target.value, setAllergies)} 
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Chronic Conditions</label>
            <textarea 
              className="input" 
              rows={2} 
              placeholder="No numbers allowed"
              value={chronic} 
              onChange={e => handleTextChange(e.target.value, setChronic)} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Medications</label>
            <textarea 
              className="input" 
              rows={2} 
              placeholder="No numbers allowed"
              value={medications} 
              onChange={e => handleTextChange(e.target.value, setMedications)} 
            />
          </div>
        </div>
        <div style={{ marginTop: 12 }}><DecisionBanner>DECISION NEEDED — Can employees edit their own medical info? Confirm in meeting.</DecisionBanner></div>
      </div>);
 case 6: return (<div>
        {/* Hidden File Input taake files select ho sakein */}
        <input type="file" id="file-upload" style={{ display: 'none' }} onChange={(e) => alert('File Selected: ' + e.target.files?.[0].name)} />
        
        {[{ label: 'CNIC Copy', status: 'uploaded', file: 'cnic_scan.pdf' }, 
          { label: 'Profile Photo', status: 'uploaded', file: 'photo.jpg' }, 
          { label: 'Electric Bill', status: 'missing' }, 
          { label: 'Employment Contract', status: 'missing' }].map((att, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--br2)' }}>
            <FileText size={16} style={{ color: 'var(--t3)' }} />
            <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{att.label}</span>
            
            {att.status === 'uploaded' ? (
              <>
                <span className="pill pill-green">✓ Uploaded — {att.file}</span>
                {/* View button ab alert dikhaye ga, real app mein file open hogi */}
                <button className="btn btn-sm btn-ghost" onClick={() => window.open('#', '_blank')}>View</button>
              </>
            ) : (
              <>
                <span className="pill pill-amber">⚠ Missing</span>
                {/* Upload click karne par hidden input trigger hoga */}
                <button className="btn btn-sm btn-ghost" onClick={() => document.getElementById('file-upload')?.click()}>
                  <Upload size={12} /> Upload
                </button>
              </>
            )}
          </div>
        ))}
        <div style={{ marginTop: 12 }}><DecisionBanner>DECISION NEEDED — Which attachments are mandatory? Confirm in meeting.</DecisionBanner></div>
      </div>);
      case 7: return (<div>
        <div style={{ display: 'flex', gap: 0, marginBottom: 16, background: 'var(--inp)', borderRadius: 'var(--rsm)', overflow: 'hidden', border: '1px solid var(--br)' }}>
          <button onClick={() => setAccountMethod('A')} style={{ flex: 1, padding: '10px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 12, background: accountMethod === 'A' ? 'var(--p)' : 'transparent', color: accountMethod === 'A' ? '#fff' : 'var(--t2)' }}>HR Creates Credentials</button>
          <button onClick={() => setAccountMethod('B')} style={{ flex: 1, padding: '10px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 12, background: accountMethod === 'B' ? 'var(--p)' : 'transparent', color: accountMethod === 'B' ? '#fff' : 'var(--t2)' }}>Send Invite Link</button>
        </div>
        {accountMethod === 'A' ? (<div><div className="form-group"><label className="form-label">Username</label><input className="input" value={username || fullName.toLowerCase().replace(/\s+/g, '.')} onChange={e => setUsername(e.target.value)} /></div><div className="form-group"><label className="form-label">Temporary Password</label><input className="input" type="password" value={tempPassword} onChange={e => setTempPassword(e.target.value)} /></div></div>) :
        (<div><div className="form-group"><label className="form-label">Employee Email</label><input className="input" type="email" value={empEmail} onChange={e => setEmpEmail(e.target.value)} /></div><div style={{ fontSize: 11, color: 'var(--t3)' }}>Employee will receive a link and set their own password.</div></div>)}
        {fullName && <div style={{ background: 'var(--inp)', padding: 12, borderRadius: 'var(--rsm)', marginTop: 16, fontSize: 12 }}><strong>{fullName}</strong> · {dept} · {desig} · {shift}<br />Total Package: {formatPKR(totalSalary)}/month{doj && ` · Joining: ${doj}`}</div>}
        <div style={{ marginTop: 12 }}><DecisionBanner>DECISION NEEDED — Account creation method: A or B? Confirm in meeting.</DecisionBanner></div>
      </div>);
      default: return null;
    }
  };

  return (
    <div>
      <div className="pg-head"><div><div className="pg-greet">Add Employee</div><div className="pg-sub">Step {step + 1} of {STEPS.length} — {STEPS[step]}</div></div></div>
      {/* Step indicator */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
          {STEPS.map((s, i) => (<React.Fragment key={i}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 60 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, background: i < step ? 'var(--green)' : i === step ? 'var(--p)' : 'var(--inp)', color: i <= step ? '#fff' : 'var(--t3)', border: i > step ? '1.5px solid var(--br)' : 'none' }}>
                {i < step ? <Check size={13} /> : i + 1}
              </div>
              <div style={{ fontSize: 9, marginTop: 4, color: i === step ? 'var(--p)' : 'var(--t3)', fontWeight: i === step ? 700 : 400 }}>{s}</div>
            </div>
            {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: i < step ? 'var(--green)' : 'var(--br)', margin: '0 -4px', marginBottom: 16 }} />}
          </React.Fragment>))}
        </div>
        <div className="progress-bar" style={{ marginTop: 12 }}><div className="progress-fill" style={{ width: `${((step + 1) / STEPS.length) * 100}%`, background: 'var(--p)' }} /></div>
      </div>

      <div className="card" style={{ minHeight: 300 }}>{renderStep()}</div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, padding: '12px 0' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/employees')}><X size={13} /> Cancel</button>
        <span style={{ fontSize: 12, color: 'var(--t3)' }}>Step {step + 1} of {STEPS.length} — {STEPS[step]}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {step > 0 && <button className="btn btn-secondary" onClick={goBack}><ChevronLeft size={13} /> Back</button>}
          {step < STEPS.length - 1 ? <button className="btn btn-primary" onClick={goNext}>Next <ChevronRight size={13} /></button> :
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : '✓ Save Employee'}</button>}
        </div>
      </div>
    </div>
  );
}










