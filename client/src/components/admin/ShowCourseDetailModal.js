import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, DollarSign, BookOpen, Clock, BarChart2, Activity, AlignLeft } from "lucide-react";

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
        fontSize: "13px",
        fontWeight: 600,
        textTransform: "capitalize",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      {name}
    </span>
  );
}

export default function ShowCourseDetailModal({ course, onClose }) {
  const [courseData, setCourseData] = useState(null);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", { currency: "VND" }).format(price);
  };

  useEffect(() => {
    if (course) {
      setCourseData(course);
    }
  }, [course]);

  if (!courseData) return null;

  return (
    <AnimatePresence>
      <motion.div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(4px)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          style={{
            background: "#ffffff",
            borderRadius: "20px",
            width: "100%",
            maxWidth: "550px",
            maxHeight: "90vh",
            position: "relative",
            overflowY: "auto",
            overflowX: "hidden",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          }}
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Header Background / Image Banner */}
          <div style={{ height: "200px", background: "#f8fafc", position: "relative" }}>
            {courseData.image ? (
              <img 
                src={courseData.image} 
                alt="Course Banner" 
                style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
            ) : null}
            <div style={{ width: "100%", height: "100%", display: courseData.image ? "none" : "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
              <BookOpen size={48} style={{ color: "#fff", opacity: 0.5 }} />
            </div>
            
            {/* Close Button overlay */}
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "rgba(0,0,0,0.3)",
                backdropFilter: "blur(4px)",
                border: "none",
                color: "#fff",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.5)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.3)")}
            >
              <X size={18} />
            </button>
          </div>

          {/* Details Content */}
          <div style={{ padding: "24px" }}>
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
              <Badge type="level" name={courseData.level} />
              <Badge type="status" name={courseData.status} />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                {courseData.name}
              </h2>
            </div>

            {/* Description Card */}
            <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#64748b", marginBottom: "8px", fontWeight: 600, fontSize: "12px", textTransform: "uppercase" }}>
                <AlignLeft size={16} />
                Description
              </div>
              <p style={{ fontSize: "14px", color: "#475569", margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                {courseData.description || "No description provided."}
              </p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "#f8fafc", borderRadius: "12px" }}>
                <div style={{ width: 36, height: 36, borderRadius: "8px", background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981" }}>
                  <DollarSign size={18} />
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Price</div>
                  <div style={{ fontSize: "14px", color: "#0f172a", fontWeight: 600 }}>{formatPrice(courseData.price)} VNĐ</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "#f8fafc", borderRadius: "12px" }}>
                <div style={{ width: 36, height: 36, borderRadius: "8px", background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1" }}>
                  <Clock size={18} />
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Created At</div>
                  <div style={{ fontSize: "14px", color: "#0f172a", fontWeight: 600 }}>{new Date(courseData.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            {/* Footer Action */}
            <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "20px", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={onClose}
                style={{
                  padding: "10px 24px",
                  background: "#fff",
                  color: "#64748b",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f8fafc";
                  e.currentTarget.style.color = "#0f172a";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#fff";
                  e.currentTarget.style.color = "#64748b";
                }}
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
