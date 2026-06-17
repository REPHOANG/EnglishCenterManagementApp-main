import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Mail, Lock, Phone, Calendar, MapPin, Shield } from "lucide-react";
import axios from "axios";

export default function UpdateUserModal({ onClose, user, onUpdate }) {
  /* ---------------- State ---------------- */
  const [form, setForm] = useState({
    fullName: "",
    userName: "",
    email: "",
    password: "",
    number: "",
    birthday: "",
    address: "",
    roleId: "",
  });
  const [roles, setRoles] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ---------------- Load roles ---------------- */
  useEffect(() => {
    axios
      .get("http://localhost:9999/api/roles")
      .then((res) => setRoles(res.data.data));
  }, []);

  /* ---------------- Sync user → form ---------------- */
  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || "",
        userName: user.userName || "",
        email: user.email || "",
        password: "",
        number: user.number || "",
        birthday: user.birthday ? user.birthday.slice(0, 10) : "",
        address: user.address || "",
        roleId: typeof user.roleId === "object" ? user.roleId.id : user.roleId,
      });
    }
  }, [user]);

  /* ---------------- Validate ---------------- */
  const validate = () => {
    const newErrors = {};
    let valid = true;

    if (!form.fullName.trim()) { newErrors.fullName = "Full name is required"; valid = false; }
    if (!form.userName.trim()) { newErrors.userName = "Username is required"; valid = false; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim() || !emailRegex.test(form.email)) { newErrors.email = "Valid email is required"; valid = false; }
    if (!form.number.trim()) { newErrors.number = "Phone number is required"; valid = false; }
    if (!form.birthday.trim()) { newErrors.birthday = "Birthday is required"; valid = false; }
    if (!form.address.trim()) { newErrors.address = "Address is required"; valid = false; }
    if (!form.roleId) { newErrors.roleId = "Role is required"; valid = false; }

    setErrors(newErrors);
    return valid;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  /* ---------------- Submit ---------------- */
  const handleUpdate = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    const payload = { ...form };
    if (!payload.password) delete payload.password; // giữ mật khẩu cũ

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:9999/api/users/${user._id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 200) {
        onUpdate(res.data.data);
        // onClose is called by the parent through onUpdate usually, but we also do it here if needed
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = (hasError) => ({
    width: "100%",
    padding: "10px 14px 10px 40px",
    border: `1px solid ${hasError ? "#ef4444" : "#e2e8f0"}`,
    borderRadius: "10px",
    fontSize: "14px",
    color: "#0f172a",
    background: "#f8fafc",
    outline: "none",
    transition: "border 0.2s, background 0.2s",
  });

  const selectStyle = (hasError) => ({
    width: "100%",
    padding: "10px 14px 10px 40px",
    border: `1px solid ${hasError ? "#ef4444" : "#e2e8f0"}`,
    borderRadius: "10px",
    fontSize: "14px",
    color: "#0f172a",
    background: "#f8fafc",
    outline: "none",
    appearance: "none",
    transition: "border 0.2s, background 0.2s",
  });

  const iconStyle = { position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" };

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
            maxWidth: "600px",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            display: "flex",
            flexDirection: "column",
            maxHeight: "90vh",
          }}
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Header */}
          <div style={{ padding: "24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Update User</h2>
              <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0 0" }}>Modify user information</p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "#f1f5f9",
                border: "none",
                color: "#64748b",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "background 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#e2e8f0"; e.currentTarget.style.color = "#0f172a"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#64748b"; }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Form Content */}
          <div style={{ padding: "24px", overflowY: "auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              {/* Full Name */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Full Name</label>
                <div style={{ position: "relative" }}>
                  <User size={16} style={iconStyle} />
                  <input
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    style={inputStyle(errors.fullName)}
                    placeholder="e.g. John Doe"
                    onFocus={(e) => { e.target.style.border = "1px solid #6366f1"; e.target.style.background = "#fff"; }}
                    onBlur={(e) => { e.target.style.border = `1px solid ${errors.fullName ? '#ef4444' : '#e2e8f0'}`; e.target.style.background = "#f8fafc"; }}
                  />
                </div>
                {errors.fullName && <span style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px", display: "block" }}>{errors.fullName}</span>}
              </div>

              {/* Username */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Username</label>
                <div style={{ position: "relative" }}>
                  <User size={16} style={iconStyle} />
                  <input
                    name="userName"
                    value={form.userName}
                    onChange={handleChange}
                    style={inputStyle(errors.userName)}
                    placeholder="e.g. johndoe123"
                    onFocus={(e) => { e.target.style.border = "1px solid #6366f1"; e.target.style.background = "#fff"; }}
                    onBlur={(e) => { e.target.style.border = `1px solid ${errors.userName ? '#ef4444' : '#e2e8f0'}`; e.target.style.background = "#f8fafc"; }}
                  />
                </div>
                {errors.userName && <span style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px", display: "block" }}>{errors.userName}</span>}
              </div>

              {/* Email */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Email Address</label>
                <div style={{ position: "relative" }}>
                  <Mail size={16} style={iconStyle} />
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    style={inputStyle(errors.email)}
                    placeholder="john@example.com"
                    onFocus={(e) => { e.target.style.border = "1px solid #6366f1"; e.target.style.background = "#fff"; }}
                    onBlur={(e) => { e.target.style.border = `1px solid ${errors.email ? '#ef4444' : '#e2e8f0'}`; e.target.style.background = "#f8fafc"; }}
                  />
                </div>
                {errors.email && <span style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px", display: "block" }}>{errors.email}</span>}
              </div>

              {/* Password */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
                  Password <span style={{ color: "#94a3b8", fontWeight: 400, fontSize: "12px" }}>(Leave blank to keep current)</span>
                </label>
                <div style={{ position: "relative" }}>
                  <Lock size={16} style={iconStyle} />
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    style={inputStyle(errors.password)}
                    placeholder="Enter new password"
                    onFocus={(e) => { e.target.style.border = "1px solid #6366f1"; e.target.style.background = "#fff"; }}
                    onBlur={(e) => { e.target.style.border = `1px solid ${errors.password ? '#ef4444' : '#e2e8f0'}`; e.target.style.background = "#f8fafc"; }}
                  />
                </div>
                {errors.password && <span style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px", display: "block" }}>{errors.password}</span>}
              </div>

              {/* Phone Number */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Phone Number</label>
                <div style={{ position: "relative" }}>
                  <Phone size={16} style={iconStyle} />
                  <input
                    name="number"
                    value={form.number}
                    onChange={handleChange}
                    style={inputStyle(errors.number)}
                    placeholder="e.g. 0912345678"
                    onFocus={(e) => { e.target.style.border = "1px solid #6366f1"; e.target.style.background = "#fff"; }}
                    onBlur={(e) => { e.target.style.border = `1px solid ${errors.number ? '#ef4444' : '#e2e8f0'}`; e.target.style.background = "#f8fafc"; }}
                  />
                </div>
                {errors.number && <span style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px", display: "block" }}>{errors.number}</span>}
              </div>

              {/* Birthday */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Birthday</label>
                <div style={{ position: "relative" }}>
                  <Calendar size={16} style={iconStyle} />
                  <input
                    name="birthday"
                    type="date"
                    value={form.birthday}
                    onChange={handleChange}
                    style={inputStyle(errors.birthday)}
                    onFocus={(e) => { e.target.style.border = "1px solid #6366f1"; e.target.style.background = "#fff"; }}
                    onBlur={(e) => { e.target.style.border = `1px solid ${errors.birthday ? '#ef4444' : '#e2e8f0'}`; e.target.style.background = "#f8fafc"; }}
                  />
                </div>
                {errors.birthday && <span style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px", display: "block" }}>{errors.birthday}</span>}
              </div>

              {/* Address */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Address</label>
                <div style={{ position: "relative" }}>
                  <MapPin size={16} style={iconStyle} />
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    style={inputStyle(errors.address)}
                    placeholder="Full address"
                    onFocus={(e) => { e.target.style.border = "1px solid #6366f1"; e.target.style.background = "#fff"; }}
                    onBlur={(e) => { e.target.style.border = `1px solid ${errors.address ? '#ef4444' : '#e2e8f0'}`; e.target.style.background = "#f8fafc"; }}
                  />
                </div>
                {errors.address && <span style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px", display: "block" }}>{errors.address}</span>}
              </div>

              {/* Role */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Role</label>
                <div style={{ position: "relative" }}>
                  <Shield size={16} style={iconStyle} />
                  <select
                    name="roleId"
                    value={form.roleId}
                    onChange={handleChange}
                    style={selectStyle(errors.roleId)}
                    onFocus={(e) => { e.target.style.border = "1px solid #6366f1"; e.target.style.background = "#fff"; }}
                    onBlur={(e) => { e.target.style.border = `1px solid ${errors.roleId ? '#ef4444' : '#e2e8f0'}`; e.target.style.background = "#f8fafc"; }}
                  >
                    <option value="" disabled>Select a role...</option>
                    {roles.map((r) => (
                      <option key={r._id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
                {errors.roleId && <span style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px", display: "block" }}>{errors.roleId}</span>}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{ padding: "20px 24px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: "12px", background: "#fafafa" }}>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: "10px 20px",
                background: "#fff",
                color: "#64748b",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { if(!isSubmitting) { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#0f172a"; } }}
              onMouseLeave={(e) => { if(!isSubmitting) { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#64748b"; } }}
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={isSubmitting}
              style={{
                padding: "10px 24px",
                background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
                transition: "all 0.2s",
                opacity: isSubmitting ? 0.7 : 1,
              }}
              onMouseEnter={(e) => { if(!isSubmitting) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(99,102,241,0.4)"; } }}
              onMouseLeave={(e) => { if(!isSubmitting) { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(99,102,241,0.3)"; } }}
            >
              {isSubmitting ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
