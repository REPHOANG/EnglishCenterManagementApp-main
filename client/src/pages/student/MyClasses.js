import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { BookOpen, Eye, CheckCircle, Clock, Filter } from "lucide-react";

const MyClasses = () => {
  const [classes, setClasses] = useState([]);
  const [filter, setFilter] = useState("Ongoing");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please log in again to view your classes.");
        setLoading(false);
        return;
      }
      try {
        const studentId = jwtDecode(token).id;
        const response = await axios.get(
          `http://localhost:9999/api/student/${studentId}/my-classes`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data && Array.isArray(response.data.data)) {
          setClasses(response.data.data);
        } else {
          setError("Invalid classes data format received from server.");
          setClasses([]);
        }
      } catch (err) {
        setError(`Failed to fetch classes. Status: ${err.response?.status || "Unknown"}, Message: ${err.response?.data?.message || err.message}`);
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  const mapStatusForFilter = (status) => {
    if (!status) return "ongoing";
    if (status.toLowerCase() === "finished") return "completed";
    return status.toLowerCase();
  };

  const filteredClasses = classes.filter((cls) => {
    if (filter === "All") return true;
    return mapStatusForFilter(cls.status) === filter.toLowerCase();
  });

  const filterButtons = ["All", "Ongoing", "Completed"];

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "300px", flexDirection: "column", gap: "16px" }}>
        <div style={{
          width: "44px", height: "44px", border: "3px solid rgba(16,185,129,0.2)",
          borderTop: "3px solid #10b981", borderRadius: "50%",
          animation: "spin 0.9s linear infinite",
        }} />
        <span style={{ color: "#64748b", fontSize: "14px" }}>Loading your classes...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
        borderRadius: "12px", padding: "24px", textAlign: "center", color: "#ef4444",
      }}>
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
          <div style={{
            width: "36px", height: "36px",
            background: "linear-gradient(135deg, #10b981, #059669)",
            borderRadius: "10px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <BookOpen size={18} color="#fff" />
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: 0 }}>My Classes</h1>
        </div>
        <p style={{ color: "#64748b", fontSize: "13px", margin: 0, marginLeft: "48px" }}>
          View and manage all your enrolled classes
        </p>
      </div>

      {/* Filter Bar */}
      <div style={{
        background: "#fff",
        borderRadius: "14px",
        padding: "16px 20px",
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        border: "1px solid rgba(0,0,0,0.05)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Filter size={15} color="#94a3b8" />
          <span style={{ color: "#64748b", fontSize: "13px", fontWeight: 500 }}>Filter:</span>
          <div style={{ display: "flex", gap: "6px" }}>
            {filterButtons.map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                style={{
                  padding: "5px 14px",
                  borderRadius: "20px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: 600,
                  transition: "all 0.2s",
                  background: filter === type
                    ? "linear-gradient(135deg, #10b981, #059669)"
                    : "rgba(0,0,0,0.05)",
                  color: filter === type ? "#fff" : "#64748b",
                  boxShadow: filter === type ? "0 2px 8px rgba(16,185,129,0.3)" : "none",
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        <span style={{
          background: "rgba(16,185,129,0.1)",
          color: "#059669",
          fontSize: "12px", fontWeight: 600,
          padding: "4px 10px", borderRadius: "20px",
        }}>
          {filteredClasses.length} class{filteredClasses.length !== 1 ? "es" : ""}
        </span>
      </div>

      {/* Table */}
      <div style={{
        background: "#fff",
        borderRadius: "14px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        border: "1px solid rgba(0,0,0,0.05)",
        overflow: "hidden",
      }}>
        {filteredClasses.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
            <BookOpen size={40} style={{ marginBottom: "12px", opacity: 0.4 }} />
            <p style={{ fontSize: "14px", margin: 0 }}>No classes found matching your filter</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                {["Class Name", "Teacher", "Schedule", "Status", "Actions"].map((h, i) => (
                  <th key={i} style={{
                    padding: "13px 16px",
                    textAlign: i >= 3 ? "center" : "left",
                    fontWeight: 600, color: "#475569",
                    fontSize: "11px", letterSpacing: "0.5px", textTransform: "uppercase",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredClasses.map((cls, idx) => {
                const displayStatus = cls.status === "finished" ? "Completed" : (cls.status || "Ongoing");
                const isOngoing = displayStatus.toLowerCase() === "ongoing";
                return (
                  <tr
                    key={cls._id}
                    style={{
                      borderBottom: idx < filteredClasses.length - 1 ? "1px solid #f1f5f9" : "none",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ fontWeight: 600, color: "#0f172a" }}>{cls.name}</span>
                    </td>
                    <td style={{ padding: "14px 16px", color: "#475569" }}>
                      {Array.isArray(cls.teachers) && cls.teachers.length > 0
                        ? cls.teachers.map((t) => t.fullName).join(", ")
                        : "N/A"}
                    </td>
                    <td style={{ padding: "14px 16px", color: "#64748b" }}>
                      {Array.isArray(cls.schedule) && cls.schedule.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          {cls.schedule.map((s, index) => (
                            <div key={index} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{
                                background: "#e0f2fe", color: "#0284c7",
                                fontSize: "10px", fontWeight: 600,
                                padding: "1px 6px", borderRadius: "4px",
                              }}>{s.weekday?.slice(0, 3)}</span>
                              <span style={{ fontSize: "12px" }}>
                                {s.slot?.from && s.slot?.to ? `${s.slot.from} - ${s.slot.to}` : "Time N/A"}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : "No Schedule"}
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "center" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: "5px",
                        padding: "4px 10px", borderRadius: "20px",
                        fontSize: "11px", fontWeight: 600,
                        background: isOngoing ? "rgba(16,185,129,0.12)" : "rgba(100,116,139,0.1)",
                        color: isOngoing ? "#059669" : "#64748b",
                      }}>
                        {isOngoing ? <CheckCircle size={10} /> : <Clock size={10} />}
                        {displayStatus}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "center" }}>
                      <Link
                        to={`/student/my-classes/${cls._id}`}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: "5px",
                          padding: "5px 12px",
                          background: "rgba(16,185,129,0.1)",
                          color: "#059669",
                          borderRadius: "8px",
                          fontSize: "12px", fontWeight: 600,
                          textDecoration: "none",
                          transition: "all 0.15s",
                          border: "1px solid rgba(16,185,129,0.2)",
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = "rgba(16,185,129,0.2)";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = "rgba(16,185,129,0.1)";
                        }}
                      >
                        <Eye size={12} /> View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MyClasses;
