import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Search, ClipboardList, Users, CheckCircle, XCircle } from "lucide-react";

const RegisterClass = () => {
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please log in again.");
      setLoading(false);
      return;
    }
    let studentId;
    try {
      studentId = jwtDecode(token).id;
    } catch {
      setError("Invalid session. Please log in again.");
      setLoading(false);
      return;
    }
    const fetchClasses = async () => {
      try {
        const response = await axios.get(
          `http://localhost:9999/api/student/${studentId}/registerable-classes`
        );
        setClasses(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching classes:", err);
        setError("Failed to load classes.");
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  const filtered = (Array.isArray(classes) ? classes : []).filter(
    (cls) =>
      (cls.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (cls.courseName?.toLowerCase() || "").includes(search.toLowerCase())
  );

  const handleEnroll = async (classId, className) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:9999/api/student/register-class/${classId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setClasses((prev) =>
        prev.map((cls) =>
          cls._id === classId
            ? { ...cls, registered: true, studentsCount: cls.studentsCount + 1 }
            : cls
        )
      );
      
      alert(`Successfully enrolled in ${className}`);
    } catch (err) {
      console.error("Error enrolling:", err);
      alert(err.response?.data?.message || "Failed to enroll in class");
    }
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "300px", flexDirection: "column", gap: "16px" }}>
      <div style={{ width: "44px", height: "44px", border: "3px solid rgba(16,185,129,0.2)", borderTop: "3px solid #10b981", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
      <span style={{ color: "#64748b", fontSize: "14px" }}>Loading available classes...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
          <div style={{
            width: "36px", height: "36px",
            background: "linear-gradient(135deg, #10b981, #059669)",
            borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <ClipboardList size={18} color="#fff" />
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Register for Classes</h1>
        </div>
        <p style={{ color: "#64748b", fontSize: "13px", margin: 0, marginLeft: "48px" }}>
          Browse and enroll in available classes
        </p>
      </div>

      {/* Search */}
      <div style={{
        background: "#fff", borderRadius: "14px", padding: "14px 16px", marginBottom: "24px",
        display: "flex", alignItems: "center", gap: "10px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.05)",
      }}>
        <Search size={16} color="#94a3b8" />
        <input
          type="text"
          placeholder="Search by class name or course..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1, border: "none", outline: "none",
            fontSize: "13px", color: "#0f172a", background: "transparent",
          }}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
          >
            <XCircle size={16} />
          </button>
        )}
        <span style={{
          background: "rgba(16,185,129,0.1)", color: "#059669",
          fontSize: "11px", fontWeight: 600, padding: "3px 8px", borderRadius: "12px",
        }}>
          {filtered.length} available
        </span>
      </div>

      {error && (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "12px", padding: "16px", color: "#ef4444", marginBottom: "20px" }}>
          {error}
        </div>
      )}

      {/* Cards Grid */}
      {filtered.length === 0 && !loading && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
          <ClipboardList size={40} style={{ marginBottom: "12px", opacity: 0.3 }} />
          <p style={{ fontSize: "14px", margin: 0 }}>No classes found</p>
        </div>
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "16px",
      }}>
        {filtered.map((cls) => {
          const isFull = cls.studentsCount >= cls.capacity;
          const pct = cls.capacity ? Math.round((cls.studentsCount / cls.capacity) * 100) : 0;
          return (
            <div key={cls._id} style={{
              background: "#fff",
              borderRadius: "16px",
              border: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              overflow: "hidden",
              transition: "box-shadow 0.2s, transform 0.2s",
              display: "flex", flexDirection: "column",
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)"; e.currentTarget.style.transform = "none"; }}
            >
              {/* Card top accent */}
              <div style={{ height: "4px", background: "linear-gradient(90deg,#10b981,#059669)" }} />

              <div style={{ padding: "18px", flex: 1 }}>
                {/* Class name & status */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                  <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                    {cls.name}
                  </h2>
                  <span style={{
                    fontSize: "10px", fontWeight: 600, padding: "2px 8px", borderRadius: "10px",
                    background: cls.status === "ongoing" ? "rgba(16,185,129,0.1)" : "rgba(100,116,139,0.1)",
                    color: cls.status === "ongoing" ? "#059669" : "#64748b",
                  }}>
                    {cls.status || "Upcoming"}
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
                  <div style={{ display: "flex", gap: "6px", fontSize: "12px", color: "#475569" }}>
                    <span style={{ fontWeight: 600, color: "#94a3b8", minWidth: "70px" }}>Course</span>
                    <span>{cls.courseName || "N/A"}</span>
                  </div>
                  <div style={{ display: "flex", gap: "6px", fontSize: "12px", color: "#475569" }}>
                    <span style={{ fontWeight: 600, color: "#94a3b8", minWidth: "70px" }}>Teachers</span>
                    <span>{cls.teachers || "N/A"}</span>
                  </div>
                  {Array.isArray(cls.schedule) && cls.schedule.length > 0 && (
                    <div style={{ display: "flex", gap: "6px", fontSize: "12px", color: "#475569" }}>
                      <span style={{ fontWeight: 600, color: "#94a3b8", minWidth: "70px" }}>Schedule</span>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        {cls.schedule.map((s, i) => (
                          <span key={i}>
                            <span style={{
                              background: "#e0f2fe", color: "#0284c7",
                              fontSize: "10px", fontWeight: 600,
                              padding: "1px 5px", borderRadius: "4px", marginRight: "5px",
                            }}>{s.weekday?.slice(0, 3)}</span>
                            {s.from} - {s.to}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Capacity bar */}
                <div style={{ marginBottom: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "#64748b" }}>
                      <Users size={12} /> Capacity
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: 600, color: isFull ? "#ef4444" : "#059669" }}>
                      {cls.studentsCount}/{cls.capacity}
                    </span>
                  </div>
                  <div style={{ height: "5px", background: "#f1f5f9", borderRadius: "10px", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: "10px",
                      width: `${Math.min(pct, 100)}%`,
                      background: isFull
                        ? "linear-gradient(90deg,#f87171,#ef4444)"
                        : "linear-gradient(90deg,#10b981,#059669)",
                      transition: "width 0.4s ease",
                    }} />
                  </div>
                </div>

                {/* Action button */}
                {cls.registered ? (
                  <button
                    style={{
                      width: "100%", padding: "9px",
                      background: "rgba(239,68,68,0.08)",
                      border: "1px solid rgba(239,68,68,0.2)",
                      borderRadius: "10px",
                      color: "#ef4444", fontSize: "13px", fontWeight: 600,
                      cursor: "default",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                    }}
                  >
                    <CheckCircle size={14} /> Enrolled
                  </button>
                ) : (
                  <button
                    disabled={isFull}
                    onClick={() => handleEnroll(cls._id, cls.name)}
                    style={{
                      width: "100%", padding: "9px",
                      background: isFull
                        ? "rgba(100,116,139,0.08)"
                        : "linear-gradient(135deg,#10b981,#059669)",
                      border: isFull ? "1px solid rgba(100,116,139,0.2)" : "none",
                      borderRadius: "10px",
                      color: isFull ? "#94a3b8" : "#fff",
                      fontSize: "13px", fontWeight: 600,
                      cursor: isFull ? "not-allowed" : "pointer",
                      transition: "all 0.2s",
                      boxShadow: isFull ? "none" : "0 2px 8px rgba(16,185,129,0.3)",
                    }}
                  >
                    {isFull ? "Class Full" : "Enroll Now"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RegisterClass;
