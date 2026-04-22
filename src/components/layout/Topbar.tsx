import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Search, LogOut, ShieldCheck } from "lucide-react";

const routeNames: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/employees": "Employees",
  "/employees/add": "Add Employee",
  "/attendance": "Attendance",
  "/leave": "Leave Management",
  "/payroll": "Payroll",
  "/promotions": "Promotions",
  "/accounts": "HR Accounts",
  "/audit-log": "Audit Log",
  "/my-dashboard": "My Dashboard",
  "/my-attendance": "My Attendance",
  "/my-payslips": "My Payslips",
  "/my-leave": "Leave",
  "/my-penalties": "My Penalties",
  "/my-profile": "My Profile",
};

export default function Topbar() {
  const auth = useAuth(); // Poora object le rahe hain error se bachne ke liye
  const location = useLocation();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    if (auth?.logout) {
      auth.logout();
      navigate("/login", { replace: true });
    }
  };

  const pageName =
    routeNames[location.pathname] ||
    (location.pathname.startsWith("/settings/")
      ? location.pathname.split("/").pop()?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : "Page");

  const dateStr = time.toLocaleDateString("en-PK", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // Role display logic
  const displayRole = auth?.user?.role === 'super_admin' ? 'Super Admin' : 
                      auth?.user?.role === 'hr' ? 'HR Module' : 'Employee';

  return (
    <div className="topbar">
      <div className="bc">
        <span className="bc-home">EMS</span>
        <span className="bc-sep">·</span>
        <span className="bc-cur">{pageName}</span>
      </div>

      <div className="topbar-search" style={{ marginLeft: "auto", marginRight: 8 }}>
        <Search size={13} style={{ color: "var(--t3)" }} />
        <span>Search employees, records, reports...</span>
        <kbd>⌘K</kbd>
      </div>

      <div className="topbar-right">
        {/* Module Label - No more switcher */}
        <div className="active-role-display" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          background: 'rgba(37, 99, 235, 0.1)', 
          padding: '4px 12px', 
          borderRadius: '8px',
          border: '1px solid rgba(37, 99, 235, 0.2)'
        }}>
          <ShieldCheck size={14} color="#2563eb" />
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#1e293b', textTransform: 'uppercase' }}>
             {displayRole}
          </span>
        </div>

        <span className="tdate">{dateStr}</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="t-av">
            {auth?.user?.username?.substring(0, 2).toUpperCase() || "UN"}
          </div>
          <button 
            onClick={handleLogout}
            style={{ 
              background: '#fee2e2', 
              color: '#ef4444', 
              border: 'none', 
              padding: '6px', 
              borderRadius: '6px', 
              cursor: 'pointer' 
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}










