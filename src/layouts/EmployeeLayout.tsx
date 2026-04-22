import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EmployeeSidebar from '../components/layout/EmployeeSidebar';
import Topbar from '../components/layout/Topbar';

export default function EmployeeLayout() {
  const { user, activeRole } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (activeRole !== 'employee') return <Navigate to="/dashboard" />;

  return (
    <div className="app-layout">
      <EmployeeSidebar />
      <div className="main-area">
        <Topbar />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}











