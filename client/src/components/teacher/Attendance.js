import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { CheckCircle, XCircle, Clock, Save, AlertTriangle, RefreshCw, MinusCircle, Plus, X } from "lucide-react";

const STATUS_CONFIG = {
  present: { label: "Present", icon: <CheckCircle size={14} />, color: "#10b981", bg: "#d1fae5", border: "#6ee7b7", activeColor: "#fff", activeBg: "#10b981" },
  late: { label: "Late", icon: <Clock size={14} />, color: "#f59e0b", bg: "#fef3c7", border: "#fcd34d", activeColor: "#fff", activeBg: "#f59e0b" },
  absent: { label: "Absent", icon: <XCircle size={14} />, color: "#ef4444", bg: "#fee2e2", border: "#fca5a5", activeColor: "#fff", activeBg: "#ef4444" },
  not_yet: { label: "Not Yet", icon: <MinusCircle size={14} />, color: "#64748b", bg: "#f1f5f9", border: "#cbd5e1", activeColor: "#fff", activeBg: "#64748b" },
};

const card = {
  background: "#fff",
  borderRadius: "16px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)",
  border: "1px solid rgba(0,0,0,0.05)",
};

const Attendance = ({ classId, teacherId }) => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [records, setRecords] = useState([]);
  const [attendanceId, setAttendanceId] = useState(null);
  const [takenAt, setTakenAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [showAddSession, setShowAddSession] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [newSessionData, setNewSessionData] = useState({ date: "", slotId: "", roomId: "" });

  const token = localStorage.getItem("token");

  // ── Fetch sessions ─────────────────────────────────────────────────────
  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:9999/api/teacher/${teacherId}/classes/${classId}/sessions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setSessions(res.data.data);
        if (res.data.data.length > 0) {
          const today = new Date().toISOString().split("T")[0];
          const todaySession = res.data.data.find((s) => s.date === today);
          setSelectedSession(todaySession || res.data.data[res.data.data.length - 1]);
        }
      }
    } catch (err) {
      console.error("Error fetching sessions:", err);
    } finally {
      setLoading(false);
    }
  }, [classId, teacherId, token]);

  // ── Fetch attendance for selected session ──────────────────────────────
  const fetchAttendance = useCallback(async (sessionId) => {
    if (!sessionId) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:9999/api/teacher/${teacherId}/classes/${classId}/attendance/${sessionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        const { records: apiRecords, attendanceId: aid, takenAt: at } = res.data.data;
        setRecords(apiRecords.map((r) => ({ ...r })));
        setAttendanceId(aid);
        setTakenAt(at);
      }
    } catch (err) {
      console.error("Error fetching attendance:", err);
    } finally {
      setLoading(false);
    }
  }, [classId, teacherId, token]);

  const fetchOptions = useCallback(async () => {
    try {
      const [resSlots, resRooms] = await Promise.all([
        axios.get(`http://localhost:9999/api/teacher/slots`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`http://localhost:9999/api/rooms`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (resSlots.data?.success) setAvailableSlots(resSlots.data.data);
      if (resRooms.data?.success) setAvailableRooms(resRooms.data.data);
      else if (resRooms.data && Array.isArray(resRooms.data)) setAvailableRooms(resRooms.data);
    } catch (e) {
      console.error(e);
    }
  }, [token]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);
  useEffect(() => { if (selectedSession) fetchAttendance(selectedSession.id); }, [selectedSession, fetchAttendance]);
  useEffect(() => { if (showAddSession && availableSlots.length === 0) fetchOptions(); }, [showAddSession, fetchOptions, availableSlots.length]);

  const isSessionLocked = () => {
    if (!selectedSession || !selectedSession.slot || !selectedSession.date) return false;
    const sessionDateTime = new Date(`${selectedSession.date}T${selectedSession.slot.from}`);
    return new Date() < sessionDateTime;
  };
  const sessionLocked = isSessionLocked();

  const handleStatusChange = (studentId, newStatus) => {
    if (sessionLocked) return;
    setRecords((prev) => prev.map((r) => r.studentId.toString() === studentId.toString() ? { ...r, status: newStatus } : r));
  };

  const handleNoteChange = (studentId, note) => {
    if (sessionLocked) return;
    setRecords((prev) => prev.map((r) => r.studentId.toString() === studentId.toString() ? { ...r, note } : r));
  };

  const markAll = (status) => {
    if (sessionLocked) return;
    setRecords((prev) => prev.map((r) => ({ ...r, status })));
  };

  const handleAddSession = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`http://localhost:9999/api/schedule/add`, {
        classId,
        slotId: newSessionData.slotId,
        roomId: newSessionData.roomId,
        date: newSessionData.date
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (res.data?.success) {
        setShowAddSession(false);
        setNewSessionData({ date: "", slotId: "", roomId: "" });
        fetchSessions();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Error adding session");
    }
  };

  const handleSave = async () => {
    if (!selectedSession) return;
    setSaving(true); setSaveSuccess(false);
    try {
      const res = await axios.post(
        `http://localhost:9999/api/teacher/${teacherId}/classes/${classId}/attendance/${selectedSession.id}`,
        { date: selectedSession.date, records: records.map((r) => ({ studentId: r.studentId, status: r.status, note: r.note || "" })) },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      if (res.data.success) {
        setSaveSuccess(true);
        setAttendanceId(res.data.data._id);
        setTakenAt(res.data.data.updatedAt);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Error saving attendance:", err);
      alert("Failed to save attendance. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const stats = records.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, { present: 0, late: 0, absent: 0 });

  if (!loading && sessions.length === 0 && !showAddSession) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
        <AlertTriangle size={40} style={{ color: "#fbbf24", marginBottom: "12px" }} />
        <div style={{ fontWeight: 600, fontSize: "15px", marginBottom: "6px" }}>No sessions available</div>
        <div style={{ fontSize: "13px" }}>Please wait for a schedule to be generated for this class, or add one below.</div>
        <button onClick={() => setShowAddSession(true)} style={{ marginTop: "16px", display: "inline-flex", alignItems: "center", gap: "6px", background: "#0ea5e9", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}>
          <Plus size={16} /> Add Session
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* ── Session Picker ── */}
      <div style={{ ...card, padding: "16px 20px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "260px" }}>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>Select Session</label>
          <select
            id="session-picker"
            value={selectedSession?.id || ""}
            onChange={(e) => setSelectedSession(sessions.find((s) => s.id === e.target.value))}
            style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px", background: "#f8fafc", outline: "none" }}
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                📅 {s.date}  {s.slot ? `| ${s.slot.from} – ${s.slot.to}` : ""}  {s.room ? `| ${s.room.name}` : ""}
              </option>
            ))}
          </select>
        </div>
        {takenAt && (
          <span style={{ fontSize: "11px", color: "#94a3b8", fontStyle: "italic" }}>
            Saved: {new Date(takenAt).toLocaleString("en-GB")}
          </span>
        )}
        <button
          onClick={() => setShowAddSession(!showAddSession)}
          title="Add Session"
          style={{ padding: "8px 12px", borderRadius: "8px", border: "none", background: showAddSession ? "#f1f5f9" : "#0ea5e9", color: showAddSession ? "#475569" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontWeight: 600, fontSize: "13px" }}
        >
          {showAddSession ? <X size={15} /> : <Plus size={15} />}
          {showAddSession ? "Cancel" : "Add Session"}
        </button>
        <button
          onClick={() => fetchSessions()}
          title="Refresh"
          style={{ padding: "8px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", display: "flex", alignItems: "center" }}
        >
          <RefreshCw size={15} color="#64748b" />
        </button>
      </div>

      {/* ── Add Session Form ── */}
      {showAddSession && (
        <div style={{ ...card, padding: "20px", marginBottom: "16px", background: "#f0f9ff", border: "1px solid #bae6fd" }}>
          <h4 style={{ margin: "0 0 12px 0", color: "#0369a1", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Plus size={16} /> Create New Session Slot
          </h4>
          <form onSubmit={handleAddSession} style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: 1, minWidth: "150px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#0c4a6e", marginBottom: "6px" }}>Date</label>
              <input type="date" required value={newSessionData.date} onChange={(e) => setNewSessionData({ ...newSessionData, date: e.target.value })} style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #bae6fd", boxSizing: "border-box" }} />
            </div>
            <div style={{ flex: 1, minWidth: "150px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#0c4a6e", marginBottom: "6px" }}>Slot</label>
              <select required value={newSessionData.slotId} onChange={(e) => setNewSessionData({ ...newSessionData, slotId: e.target.value })} style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #bae6fd", background: "#fff", boxSizing: "border-box" }}>
                <option value="">-- Select Slot --</option>
                {availableSlots.map(s => <option key={s._id} value={s._id}>{s.from} - {s.to}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: "150px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#0c4a6e", marginBottom: "6px" }}>Room</label>
              <select required value={newSessionData.roomId} onChange={(e) => setNewSessionData({ ...newSessionData, roomId: e.target.value })} style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #bae6fd", background: "#fff", boxSizing: "border-box" }}>
                <option value="">-- Select Room --</option>
                {availableRooms.map(r => <option key={r._id} value={r._id}>{r.name} ({r.location})</option>)}
              </select>
            </div>
            <button type="submit" style={{ padding: "9px 20px", borderRadius: "8px", background: "#0284c7", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer", height: "35px" }}>
              Create
            </button>
          </form>
        </div>
      )}

      {/* ── Time Lock Warning ── */}
      {sessionLocked && (
        <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "12px 16px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", fontWeight: 600, fontSize: "14px", border: "1px solid #fecaca" }}>
          <AlertTriangle size={18} />
          Chưa đến thời gian của slot này. Bạn chưa thể điểm danh.
        </div>
      )}

      {/* ── Stats + Quick-mark ── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "16px", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: "10px" }}>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "20px", background: cfg.bg, border: `1px solid ${cfg.border}`, fontSize: "12px", fontWeight: 600, color: cfg.color }}>
              {cfg.icon} {cfg.label}: <strong>{stats[key]}</strong>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ fontSize: "12px", color: "#94a3b8" }}>Quick Mark:</span>
          {Object.entries(STATUS_CONFIG).filter(([k]) => k !== 'not_yet').map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => markAll(key)}
              disabled={sessionLocked}
              style={{ padding: "5px 12px", borderRadius: "8px", border: `1px solid ${cfg.border}`, background: cfg.bg, color: cfg.color, fontSize: "11px", fontWeight: 600, cursor: sessionLocked ? "not-allowed" : "pointer", opacity: sessionLocked ? 0.5 : 1 }}
            >
              Mark all {cfg.label.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ── Attendance Table ── */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>Loading student list...</div>
      ) : (
        <div style={{ ...card, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "linear-gradient(135deg, #1e40af, #1d4ed8)", color: "#fff" }}>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, width: "36px" }}>#</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Student Name</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Email</th>
                <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 600, minWidth: "260px" }}>Status</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Note</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, idx) => {
                const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.absent;
                return (
                  <tr key={r.studentId} style={{ borderBottom: "1px solid #f1f5f9", background: idx % 2 === 0 ? "#fff" : "#fafafa" }}>
                    <td style={{ padding: "12px 16px", color: "#94a3b8", fontFamily: "monospace" }}>{idx + 1}</td>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "#1e3a8a" }}>{r.studentName}</td>
                    <td style={{ padding: "12px 16px", color: "#64748b", fontSize: "12px" }}>{r.email}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                        {Object.entries(STATUS_CONFIG).map(([key, kcfg]) => {
                          const isActive = r.status === key;
                          return (
                            <button
                              key={key}
                              onClick={() => handleStatusChange(r.studentId, key)}
                              disabled={sessionLocked}
                              style={{
                                display: "flex", alignItems: "center", gap: "4px",
                                padding: "5px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 600, cursor: sessionLocked ? "not-allowed" : "pointer",
                                border: `1px solid ${isActive ? kcfg.activeBg : kcfg.border}`,
                                background: isActive ? kcfg.activeBg : kcfg.bg,
                                color: isActive ? kcfg.activeColor : kcfg.color,
                                transform: isActive ? "scale(1.05)" : "scale(1)",
                                boxShadow: isActive ? `0 2px 8px ${kcfg.activeBg}55` : "none",
                                transition: "all 0.15s ease",
                                opacity: sessionLocked ? 0.6 : 1
                              }}
                            >
                              {kcfg.icon} {kcfg.label}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <input
                        type="text"
                        placeholder="Add a note..."
                        value={r.note || ""}
                        disabled={sessionLocked}
                        onChange={(e) => handleNoteChange(r.studentId, e.target.value)}
                        style={{ width: "100%", padding: "6px 10px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "12px", background: sessionLocked ? "#f1f5f9" : "#f8fafc", outline: "none", cursor: sessionLocked ? "not-allowed" : "text" }}
                      />
                    </td>
                  </tr>
                );
              })}
              {records.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>No students in this class.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Save Button ── */}
      {records.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "12px", marginTop: "20px" }}>
          {saveSuccess && (
            <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#10b981", fontSize: "13px", fontWeight: 500 }}>
              <CheckCircle size={15} /> Attendance saved successfully!
            </span>
          )}
          <button
            id="save-attendance-btn"
            onClick={handleSave}
            disabled={saving || !selectedSession || sessionLocked}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "10px 24px", borderRadius: "10px",
              background: (saving || sessionLocked) ? "#93c5fd" : "linear-gradient(135deg, #1d4ed8, #1e40af)",
              color: "#fff", fontWeight: 600, fontSize: "14px",
              border: "none", cursor: (saving || sessionLocked) ? "not-allowed" : "pointer",
              boxShadow: (saving || sessionLocked) ? "none" : "0 4px 14px rgba(29,78,216,0.35)",
              transition: "all 0.2s ease",
            }}
          >
            <Save size={16} />
            {saving ? "Saving..." : attendanceId ? "Update Attendance" : "Save Attendance"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Attendance;
