import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Calendar, ChevronLeft, ChevronRight, BookOpen, MapPin } from "lucide-react";

const slotStartTimes = [
  "08:00", "09:45", "13:00", "14:45", "18:00", "19:45",
];
const slotEndTimes = [
  "09:30", "11:15", "14:30", "16:15", "19:30", "21:15",
];
const slotLabels = ["Slot 1", "Slot 2", "Slot 3", "Slot 4", "Slot 5", "Slot 6"];
const daysOfWeek = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const slotColors = [
  { bg: "linear-gradient(135deg,#dbeafe,#bfdbfe)", border: "#93c5fd", text: "#1d4ed8", label: "#3b82f6" },
  { bg: "linear-gradient(135deg,#d1fae5,#a7f3d0)", border: "#6ee7b7", text: "#065f46", label: "#10b981" },
  { bg: "linear-gradient(135deg,#fce7f3,#fbcfe8)", border: "#f9a8d4", text: "#9d174d", label: "#ec4899" },
  { bg: "linear-gradient(135deg,#fef3c7,#fde68a)", border: "#fcd34d", text: "#92400e", label: "#f59e0b" },
  { bg: "linear-gradient(135deg,#ede9fe,#ddd6fe)", border: "#c4b5fd", text: "#4c1d95", label: "#8b5cf6" },
  { bg: "linear-gradient(135deg,#ffedd5,#fed7aa)", border: "#fdba74", text: "#7c2d12", label: "#f97316" },
];

export default function StudentSchedule() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [weeks, setWeeks] = useState([]);
  const [selectedWeekIdx, setSelectedWeekIdx] = useState(0);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const generateWeeksOfYear = (targetYear) => {
    const startDate = new Date(`${targetYear}-01-01`);
    while (startDate.getDay() !== 1) startDate.setDate(startDate.getDate() + 1);
    const result = [];
    for (let i = 0; i < 53; i++) {
      const weekStart = new Date(startDate);
      weekStart.setDate(startDate.getDate() + i * 7);
      if (weekStart.getFullYear() > targetYear && i > 0) break;
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      result.push({ start: new Date(weekStart), end: new Date(weekEnd) });
    }
    return result;
  };

  const formatDate = (d) => {
    if (!(d instanceof Date) || isNaN(d)) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const getDateByOffset = (start, offset) => {
    if (!start) return null;
    const d = new Date(start);
    d.setDate(d.getDate() + offset);
    return d;
  };

  const getScheduleItem = (slotId, dateStr) => {
    if (!Array.isArray(schedule)) return null;
    const expectedStart = slotStartTimes[parseInt(slotId, 10)];
    if (!expectedStart) return null;
    return schedule.find(item => {
      const itemDate = item.date ? item.date.split("T")[0] : "";
      return item.slot && item.slot.from === expectedStart && itemDate === dateStr;
    });
  };

  useEffect(() => {
    const newWeeks = generateWeeksOfYear(year);
    setWeeks(newWeeks);
    const now = new Date();
    const idx = newWeeks.findIndex(w => now >= w.start && now <= w.end);
    setSelectedWeekIdx(idx >= 0 ? idx : 0);
  }, [year]);

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) { setLoading(false); setError("No token found."); return; }
      try {
        const studentId = jwtDecode(token).id;
        const response = await axios.get(
          `http://localhost:9999/api/student/${studentId}/schedule`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data && Array.isArray(response.data.data)) {
          setSchedule(response.data.data);
        } else {
          setError("Invalid schedule data format.");
          setSchedule([]);
        }
      } catch (err) {
        setError(`Failed to fetch schedule: ${err.response?.data?.message || err.message}`);
        setSchedule([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  const selectedWeek = weeks[selectedWeekIdx] || null;

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "300px", flexDirection: "column", gap: "16px" }}>
      <div style={{ width: "44px", height: "44px", border: "3px solid rgba(16,185,129,0.2)", borderTop: "3px solid #10b981", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
      <span style={{ color: "#64748b", fontSize: "14px" }}>Loading schedule...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "12px", padding: "24px", textAlign: "center", color: "#ef4444" }}>
      {error}
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
          <div style={{
            width: "36px", height: "36px",
            background: "linear-gradient(135deg, #10b981, #059669)",
            borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Calendar size={18} color="#fff" />
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: 0 }}>My Schedule</h1>
        </div>
        <p style={{ color: "#64748b", fontSize: "13px", margin: 0, marginLeft: "48px" }}>
          Weekly class timetable
        </p>
      </div>

      {/* Controls */}
      <div style={{
        background: "#fff", borderRadius: "14px", padding: "16px 20px", marginBottom: "20px",
        display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.05)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Year</span>
          <select
            value={year}
            onChange={(e) => setYear(+e.target.value)}
            style={{
              border: "1px solid #e2e8f0", borderRadius: "8px",
              padding: "6px 10px", fontSize: "13px", color: "#0f172a",
              background: "#f8fafc", cursor: "pointer", outline: "none",
            }}
          >
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Week</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button
              onClick={() => setSelectedWeekIdx(i => Math.max(0, i - 1))}
              disabled={selectedWeekIdx === 0}
              style={{
                border: "1px solid #e2e8f0", borderRadius: "6px",
                padding: "4px 8px", cursor: "pointer",
                background: selectedWeekIdx === 0 ? "#f1f5f9" : "#fff",
                color: selectedWeekIdx === 0 ? "#cbd5e1" : "#475569",
              }}
            >
              <ChevronLeft size={14} />
            </button>
            <select
              value={selectedWeekIdx}
              onChange={(e) => setSelectedWeekIdx(+e.target.value)}
              style={{
                border: "1px solid #e2e8f0", borderRadius: "8px",
                padding: "6px 10px", fontSize: "12px", color: "#0f172a",
                background: "#f8fafc", cursor: "pointer", outline: "none", maxWidth: "280px",
              }}
            >
              {weeks.map((week, i) => (
                <option key={i} value={i}>
                  {week.start.toLocaleDateString("en-GB")} → {week.end.toLocaleDateString("en-GB")}
                </option>
              ))}
            </select>
            <button
              onClick={() => setSelectedWeekIdx(i => Math.min(weeks.length - 1, i + 1))}
              disabled={selectedWeekIdx === weeks.length - 1}
              style={{
                border: "1px solid #e2e8f0", borderRadius: "6px",
                padding: "4px 8px", cursor: "pointer",
                background: selectedWeekIdx === weeks.length - 1 ? "#f1f5f9" : "#fff",
                color: selectedWeekIdx === weeks.length - 1 ? "#cbd5e1" : "#475569",
              }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Grid */}
      {selectedWeek ? (
        <div style={{
          background: "#fff", borderRadius: "14px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          border: "1px solid rgba(0,0,0,0.05)",
          overflow: "auto",
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
            <thead>
              <tr>
                <th style={{
                  padding: "14px 12px", width: "90px",
                  background: "linear-gradient(135deg,#0c1a2e,#0a2744)",
                  color: "rgba(255,255,255,0.6)", fontSize: "10px",
                  fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase",
                  borderRight: "1px solid rgba(255,255,255,0.06)",
                }}>Slot</th>
                {daysOfWeek.map((day, idx) => {
                  const date = getDateByOffset(selectedWeek.start, idx);
                  const today = new Date();
                  const isToday = date && formatDate(date) === formatDate(today);
                  return (
                    <th key={day} style={{
                      padding: "12px 8px", textAlign: "center",
                      background: isToday
                        ? "linear-gradient(135deg,rgba(16,185,129,0.2),rgba(5,150,105,0.15))"
                        : "linear-gradient(135deg,#0c1a2e,#0a2744)",
                      borderRight: "1px solid rgba(255,255,255,0.06)",
                      borderLeft: isToday ? "2px solid rgba(16,185,129,0.5)" : "none",
                    }}>
                      <div style={{
                        color: isToday ? "#34d399" : "rgba(255,255,255,0.75)",
                        fontSize: "11px", fontWeight: 700, letterSpacing: "0.5px",
                      }}>{day}</div>
                      <div style={{
                        color: isToday ? "#6ee7b7" : "rgba(255,255,255,0.35)",
                        fontSize: "10px", marginTop: "2px",
                      }}>
                        {date ? date.toLocaleDateString("en-GB") : ""}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {slotLabels.map((slotLabel, rowIdx) => (
                <tr key={slotLabel}>
                  <td style={{
                    padding: "10px 12px",
                    background: "#f8fafc",
                    borderRight: "1px solid #e2e8f0",
                    borderTop: "1px solid #e2e8f0",
                    verticalAlign: "middle",
                  }}>
                    <div style={{ fontWeight: 700, fontSize: "11px", color: "#475569" }}>{slotLabel}</div>
                    <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "2px" }}>
                      {slotStartTimes[rowIdx]} - {slotEndTimes[rowIdx]}
                    </div>
                  </td>
                  {daysOfWeek.map((_, colIdx) => {
                    const date = getDateByOffset(selectedWeek.start, colIdx);
                    const dateStr = formatDate(date);
                    const item = getScheduleItem(`${rowIdx}`, dateStr);
                    const color = slotColors[rowIdx];
                    const today = new Date();
                    const isToday = dateStr === formatDate(today);
                    return (
                      <td key={colIdx} style={{
                        padding: "6px",
                        borderTop: "1px solid #e2e8f0",
                        borderRight: "1px solid #e2e8f0",
                        verticalAlign: "top",
                        minWidth: "120px",
                        background: isToday ? "rgba(16,185,129,0.03)" : "transparent",
                      }}>
                        {item ? (
                          <div style={{
                            background: color.bg,
                            border: `1px solid ${color.border}`,
                            borderRadius: "8px",
                            padding: "8px 10px",
                            height: "100%",
                          }}>
                            <div style={{
                              fontSize: "11px", fontWeight: 700, color: color.text,
                              marginBottom: "4px",
                            }}>
                              {item.class?.name}
                            </div>
                            {item.class?.course && (
                              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: color.label, marginBottom: "2px" }}>
                                <BookOpen size={10} /> {item.class.course}
                              </div>
                            )}
                            {item.room?.name && (
                              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: color.text, opacity: 0.7 }}>
                                <MapPin size={10} /> {item.room.name}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{
                            height: "100%", minHeight: "60px",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <span style={{ color: "#e2e8f0", fontSize: "18px" }}>—</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
          No week selected
        </div>
      )}
    </div>
  );
}
