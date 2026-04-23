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

      <div className="flex justify-between items-center mb-2 mt-6">
        <h2 className="text-xl font-semibold">Student List</h2>
        <a
          href={`/student/my-classes/${classId}/documents`}
          className="flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg font-medium transition-colors border border-blue-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Tài liệu & Bài tập
        </a>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-3 text-left">Name</th>
              <th className="border px-4 py-3 text-left">Email</th>
              <th className="border px-4 py-3 text-left">Birth Date</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="border px-4 py-3 font-semibold text-blue-700">
                  {student.name}
                </td>
                <td className="border px-4 py-3">{student.email}</td>
                <td className="border px-4 py-3">{student.birthday}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClassDetails;
