import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { ArrowLeft, GraduationCap, Star, MessageSquare } from "lucide-react";

const skillColors = [
  { bg: "linear-gradient(135deg,#dbeafe,#bfdbfe)", border: "#93c5fd", text: "#1d4ed8", fill: "#3b82f6" },
  { bg: "linear-gradient(135deg,#d1fae5,#a7f3d0)", border: "#6ee7b7", text: "#065f46", fill: "#10b981" },
  { bg: "linear-gradient(135deg,#fce7f3,#fbcfe8)", border: "#f9a8d4", text: "#9d174d", fill: "#ec4899" },
  { bg: "linear-gradient(135deg,#fef3c7,#fde68a)", border: "#fcd34d", text: "#92400e", fill: "#f59e0b" },
  { bg: "linear-gradient(135deg,#ede9fe,#ddd6fe)", border: "#c4b5fd", text: "#4c1d95", fill: "#8b5cf6" },
];

const GradeDetails = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [gradeDetails, setGradeDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGradeDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const studentId = jwtDecode(token).id;
        const response = await axios.get(
          `http://localhost:9999/api/student/${studentId}/grades/class/${classId}`
        );
        const dataArr = response.data?.data;
        if (Array.isArray(dataArr) && dataArr.length > 0) {
          const grade = dataArr[0];
          const skills = Object.entries(grade.score || {}).map(([name, score]) => ({ name, score }));
          setGradeDetails({
            className: grade.classId?.name || "",
            courseName: grade.classId?.courseId?.name || "",
            skills,
            comment: grade.comment || [],
          });
        } else {
          setGradeDetails(null);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching grade details:", err);
        if (err.response && err.response.status === 404) {
          setGradeDetails(null);
          setError(null);
        } else {
          setError("Failed to load grade details.");
        }
        setLoading(false);
      }
    };
    fetchGradeDetails();
  }, [classId]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "300px", flexDirection: "column", gap: "16px" }}>
      <div style={{ width: "44px", height: "44px", border: "3px solid rgba(16,185,129,0.2)", borderTop: "3px solid #10b981", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
      <span style={{ color: "#64748b", fontSize: "14px" }}>Loading grade details...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "12px", padding: "24px", textAlign: "center", color: "#ef4444" }}>
      {error}
    </div>
  );

  if (!gradeDetails) return (
    <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
      <GraduationCap size={40} style={{ marginBottom: "12px", opacity: 0.3 }} />
      <p style={{ margin: 0, fontSize: "14px" }}>No grade details found</p>
    </div>
  );

  const avgScore = gradeDetails.skills.length > 0
    ? (gradeDetails.skills.reduce((a, s) => a + (parseFloat(s.score) || 0), 0) / gradeDetails.skills.length).toFixed(1)
    : "N/A";

  return (
    <div>
      {/* Back & Header */}
      <div style={{ marginBottom: "24px" }}>
        <button
          onClick={() => navigate("/student/grade")}
          style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
            borderRadius: "8px", padding: "6px 12px",
            color: "#059669", fontSize: "12px", fontWeight: 600,
            cursor: "pointer", marginBottom: "16px", transition: "all 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(16,185,129,0.15)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(16,185,129,0.08)"}
        >
          <ArrowLeft size={14} /> Back to Grades
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "36px", height: "36px",
            background: "linear-gradient(135deg,#10b981,#059669)",
            borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <GraduationCap size={18} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Grade Details</h1>
            <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
              {gradeDetails.className} · {gradeDetails.courseName}
            </p>
          </div>
        </div>
      </div>

      {/* Average Score Banner */}
      <div style={{
        background: "linear-gradient(135deg,#0c1a2e,#0a2744)",
        borderRadius: "14px", padding: "24px",
        marginBottom: "20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        color: "#fff",
      }}>
        <div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "4px" }}>
            Overall Average
          </div>
          <div style={{ fontSize: "42px", fontWeight: 800, color: "#34d399", lineHeight: 1 }}>
            {avgScore}
          </div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "4px" }}>
            across {gradeDetails.skills.length} skill{gradeDetails.skills.length !== 1 ? "s" : ""}
          </div>
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          {[1, 2, 3, 4, 5].map(i => (
            <Star key={i} size={20}
              fill={parseFloat(avgScore) >= i * 2 ? "#f59e0b" : "none"}
              color={parseFloat(avgScore) >= i * 2 ? "#f59e0b" : "rgba(255,255,255,0.2)"}
            />
          ))}
        </div>
      </div>

      {/* Skills */}
      <div style={{
        background: "#fff", borderRadius: "14px", overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        marginBottom: "20px",
      }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "8px" }}>
          <GraduationCap size={16} color="#059669" />
          <span style={{ fontWeight: 700, fontSize: "14px", color: "#0f172a" }}>Skill Scores</span>
        </div>
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {gradeDetails.skills.map((skill, idx) => {
            const color = skillColors[idx % skillColors.length];
            const pct = Math.min((parseFloat(skill.score) / 10) * 100, 100);
            return (
              <div key={idx}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a", textTransform: "capitalize" }}>
                    {skill.name}
                  </span>
                  <span style={{
                    background: color.bg, border: `1px solid ${color.border}`,
                    color: color.text, fontSize: "12px", fontWeight: 700,
                    padding: "2px 10px", borderRadius: "20px",
                  }}>
                    {skill.score}
                  </span>
                </div>
                <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "10px", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: "10px",
                    width: `${pct}%`,
                    background: `linear-gradient(90deg,${color.fill},${color.text})`,
                    transition: "width 0.6s ease",
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comments */}
      {gradeDetails.comment && (
        <div style={{
          background: "#fff", borderRadius: "14px",
          border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          overflow: "hidden",
        }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "8px" }}>
            <MessageSquare size={16} color="#059669" />
            <span style={{ fontWeight: 700, fontSize: "14px", color: "#0f172a" }}>Teacher Comments</span>
          </div>
          <div style={{ padding: "16px 20px" }}>
            {Array.isArray(gradeDetails.comment) ? (
              gradeDetails.comment.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {gradeDetails.comment.map((c, i) => (
                    <div key={i} style={{
                      background: "#f0fdf4", border: "1px solid #bbf7d0",
                      borderRadius: "8px", padding: "10px 14px",
                      fontSize: "13px", color: "#065f46",
                    }}>
                      {c}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>No comments yet</p>
              )
            ) : (
              <div style={{
                background: "#f0fdf4", border: "1px solid #bbf7d0",
                borderRadius: "8px", padding: "10px 14px",
                fontSize: "13px", color: "#065f46",
              }}>
                {gradeDetails.comment}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GradeDetails;
