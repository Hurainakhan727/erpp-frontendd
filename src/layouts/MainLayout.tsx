import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import { AlertTriangle, X } from 'lucide-react';

export default function MainLayout() {
  const { user, activeRole } = useAuth();
  const { globalDays } = useData();
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('ems_banner_dismissed') === 'true') setBannerDismissed(true);
  }, []);

  if (!user) return <Navigate to="/login" />;
  if (activeRole === 'employee') return <Navigate to="/my-dashboard" />;

  const today = new Date().toISOString().split('T')[0];
  const activeBanner = !bannerDismissed ? globalDays.find(g => g.date === today && g.show_banner && g.is_active) : null;

  const handleDismiss = () => {
    setBannerDismissed(true);
    sessionStorage.setItem('ems_banner_dismissed', 'true');
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        <Topbar />
        {activeBanner && (
          <div style={{ background: 'var(--amberl)', border: '1px solid var(--amber)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: 'var(--amber)' }}>
            <AlertTriangle size={14} />
            <span style={{ flex: 1, fontWeight: 600 }}>{activeBanner.banner_message || activeBanner.title}</span>
            <button onClick={handleDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--amber)', padding: 4 }}><X size={14} /></button>
          </div>
        )}
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}











