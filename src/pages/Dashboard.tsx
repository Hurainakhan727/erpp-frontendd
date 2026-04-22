import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  CalendarDays,
  AlertTriangle,
  Activity,
  Cake,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Briefcase,
  BarChart3,
  ArrowUpRight,
  Plus,
  ClipboardList,
  Megaphone,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import DecisionBanner from "../components/DecisionBanner";

const deptDistribution = [
  { name: "Engineering", value: 84, color: "#1565c0" },
  { name: "Sales", value: 49, color: "#1b7a4e" },
  { name: "Marketing", value: 45, color: "#b06000" },
  { name: "HR", value: 34, color: "#00695c" },
  { name: "Finance", value: 35, color: "#37474f" },
];

const empTypeDistribution = [
  { name: "Full Time", value: 146, color: "#1565c0" },
  { name: "Part Time", value: 55, color: "#1b7a4e" },
  { name: "Contract", value: 32, color: "#b06000" },
  { name: "Intern", value: 14, color: "#00695c" },
];

const monthlyAttendance = [
  { month: "Oct", present: 205, absent: 30, pct: 87 },
  { month: "Nov", present: 192, absent: 45, pct: 81 },
  { month: "Dec", present: 180, absent: 57, pct: 76 },
  { month: "Jan", present: 220, absent: 17, pct: 93 },
  { month: "Feb", present: 215, absent: 22, pct: 91 },
  { month: "Mar", present: 218, absent: 29, pct: 88 },
];

const headcountGrowth = [
  { month: "Oct", count: 214 },
  { month: "Nov", count: 224 },
  { month: "Dec", count: 228 },
  { month: "Jan", count: 236 },
  { month: "Feb", count: 242 },
  { month: "Mar", count: 247 },
];

const announcements = [
  {
    title: "Office Closure — Eid ul Fitr",
    date: "Mar 20, 2026",
    text: "Office will remain closed from March 28 to April 1 for Eid ul Fitr celebrations.",
  },
  {
    title: "Annual Performance Review",
    date: "Mar 15, 2026",
    text: "Performance reviews for FY 2025-26 will begin from April 5. Managers should prepare evaluations.",
  },
  {
    title: "New Health Insurance Policy",
    date: "Mar 10, 2026",
    text: "Updated health insurance coverage now includes dental and vision benefits for all full-time employees.",
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { leaveRequests, employees, globalDays } = useData();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hour = time.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr = time.toLocaleDateString("en-PK", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeStr = time.toLocaleTimeString("en-PK", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const total = 247;

  const pendingLeaves = leaveRequests.filter(
    (l: any) => l.status === "Pending",
  ).length;

  const attendanceRate = 88.3;
  const leaveUtilization = 42;
  const onTimeRate = 93.1;

  const pendingActions = [
    {
      text: `${pendingLeaves} leave requests awaiting approval`,
      action: "Review →",
      emoji: "📋",
      link: "/leave",
    },
    {
      text: "Attendance incomplete 3 employees",
      action: "Mark →",
      emoji: "⏰",
      link: "/attendance",
    },
    {
      text: "Bank info missing EMP004, EMP005",
      action: "Fix →",
      emoji: "🏦",
      link: "/employees/EMP004",
    },
  ];

  const urgentAlerts = [
    {
      name: "Usman Malik",
      text: "Contract expiry in 8 days",
      badge: "URGENT",
      badgeCls: "pill-red",
    },
    {
      name: "Fatima Raza",
      text: "Probation ends in 12 days",
      badge: "PROBATION",
      badgeCls: "pill-amber",
    },
    {
      name: "Bilal Ahmed",
      text: "Bank info missing",
      badge: "MISSING",
      badgeCls: "pill-red",
    },
    {
      name: "Ahmed Ali",
      text: "Absent 3 days in a row",
      badge: "ABSENT",
      badgeCls: "pill-amber",
    },
  ];

  const recentActivity = [
    {
      initials: "SK",
      color: "#e67e22",
      text: "Sara Khan's leave approved",
      time: "2 hrs ago",
      by: "Super Admin",
      badge: "Approved",
      badgeCls: "pill-green",
    },
    {
      initials: "BA",
      color: "#1565c0",
      text: "Bilal Ahmed added as EMP005",
      time: "Yesterday",
      by: "HR1",
      badge: "New Hire",
      badgeCls: "pill-blue",
    },
    {
      initials: "UM",
      color: "#b71c1c",
      text: "Usman's leave rejected",
      time: "3 days ago",
      by: "HR1",
      badge: "Rejected",
      badgeCls: "pill-red",
    },
    {
      initials: "FR",
      color: "#00695c",
      text: "Fatima salary updated",
      time: "4 days ago",
      by: "Super Admin",
      badge: "Updated",
      badgeCls: "pill-steel",
    },
  ];

  // Calendar events
  const calendarEvents = useMemo(() => {
    const events: Record<
      string,
      { type: string; label: string; color: string }[]
    > = {};
    const monthStr = String(calMonth + 1).padStart(2, "0");
    // Birthdays from employees
    employees.forEach((emp: any) => {
      if (!emp.dob) return;
      const dobDate = new Date(emp.dob);
      if (dobDate.getMonth() === calMonth) {
        const day = dobDate.getDate();
        if (!events[day]) events[day] = [];
        events[day].push({
          type: "birthday",
          label: `${emp.name}`,
          color: "#e91e63",
        });
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
          color:
            gd.type === "emergency"
              ? "#b71c1c"
              : gd.type === "holiday"
                ? "#1b7a4e"
                : "#1565c0",
        });
      }
    });
    // Approved leaves
    leaveRequests
      .filter((l: any) => l.status === "Approved")
      .forEach((l: any) => {
        const from = new Date(l.from);
        const to = new Date(l.to);
        for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
          if (d.getMonth() === calMonth && d.getFullYear() === calYear) {
            const day = d.getDate();
            if (!events[day]) events[day] = [];
            if (!events[day].find((e) => e.label === `${l.empName} (Leave)`)) {
              events[day].push({
                type: "leave",
                label: `${l.empName} (Leave)`,
                color: "#1565c0",
              });
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
    const birthdays: {
      name: string;
      date: Date;
      daysUntil: number;
      initials: string;
    }[] = [];

    employees.forEach((emp: any) => {
      if (!emp.dob) return;
      const dob = new Date(emp.dob);
      // Create this year's birthday
      let birthday = new Date(
        today.getFullYear(),
        dob.getMonth(),
        dob.getDate(),
      );
      // If birthday already passed this year, check next year
      if (birthday < today) {
        birthday = new Date(
          today.getFullYear() + 1,
          dob.getMonth(),
          dob.getDate(),
        );
      }
      const daysUntil = Math.ceil(
        (birthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysUntil <= 30) {
        const nameParts = emp.name.split(" ");
        const initials = nameParts
          .map((n: string) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();
        birthdays.push({ name: emp.name, date: birthday, daysUntil, initials });
      }
    });

    return birthdays.sort((a, b) => a.daysUntil - b.daysUntil);
  }, [employees]);

  const getDaysLabel = (days: number) => {
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    if (days <= 7) return `In ${days} days`;
    return `In ${days} days`;
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay();

  return (
    <div>
      {/* Page Header */}
      <div className="pg-head">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="pg-greet">
              {greeting}, {user?.username === "superadmin" ? "Admin" : "HR"} 👋
            </div>
            <div className="live-badge">
              <div className="live-dot" /> LIVE
            </div>
          </div>
          <div className="pg-sub" style={{ marginTop: 4 }}>
            📅 {dateStr} · 🕐 <span className="mono">{timeStr}</span> PKT · EMS
            Dashboard
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/employees/add")}
          >
            <Plus size={13} /> Add Employee
          </button>
        </div>
      </div>

      {/* 3 Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <StatCard
          icon={<Users size={18} />}
          iconBg="var(--pl)"
          iconColor="var(--p)"
          borderColor="var(--p)"
          value="247"
          label="Total Employees"
          trend="↑ 2.4%"
          trendColor="var(--green)"
          trendBg="var(--greenl)"
          sub="+6 this month · 5 depts"
        />
        <StatCard
          icon={<UserCheck size={18} />}
          iconBg="var(--greenl)"
          iconColor="var(--green)"
          borderColor="var(--green)"
          value="218"
          label="Present Today"
          trend="↑ 3.1%"
          trendColor="var(--green)"
          trendBg="var(--greenl)"
          sub="88.3% rate · 17 late"
        />
        <StatCard
          icon={<CalendarDays size={18} />}
          iconBg="var(--amberl)"
          iconColor="var(--amber)"
          borderColor="var(--amber)"
          value="12"
          label="On Leave Today"
          trend="— same"
          trendColor="var(--steel)"
          trendBg="var(--steell)"
          sub="3 pending · 9 approved"
        />
      </div>

      {/* Quick Actions + Performance */}
      <div className="g2">
        <div className="card">
          <div className="ch">
            <div className="ct">
              <div className="ct-ico blue">
                <ClipboardList size={13} />
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
              onClick={() => navigate("/leave")}
            >
              <CalendarDays size={13} /> Approve Leaves
              {pendingLeaves > 0 && (
                <span
                  className="pill pill-red"
                  style={{
                    marginLeft: "auto",
                    fontSize: 8,
                    padding: "2px 5px",
                  }}
                >
                  {pendingLeaves}
                </span>
              )}
            </button>
            <button
              className="btn btn-ghost"
              style={{ justifyContent: "flex-start" }}
              onClick={() => navigate("/attendance")}
            >
              <UserCheck size={13} /> Mark Attendance
            </button>
            <button
              className="btn btn-ghost"
              style={{ justifyContent: "flex-start" }}
              onClick={() => navigate("/employees/add")}
            >
              <Plus size={13} /> Add Employee
            </button>
            <button
              className="btn btn-ghost"
              style={{ justifyContent: "flex-start" }}
              onClick={() => navigate("/promotions")}
            >
              <TrendingUp size={13} /> Record Promotion
            </button>
          </div>
        </div>
        <div className="card">
          <div className="ch">
            <div className="ct">
              <div className="ct-ico green">
                <TrendingUp size={13} />
              </div>
              Performance Metrics
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 8,
            }}
          >
            <div style={{ textAlign: "center", padding: 8 }}>
              <div
                className="mono"
                style={{ fontSize: 22, fontWeight: 800, color: "var(--green)" }}
              >
                {attendanceRate}%
              </div>
              <div style={{ fontSize: 10, color: "var(--t3)" }}>Attendance</div>
            </div>
            <div style={{ textAlign: "center", padding: 8 }}>
              <div
                className="mono"
                style={{ fontSize: 22, fontWeight: 800, color: "var(--p)" }}
              >
                {leaveUtilization}%
              </div>
              <div style={{ fontSize: 10, color: "var(--t3)" }}>Leave Used</div>
            </div>
            <div style={{ textAlign: "center", padding: 8 }}>
              <div
                className="mono"
                style={{ fontSize: 22, fontWeight: 800, color: "var(--teal)" }}
              >
                {onTimeRate}%
              </div>
              <div style={{ fontSize: 10, color: "var(--t3)" }}>On-time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Donut Charts */}
      <div className="g2">
        <DonutCard
          title="Employees by Department"
          icon={<Users size={13} />}
          data={deptDistribution}
          total={total}
        />
        <DonutCard
          title="By Employment Type"
          icon={<Briefcase size={13} />}
          data={empTypeDistribution}
          total={total}
        />
      </div>

      {/* Bar + Line Charts */}
      <div className="g2">
        <div className="card">
          <div className="ch">
            <div className="ct">
              <div className="ct-ico blue">
                <BarChart3 size={13} />
              </div>
              Monthly Attendance
            </div>
            <select
              className="select-input"
              style={{ width: "auto", padding: "4px 8px", fontSize: 10 }}
            >
              <option>Last 6 Months</option>
              <option>Last 12 Months</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyAttendance} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8edf8" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#7590a8" }} />
              <YAxis tick={{ fontSize: 10, fill: "#7590a8" }} />
              <Tooltip />
              <Bar
                dataKey="present"
                name="Present"
                fill="#1565c0"
                radius={[3, 3, 0, 0]}
                barSize={16}
              />
              <Bar
                dataKey="absent"
                name="Absent"
                fill="#e53935"
                radius={[3, 3, 0, 0]}
                barSize={16}
              />
            </BarChart>
          </ResponsiveContainer>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 20,
              marginTop: 8,
            }}
          >
            {monthlyAttendance.map((m, i) => (
              <span
                key={i}
                className="mono"
                style={{
                  fontSize: 10,
                  color:
                    m.pct >= 90
                      ? "var(--green)"
                      : m.pct >= 80
                        ? "var(--amber)"
                        : "var(--red)",
                }}
              >
                {m.pct}%
              </span>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="ch">
            <div className="ct">
              <div className="ct-ico green">
                <TrendingUp size={13} />
              </div>
              Headcount Growth
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={headcountGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8edf8" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#7590a8" }} />
              <YAxis
                tick={{
                  fontSize: 10,
                  fill: "#7590a8",
                  fontFamily: "IBM Plex Mono",
                }}
                domain={["dataMin - 10", "dataMax + 5"]}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#00695c"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#00695c" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Unified Calendar + Upcoming Birthdays */}
      <div
        className="g2"
        style={{ marginBottom: 12, gridTemplateColumns: "1fr 320px" }}
      >
        <div className="card">
          <div className="ch">
            <div className="ct">
              <div className="ct-ico blue">
                <CalendarDays size={13} />
              </div>
              Calendar — Birthdays, Holidays & Leave
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => {
                if (calMonth === 0) {
                  setCalMonth(11);
                  setCalYear((y) => y - 1);
                } else setCalMonth((m) => m - 1);
              }}
            >
              <ChevronLeft size={14} />
            </button>
            <span style={{ fontSize: 13, fontWeight: 700 }}>
              {monthNames[calMonth]} {calYear}
            </span>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => {
                if (calMonth === 11) {
                  setCalMonth(0);
                  setCalYear((y) => y + 1);
                } else setCalMonth((m) => m + 1);
              }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 3,
              textAlign: "center",
            }}
          >
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => (
              <div
                key={i}
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--t3)",
                  padding: 6,
                }}
              >
                {d}
              </div>
            ))}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`e${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const evts = calendarEvents[day] || [];
              const isToday =
                day === new Date().getDate() &&
                calMonth === new Date().getMonth() &&
                calYear === new Date().getFullYear();
              const hasBirthday = evts.some((e) => e.type === "birthday");
              return (
                <div
                  key={day}
                  style={{
                    padding: 5,
                    borderRadius: 8,
                    background: isToday
                      ? "var(--pl)"
                      : hasBirthday
                        ? "#fce4ec"
                        : evts.length > 0
                          ? "#f8fafc"
                          : "transparent",
                    minHeight: 58,
                    cursor: evts.length > 0 ? "pointer" : "default",
                    border: isToday
                      ? "2px solid var(--p)"
                      : hasBirthday
                        ? "1px solid #f48fb1"
                        : "1px solid transparent",
                    transition: "all 0.15s ease",
                  }}
                  title={evts
                    .map((e) =>
                      e.type === "birthday"
                        ? `🎂 ${e.label}'s Birthday`
                        : e.label,
                    )
                    .join("\n")}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: isToday ? 700 : 500,
                      color: isToday ? "var(--p)" : "var(--t2)",
                      marginBottom: 2,
                    }}
                  >
                    {day}
                  </div>
                  {evts.slice(0, 2).map((e, ei) => (
                    <div
                      key={ei}
                      style={{
                        fontSize: 9,
                        padding: "2px 4px",
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
                      {e.type === "birthday" && <Cake size={9} />}
                      {e.type === "birthday" ? e.label.split(" ")[0] : e.label}
                    </div>
                  ))}
                  {evts.length > 2 && (
                    <div
                      style={{ fontSize: 8, color: "var(--t3)", marginTop: 2 }}
                    >
                      +{evts.length - 2} more
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div
            style={{
              display: "flex",
              gap: 20,
              marginTop: 12,
              fontSize: 11,
              padding: "8px 12px",
              background: "#f8fafc",
              borderRadius: 8,
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#e91e63",
                }}
              />
              Birthday
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#1b7a4e",
                }}
              />
              Holiday
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#b71c1c",
                }}
              />
              Emergency
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#1565c0",
                }}
              />
              Leave
            </span>
          </div>
        </div>

        {/* Upcoming Birthdays Sidebar */}
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
            <span
              className="pill"
              style={{ background: "#fce4ec", color: "#e91e63" }}
            >
              {upcomingBirthdays.length}
            </span>
          </div>
          {upcomingBirthdays.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "20px 0",
                color: "var(--t3)",
                fontSize: 12,
              }}
            >
              No birthdays in the next 30 days
            </div>
          ) : (
            <div style={{ maxHeight: 340, overflowY: "auto" }}>
              {upcomingBirthdays.map((b, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 0",
                    borderBottom:
                      i < upcomingBirthdays.length - 1
                        ? "1px solid var(--br2)"
                        : "none",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background:
                        b.daysUntil === 0
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
                    {b.daysUntil === 0 ? "🎂" : b.initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--t1)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {b.name}
                    </div>
                    <div
                      className="mono"
                      style={{ fontSize: 10, color: "var(--t3)" }}
                    >
                      {b.date.toLocaleDateString("en-PK", {
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
                        b.daysUntil === 0
                          ? "#e91e63"
                          : b.daysUntil === 1
                            ? "#ff9800"
                            : b.daysUntil <= 7
                              ? "#4caf50"
                              : "#e3f2fd",
                      color: b.daysUntil <= 7 ? "white" : "#1565c0",
                      fontWeight: 600,
                      fontSize: 10,
                    }}
                  >
                    {b.daysUntil === 0
                      ? "🎉 Today!"
                      : b.daysUntil === 1
                        ? "Tomorrow"
                        : `${b.daysUntil} days`}
                  </span>
                </div>
              ))}
            </div>
          )}
          {upcomingBirthdays.filter((b) => b.daysUntil === 0).length > 0 && (
            <div
              style={{
                marginTop: 12,
                padding: "10px 12px",
                background: "linear-gradient(135deg, #fce4ec, #f8bbd9)",
                borderRadius: 8,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 600, color: "#c2185b" }}>
                🎂 Don't forget to wish them!
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Announcements */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="ch">
          <div className="ct">
            <div className="ct-ico amber">
              <Megaphone size={13} />
            </div>
            Announcements
          </div>
        </div>
        {announcements.map((a, i) => (
          <div
            key={i}
            style={{
              padding: "10px 0",
              borderBottom:
                i < announcements.length - 1 ? "1px solid var(--br2)" : "none",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)" }}
              >
                {a.title}
              </span>
              <span
                className="mono"
                style={{ fontSize: 10, color: "var(--t3)" }}
              >
                {a.date}
              </span>
            </div>
            <div style={{ fontSize: 12, color: "var(--t2)", marginTop: 3 }}>
              {a.text}
            </div>
          </div>
        ))}
      </div>

      {/* Three columns */}
      <div className="g3">
        <div className="card">
          <div className="ch">
            <div className="ct">
              <div className="ct-ico amber">
                <AlertTriangle size={13} />
              </div>
              Pending Actions
            </div>
            <span className="pill pill-amber">{pendingActions.length}</span>
          </div>
          {pendingActions.map((a, i) => (
            <div key={i} className="action-row">
              <span style={{ marginRight: 6 }}>{a.emoji}</span>
              <span style={{ flex: 1 }}>{a.text}</span>
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => navigate(a.link)}
              >
                {a.action}
              </button>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="ch">
            <div className="ct">
              <div className="ct-ico red">
                <AlertTriangle size={13} />
              </div>
              Urgent Alerts
            </div>
          </div>
          {urgentAlerts.map((a, i) => (
            <div key={i} className="action-row" style={{ gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "var(--t1)",
                  }}
                >
                  {a.name}
                </div>
                <div style={{ fontSize: 11, color: "var(--t3)" }}>{a.text}</div>
              </div>
              <span className={`pill ${a.badgeCls}`}>{a.badge}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="ch">
            <div className="ct">
              <div className="ct-ico steel">
                <Activity size={13} />
              </div>
              Recent Activity
            </div>
          </div>
          {recentActivity.map((a, i) => (
            <div key={i} className="feed-item">
              <div
                className="feed-av"
                style={{ background: a.color, fontSize: 9 }}
              >
                {a.initials}
              </div>
              <div style={{ flex: 1 }}>
                <div className="feed-text">{a.text}</div>
                <div className="feed-time">
                  {a.time} · {a.by}
                </div>
              </div>
              <span className={`pill ${a.badgeCls}`} style={{ fontSize: 9 }}>
                {a.badge}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  iconBg,
  iconColor,
  borderColor,
  value,
  label,
  trend,
  trendColor,
  trendBg,
  sub,
}: any) {
  return (
    <div
      className="card"
      style={{
        borderLeft: `3px solid ${borderColor}`,
        padding: "16px 18px",
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", top: 12, right: 14 }}>
        <span
          style={{
            fontSize: 9,
            fontWeight: 600,
            padding: "2px 7px",
            borderRadius: 12,
            background: trendBg,
            color: trendColor,
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          {trend}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 8,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 9,
            background: iconBg,
            color: iconColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
        <div>
          <div
            className="mono"
            style={{
              fontSize: 36,
              fontWeight: 800,
              color: "var(--t1)",
              lineHeight: 1,
            }}
          >
            {value}
          </div>
        </div>
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--t2)" }}>
        {label}
      </div>
      <div
        className="mono"
        style={{ fontSize: 10, color: "var(--t3)", marginTop: 2 }}
      >
        {sub}
      </div>
    </div>
  );
}

function DonutCard({
  title,
  icon,
  data,
  total,
}: {
  title: string;
  icon: React.ReactNode;
  data: any[];
  total: number;
}) {
  return (
    <div className="card">
      <div className="ch">
        <div className="ct">
          <div className="ct-ico blue">{icon}</div>
          {title}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            position: "relative",
            width: 160,
            height: 160,
            flexShrink: 0,
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={72}
                dataKey="value"
                stroke="none"
              >
                {data.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => v} />
            </PieChart>
          </ResponsiveContainer>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
            }}
          >
            <div
              className="mono"
              style={{ fontSize: 18, fontWeight: 800, color: "var(--t1)" }}
            >
              {total}
            </div>
            <div
              style={{
                fontSize: 8,
                color: "var(--t3)",
                textTransform: "uppercase",
                letterSpacing: ".08em",
              }}
            >
              HEADCOUNT
            </div>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          {data.map((d, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "5px 0",
                borderBottom:
                  i < data.length - 1 ? "1px solid var(--br2)" : "none",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: d.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ flex: 1, fontSize: 12, color: "var(--t2)" }}>
                {d.name}
              </span>
              <span
                className="mono"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--t1)",
                  width: 28,
                }}
              >
                {d.value}
              </span>
              <span
                className="mono"
                style={{ fontSize: 10, color: "var(--t3)", width: 30 }}
              >
                {Math.round((d.value / total) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}