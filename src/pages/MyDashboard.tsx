import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useData } from "../context/DataContext";
import { formatPKR } from "../services/api";
import {
  Calendar,
  CalendarDays,
  Clock,
  Wallet,
  FileText,
  Plus,
  Cake,
  User,
  Lock,
  Play,
  Square,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import Modal from "../components/common/Modal";
import { useToastContext } from "../context/ToastContext";

export default function MyDashboard() {
  const [time, setTime] = useState(new Date());
  const { attendanceData, leaveRequests, setLeaveRequests, employees, globalDays } = useData();
  const [leaveModal, setLeaveModal] = useState(false);
  const [leaveType, setLeaveType] = useState("Annual Leave");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState("");
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const { showToast } = useToastContext();

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const dateStr = time.toLocaleDateString("en-PK", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeStr =
    time.toLocaleTimeString("en-PK", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }) + " PKT";

  const balances = [
    { type: "Annual", remaining: 7, total: 12, color: "var(--p)" },
    { type: "Casual", remaining: 10, total: 12, color: "var(--green)" },
    { type: "Medical", remaining: 8, total: 8, color: "var(--teal)" },
  ];

  const calcDays = () => {
    if (!fromDate || !toDate) return 0;
    const diff =
      (new Date(toDate).getTime() - new Date(fromDate).getTime()) /
      (1000 * 60 * 60 * 24);
    return Math.max(0, diff + 1);
  };

  const selectedBalance = balances.find((b) =>
    leaveType.toLowerCase().includes(b.type.toLowerCase()),
  );
  const daysRequested = calcDays();
  const overBalance =
    selectedBalance && daysRequested > selectedBalance.remaining;

  const handleCheckIn = () => {
    const now = time.toLocaleTimeString("en-PK", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    setCheckedIn(true);
    setCheckInTime(now);
    localStorage.setItem("ems_checkin_today", now);
    showToast(`Checked in at ${now}`);
  };

  const handleCheckOut = () => {
    const now = time.toLocaleTimeString("en-PK", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    setCheckedIn(false);
    localStorage.setItem("ems_checkout_today", now);
    showToast(`Checked out at ${now}`);
  };

  const handleLeaveSubmit = () => {
    if (!fromDate || !toDate || !reason) {
      showToast("Please fill all fields", "error");
      return;
    }
    setLeaveRequests((prev) => [
      {
        id: "LR" + String(prev.length + 1).padStart(3, "0"),
        empId: "EMP001",
        empName: "Ahmed Ali",
        leaveType: leaveType
          .replace(" Leave", "")
          .replace(" (7 remaining)", "")
          .replace(" (10 remaining)", "")
          .replace(" (8 remaining)", ""),
        from: fromDate,
        to: toDate,
        days: daysRequested,
        reason,
        appliedOn: new Date().toISOString().split("T")[0],
        status: "Pending",
      },
      ...prev,
    ]);
    showToast("Leave request submitted");
    setLeaveModal(false);
    setFromDate("");
    setToDate("");
    setReason("");
  };

  // Team members
  const teamMembers = [
    { name: "Sara Khan", dept: "Marketing", initials: "SK" },
    { name: "Usman Malik", dept: "HR", initials: "UM" },
  ];

  // Upcoming leaves
  const myPendingLeaves = leaveRequests.filter(
    (l: any) =>
      l.empId === "EMP001" &&
      l.status === "Approved" &&
      new Date(l.from) > new Date(),
  );

  // Calendar events
  const calendarEvents = useMemo(() => {
    const events: Record<string, { type: string; label: string; color: string }[]> = {};
    // Birthdays from employees
    employees.forEach((emp: any) => {
      if (!emp.dob) return;
      const dobDate = new Date(emp.dob);
      if (dobDate.getMonth() === calMonth) {
        const day = dobDate.getDate();
        if (!events[day]) events[day] = [];
        events[day].push({ type: "birthday", label: `${emp.name}`, color: "#e91e63" });
      }
    });
    // Global days (holidays, emergencies)
    globalDays.forEach((gd: any) => {
      if (!gd.is_active) return;
      const gdDate = new Date(gd.date);
      if (gdDate.getMonth() === calMonth && gdDate.getFullYear() === calYear) {
        const day = gdDate.getDate();
        if (!events[day]) events[day] = [];
        events[day].push({
          type: gd.type,
          label: gd.title,
          color: gd.type === "emergency" ? "#b71c1c" : gd.type === "holiday" ? "#1b7a4e" : "#1565c0",
        });
      }
    });
    // Approved leaves (show team members on leave)
    leaveRequests.filter((l: any) => l.status === "Approved").forEach((l: any) => {
      const from = new Date(l.from);
      const to = new Date(l.to);
      for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
        if (d.getMonth() === calMonth && d.getFullYear() === calYear) {
          const day = d.getDate();
          if (!events[day]) events[day] = [];
          if (!events[day].find((e) => e.label === `${l.empName} (Leave)`)) {
            events[day].push({ type: "leave", label: `${l.empName} (Leave)`, color: "#1565c0" });
          }
        }
      }
    });
    return events;
  }, [employees, globalDays, leaveRequests, calMonth, calYear]);

  // Upcoming birthdays (next 30 days)
  const upcomingBirthdays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const birthdays: { name: string; date: Date; daysUntil: number; initials: string }[] = [];
    employees.forEach((emp: any) => {
      if (!emp.dob) return;
      const dob = new Date(emp.dob);
      let birthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
      if (birthday < today) {
        birthday = new Date(today.getFullYear() + 1, dob.getMonth(), dob.getDate());
      }
      const daysUntil = Math.ceil((birthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntil <= 30) {
        const nameParts = emp.name.split(" ");
        const initials = nameParts.map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
        birthdays.push({ name: emp.name, date: birthday, daysUntil, initials });
      }
    });
    return birthdays.sort((a, b) => a.daysUntil - b.daysUntil);
  }, [employees]);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay();

  return (
    <div>
      {/* Welcome Banner */}
      <div
        className="card"
        style={{
          marginBottom: 12,
          background: "linear-gradient(135deg, var(--pl), var(--card))",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--t1)" }}>
              Welcome back, Ahmed Ali 👋
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
              {[
                { label: "Employee ID", value: "EMP001" },
                { label: "Department", value: "Engineering" },
                { label: "Shift", value: "Morning Shift (09:00-18:00)" },
              ].map((item, i) => (
                <span
                  key={i}
                  className="mono"
                  style={{ fontSize: 10.5, color: "var(--t3)" }}
                >
                  {item.label}:{" "}
                  <strong style={{ color: "var(--t1)" }}>{item.value}</strong>
                </span>
              ))}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="mono" style={{ fontSize: 11, color: "var(--t2)" }}>
              {dateStr}
            </div>
            <div
              className="mono"
              style={{ fontSize: 14, fontWeight: 600, color: "var(--p)" }}
            >
              {timeStr}
            </div>
          </div>
        </div>
      </div>

      {/* Today's Schedule + Check-in */}
      <div className="g2" style={{ marginBottom: 0 }}>
        <div className="card">
          <div className="ch">
            <div className="ct">
              <div className="ct-ico blue">
                <Clock size={13} />
              </div>
              Today's Schedule
            </div>
          </div>
          <div style={{ display: "flex", gap: 20, fontSize: 12.5 }}>
            <div>
              <div
                style={{ fontSize: 10, color: "var(--t3)", marginBottom: 2 }}
              >
                Shift Start
              </div>
              <div className="mono" style={{ fontWeight: 600 }}>
                09:00
              </div>
            </div>
            <div>
              <div
                style={{ fontSize: 10, color: "var(--t3)", marginBottom: 2 }}
              >
                Shift End
              </div>
              <div className="mono" style={{ fontWeight: 600 }}>
                18:00
              </div>
            </div>
            <div>
              <div
                style={{ fontSize: 10, color: "var(--t3)", marginBottom: 2 }}
              >
                Break
              </div>
              <div className="mono" style={{ fontWeight: 600 }}>
                13:00 - 14:00
              </div>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            {!checkedIn ? (
              <button className="btn btn-primary" onClick={handleCheckIn}>
                <Play size={13} /> Check In
              </button>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span className="pill pill-green">
                  ✓ Checked in at {checkInTime}
                </span>
                <button className="btn btn-danger" onClick={handleCheckOut}>
                  <Square size={12} /> Check Out
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="card">
          <div className="ch">
            <div className="ct">
              <div className="ct-ico green">
                <User size={13} />
              </div>
              Quick Actions
            </div>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
          >
            <button
              className="btn btn-ghost"
              style={{ justifyContent: "flex-start" }}
              onClick={() => setLeaveModal(true)}
            >
              <Calendar size={13} /> Apply for Leave
            </button>
            <button
              className="btn btn-ghost"
              style={{ justifyContent: "flex-start" }}
            >
              <Wallet size={13} /> View Payslips
            </button>
            <button
              className="btn btn-ghost"
              style={{ justifyContent: "flex-start" }}
            >
              <User size={13} /> Update Profile
            </button>
            <button
              className="btn btn-ghost"
              style={{ justifyContent: "flex-start" }}
            >
              <Lock size={13} /> Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="kpi-strip">
        <div className="kpi-item k1">
          <div className="kpi-ico k1">
            <Calendar size={17} />
          </div>
          <div>
            <div className="kpi-val">
              18<span style={{ fontSize: 13, color: "var(--t3)" }}> / 22</span>
            </div>
            <div className="kpi-lbl">Attendance This Month</div>
            <div className="progress-bar" style={{ width: 80, marginTop: 4 }}>
              <div
                className="progress-fill"
                style={{ width: "82%", background: "var(--p)" }}
              />
            </div>
          </div>
        </div>
        <div
          className="kpi-item k2"
          style={{ flexDirection: "column", alignItems: "flex-start", gap: 4 }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--t1)",
              marginBottom: 4,
            }}
          >
            Leave Balance
          </div>
          {balances.map((b, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                width: "100%",
              }}
            >
              <span style={{ fontSize: 10.5, color: "var(--t2)", width: 50 }}>
                {b.type}
              </span>
              <div className="progress-bar" style={{ flex: 1, height: 4 }}>
                <div
                  className="progress-fill"
                  style={{
                    width: `${(b.remaining / b.total) * 100}%`,
                    background: b.color,
                  }}
                />
              </div>
              <span
                className="mono"
                style={{ fontSize: 10, color: "var(--t2)", width: 40 }}
              >
                {b.remaining}/{b.total}
              </span>
            </div>
          ))}
        </div>
        <div className="kpi-item k3">
          <div className="kpi-ico k3">
            <Clock size={17} />
          </div>
          <div>
            <div className="kpi-val">1</div>
            <div className="kpi-lbl">Pending Requests</div>
          </div>
        </div>
        <div className="kpi-item k4">
          <div className="kpi-ico k4">
            <Wallet size={17} />
          </div>
          <div>
            <div className="kpi-val" style={{ fontSize: 16 }}>
              {formatPKR(178000)}
            </div>
            <div className="kpi-lbl">Last Payslip · Mar 2026</div>
          </div>
        </div>
      </div>

      {/* Attendance + Leave + Team */}
      <div className="g2">
        <div className="card">
          <div className="ch">
            <div className="ct">
              <div className="ct-ico blue">
                <Calendar size={13} />
              </div>
              My Attendance (Last 7 Days)
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Day</th>
                <th>Status</th>
                <th>In</th>
                <th>Out</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData
                .filter((a: any) => a.empId === "EMP001")
                .slice(0, 7)
                .map((a: any, i: number) => (
                  <tr
                    key={i}
                    style={i === 0 ? { background: "var(--pl)" } : {}}
                  >
                    <td className="mono">{a.date}</td>
                    <td>{a.day}</td>
                    <td>
                      <span
                        className={`pill ${a.status === "Present" ? "pill-green" : a.status === "Late" ? "pill-amber" : "pill-red"}`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="mono">{a.checkIn}</td>
                    <td className="mono">{a.checkOut}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <div className="ch">
            <div className="ct">
              <div className="ct-ico amber">
                <FileText size={13} />
              </div>
              My Leave Requests
            </div>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => setLeaveModal(true)}
            >
              <Plus size={12} /> Apply
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Days</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests
                .filter((l: any) => l.empId === "EMP001")
                .slice(0, 5)
                .map((l: any, i: number) => (
                  <tr key={i}>
                    <td>{l.leaveType}</td>
                    <td className="mono">{l.from}</td>
                    <td className="mono">{l.to}</td>
                    <td className="mono">{l.days}</td>
                    <td>
                      <span
                        className={`pill ${l.status === "Approved" ? "pill-green" : l.status === "Pending" ? "pill-amber" : "pill-red"}`}
                      >
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Team + Birthday */}
      <div className="g2">
        <div className="card">
          <div className="ch">
            <div className="ct">
              <div className="ct-ico teal">
                <User size={13} />
              </div>
              My Team
            </div>
          </div>
          {teamMembers.map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 0",
                borderBottom: "1px solid var(--br2)",
              }}
            >
              <div
                className="feed-av"
                style={{
                  background: "var(--p)",
                  width: 28,
                  height: 28,
                  fontSize: 9,
                }}
              >
                {m.initials}
              </div>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>{m.name}</div>
                <div style={{ fontSize: 10, color: "var(--t3)" }}>{m.dept}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="ch">
            <div className="ct">
              <div
                className="ct-ico"
                style={{ background: "#fce4ec", color: "#e91e63" }}
              >
                <Cake size={13} />
              </div>
              Upcoming Birthdays
            </div>
          </div>
          {[
            {
              name: "Ahmed Ali",
              date: "Mar 15",
              fullDate: new Date(2026, 2, 15),
              days: 0,
              initials: "AA",
            },
            {
              name: "Sara Khan",
              date: "Mar 28",
              fullDate: new Date(2026, 2, 28),
              days: 9,
              initials: "SK",
            },
          ].map((b, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 0",
                borderBottom: i < 1 ? "1px solid var(--br2)" : "none",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background:
                    b.days === 0
                      ? "linear-gradient(135deg, #e91e63, #f48fb1)"
                      : "var(--p)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {b.days === 0 ? "🎂" : b.initials}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)" }}
                >
                  {b.name}
                </div>
                <div
                  className="mono"
                  style={{ fontSize: 10, color: "var(--t3)" }}
                >
                  {b.fullDate.toLocaleDateString("en-PK", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </div>
              </div>
              <span
                className={`pill`}
                style={{
                  background:
                    b.days === 0
                      ? "#e91e63"
                      : b.days === 1
                        ? "#ff9800"
                        : b.days <= 7
                          ? "#4caf50"
                          : "#e3f2fd",
                  color: b.days <= 7 ? "white" : "#1565c0",
                  fontWeight: 600,
                  fontSize: 10,
                }}
              >
                {b.days === 0
                  ? "🎉 Today!"
                  : b.days === 1
                    ? "Tomorrow"
                    : `${b.days} days`}
              </span>
            </div>
          ))}
          {/* Birthday reminder for today */}
          {[
            {
              name: "Ahmed Ali",
              date: "Mar 15",
              fullDate: new Date(2026, 2, 15),
              days: 0,
              initials: "AA",
            },
          ].filter((b) => b.days === 0).length > 0 && (
            <div
              style={{
                marginTop: 8,
                padding: "8px 10px",
                background: "linear-gradient(135deg, #fce4ec, #f8bbd9)",
                borderRadius: 8,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 600, color: "#c2185b" }}>
                🎂 It's your birthday! Have a great day!
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Calendar - Birthdays, Holidays & Leave */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="ch">
          <div className="ct">
            <div className="ct-ico blue"><CalendarDays size={13} /></div>
            Calendar — Birthdays, Holidays & Leave
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <button className="btn btn-sm btn-ghost" onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); } else setCalMonth((m) => m - 1); }}>
            <ChevronLeft size={14} />
          </button>
          <span style={{ fontSize: 13, fontWeight: 700 }}>{monthNames[calMonth]} {calYear}</span>
          <button className="btn btn-sm btn-ghost" onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); } else setCalMonth((m) => m + 1); }}>
            <ChevronRight size={14} />
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3, textAlign: "center" }}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => (
            <div key={i} style={{ fontSize: 10, fontWeight: 700, color: "var(--t3)", padding: 6 }}>{d}</div>
          ))}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const evts = calendarEvents[day] || [];
            const isToday = day === new Date().getDate() && calMonth === new Date().getMonth() && calYear === new Date().getFullYear();
            const hasBirthday = evts.some((e) => e.type === "birthday");
            const hasHoliday = evts.some((e) => e.type === "holiday" || e.type === "emergency");
            return (
              <div
                key={day}
                style={{
                  padding: 5,
                  borderRadius: 8,
                  background: isToday ? "var(--pl)" : hasBirthday ? "#fce4ec" : hasHoliday ? "#e8f5e9" : evts.length > 0 ? "#f8fafc" : "transparent",
                  minHeight: 52,
                  cursor: evts.length > 0 ? "pointer" : "default",
                  border: isToday ? "2px solid var(--p)" : hasBirthday ? "1px solid #f48fb1" : hasHoliday ? "1px solid #81c784" : "1px solid transparent",
                  transition: "all 0.15s ease",
                }}
                title={evts.map((e) => e.type === "birthday" ? `🎂 ${e.label}'s Birthday` : e.label).join("\n")}
              >
                <div style={{ fontSize: 12, fontWeight: isToday ? 700 : 500, color: isToday ? "var(--p)" : "var(--t2)", marginBottom: 2 }}>{day}</div>
                {evts.slice(0, 2).map((e, ei) => (
                  <div
                    key={ei}
                    style={{
                      fontSize: 8,
                      padding: "2px 3px",
                      borderRadius: 4,
                      background: e.color + "20",
                      color: e.color,
                      marginTop: 2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    {e.type === "birthday" && <Cake size={8} />}
                    {e.type === "birthday" ? e.label.split(" ")[0] : e.label.length > 8 ? e.label.slice(0, 8) + "..." : e.label}
                  </div>
                ))}
                {evts.length > 2 && <div style={{ fontSize: 7, color: "var(--t3)", marginTop: 2 }}>+{evts.length - 2} more</div>}
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 10, padding: "8px 12px", background: "#f8fafc", borderRadius: 8 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#e91e63" }} />Birthday</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#1b7a4e" }} />Holiday</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#b71c1c" }} />Emergency</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#1565c0" }} />Leave</span>
        </div>
      </div>

      {/* My Penalties Summary */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="ch">
          <div className="ct">
            <div className="ct-ico" style={{ background: "#ffebee", color: "#c62828" }}><AlertTriangle size={13} /></div>
            My Penalties
          </div>
          <Link to="/my-penalties" className="btn btn-sm btn-ghost">View All →</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 12 }}>
          <div style={{ padding: "12px 16px", background: "#ffebee", borderRadius: 8, borderLeft: "3px solid #c62828" }}>
            <div style={{ fontSize: 10, color: "var(--t3)", textTransform: "uppercase", fontWeight: 600 }}>This Month</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#c62828", marginTop: 4 }}>Rs. 800</div>
            <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 2 }}>2 penalties</div>
          </div>
          <div style={{ padding: "12px 16px", background: "#fff3e0", borderRadius: 8, borderLeft: "3px solid #e65100" }}>
            <div style={{ fontSize: 10, color: "var(--t3)", textTransform: "uppercase", fontWeight: 600 }}>Total Deducted</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#e65100", marginTop: 4 }}>Rs. 3,500</div>
            <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 2 }}>All time</div>
          </div>
          <div style={{ padding: "12px 16px", background: "#e8f5e9", borderRadius: 8, borderLeft: "3px solid #4caf50" }}>
            <div style={{ fontSize: 10, color: "var(--t3)", textTransform: "uppercase", fontWeight: 600 }}>Total Waived</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#4caf50", marginTop: 4 }}>Rs. 1,500</div>
            <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 2 }}>All time</div>
          </div>
        </div>
        <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8, color: "var(--t2)" }}>Recent Penalties</div>
        {[
          { date: "2026-03-24", type: "Late Arrival", amount: 500, status: "Applied" },
          { date: "2026-03-18", type: "Late Arrival", amount: 300, status: "Applied" },
        ].map((p, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 1 ? "1px solid var(--br2)" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#ffebee", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AlertTriangle size={14} style={{ color: "#c62828" }} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: p.type === "Late Arrival" ? "#e65100" : "#c62828" }}>{p.type}</div>
                <div className="mono" style={{ fontSize: 10, color: "var(--t3)" }}>{p.date}</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="mono" style={{ fontSize: 12, fontWeight: 600, color: "#c62828" }}>Rs. {p.amount.toLocaleString()}</div>
              <span className="pill pill-red" style={{ fontSize: 9 }}>Deducted</span>
            </div>
          </div>
        ))}
        <Link to="/my-penalties" style={{ display: "block", textAlign: "center", marginTop: 12, fontSize: 11, color: "var(--p)", fontWeight: 600, textDecoration: "none" }}>
          View full penalty history →
        </Link>
      </div>

      {/* Leave Modal */}
      <Modal
        open={leaveModal}
        onClose={() => setLeaveModal(false)}
        title="Apply for Leave"
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={() => setLeaveModal(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              disabled={!fromDate || !toDate || !reason || !!overBalance}
              onClick={handleLeaveSubmit}
            >
              Submit Request
            </button>
          </>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--t3)",
              marginBottom: 8,
            }}
          >
            LEAVE BALANCE
          </div>
          {balances.map((b, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "4px 0",
                fontSize: 12,
              }}
            >
              <span>{b.type} Leave</span>
              <span
                className="mono"
                style={{ color: b.color, fontWeight: 600 }}
              >
                {b.remaining} days remaining
              </span>
            </div>
          ))}
        </div>
        <div className="form-group">
          <label className="form-label">Leave Type</label>
          <select
            className="input select-input"
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
          >
            <option>Annual Leave (7 remaining)</option>
            <option>Casual Leave (10 remaining)</option>
            <option>Medical Leave (8 remaining)</option>
          </select>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">From Date</label>
            <input
              className="input"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">To Date</label>
            <input
              className="input"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Days Requested</label>
          <input
            className="input mono"
            value={daysRequested || ""}
            readOnly
            style={{ background: "var(--steell)" }}
          />
          {overBalance && (
            <div style={{ color: "var(--red)", fontSize: 11, marginTop: 4 }}>
              ⚠ You only have {selectedBalance?.remaining} days remaining in
              this leave type
            </div>
          )}
        </div>
        <div className="form-group">
          <label className="form-label">Reason</label>
          <textarea
            className="input"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for leave..."
          />
        </div>
      </Modal>
    </div>
  );
}











