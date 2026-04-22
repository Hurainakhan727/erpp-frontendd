import React, { useState } from "react";
import {
  AlertTriangle,
  Calendar,
  Clock,
  Filter,
  Search,
  ChevronDown,
} from "lucide-react";
import { formatPKR } from "../data/dummyData";

const penaltiesData = [
  {
    id: "PEN001",
    date: "2026-03-24",
    type: "Late Arrival",
    reason: "Arrived 45 mins late (10:45 AM)",
    amount: 500,
    status: "Applied",
    appliedBy: "System",
    month: "March 2026",
  },
  {
    id: "PEN002",
    date: "2026-03-18",
    type: "Late Arrival",
    reason: "Arrived 30 mins late (10:30 AM)",
    amount: 300,
    status: "Applied",
    appliedBy: "System",
    month: "March 2026",
  },
  {
    id: "PEN003",
    date: "2026-02-28",
    type: "Early Leave",
    reason: "Left 2 hours early without approval",
    amount: 1000,
    status: "Waived",
    appliedBy: "HR Admin",
    month: "February 2026",
    waivedReason: "Medical emergency - approved by manager",
  },
  {
    id: "PEN004",
    date: "2026-02-15",
    type: "Absent",
    reason: "Unmarked absence - no leave applied",
    amount: 2500,
    status: "Applied",
    appliedBy: "System",
    month: "February 2026",
  },
  {
    id: "PEN005",
    date: "2026-01-22",
    type: "Late Arrival",
    reason: "Arrived 20 mins late (09:20 AM)",
    amount: 200,
    status: "Applied",
    appliedBy: "System",
    month: "January 2026",
  },
  {
    id: "PEN006",
    date: "2026-01-10",
    type: "Policy Violation",
    reason: "Dress code violation - formal attire required",
    amount: 500,
    status: "Waived",
    appliedBy: "HR Admin",
    month: "January 2026",
    waivedReason: "First warning issued instead",
  },
];

const penaltyRules = [
  { type: "Late Arrival", rule: "15-30 mins late", amount: 200 },
  { type: "Late Arrival", rule: "30-60 mins late", amount: 500 },
  { type: "Late Arrival", rule: "> 60 mins late", amount: 1000 },
  { type: "Early Leave", rule: "Without approval", amount: 1000 },
  { type: "Absent", rule: "Unmarked absence", amount: 2500 },
];

export default function MyPenalties() {
  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = penaltiesData.filter((p) => {
    if (filter !== "all" && p.status.toLowerCase() !== filter) return false;
    if (typeFilter !== "all" && p.type !== typeFilter) return false;
    if (search && !p.reason.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const totalApplied = penaltiesData
    .filter((p) => p.status === "Applied")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalWaived = penaltiesData
    .filter((p) => p.status === "Waived")
    .reduce((sum, p) => sum + p.amount, 0);
  const thisMonthTotal = penaltiesData
    .filter((p) => p.status === "Applied" && p.month === "March 2026")
    .reduce((sum, p) => sum + p.amount, 0);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Late Arrival":
        return "#e65100";
      case "Early Leave":
        return "#7b1fa2";
      case "Absent":
        return "#c62828";
      case "Policy Violation":
        return "#1565c0";
      default:
        return "var(--t2)";
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="pg-head">
        <div>
          <div className="pg-title">My Penalties</div>
          <div className="pg-sub">View your penalty history and deductions</div>
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div
          className="card"
          style={{ padding: "16px 20px", borderLeft: "3px solid #c62828" }}
        >
          <div
            style={{
              fontSize: 10,
              color: "var(--t3)",
              textTransform: "uppercase",
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            This Month
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#c62828" }}>
            {formatPKR(thisMonthTotal)}
          </div>
          <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 4 }}>
            March 2026
          </div>
        </div>
        <div
          className="card"
          style={{ padding: "16px 20px", borderLeft: "3px solid #e65100" }}
        >
          <div
            style={{
              fontSize: 10,
              color: "var(--t3)",
              textTransform: "uppercase",
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            Total Deducted
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#e65100" }}>
            {formatPKR(totalApplied)}
          </div>
          <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 4 }}>
            All time
          </div>
        </div>
        <div
          className="card"
          style={{ padding: "16px 20px", borderLeft: "3px solid #4caf50" }}
        >
          <div
            style={{
              fontSize: 10,
              color: "var(--t3)",
              textTransform: "uppercase",
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            Total Waived
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#4caf50" }}>
            {formatPKR(totalWaived)}
          </div>
          <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 4 }}>
            All time
          </div>
        </div>
        <div
          className="card"
          style={{ padding: "16px 20px", borderLeft: "3px solid var(--p)" }}
        >
          <div
            style={{
              fontSize: 10,
              color: "var(--t3)",
              textTransform: "uppercase",
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            Total Records
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--p)" }}>
            {penaltiesData.length}
          </div>
          <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 4 }}>
            {penaltiesData.filter((p) => p.status === "Applied").length}{" "}
            applied, {penaltiesData.filter((p) => p.status === "Waived").length}{" "}
            waived
          </div>
        </div>
      </div>

      {/* Penalty Rules Card */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="ch">
          <div className="ct">
            <div
              className="ct-ico"
              style={{ background: "#fff3e0", color: "#e65100" }}
            >
              <AlertTriangle size={13} />
            </div>
            Penalty Rules
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 12,
          }}
        >
          {penaltyRules.map((rule, i) => (
            <div
              key={i}
              style={{
                padding: "10px 12px",
                background: "#f8fafc",
                borderRadius: 8,
                borderLeft: `3px solid ${getTypeColor(rule.type)}`,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: getTypeColor(rule.type),
                  marginBottom: 4,
                }}
              >
                {rule.type}
              </div>
              <div
                style={{ fontSize: 10, color: "var(--t3)", marginBottom: 6 }}
              >
                {rule.rule}
              </div>
              <div
                className="mono"
                style={{ fontSize: 13, fontWeight: 700, color: "#c62828" }}
              >
                Rs. {rule.amount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="ch">
          <div className="ct">
            <div
              className="ct-ico"
              style={{ background: "#ffebee", color: "#c62828" }}
            >
              <AlertTriangle size={13} />
            </div>
            Penalty History
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div className="input-wrap" style={{ width: 200 }}>
              <Search size={13} />
              <input
                className="input"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="input select-input"
              style={{ width: 140 }}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="applied">Deducted</option>
              <option value="waived">Waived</option>
            </select>
            <select
              className="input select-input"
              style={{ width: 140 }}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="Late Arrival">Late Arrival</option>
              <option value="Early Leave">Early Leave</option>
              <option value="Absent">Absent</option>
              <option value="Policy Violation">Policy Violation</option>
            </select>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Type</th>
              <th>Reason</th>
              <th>Amount</th>
              <th>Applied By</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={i}>
                <td className="mono" style={{ fontSize: 11 }}>
                  {p.id}
                </td>
                <td className="mono">{p.date}</td>
                <td>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 11,
                      fontWeight: 600,
                      color: getTypeColor(p.type),
                      padding: "3px 8px",
                      background: getTypeColor(p.type) + "15",
                      borderRadius: 4,
                    }}
                  >
                    {p.type}
                  </span>
                </td>
                <td style={{ fontSize: 11, color: "var(--t2)", maxWidth: 250 }}>
                  {p.reason}
                  {p.waivedReason && (
                    <div
                      style={{
                        fontSize: 10,
                        color: "#4caf50",
                        marginTop: 2,
                        fontStyle: "italic",
                      }}
                    >
                      Waived: {p.waivedReason}
                    </div>
                  )}
                </td>
                <td
                  className="mono"
                  style={{
                    fontWeight: 600,
                    color: p.status === "Applied" ? "#c62828" : "var(--t3)",
                    textDecoration:
                      p.status === "Waived" ? "line-through" : "none",
                  }}
                >
                  Rs. {p.amount.toLocaleString()}
                </td>
                <td style={{ fontSize: 11, color: "var(--t3)" }}>
                  {p.appliedBy}
                </td>
                <td>
                  <span
                    className={`pill ${p.status === "Applied" ? "pill-red" : "pill-green"}`}
                  >
                    {p.status === "Applied" ? "Deducted" : "Waived"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 0",
              color: "var(--t3)",
            }}
          >
            <AlertTriangle
              size={32}
              style={{ marginBottom: 8, opacity: 0.3 }}
            />
            <div>No penalties found matching your filters</div>
          </div>
        )}

        {/* Summary Footer */}
        <div
          style={{
            marginTop: 16,
            padding: "12px 16px",
            background: "#fff3e0",
            borderRadius: 8,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <AlertTriangle size={16} style={{ color: "#e65100" }} />
            <div style={{ fontSize: 12, color: "#e65100" }}>
              <strong>Note:</strong> Penalties are deducted from your salary at
              the end of each month. Contact HR for disputes.
            </div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--t2)" }}>
            Showing {filtered.length} of {penaltiesData.length} records
          </div>
        </div>
      </div>
    </div>
  );
}
