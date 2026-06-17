import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Search, Eye, Trash2, X, Edit2, BookOpen, FilterX, BarChart2, Activity } from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import AddCourseModal from "../../components/admin/AddCourseModal";
import ShowCourseDetailModal from "../../components/admin/ShowCourseDetailModal";
import UpdateCourseModal from "../../components/admin/UpdateCourseModal";

/* ─── Colour helpers ─── */
const LEVEL_COLORS = {
  beginner: { bg: "rgba(16,185,129,0.12)", text: "#10b981", dot: "#10b981" },
  intermediate: { bg: "rgba(245,158,11,0.12)", text: "#f59e0b", dot: "#f59e0b" },
  advanced: { bg: "rgba(244,63,94,0.12)", text: "#f43f5e", dot: "#f43f5e" },
  default: { bg: "rgba(100,116,139,0.12)", text: "#64748b", dot: "#64748b" },
};

const STATUS_COLORS = {
  active: { bg: "rgba(14,165,233,0.12)", text: "#0ea5e9", dot: "#0ea5e9" },
  inactive: { bg: "rgba(100,116,139,0.12)", text: "#64748b", dot: "#64748b" },
  default: { bg: "rgba(100,116,139,0.12)", text: "#64748b", dot: "#64748b" },
};

function Badge({ type, name }) {
  const key = (name || "").toLowerCase();
  const c = (type === "level" ? LEVEL_COLORS[key] : STATUS_COLORS[key]) || LEVEL_COLORS.default;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "4px 12px",
        borderRadius: "20px",
        background: c.bg,
        color: c.text,
        fontSize: "12px",
        fontWeight: 600,
        textTransform: "capitalize",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      {name}
    </span>
  );
}

const HEADERS = ["Course", "Level", "Price", "Status", "Description", "Actions"];

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("all");
  const [status, setStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [expandedDescriptionId, setExpandedDescriptionId] = useState(null);
  const [hoverRow, setHoverRow] = useState(null);

  /* ── Fetch ── */
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("http://localhost:9999/api/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(data.data);
    } catch (e) {
      console.error("Fetch courses failed", e);
    }
  };

  const handleAddCourse = async (payload) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        "http://localhost:9999/api/courses/add",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setCourses((prev) => [...prev, data.data]);
        setShowAddModal(false);
      }
    } catch (e) {
      console.error("Add course failed", e);
    }
  };

  const handleDeleteCourse = async (_id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.delete(
        `http://localhost:9999/api/courses/delete/${_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) setCourses((prev) => prev.filter((c) => c._id !== _id));
    } catch (e) {
      console.error("Delete course failed", e);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", { currency: "VND" }).format(price);
  };

  /* ── Filter ── */
  const filtered = courses.filter((c) => {
    const s = search.toLowerCase();
    const matchSearch =
      c.name?.toLowerCase().includes(s) ||
      c.description?.toLowerCase().includes(s);
    const matchLevel = level === "all" || c.level === level;
    const matchStatus = status === "all" || c.status === status;
    return matchSearch && matchLevel && matchStatus;
  });

  const hasFilter = search !== "" || level !== "all" || status !== "all";

  const clearFilters = () => {
    setSearch("");
    setLevel("all");
    setStatus("all");
  };

  /* ── Styles ── */
  const card = {
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
    border: "1px solid rgba(0,0,0,0.05)",
  };

  const inputStyle = {
    width: "100%",
    padding: "9px 12px 9px 38px",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    fontSize: "13px",
    color: "#0f172a",
    outline: "none",
    background: "#f8fafc",
    transition: "border 0.2s",
  };

  const selectStyle = {
    width: "100%",
    padding: "9px 32px 9px 38px",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    fontSize: "13px",
    color: "#0f172a",
    outline: "none",
    background: "#f8fafc",
    appearance: "none",
    cursor: "pointer",
  };

  return (
    <AdminLayout>
      <div style={{ width: "100%", minHeight: "100%" }}>

        {/* ── Page Header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: 36,
                height: 36,
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
              }}
            >
              <BookOpen size={18} />
            </div>
            <div>
              <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                Course Management
              </h1>
              <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>
                {courses.length} total courses
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "9px 18px",
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(245,158,11,0.35)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 6px 18px rgba(245,158,11,0.45)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(245,158,11,0.35)";
            }}
          >
            <Plus size={16} />
            Add Course
          </button>
        </div>

        {/* ── Filter Bar ── */}
        <div style={{ ...card, padding: "18px 20px", marginBottom: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 200px 200px auto", gap: "12px", alignItems: "end" }}>

            {/* Search */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Search
              </label>
              <div style={{ position: "relative" }}>
                <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Course name or description…"
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.border = "1px solid #f59e0b"; e.target.style.background = "#fff"; }}
                  onBlur={(e) => { e.target.style.border = "1px solid #e2e8f0"; e.target.style.background = "#f8fafc"; }}
                />
              </div>
            </div>

            {/* Level */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Level
              </label>
              <div style={{ position: "relative" }}>
                <BarChart2 size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  style={selectStyle}
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Status */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Status
              </label>
              <div style={{ position: "relative" }}>
                <Activity size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={selectStyle}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Clear */}
            <button
              onClick={clearFilters}
              disabled={!hasFilter}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "9px 16px",
                border: `1px solid ${hasFilter ? "#e2e8f0" : "#f1f5f9"}`,
                borderRadius: "10px",
                background: hasFilter ? "#fff" : "#f8fafc",
                color: hasFilter ? "#64748b" : "#cbd5e1",
                fontSize: "13px",
                fontWeight: 500,
                cursor: hasFilter ? "pointer" : "not-allowed",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => { if (hasFilter) { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#0f172a"; } }}
              onMouseLeave={(e) => { if (hasFilter) { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#64748b"; } }}
            >
              <FilterX size={14} />
              Clear
            </button>
          </div>

          {/* Result count */}
          {hasFilter && (
            <div style={{ marginTop: "10px", fontSize: "12px", color: "#94a3b8" }}>
              Showing <strong style={{ color: "#0f172a" }}>{filtered.length}</strong> of {courses.length} courses
            </div>
          )}
        </div>

        {/* ── Table ── */}
        <div style={{ ...card, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "850px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                  {HEADERS.map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "13px 16px",
                        textAlign: "left",
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#94a3b8",
                        textTransform: "uppercase",
                        letterSpacing: "0.6px",
                        background: "#fafafa",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c._id}
                    onMouseEnter={() => setHoverRow(c._id)}
                    onMouseLeave={() => setHoverRow(null)}
                    style={{
                      borderBottom: "1px solid #f8fafc",
                      background: hoverRow === c._id ? "#fffbf2" : "#fff", // subtle amber hover
                      transition: "background 0.15s",
                    }}
                  >
                    {/* Name (with icon) */}
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: 36, height: 36, borderRadius: "8px", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #f1f5f9" }}>
                          {c.image ? (
                            <img src={c.image} alt="course" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }} onError={(e) => { e.target.style.display = 'none'; }} />
                          ) : (
                            <BookOpen size={16} style={{ color: "#94a3b8" }} />
                          )}
                        </div>
                        <span style={{ fontSize: "14px", fontWeight: 600, color: "#0f172a" }}>
                          {c.name}
                        </span>
                      </div>
                    </td>

                    {/* Level */}
                    <td style={{ padding: "14px 16px" }}>
                      <Badge type="level" name={c.level} />
                    </td>

                    {/* Price */}
                    <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: 600, color: "#475569", whiteSpace: "nowrap" }}>
                      {formatPrice(c.price.toFixed(0))} VND
                    </td>

                    {/* Status */}
                    <td style={{ padding: "14px 16px" }}>
                      <Badge type="status" name={c.status} />
                    </td>

                    {/* Description */}
                    <td
                      style={{ padding: "14px 16px", fontSize: "13px", color: "#64748b", maxWidth: "250px", cursor: "pointer" }}
                      onClick={() => setExpandedDescriptionId((p) => (p === c._id ? null : c._id))}
                    >
                      {expandedDescriptionId === c._id ? (
                        <div style={{ background: "#f1f5f9", padding: "8px 12px", borderRadius: "6px", fontSize: "12px", color: "#475569", lineHeight: 1.5 }}>
                          {c.description}
                        </div>
                      ) : (
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                          {c.description}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {/* Edit */}
                        <button
                          title="Edit course"
                          onClick={() => { setSelectedCourse(c); setShowUpdateModal(true); }}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            background: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            color: "#64748b",
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(245,158,11,0.1)"; e.currentTarget.style.color = "#f59e0b"; e.currentTarget.style.border = "1px solid rgba(245,158,11,0.3)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#64748b"; e.currentTarget.style.border = "1px solid #e2e8f0"; }}
                        >
                          <Edit2 size={14} />
                        </button>

                        {/* View */}
                        <button
                          title="View details"
                          onClick={() => { setSelectedCourse(c); setShowDetailModal(true); }}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            background: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            color: "#64748b",
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(14,165,233,0.1)"; e.currentTarget.style.color = "#0ea5e9"; e.currentTarget.style.border = "1px solid rgba(14,165,233,0.3)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#64748b"; e.currentTarget.style.border = "1px solid #e2e8f0"; }}
                        >
                          <Eye size={14} />
                        </button>

                        {/* Delete */}
                        <button
                          title="Delete course"
                          onClick={() => handleDeleteCourse(c._id)}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            background: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            color: "#64748b",
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(244,63,94,0.1)"; e.currentTarget.style.color = "#f43f5e"; e.currentTarget.style.border = "1px solid rgba(244,63,94,0.3)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#64748b"; e.currentTarget.style.border = "1px solid #e2e8f0"; }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Empty state */}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: "56px 0", textAlign: "center" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", color: "#94a3b8" }}>
                        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <BookOpen size={22} style={{ color: "#cbd5e1" }} />
                        </div>
                        <span style={{ fontSize: "14px", fontWeight: 500 }}>No courses found</span>
                        {hasFilter && (
                          <button
                            onClick={clearFilters}
                            style={{ fontSize: "12px", color: "#f59e0b", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {filtered.length > 0 && (
            <div
              style={{
                padding: "12px 20px",
                borderTop: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                {filtered.length} course{filtered.length !== 1 ? "s" : ""} shown
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      {showAddModal && (
        <AddCourseModal
          onClose={() => setShowAddModal(false)}
          onCreate={handleAddCourse}
        />
      )}
      {showUpdateModal && selectedCourse && (
        <UpdateCourseModal
          course={selectedCourse}
          onClose={() => { setSelectedCourse(null); setShowUpdateModal(false); }}
          onUpdate={(updated) =>
            setCourses((prev) => prev.map((c) => (c._id === updated._id ? updated : c)))
          }
        />
      )}
      {showDetailModal && selectedCourse && (
        <ShowCourseDetailModal
          course={selectedCourse}
          onClose={() => { setSelectedCourse(null); setShowDetailModal(false); }}
        />
      )}
    </AdminLayout>
  );
}
