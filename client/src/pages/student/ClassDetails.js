import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, BookOpen, User, Calendar, Home, AlertCircle, Clock } from "lucide-react";

const ClassDetails = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchClassDetails = async () => {
      const token = localStorage.getItem("token");
      if (!token) { setLoading(false); setError("No token found"); return; }
      try {
        const response = await axios.get(
          `http://localhost:9999/api/student/my-classes/${classId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setClassData(response.data);
        setStudents(response.data.students || []);
      } catch (err) {
        setError(`Failed to fetch class details. ${err.response?.data?.message || err.message}`);
        setClassData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchClassDetails();
  }, [classId]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "300px", flexDirection: "column", gap: "16px" }}>
      <div style={{ width: "44px", height: "44px", border: "3px solid rgba(16,185,129,0.2)", borderTop: "3px solid #10b981", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
      <span style={{ color: "#64748b", fontSize: "14px" }}>Loading class details...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "12px", padding: "24px", color: "#ef4444", display: "flex", alignItems: "center", gap: "10px" }}>
      <AlertCircle size={18} /> {error}
    </div>
  );

  if (!classData) return (
    <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>No class details found.</div>
  );

  const teachers = typeof classData.teacher === "string"
    ? classData.teacher.split(", ").map(name => ({ fullName: name.trim() }))
    : Array.isArray(classData.teachers) ? classData.teachers : [];

  const infoCards = [
    {
      icon: <BookOpen size={16} color="#059669" />,
      label: "Class Name",
      value: classData.name,
      bg: "rgba(16,185,129,0.06)",
    },
    {
      icon: <User size={16} color="#0284c7" />,
      label: "Teachers",
      value: teachers.length > 0 ? teachers.map(t => t.fullName).join(", ") : "N/A",
      bg: "rgba(2,132,199,0.06)",
    },
    {
      icon: <Home size={16} color="#7c3aed" />,
      label: "Room",
      value: classData.room || "N/A",
      bg: "rgba(124,58,237,0.06)",
    },
    {
      icon: <AlertCircle size={16} color="#d97706" />,
      label: "Status",
      value: classData.status,
      badge: true,
      isOngoing: (classData.status || "").toLowerCase() === "ongoing",
      bg: "rgba(217,119,6,0.06)",
    },
    {
      icon: <Clock size={16} color="#059669" />,
      label: "Schedule",
      value: classData.schedule && classData.schedule.length > 0
        ? classData.schedule.map(s => `${s.weekday?.slice(0, 3)}: ${s.from}-${s.to}`).join(" | ")
        : "N/A",
      bg: "rgba(16,185,129,0.06)",
    },
  ];

  return (
    <div>
      {/* Back button & Header */}
      <div style={{ marginBottom: "24px" }}>
        <button
          onClick={() => navigate("/student/my-classes")}
          style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.2)",
            borderRadius: "8px", padding: "6px 12px",
            color: "#059669", fontSize: "12px", fontWeight: 600,
            cursor: "pointer", marginBottom: "16px",
            transition: "all 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(16,185,129,0.15)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(16,185,129,0.08)"}
        >
          <ArrowLeft size={14} /> Back to My Classes
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "36px", height: "36px",
            background: "linear-gradient(135deg, #10b981, #059669)",
            borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <BookOpen size={18} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Class Details</h1>
            <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>{classData.name}</p>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "12px", marginBottom: "24px",
      }}>
        {infoCards.map((card, i) => (
          <div key={i} style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "16px",
            border: "1px solid rgba(0,0,0,0.05)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}>
            <div style={{
              width: "32px", height: "32px",
              background: card.bg,
              borderRadius: "8px",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: "10px",
            }}>
              {card.icon}
            </div>
            <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
              {card.label}
            </div>
            {card.badge ? (
              <span style={{
                display: "inline-block",
                padding: "3px 10px", borderRadius: "20px",
                fontSize: "12px", fontWeight: 600,
                background: card.isOngoing ? "rgba(16,185,129,0.1)" : "rgba(100,116,139,0.1)",
                color: card.isOngoing ? "#059669" : "#64748b",
              }}>
                {card.value}
              </span>
            ) : (
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#0f172a" }}>{card.value}</div>
            )}
          </div>
        ))}
      </div>

      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: "16px", marginTop: "32px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <User size={20} color="#0f172a" />
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Student List
          </h2>
        </div>
        <a
          href={`/student/my-classes/${classId}/documents`}
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)",
            color: "#2563eb", padding: "8px 16px", borderRadius: "10px",
            fontSize: "13px", fontWeight: 600, textDecoration: "none",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(59,130,246,0.15)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(59,130,246,0.08)"; }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Documents & Exercises
        </a>
      </div>

      <div style={{
        background: "#fff",
        borderRadius: "14px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        border: "1px solid rgba(0,0,0,0.05)",
        overflow: "hidden",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
              <th style={{ padding: "14px 20px", textAlign: "left", fontWeight: 600, color: "#475569", fontSize: "11px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                Student Name
              </th>
              <th style={{ padding: "14px 20px", textAlign: "left", fontWeight: 600, color: "#475569", fontSize: "11px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                Email Address
              </th>
              <th style={{ padding: "14px 20px", textAlign: "left", fontWeight: 600, color: "#475569", fontSize: "11px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                Birth Date
              </th>
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? students.map((student, idx) => {
              // Generate a stable color based on name
              const colors = [
                "linear-gradient(135deg, #fecaca, #f87171)",
                "linear-gradient(135deg, #bbf7d0, #4ade80)",
                "linear-gradient(135deg, #bfdbfe, #60a5fa)",
                "linear-gradient(135deg, #fef08a, #facc15)",
                "linear-gradient(135deg, #e9d5ff, #c084fc)",
                "linear-gradient(135deg, #fed7aa, #fb923c)"
              ];
              const colorIdx = student.name ? student.name.length % colors.length : 0;
              const initials = student.name ? student.name.substring(0, 2).toUpperCase() : "ST";
              
              return (
                <tr key={student.id || idx} style={{
                  borderBottom: idx < students.length - 1 ? "1px solid #f1f5f9" : "none",
                  transition: "background 0.15s"
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{
                        width: "36px", height: "36px",
                        background: colors[colorIdx],
                        borderRadius: "10px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontSize: "13px", fontWeight: 700,
                        textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                        flexShrink: 0
                      }}>
                        {initials}
                      </div>
                      <span style={{ fontWeight: 600, color: "#0f172a" }}>{student.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px", color: "#64748b" }}>
                    {student.email || "N/A"}
                  </td>
                  <td style={{ padding: "14px 20px", color: "#64748b" }}>
                    {student.birthday || "N/A"}
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan="3" style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                  <User size={32} style={{ opacity: 0.3, marginBottom: "10px" }} />
                  <div>No students found in this class</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClassDetails;
