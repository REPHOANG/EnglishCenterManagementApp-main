import React, { useState } from "react";
import { Menu, Bell, LogOut, User, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function Navbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  const token = localStorage.getItem("token");
  const userName = token ? jwtDecode(token).userName : "Admin";
  const initial = userName?.charAt(0)?.toUpperCase() || "A";

  return (
    <div
      style={{
        width: "100%",
        background: "linear-gradient(90deg, #0c1a2e 0%, #0a2744 100%)",
        padding: "0 24px",
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 16px rgba(0,0,0,0.4)",
        zIndex: 100,
        flexShrink: 0,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Left */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button
          onClick={onToggleSidebar}
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            padding: "6px 8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            color: "rgba(255,255,255,0.7)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(99,102,241,0.25)";
            e.currentTarget.style.color = "#a5b4fc";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.06)";
            e.currentTarget.style.color = "rgba(255,255,255,0.7)";
          }}
        >
          <Menu size={18} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              color: "#fff",
              fontSize: "15px",
              fontWeight: 600,
              letterSpacing: "0.2px",
            }}
          >
            English Center
          </span>
          <span
            style={{
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              color: "#fff",
              fontSize: "10px",
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: "20px",
              letterSpacing: "0.5px",
            }}
          >
            ADMIN
          </span>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Notification Bell */}
        <button
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            padding: "6px 8px",
            cursor: "pointer",
            color: "rgba(255,255,255,0.6)",
            display: "flex",
            alignItems: "center",
            position: "relative",
          }}
        >
          <Bell size={17} />
          <span
            style={{
              position: "absolute",
              top: "4px",
              right: "4px",
              width: "7px",
              height: "7px",
              background: "#f59e0b",
              borderRadius: "50%",
              border: "1.5px solid #0c1a2e",
            }}
          />
        </button>

        {/* User dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowDropdown((p) => !p)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "10px",
              padding: "5px 12px 5px 6px",
              cursor: "pointer",
              color: "#fff",
              transition: "all 0.2s",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                background: "linear-gradient(135deg, #6366f1, #818cf8)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: 700,
                color: "#fff",
              }}
            >
              {initial}
            </div>
            <span style={{ fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.85)" }}>
              {userName}
            </span>
            <ChevronDown size={14} style={{ color: "rgba(255,255,255,0.4)", marginLeft: "2px" }} />
          </button>

          {showDropdown && (
            <div
              style={{
                position: "absolute",
                top: "44px",
                right: 0,
                background: "#0c2040",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                minWidth: "180px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                overflow: "hidden",
                zIndex: 999,
              }}
            >
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div style={{ color: "#fff", fontSize: "13px", fontWeight: 600 }}>{userName}</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>Administrator</div>
              </div>
              <div style={{ padding: "6px" }}>
                <button
                  onClick={() => setShowDropdown(false)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    background: "transparent",
                    border: "none",
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "13px",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                  }}
                >
                  <User size={14} /> Profile
                </button>
                <button
                  onClick={handleLogout}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    background: "transparent",
                    border: "none",
                    color: "#f87171",
                    fontSize: "13px",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(248,113,113,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
