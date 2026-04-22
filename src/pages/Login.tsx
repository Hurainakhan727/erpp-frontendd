import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Zap } from 'lucide-react';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to={user.role === 'employee' ? '/my-dashboard' : '/dashboard'} />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      const success = login(username, password);
      if (success) {
        const stored = JSON.parse(localStorage.getItem('ems_user') || '{}');
        navigate(stored.role === 'employee' ? '/my-dashboard' : '/dashboard');
      } else {
        setError('Invalid username or password');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div className="sb-mark" style={{ width: 48, height: 48 }}><Zap size={22} /></div>
        </div>
        <div className="login-title">Employee Management System</div>
        <div className="login-sub">Sign in to your account</div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="input" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input className="input" type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {error && <div style={{ color: 'var(--red)', fontSize: 12, marginBottom: 12 }}>{error}</div>}
          <button className="btn btn-primary" type="submit" style={{ width: '100%', justifyContent: 'center', padding: '10px 14px' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div style={{ marginTop: 20, padding: 12, background: 'var(--inp)', borderRadius: 'var(--rsm)', fontSize: 11, color: 'var(--t3)' }}>
          <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--t2)' }}>Demo Accounts:</div>
          <div className="mono" style={{ fontSize: 10.5 }}>superadmin / admin123 → Super Admin</div>
          <div className="mono" style={{ fontSize: 10.5 }}>hr1 / hr123 → HR</div>
          <div className="mono" style={{ fontSize: 10.5 }}>emp001 / emp123 → Employee</div>
        </div>
      </div>
    </div>
  );
}