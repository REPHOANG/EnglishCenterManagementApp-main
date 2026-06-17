import { useNavigate, useLocation } from "react-router-dom";
import {
  Users,
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Building,
  Trophy,
  ChevronRight,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const userName = token ? jwtDecode(token).userName : "Admin";

  const items = [
    {
      text: "Dashboard",
      link: "/admin/dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    { icon: <Users size={18} />, text: "Manage Users", link: "/admin/users" },
    {
      icon: <BookOpen size={18} />,
      text: "Manage Courses",
      link: "/admin/courses",
    },
    {
      icon: <GraduationCap size={18} />,
      text: "Manage Classes",
      link: "/admin/classes",
    },
    {
      icon: <Building size={18} />,
      text: "Manage Rooms",
      link: "/admin/rooms",
    },
    {
      icon: <Trophy size={18} />,
      text: "Grades Overview",
      link: "/admin/grades",
    },
  ];

  return (
    <div
      style={{
        width: "240px",
        height: "100vh",
        background: "linear-gradient(180deg, #0c1a2e 0%, #0a2744 55%, #0d3461 100%)",
        display: "flex",
        flexDirection: "column",
        boxShadow: "4px 0 24px rgba(0,0,0,0.3)",
        flexShrink: 0,
      }}
    >
      {/* Logo / Brand */}
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
            }}
          >
            🏫
          </div>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: "16px", letterSpacing: "0.3px" }}>
            EduCenter
          </span>
        </div>
        <span
          style={{
            color: "rgba(255,255,255,0.35)",
            fontSize: "11px",
            letterSpacing: "1px",
            textTransform: "uppercase",
            marginLeft: "42px",
          }}
        >
          Admin Portal
        </span>
      </div>

      {/* Avatar */}
      <div
        style={{
          padding: "20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            background: "linear-gradient(135deg, #6366f1, #818cf8)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 700,
            fontSize: "16px",
            flexShrink: 0,
            boxShadow: "0 0 0 2px rgba(99,102,241,0.4)",
          }}
        >
          {userName?.charAt(0)?.toUpperCase() || "A"}
        </div>
        <div style={{ overflow: "hidden" }}>
          <div
            style={{
              color: "#fff",
              fontSize: "13px",
              fontWeight: 600,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {userName}
          </div>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>Administrator</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: "4px" }}>
        <div
          style={{
            color: "rgba(255,255,255,0.3)",
            fontSize: "10px",
            letterSpacing: "1.2px",
            textTransform: "uppercase",
            padding: "0 8px",
            marginBottom: "8px",
          }}
        >
          Navigation
        </div>
        {items.map((item, index) => {
          const isActive = location.pathname.startsWith(item.link);
          return (
            <div
              key={index}
              onClick={() => navigate(item.link)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 12px",
                borderRadius: "10px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                background: isActive
                  ? "linear-gradient(135deg, rgba(99,102,241,0.35), rgba(79,70,229,0.2))"
                  : "transparent",
                border: isActive
                  ? "1px solid rgba(99,102,241,0.4)"
                  : "1px solid transparent",
                color: isActive ? "#a5b4fc" : "rgba(255,255,255,0.6)",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.color = "#fff";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                }
              }}
            >
              <span style={{ color: isActive ? "#818cf8" : "rgba(255,255,255,0.45)" }}>
                {item.icon}
              </span>
              <span style={{ fontSize: "13px", fontWeight: isActive ? 600 : 400, flex: 1 }}>
                {item.text}
              </span>
              {isActive && <ChevronRight size={14} style={{ color: "#818cf8" }} />}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: "16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ color: "rgba(255,255,255,0.2)", fontSize: "10px", textAlign: "center" }}>
          © 2025 EduCenter
        </div>
      </div>
    </div>
  );
}
