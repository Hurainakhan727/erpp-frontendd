import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  LayoutDashboard,
  CalendarCheck,
  Wallet,
  CalendarDays,
  User,
  LogOut,
  Zap,
  AlertTriangle,
} from "lucide-react";

export default function EmployeeSidebar() {
  const { user, logout } = useAuth();
  const links = [
    { to: "/my-dashboard", icon: LayoutDashboard, label: "My Dashboard" },
    { to: "/my-attendance", icon: CalendarCheck, label: "My Attendance" },
    { to: "/my-payslips", icon: Wallet, label: "My Payslips" },
    { to: "/my-leave", icon: CalendarDays, label: "Apply for Leave" },
    { to: "/my-penalties", icon: AlertTriangle, label: "My Penalties" },
    { to: "/my-profile", icon: User, label: "My Profile" },
  ];

  return (
    <div className="sidebar emp-sidebar">
      <div className="sb-logo">
        <div className="sb-logo-row">
          <div className="sb-mark">
            <Zap size={17} />
          </div>
          <div>
            <div className="sb-title">EMS</div>
            <div className="sb-subtitle">Self Service</div>
          </div>
        </div>
      </div>
      <div className="sb-sec">
        <div className="sb-lbl">Menu</div>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `nav-a ${isActive ? "active" : ""}`}
          >
            <link.icon size={14} className="nav-ico" />
            {link.label}
          </NavLink>
        ))}
      </div>
      <div className="sb-bottom">
        <div className="sb-user">
          <div className="sb-chip" onClick={logout}>
            <div className="sb-av">AA</div>
            <div>
              <div className="sb-un">Ahmed Ali</div>
              <div className="sb-ur">employee</div>
            </div>
            <LogOut
              size={14}
              style={{ marginLeft: "auto", color: "rgba(255,255,255,.18)" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
