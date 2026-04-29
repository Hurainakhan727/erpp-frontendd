import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { DataProvider } from "./context/DataContext";

// Layouts
import MainLayout from "./layouts/MainLayout";
import EmployeeLayout from "./layouts/EmployeeLayout";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import AddEmployee from "./pages/AddEmployee";
import EmployeeDetail from "./pages/EmployeeDetail";
import Attendance from "./pages/Attendance";
import Leave from "./pages/Leave";
import Payroll from "./pages/Payroll";
import Promotions from "./pages/Promotions";
import Accounts from "./pages/Accounts";
import AuditLog from "./pages/AuditLog";

// Employee Specific Pages
import MyDashboard from "./pages/MyDashboard";
import MyAttendance from "./pages/MyAttendance";
import MyPayslips from "./pages/MyPayslips";
import MyLeave from "./pages/MyLeave";
import MyPenalties from "./pages/MyPenalties";
import MyProfile from "./pages/MyProfile";

// Settings
import {
  DepartmentsPage,
  DesignationsPage,
  WorkModesPage,
  WorkLocationsPage,
  EmploymentTypesPage,
  JobStatusesPage,
  ReportingManagersPage,
  ShiftsPage,
  LeaveTypesPage,
  LeavePoliciesPage,
  PayrollComponentsPage,
  PenaltiesConfigPage,
  TaxConfigPage,
  GlobalDaysPage,
} from "./pages/settings/AllSettings";
import CustomFields from "./pages/settings/CustomFields";

/**
 * 1. Protected Route Wrapper
 * Checks if user is logged in.
 */
const ProtectedRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const { user, activeRole, loading } = useAuth();

  if (loading) return <div>Loading...</div>; // Ya koi professional spinner

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(activeRole)) {
    return <Navigate to={activeRole === "employee" ? "/my-dashboard" : "/dashboard"} replace />;
  }

  return <Outlet />;
};

/**
 * 2. Root Redirect Logic
 */
function RootRedirect() {
  const { user, activeRole } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return activeRole === "employee" ? (
    <Navigate to="/my-dashboard" />
  ) : (
    <Navigate to="/dashboard" />
  );
}

const App = () => (
  <AuthProvider>
    <ToastProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<RootRedirect />} />

            {/* --- ADMIN & HR ROUTES (MainLayout) --- */}
            <Route element={<ProtectedRoute allowedRoles={["super_admin", "admin", "hr"]} />}>
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/employees" element={<Employees />} />
                <Route path="/employees/add" element={<AddEmployee />} />
                <Route path="/employees/:id" element={<EmployeeDetail />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/leave" element={<Leave />} />
                <Route path="/payroll" element={<Payroll />} />
                <Route path="/promotions" element={<Promotions />} />
                <Route path="/accounts" element={<Accounts />} />
                <Route path="/audit-log" element={<AuditLog />} />
                
                {/* Settings Nested Routes */}
                <Route path="/settings/departments" element={<DepartmentsPage />} />
                <Route path="/settings/reporting-managers" element={<ReportingManagersPage />} />
                <Route path="/settings/designations" element={<DesignationsPage />} />
                <Route path="/settings/work-modes" element={<WorkModesPage />} />
                <Route path="/settings/work-locations" element={<WorkLocationsPage />} />
                <Route path="/settings/employment-types" element={<EmploymentTypesPage />} />
                <Route path="/settings/job-statuses" element={<JobStatusesPage />} />
                <Route path="/settings/shifts" element={<ShiftsPage />} />
                <Route path="/settings/leave-types" element={<LeaveTypesPage />} />
                <Route path="/settings/leave-policies" element={<LeavePoliciesPage />} />
                <Route path="/settings/payroll-components" element={<PayrollComponentsPage />} />
                <Route path="/settings/penalties-config" element={<PenaltiesConfigPage />} />
                <Route path="/settings/tax-config" element={<TaxConfigPage />} />
                <Route path="/settings/global-days" element={<GlobalDaysPage />} />
                <Route path="/settings/custom-fields" element={<CustomFields />} />
              </Route>
            </Route>

            {/* --- EMPLOYEE ROUTES (EmployeeLayout) --- */}
            <Route element={<ProtectedRoute allowedRoles={["employee"]} />}>
              <Route element={<EmployeeLayout />}>
                <Route path="/my-dashboard" element={<MyDashboard />} />
                <Route path="/my-attendance" element={<MyAttendance />} />
                <Route path="/my-payslips" element={<MyPayslips />} />
                <Route path="/my-leave" element={<MyLeave />} />
                <Route path="/my-penalties" element={<MyPenalties />} />
                <Route path="/my-profile" element={<MyProfile />} />
              </Route>
            </Route>

            {/* 404 Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </ToastProvider>
  </AuthProvider>
);

export default App;