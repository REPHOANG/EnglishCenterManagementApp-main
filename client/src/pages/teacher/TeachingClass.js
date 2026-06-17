import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { NotebookTabs, Users, BookOpen, Clock, ChevronRight } from "lucide-react";
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const card = {
  background: "#fff",
  borderRadius: "16px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)",
  border: "1px solid rgba(0,0,0,0.05)",
};

const STATUS_CONFIG = {
  ongoing: { bg: "#d1fae5", text: "#065f46", dot: "#10b981", label: "Ongoing" },
  completed: { bg: "#f1f5f9", text: "#475569", dot: "#94a3b8", label: "Completed" },
};

export default function TeachingClass() {
  const [allClasses, setAllClasses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const teacherId = jwtDecode(token).id;

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:9999/api/teacher/${teacherId}/classes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data?.success) {
          setAllClasses(response.data.data);
          setClasses(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
        setAllClasses([]);
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, [teacherId]);

  useEffect(() => {
    if (statusFilter !== "All") {
      setClasses(allClasses.filter(c => c.status.toLowerCase() === statusFilter.toLowerCase()));
    } else {
      setClasses(allClasses);
    }
  }, [statusFilter, allClasses]);

  const filters = ["All", "Ongoing", "Completed"];

  const stats = {
    total: allClasses.length,
    ongoing: allClasses.filter(c => c.status.toLowerCase() === "ongoing").length,
    completed: allClasses.filter(c => c.status.toLowerCase() === "completed").length,
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: 0 }}>My Classes</h1>
        <p style={{ color: "#64748b", fontSize: "13px", marginTop: "4px" }}>Manage and view your assigned teaching classes</p>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total Classes", value: stats.total, icon: <BookOpen size={20} />, color: "#0ea5e9", bg: "#e0f2fe" },
          { label: "Ongoing", value: stats.ongoing, icon: <Clock size={20} />, color: "#10b981", bg: "#d1fae5" },
          { label: "Completed", value: stats.completed, icon: <Users size={20} />, color: "#f59e0b", bg: "#fef3c7" },
        ].map(s => (
          <div key={s.label} style={{ ...card, padding: "18px 20px", display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.color, flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div style={card}>
        {/* Toolbar */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b" }}>
            Classes ({classes.length})
          </span>
          <div style={{ display: "flex", gap: "6px", background: "#f8fafc", borderRadius: "10px", padding: "3px" }}>
            {filters.map(type => (
              <button
                key={type}
                onClick={() => setStatusFilter(type)}
                style={{
                  padding: "5px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
                  border: "none", cursor: "pointer", transition: "all 0.2s",
                  background: statusFilter === type ? "#fff" : "transparent",
                  color: statusFilter === type ? "#0284c7" : "#94a3b8",
                  boxShadow: statusFilter === type ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#94a3b8" }}>Loading classes...</div>
        ) : classes.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>📚</div>
            <div style={{ color: "#94a3b8", fontSize: "14px" }}>No classes found.</div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Class Name", "Course", "Start Date", "Status", "Actions"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textAlign: "left", letterSpacing: "0.7px", textTransform: "uppercase", borderBottom: "1px solid #f1f5f9" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {classes.map((cls, idx) => {
                  const sc = STATUS_CONFIG[cls.status?.toLowerCase()] || STATUS_CONFIG.completed;
                  return (
                    <tr key={cls.id}
                      style={{ borderBottom: idx < classes.length - 1 ? "1px solid #f8fafc" : "none", transition: "background 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#fafbff"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "14px" }}>{cls.name}</div>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: "13px", color: "#475569" }}>{cls.course}</span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: "13px", color: "#475569" }}>{cls.startDate}</span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "5px",
                          padding: "3px 10px", borderRadius: "20px",
                          background: sc.bg, color: sc.text, fontSize: "11px", fontWeight: 600,
                        }}>
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: sc.dot, display: "inline-block" }} />
                          {sc.label}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <Link
                          to={`/teacher/${teacherId}/classes/${cls.id}`}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: "6px",
                            padding: "6px 12px", borderRadius: "8px",
                            background: "#e0f2fe", color: "#0284c7",
                            fontSize: "12px", fontWeight: 600,
                            textDecoration: "none", transition: "all 0.2s",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#0284c7"; e.currentTarget.style.color = "#fff"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "#e0f2fe"; e.currentTarget.style.color = "#0284c7"; }}
                        >
                          <NotebookTabs size={14} /> View
                          <ChevronRight size={12} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}