import { useEffect, useState } from "react";
import axios from "axios";
import {
  Plus,
  Search,
  Edit2,
  Eye,
  X,
  Users,
  ChevronDown,
  UserCheck,
  FilterX,
} from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import AddUserModal from "../../components/admin/AddUserModal";
import UpdateUserModal from "../../components/admin/UpdateUserModal";
import ShowUserDetailModal from "../../components/admin/ShowUserDetailModal";

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
        padding: "3px 10px",
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

function Avatar({ name }) {
  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const color = getAvatarColor(name);
  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${color}cc, ${color})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize: 13,
        flexShrink: 0,
        boxShadow: `0 0 0 2px ${color}33`,
      }}
    >
      {initials}
    </div>
  );
}

const HEADERS = ["User", "Username", "Email", "Phone", "Role", "Date of Birth", "Actions"];

export default function UserManagement() {
  const [users, setUsers]       = useState([]);
  const [roles, setRoles]       = useState([]);
  const [search, setSearch]     = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [showAdd, setShowAdd]       = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [hoverRow, setHoverRow]     = useState(null);

  /* ── Fetch ── */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const cfg   = { headers: { Authorization: `Bearer ${token}` } };
    axios.get("http://localhost:9999/api/users", cfg).then((r) => setUsers(r.data.data || []));
    axios.get("http://localhost:9999/api/roles").then((r) => setRoles(r.data.data || []));
  }, []);

  const fetchUserById = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:9999/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data;
    } catch { return null; }
  };

  /* ── Filter ── */
  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      u.fullName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.userName?.toLowerCase().includes(q);
    const matchRole = roleFilter === "all" || u.roleId?.id === roleFilter;
    return matchSearch && matchRole;
  });

  const hasFilter = search !== "" || roleFilter !== "all";

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
    padding: "9px 32px 9px 12px",
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
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
              }}
            >
              <Users size={18} />
            </div>
            <div>
              <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                User Management
              </h1>
              <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>
                {users.length} total users
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAdd(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "9px 18px",
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(99,102,241,0.35)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 6px 18px rgba(99,102,241,0.45)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(99,102,241,0.35)";
            }}
          >
            <Plus size={16} />
            Add User
          </button>
        </div>

        {/* ── Filter Bar ── */}
        <div style={{ ...card, padding: "18px 20px", marginBottom: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 220px auto", gap: "12px", alignItems: "end" }}>

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
                  placeholder="Name, email or username…"
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.border = "1px solid #6366f1"; e.target.style.background = "#fff"; }}
                  onBlur={(e) => { e.target.style.border = "1px solid #e2e8f0"; e.target.style.background = "#f8fafc"; }}
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Role
              </label>
              <div style={{ position: "relative" }}>
                <UserCheck size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  style={{ ...selectStyle, paddingLeft: "36px" }}
                >
                  <option value="all">All Roles</option>
                  {roles.map((r) => (
                    <option key={r._id} value={r.id}>{r.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
              </div>
            </div>

            {/* Clear */}
            <button
              onClick={() => { setSearch(""); setRoleFilter("all"); }}
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
              Showing <strong style={{ color: "#0f172a" }}>{filtered.length}</strong> of {users.length} users
            </div>
          )}
        </div>

        {/* ── Table ── */}
        <div style={{ ...card, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "750px" }}>
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
                {filtered.map((u) => (
                  <tr
                    key={u._id}
                    onMouseEnter={() => setHoverRow(u._id)}
                    onMouseLeave={() => setHoverRow(null)}
                    style={{
                      borderBottom: "1px solid #f8fafc",
                      background: hoverRow === u._id ? "#fafbff" : "#fff",
                      transition: "background 0.15s",
                    }}
                  >
                    {/* User (avatar + name) */}
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <Avatar name={u.fullName} />
                        <span style={{ fontSize: "14px", fontWeight: 600, color: "#0f172a" }}>
                          {u.fullName}
                        </span>
                      </div>
                    </td>

                    {/* Username */}
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ fontSize: "13px", color: "#475569", fontFamily: "monospace", background: "#f1f5f9", padding: "2px 7px", borderRadius: "5px" }}>
                        {u.userName}
                      </span>
                    </td>

                    {/* Email */}
                    <td style={{ padding: "14px 16px", fontSize: "13px", color: "#64748b", maxWidth: "200px" }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                        {u.email}
                      </span>
                    </td>

                    {/* Phone */}
                    <td style={{ padding: "14px 16px", fontSize: "13px", color: "#64748b", whiteSpace: "nowrap" }}>
                      {u.number || <span style={{ color: "#cbd5e1" }}>—</span>}
                    </td>

                    {/* Role */}
                    <td style={{ padding: "14px 16px" }}>
                      <RoleBadge name={u.roleId?.name} />
                    </td>

                    {/* DOB */}
                    <td style={{ padding: "14px 16px", fontSize: "13px", color: "#64748b", whiteSpace: "nowrap" }}>
                      {u.birthday
                        ? new Date(u.birthday).toLocaleDateString("vi-VN")
                        : <span style={{ color: "#cbd5e1" }}>—</span>}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {/* Edit */}
                        <button
                          title="Edit user"
                          onClick={async () => {
                            const fresh = await fetchUserById(u._id);
                            if (fresh) { setSelectedUser(fresh); setShowUpdate(true); }
                          }}
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
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(99,102,241,0.1)";
                            e.currentTarget.style.color = "#6366f1";
                            e.currentTarget.style.border = "1px solid rgba(99,102,241,0.3)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#fff";
                            e.currentTarget.style.color = "#64748b";
                            e.currentTarget.style.border = "1px solid #e2e8f0";
                          }}
                        >
                          <Edit2 size={14} />
                        </button>

                        {/* View */}
                        <button
                          title="View details"
                          onClick={async () => {
                            const fresh = await fetchUserById(u._id);
                            if (fresh) { setSelectedUser(fresh); setShowDetail(true); }
                          }}
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
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(14,165,233,0.1)";
                            e.currentTarget.style.color = "#0ea5e9";
                            e.currentTarget.style.border = "1px solid rgba(14,165,233,0.3)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#fff";
                            e.currentTarget.style.color = "#64748b";
                            e.currentTarget.style.border = "1px solid #e2e8f0";
                          }}
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Empty state */}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: "56px 0", textAlign: "center" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", color: "#94a3b8" }}>
                        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Users size={22} style={{ color: "#cbd5e1" }} />
                        </div>
                        <span style={{ fontSize: "14px", fontWeight: 500 }}>No users found</span>
                        {hasFilter && (
                          <button
                            onClick={() => { setSearch(""); setRoleFilter("all"); }}
                            style={{ fontSize: "12px", color: "#6366f1", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
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
                {filtered.length} user{filtered.length !== 1 ? "s" : ""} shown
              </span>
              <div style={{ display: "flex", gap: "4px" }}>
                {roles.map((r) => {
                  const count = filtered.filter((u) => u.roleId?.name?.toLowerCase() === r.name?.toLowerCase()).length;
                  const c = ROLE_COLORS[r.name?.toLowerCase()] || ROLE_COLORS.default;
                  return count > 0 ? (
                    <span
                      key={r._id}
                      style={{
                        fontSize: "11px",
                        padding: "2px 8px",
                        borderRadius: "20px",
                        background: c.bg,
                        color: c.text,
                        fontWeight: 600,
                      }}
                    >
                      {count} {r.name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      {showAdd && (
        <AddUserModal
          onClose={() => setShowAdd(false)}
          onCreate={(u) => { setUsers((prev) => [...prev, u]); setShowAdd(false); }}
        />
      )}
      {showUpdate && selectedUser && (
        <UpdateUserModal
          user={selectedUser}
          onClose={() => { setSelectedUser(null); setShowUpdate(false); }}
          onUpdate={(upd) => { setUsers((p) => p.map((x) => (x._id === upd._id ? upd : x))); setShowUpdate(false); }}
        />
      )}
      {showDetail && selectedUser && (
        <ShowUserDetailModal
          user={selectedUser}
          onClose={() => { setSelectedUser(null); setShowDetail(false); }}
        />
      )}
    </AdminLayout>
  );
}
