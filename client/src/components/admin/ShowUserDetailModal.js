import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Phone, MapPin, Calendar, Key, Clock, User as UserIcon } from "lucide-react";

/* ─── Colour helpers ─── */
const ROLE_COLORS = {
  admin:   { bg: "rgba(99,102,241,0.12)",  text: "#6366f1", dot: "#6366f1" },
  teacher: { bg: "rgba(14,165,233,0.12)",  text: "#0ea5e9", dot: "#0ea5e9" },
  student: { bg: "rgba(16,185,129,0.12)",  text: "#10b981", dot: "#10b981" },
  default: { bg: "rgba(100,116,139,0.12)", text: "#64748b", dot: "#64748b" },
};

const AVATAR_COLORS = [
  "#6366f1","#0ea5e9","#10b981","#f59e0b","#f43f5e","#8b5cf6","#14b8a6","#ec4899",
];

function getAvatarColor(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function RoleBadge({ name }) {
  const key = (name || "").toLowerCase();
  const c = ROLE_COLORS[key] || ROLE_COLORS.default;
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

export default function ShowUserDetailModal({ user, onClose }) {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (user) {
      setUserData(user);
    }
  }, [user]);

  if (!userData) return null;

  const color = getAvatarColor(userData.fullName);
  const initials = (userData.fullName || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const details = [
    { label: "Username", value: userData.userName, icon: <UserIcon size={16} /> },
    { label: "Email", value: userData.email, icon: <Mail size={16} /> },
    { label: "Phone Number", value: userData.number, icon: <Phone size={16} /> },
    { label: "Birthday", value: userData.birthday ? new Date(userData.birthday).toLocaleDateString("vi-VN") : "-", icon: <Calendar size={16} /> },
    { label: "Address", value: userData.address, icon: <MapPin size={16} /> },
    { label: "Created At", value: new Date(userData.createdAt).toLocaleDateString(), icon: <Clock size={16} /> },
  ];

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
            maxWidth: "500px",
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
          {/* Header Background */}
          <div style={{ height: "100px", background: `linear-gradient(135deg, ${color}cc, ${color})` }} />

          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              background: "rgba(255,255,255,0.2)",
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
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.3)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
          >
            <X size={18} />
          </button>

          {/* Avatar & Title */}
          <div style={{ padding: "0 24px", position: "relative", marginTop: "-40px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              >
                <div
                  style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${color}cc, ${color})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: "24px",
                    fontWeight: 700,
                  }}
                >
                  {initials}
                </div>
              </div>
              <div style={{ marginBottom: "10px" }}>
                <RoleBadge name={userData.roleId?.name || userData.roleId} />
              </div>
            </div>

            <div style={{ marginTop: "16px", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                {userData.fullName}
              </h2>
              <p style={{ fontSize: "14px", color: "#64748b", margin: "4px 0 0 0" }}>User Details</p>
            </div>

            {/* Details Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px", marginBottom: "32px" }}>
              {details.map((field, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "12px", background: "#f8fafc", borderRadius: "12px" }}>
                  <div style={{ color: "#94a3b8", marginTop: "2px" }}>{field.icon}</div>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      {field.label}
                    </div>
                    <div style={{ fontSize: "14px", color: "#0f172a", fontWeight: 500, marginTop: "4px", wordBreak: "break-word" }}>
                      {field.value || "—"}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Action */}
            <div style={{ borderTop: "1px solid #f1f5f9", padding: "16px 0 24px 0", display: "flex", justifyContent: "flex-end" }}>
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
