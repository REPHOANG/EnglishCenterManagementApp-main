import StudentList from "../teacher/StudentList";
import Grades from "../teacher/Grades";
import Attendance from "../../components/teacher/Attendance";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ClipboardPenLine, UsersRound, ArrowLeft, GraduationCap, Calendar, CircleDot, BookOpen, ClipboardCheck } from "lucide-react";
import axios from "axios";

const card = {
  background: "#fff",
  borderRadius: "16px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)",
  border: "1px solid rgba(0,0,0,0.05)",
};

const TeachingClassDetails = () => {
  const [activeTab, setActiveTab] = useState("students");
  const [classData, setClassData] = useState(null);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const { classId, teacherId } = useParams();
  const navigate = useNavigate();

  const fetchClassData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:9999/api/teacher/${teacherId}/classes/${classId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data?.success) setClassData(response.data.data);
    } catch (error) {
      console.error("Error fetching class data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGrades = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:9999/api/teacher/${teacherId}/classes/${classId}/grades`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data?.success) setGrades(response.data.data);
      else setGrades([]);
    } catch {
      setGrades([]);
    }
  };

  const handleGradeUpdate = () => fetchGrades();

  useEffect(() => {
    if (classId) { fetchClassData(); fetchGrades(); }
  }, [classId, teacherId]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "300px" }}>
        <div style={{ textAlign: "center", color: "#94a3b8" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
          <div>Loading class details...</div>
        </div>
      </div>
    );
  }

  const isOngoing = classData?.status?.toLowerCase() === "ongoing";

  return (
    <div>
      {/* Back + Header */}
      <button
        onClick={() => navigate(-1)}
        style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          marginBottom: "20px", background: "none", border: "none",
          color: "#64748b", fontSize: "13px", cursor: "pointer", padding: 0,
          fontWeight: 500, transition: "color 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.color = "#6366f1"}
        onMouseLeave={e => e.currentTarget.style.color = "#64748b"}
      >
        <ArrowLeft size={14} /> Back to Classes
      </button>

      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Class Details</h1>
        <p style={{ color: "#64748b", fontSize: "13px", marginTop: "4px" }}>View students and manage grades for this class</p>
      </div>

      {/* Class Info Card */}
      <div style={{ ...card, padding: "24px", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "20px", flexWrap: "wrap" }}>
          {/* Icon */}
          <div style={{
            width: "56px", height: "56px", borderRadius: "14px",
            background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <GraduationCap size={26} color="#fff" />
          </div>

          <div style={{ flex: 1, minWidth: "200px" }}>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>
              {classData?.name}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
              {/* Status badge */}
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "5px",
                padding: "3px 12px", borderRadius: "20px",
                background: isOngoing ? "#d1fae5" : "#f1f5f9",
                color: isOngoing ? "#065f46" : "#475569",
                fontSize: "11px", fontWeight: 600,
              }}>
                <CircleDot size={10} style={{ color: isOngoing ? "#10b981" : "#94a3b8" }} />
                {classData?.status}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #f1f5f9" }}>
          {[
            { icon: <BookOpen size={14} />, label: "Course", value: classData?.course },
            { icon: <Calendar size={14} />, label: "Start Date", value: classData?.startDate },
            { icon: <UsersRound size={14} />, label: "Teachers", value: classData?.teachers?.map(t => t.name).join(", ") || "—" },
          ].map(info => (
            <div key={info.label}>
              <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#94a3b8", fontSize: "11px", fontWeight: 600, letterSpacing: "0.5px", marginBottom: "4px", textTransform: "uppercase" }}>
                {info.icon} {info.label}
              </div>
              <div style={{ color: "#1e293b", fontSize: "14px", fontWeight: 500 }}>{info.value || "—"}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        {[
          { key: "students", label: "Students", icon: <UsersRound size={15} /> },
          { key: "grades", label: "Grades", icon: <ClipboardPenLine size={15} /> },
          { key: "attendance", label: "Điểm danh", icon: <ClipboardCheck size={15} /> },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              display: "flex", alignItems: "center", gap: "7px",
              padding: "9px 20px", borderRadius: "10px",
              border: activeTab === tab.key ? "1.5px solid #bae6fd" : "1.5px solid #e2e8f0",
              background: activeTab === tab.key ? "#e0f2fe" : "#fff",
              color: activeTab === tab.key ? "#0284c7" : "#64748b",
              fontSize: "13px", fontWeight: 600, cursor: "pointer",
              boxShadow: activeTab === tab.key ? "0 2px 8px rgba(14,165,233,0.12)" : "none",
              transition: "all 0.2s",
            }}
          >
            {tab.icon} {tab.label}
            {tab.key === "students" && classData?.students && (
              <span style={{
                background: activeTab === "students" ? "#0284c7" : "#e2e8f0",
                color: activeTab === "students" ? "#fff" : "#64748b",
                borderRadius: "20px", padding: "1px 7px", fontSize: "10px", fontWeight: 700,
              }}>
                {classData.students.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={card}>
        {activeTab === "students" && <StudentList students={classData?.students} />}
        {activeTab === "grades" && <Grades grades={grades} onGradeUpdate={handleGradeUpdate} />}
        {activeTab === "attendance" && <Attendance classId={classId} teacherId={teacherId} />}
      </div>
    </div>
  );
};

export default TeachingClassDetails;