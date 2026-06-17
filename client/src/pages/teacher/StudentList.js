import React from 'react';
import { User, Mail, Phone, Calendar } from 'lucide-react';

const StudentList = ({ students }) => {
  if (!students || students.length === 0) {
    return (
      <div style={{ padding: "48px", textAlign: "center" }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>👥</div>
        <div style={{ color: "#94a3b8", fontSize: "14px" }}>No students enrolled in this class.</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "13px", fontWeight: 600, color: "#64748b" }}>
          {students.length} student{students.length !== 1 ? "s" : ""} enrolled
        </span>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {[
                { label: "Student", icon: <User size={12} /> },
                { label: "Email", icon: <Mail size={12} /> },
                { label: "Phone", icon: <Phone size={12} /> },
                { label: "Birth Date", icon: <Calendar size={12} /> },
              ].map(h => (
                <th key={h.label} style={{
                  padding: "12px 16px", fontSize: "11px", fontWeight: 700,
                  color: "#94a3b8", textAlign: "left", letterSpacing: "0.7px",
                  textTransform: "uppercase", borderBottom: "1px solid #f1f5f9",
                }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                    {h.icon} {h.label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((student, idx) => (
              <tr
                key={student.id}
                style={{ borderBottom: idx < students.length - 1 ? "1px solid #f8fafc" : "none", transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#fafbff"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "34px", height: "34px", borderRadius: "50%",
                      background: `hsl(${(idx * 47) % 360}, 65%, 92%)`,
                      color: `hsl(${(idx * 47) % 360}, 55%, 40%)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: "13px", flexShrink: 0,
                    }}>
                      {student.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <span style={{ fontWeight: 600, color: "#1e293b", fontSize: "14px" }}>{student.name}</span>
                  </div>
                </td>
                <td style={{ padding: "12px 16px", color: "#475569", fontSize: "13px" }}>{student.email || "—"}</td>
                <td style={{ padding: "12px 16px", color: "#475569", fontSize: "13px" }}>{student.number || "—"}</td>
                <td style={{ padding: "12px 16px", color: "#475569", fontSize: "13px" }}>{student.birthday || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentList;