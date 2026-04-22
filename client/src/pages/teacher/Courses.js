import { useEffect, useState } from "react";
import { Search, BookOpen, Tag, DollarSign, Eye } from "lucide-react";

const card = {
  background: "#fff",
  borderRadius: "16px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)",
  border: "1px solid rgba(0,0,0,0.05)",
};

const LEVEL_COLORS = {
  beginner: { bg: "#d1fae5", text: "#065f46" },
  elementary: { bg: "#dbeafe", text: "#1d4ed8" },
  intermediate: { bg: "#fef3c7", text: "#92400e" },
  "upper-intermediate": { bg: "#ede9fe", text: "#6d28d9" },
  advanced: { bg: "#fee2e2", text: "#991b1b" },
};

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:9999/api/courses", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Failed to fetch courses");
        const data = await response.json();
        if (data.success) setCourses(data.data);
        else { setError(data.message || "Failed to fetch courses"); setCourses([]); }
      } catch (err) {
        setError(err.message);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filtered = courses.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === "all" || c.status === status;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: courses.length,
    active: courses.filter(c => c.status === "active").length,
    inactive: courses.filter(c => c.status === "inactive").length,
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "300px" }}>
        <div style={{ textAlign: "center", color: "#94a3b8" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>📚</div>
          <div>Loading courses...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "300px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>⚠️</div>
          <div style={{ color: "#ef4444", fontSize: "14px" }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Courses</h1>
        <p style={{ color: "#64748b", fontSize: "13px", marginTop: "4px" }}>Browse all available courses at the center</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total Courses", value: stats.total, icon: <BookOpen size={20} />, color: "#0ea5e9", bg: "#e0f2fe" },
          { label: "Active", value: stats.active, icon: <Tag size={20} />, color: "#10b981", bg: "#d1fae5" },
          { label: "Inactive", value: stats.inactive, icon: <Tag size={20} />, color: "#94a3b8", bg: "#f1f5f9" },
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

      {/* Filters */}
      <div style={{ ...card, padding: "16px 20px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: "200px", maxWidth: "320px" }}>
          <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "8px 12px 8px 34px",
              border: "1.5px solid #e2e8f0", borderRadius: "10px",
              fontSize: "13px", outline: "none", background: "#f8fafc", color: "#1e293b",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Status filter */}
        <div style={{ display: "flex", gap: "6px", background: "#f8fafc", borderRadius: "10px", padding: "3px" }}>
          {[["all", "All"], ["active", "Active"], ["inactive", "Inactive"]].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setStatus(val)}
              style={{
                padding: "5px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
                border: "none", cursor: "pointer", transition: "all 0.2s",
                background: status === val ? "#fff" : "transparent",
                color: status === val ? "#0284c7" : "#94a3b8",
                boxShadow: status === val ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={card}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#64748b" }}>
            {filtered.length} course{filtered.length !== 1 ? "s" : ""} found
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {[
                  { label: "Course Name", icon: <BookOpen size={12} /> },
                  { label: "Level", icon: <Tag size={12} /> },
                  { label: "Price (VND)", icon: <DollarSign size={12} /> },
                  { label: "Status", icon: null },
                  { label: "Actions", icon: null },
                ].map(h => (
                  <th key={h.label} style={{
                    padding: "12px 16px", fontSize: "11px", fontWeight: 700,
                    color: "#94a3b8", textAlign: "left", letterSpacing: "0.7px",
                    textTransform: "uppercase", borderBottom: "1px solid #f1f5f9",
                    whiteSpace: "nowrap",
                  }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                      {h.icon} {h.label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "48px", textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>
                    No courses found.
                  </td>
                </tr>
              ) : filtered.map((course, idx) => {
                const levelKey = course?.level?.toLowerCase();
                const lc = LEVEL_COLORS[levelKey] || { bg: "#f1f5f9", text: "#475569" };
                const isActive = course.status === "active";

                return (
                  <tr
                    key={course._id}
                    style={{ borderBottom: idx < filtered.length - 1 ? "1px solid #f8fafc" : "none", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fafbff"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                          width: "36px", height: "36px", borderRadius: "10px",
                          background: "linear-gradient(135deg, #e0f2fe, #bae6fd44)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                        }}>
                          <BookOpen size={16} style={{ color: "#0ea5e9" }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "14px" }}>{course.name}</div>
                          {course.description && (
                            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "1px", maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {course.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        display: "inline-block", padding: "3px 10px", borderRadius: "20px",
                        background: lc.bg, color: lc.text, fontSize: "11px", fontWeight: 600,
                        textTransform: "capitalize",
                      }}>
                        {course.level || "—"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", color: "#1e293b", fontWeight: 600, fontSize: "13px" }}>
                      {course.price?.toLocaleString('vi-VN') ?? "—"}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: "5px",
                        padding: "3px 10px", borderRadius: "20px",
                        background: isActive ? "#d1fae5" : "#f1f5f9",
                        color: isActive ? "#065f46" : "#475569",
                        fontSize: "11px", fontWeight: 600,
                      }}>
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: isActive ? "#10b981" : "#94a3b8", display: "inline-block" }} />
                        {course.status}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <button style={{
                        display: "inline-flex", alignItems: "center", gap: "5px",
                        padding: "5px 12px", borderRadius: "8px",
                        background: "#f8fafc", color: "#475569",
                        border: "1px solid #e2e8f0", fontSize: "12px", fontWeight: 600,
                        cursor: "pointer", transition: "all 0.2s",
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#eef2ff"; e.currentTarget.style.color = "#6366f1"; e.currentTarget.style.borderColor = "#c7d2fe"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#475569"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
                      >
                        <Eye size={12} /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
