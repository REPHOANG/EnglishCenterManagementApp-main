import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, BookOpen, User, Calendar, Home, AlertCircle } from "lucide-react";

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

      {/* Schedule */}
      {Array.isArray(classData.schedule) && classData.schedule.length > 0 && (
        <div style={{
          background: "#fff", borderRadius: "14px", padding: "20px",
          border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          marginBottom: "24px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
            <Calendar size={16} color="#059669" />
            <span style={{ fontWeight: 700, fontSize: "14px", color: "#0f172a" }}>Schedule</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {classData.schedule.map((s, idx) => (
              <div key={idx} style={{
                display: "flex", alignItems: "center", gap: "8px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "8px", padding: "8px 14px",
              }}>
                <span style={{
                  background: "#10b981", color: "#fff",
                  fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "5px",
                }}>
                  {s.weekday?.slice(0, 3)}
                </span>
                <span style={{ fontSize: "12px", color: "#065f46", fontWeight: 500 }}>
                  {s.from && s.to ? `${s.from} - ${s.to}` : "Time N/A"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Student List */}
      <div style={{
        background: "#fff", borderRadius: "14px",
        border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        overflow: "hidden",
      }}>
        <div style={{
          padding: "16px 20px", borderBottom: "1px solid #f1f5f9",
          display: "flex", alignItems: "center", gap: "8px",
        }}>
          <User size={16} color="#059669" />
          <span style={{ fontWeight: 700, fontSize: "14px", color: "#0f172a" }}>
            Student List
          </span>
          <span style={{
            background: "rgba(16,185,129,0.1)", color: "#059669",
            fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "12px",
          }}>
            {students.length}
          </span>
        </div>

        {students.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8", fontSize: "13px" }}>
            No students enrolled
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["#", "Name", "Email", "Birth Date"].map((h, i) => (
                  <th key={i} style={{
                    padding: "11px 16px", textAlign: "left",
                    fontWeight: 600, color: "#475569",
                    fontSize: "11px", letterSpacing: "0.5px", textTransform: "uppercase",
                    borderBottom: "1px solid #e2e8f0",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((student, idx) => (
                <tr
                  key={student.id || idx}
                  style={{ borderBottom: idx < students.length - 1 ? "1px solid #f1f5f9" : "none", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "12px 16px", color: "#94a3b8", fontSize: "12px" }}>
                    {idx + 1}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{
                        width: "28px", height: "28px",
                        background: "linear-gradient(135deg,#10b981,#34d399)",
                        borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontWeight: 700, fontSize: "11px", flexShrink: 0,
                      }}>
                        {student.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <span style={{ fontWeight: 600, color: "#0f172a" }}>{student.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#475569" }}>{student.email}</td>
                  <td style={{ padding: "12px 16px", color: "#64748b" }}>{student.birthday}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ClassDetails;
