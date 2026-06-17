import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { CheckCircle, XCircle, Clock, BookOpen, BarChart2, AlertTriangle } from "lucide-react";

const STATUS_CONFIG = {
  present: { label: "Có mặt",  icon: <CheckCircle size={13} />, badge: { background: "#d1fae5", color: "#065f46", border: "#6ee7b7" }, dot: "#10b981" },
  late:    { label: "Đi muộn", icon: <Clock size={13} />,        badge: { background: "#fef3c7", color: "#92400e", border: "#fcd34d" }, dot: "#f59e0b" },
  absent:  { label: "Vắng mặt",icon: <XCircle size={13} />,      badge: { background: "#fee2e2", color: "#991b1b", border: "#fca5a5" }, dot: "#ef4444" },
};

const card = {
  background: "#fff",
  borderRadius: "16px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)",
  border: "1px solid rgba(0,0,0,0.05)",
};

const AttendanceHistory = () => {
  const [classes,           setClasses]           = useState([]);
  const [selectedClassId,   setSelectedClassId]   = useState(null);
  const [attendanceData,    setAttendanceData]     = useState(null);
  const [loadingClasses,    setLoadingClasses]     = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  const token     = localStorage.getItem("token");
  const studentId = token ? jwtDecode(token).id : null;

  // ── Lấy danh sách lớp đã đăng ký ─────────────────────────────────────
  const fetchClasses = useCallback(async () => {
    if (!studentId) return;
    try {
      setLoadingClasses(true);
      const res = await axios.get(
        `http://localhost:9999/api/student/${studentId}/my-classes`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success && Array.isArray(res.data.data)) {
        setClasses(res.data.data);
        if (res.data.data.length > 0) setSelectedClassId(res.data.data[0]._id);
      }
    } catch (err) {
      console.error("Error fetching classes:", err);
    } finally {
      setLoadingClasses(false);
    }
  }, [studentId, token]);

  // ── Lấy lịch sử điểm danh theo lớp ──────────────────────────────────
  const fetchAttendance = useCallback(async (classId) => {
    if (!studentId || !classId) return;
    try {
      setLoadingAttendance(true);
      setAttendanceData(null);
      const res = await axios.get(
        `http://localhost:9999/api/student/${studentId}/attendance/class/${classId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) setAttendanceData(res.data.data);
    } catch (err) {
      console.error("Error fetching attendance:", err);
    } finally {
      setLoadingAttendance(false);
    }
  }, [studentId, token]);

  useEffect(() => { fetchClasses(); }, [fetchClasses]);
  useEffect(() => { if (selectedClassId) fetchAttendance(selectedClassId); }, [selectedClassId, fetchAttendance]);

  const rate = parseFloat(attendanceData?.attendanceRate || 0);
  const rateColor = rate >= 80 ? "#10b981" : rate >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "8px 0" }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
          <span style={{ padding: "8px", background: "#dbeafe", borderRadius: "10px", display: "flex" }}>
            <BarChart2 size={22} color="#1d4ed8" />
          </span>
          Lịch Sử Điểm Danh
        </h1>
        <p style={{ color: "#64748b", fontSize: "13px", marginTop: "6px", marginLeft: "52px" }}>
          Xem trạng thái điểm danh của bạn theo từng lớp học.
        </p>
      </div>

      {/* ── Class Picker ── */}
      <div style={{ ...card, padding: "20px", marginBottom: "20px" }}>
        <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
          Chọn lớp học
        </label>
        {loadingClasses ? (
          <div style={{ height: "36px", background: "#f1f5f9", borderRadius: "8px" }} />
        ) : classes.length === 0 ? (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#94a3b8", fontSize: "13px" }}>
            <AlertTriangle size={15} color="#fbbf24" /> Bạn chưa đăng ký lớp nào.
          </div>
        ) : (
          <select
            id="class-picker"
            value={selectedClassId || ""}
            onChange={(e) => setSelectedClassId(e.target.value)}
            style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "13px", background: "#f8fafc", outline: "none", cursor: "pointer" }}
          >
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} — {c.courseName}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* ── Loading ── */}
      {loadingAttendance && (
        <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>Đang tải lịch sử điểm danh...</div>
      )}

      {/* ── Data ── */}
      {!loadingAttendance && attendanceData && (
        <>
          {/* Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "18px" }}>
            {[
              { label: "Tổng buổi",  value: attendanceData.totalSessions, color: "#1d4ed8", bg: "#eff6ff" },
              { label: "Có mặt",     value: attendanceData.present,       color: "#065f46", bg: "#d1fae5" },
              { label: "Đi muộn",    value: attendanceData.late,          color: "#92400e", bg: "#fef3c7" },
              { label: "Vắng mặt",   value: attendanceData.absent,        color: "#991b1b", bg: "#fee2e2" },
            ].map((item) => (
              <div key={item.label} style={{ ...card, padding: "18px", textAlign: "center", background: item.bg }}>
                <div style={{ fontSize: "30px", fontWeight: 800, color: item.color, lineHeight: 1 }}>{item.value}</div>
                <div style={{ fontSize: "11px", color: item.color, marginTop: "6px", fontWeight: 600, opacity: 0.8 }}>{item.label}</div>
              </div>
            ))}
          </div>

          {/* Attendance Rate Bar */}
          <div style={{ ...card, padding: "20px", marginBottom: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>Tỉ lệ điểm danh</span>
              <span style={{ fontSize: "20px", fontWeight: 800, color: rateColor }}>{attendanceData.attendanceRate}%</span>
            </div>
            <div style={{ width: "100%", height: "10px", background: "#f1f5f9", borderRadius: "99px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min(rate, 100)}%`, background: rateColor, borderRadius: "99px", transition: "width 0.6s ease" }} />
            </div>
            {rate < 80 && (
              <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "8px", color: "#f59e0b", fontSize: "12px" }}>
                <AlertTriangle size={12} /> Tỉ lệ dưới 80% — hãy cố gắng tham gia đầy đủ!
              </div>
            )}
          </div>

          {/* Detail Table */}
          {attendanceData.records.length === 0 ? (
            <div style={{ ...card, padding: "60px", textAlign: "center", color: "#94a3b8" }}>
              <BookOpen size={40} style={{ color: "#e2e8f0", marginBottom: "12px" }} />
              <div>Chưa có dữ liệu điểm danh cho lớp này.</div>
            </div>
          ) : (
            <div style={{ ...card, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "#0f172a" }}>Chi tiết từng buổi học</span>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "linear-gradient(135deg, #1e40af, #1d4ed8)", color: "#fff" }}>
                    <th style={{ padding: "11px 16px", textAlign: "left", fontWeight: 600, width: "40px" }}>#</th>
                    <th style={{ padding: "11px 16px", textAlign: "left", fontWeight: 600 }}>Ngày</th>
                    <th style={{ padding: "11px 16px", textAlign: "center", fontWeight: 600 }}>Trạng thái</th>
                    <th style={{ padding: "11px 16px", textAlign: "left", fontWeight: 600 }}>Ghi chú giáo viên</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.records.map((r, idx) => {
                    const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.absent;
                    return (
                      <tr key={r.attendanceId || idx} style={{ borderBottom: "1px solid #f8fafc", background: idx % 2 === 0 ? "#fff" : "#fafafa" }}>
                        <td style={{ padding: "11px 16px", color: "#94a3b8", fontFamily: "monospace" }}>{idx + 1}</td>
                        <td style={{ padding: "11px 16px", fontWeight: 500, color: "#374151" }}>
                          {r.date ? new Date(r.date).toLocaleDateString("vi-VN", { weekday: "short", year: "numeric", month: "2-digit", day: "2-digit" }) : "—"}
                        </td>
                        <td style={{ padding: "11px 16px", textAlign: "center" }}>
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: "5px",
                            padding: "3px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 600,
                            background: cfg.badge.background, color: cfg.badge.color,
                            border: `1px solid ${cfg.badge.border}`,
                          }}>
                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
                            {cfg.icon} {cfg.label}
                          </span>
                        </td>
                        <td style={{ padding: "11px 16px", color: "#64748b", fontStyle: r.note ? "normal" : "italic", fontSize: "12px" }}>
                          {r.note || <span style={{ color: "#cbd5e1" }}>Không có ghi chú</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {!loadingAttendance && !attendanceData && selectedClassId && (
        <div style={{ ...card, padding: "60px", textAlign: "center", color: "#94a3b8" }}>
          <BookOpen size={40} style={{ color: "#e2e8f0", marginBottom: "12px" }} />
          <div>Không có dữ liệu điểm danh.</div>
        </div>
      )}
    </div>
  );
};

export default AttendanceHistory;
