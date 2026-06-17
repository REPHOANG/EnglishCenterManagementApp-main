import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { GraduationCap, Eye, BookOpen } from "lucide-react";

const Grades = () => {
  const [gradeList, setGradeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const viewDetailsHandler = (classId) => {
    navigate(`/student/grade/${classId}`);
  };

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        const studentId = jwtDecode(token).id;
        const response = await axios.get(
          `http://localhost:9999/api/student/${studentId}/grades`
        );
        const grades = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
          ? response.data.data
          : [];
        setGradeList(grades);
      } catch (err) {
        console.error("Error fetching grades:", err);
        if (err.response && err.response.status === 404) {
          setGradeList([]);
          setError(null);
        } else {
          setError("Failed to load grades.");
          setGradeList([]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchGrades();
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "300px", flexDirection: "column", gap: "16px" }}>
      <div style={{ width: "44px", height: "44px", border: "3px solid rgba(16,185,129,0.2)", borderTop: "3px solid #10b981", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
      <span style={{ color: "#64748b", fontSize: "14px" }}>Loading grades...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "12px", padding: "24px", textAlign: "center", color: "#ef4444" }}>
      {error}
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
          <div style={{
            width: "36px", height: "36px",
            background: "linear-gradient(135deg, #10b981, #059669)",
            borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <GraduationCap size={18} color="#fff" />
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: 0 }}>My Grades</h1>
        </div>
        <p style={{ color: "#64748b", fontSize: "13px", margin: 0, marginLeft: "48px" }}>
          View your academic performance across all classes
        </p>
      </div>

      {/* Table */}
      <div style={{
        background: "#fff",
        borderRadius: "14px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        border: "1px solid rgba(0,0,0,0.05)",
        overflow: "hidden",
      }}>
        {gradeList.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
            <GraduationCap size={40} style={{ marginBottom: "12px", opacity: 0.3 }} />
            <p style={{ fontSize: "14px", margin: 0 }}>No grades available yet</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "13px 16px", textAlign: "left", fontWeight: 600, color: "#475569", fontSize: "11px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                  Class
                </th>
                <th style={{ padding: "13px 16px", textAlign: "left", fontWeight: 600, color: "#475569", fontSize: "11px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                  Course
                </th>
                <th style={{ padding: "13px 16px", textAlign: "center", fontWeight: 600, color: "#475569", fontSize: "11px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {gradeList.map((grade, idx) => (
                <tr
                  key={grade._id || idx}
                  style={{ borderBottom: idx < gradeList.length - 1 ? "1px solid #f1f5f9" : "none", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{
                        width: "32px", height: "32px",
                        background: "linear-gradient(135deg,rgba(16,185,129,0.15),rgba(5,150,105,0.1))",
                        borderRadius: "8px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <BookOpen size={14} color="#059669" />
                      </div>
                      <span style={{ fontWeight: 600, color: "#0f172a" }}>{grade.className}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", color: "#475569" }}>
                    {grade.courseName}
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "center" }}>
                    <button
                      onClick={() => viewDetailsHandler(grade.classId)}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "5px",
                        padding: "5px 12px",
                        background: "rgba(16,185,129,0.1)",
                        color: "#059669",
                        border: "1px solid rgba(16,185,129,0.2)",
                        borderRadius: "8px",
                        fontSize: "12px", fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(16,185,129,0.2)"}
                      onMouseLeave={e => e.currentTarget.style.background = "rgba(16,185,129,0.1)"}
                    >
                      <Eye size={12} /> View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Grades;