import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { RefreshCw, Calendar, Clock, MapPin, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";

/* ─── Shared style tokens ─────────────────────────────── */
const card = {
  background: "#fff",
  borderRadius: "16px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)",
  border: "1px solid rgba(0,0,0,0.05)",
};

const badge = (color) => ({
  display: "inline-flex", alignItems: "center", gap: "4px",
  padding: "3px 10px", borderRadius: "20px",
  fontSize: "11px", fontWeight: 600,
  ...color,
});

const DAY_COLORS = ["#e0e7ff", "#fce7f3", "#d1fae5", "#fef3c7", "#dbeafe", "#ede9fe", "#ffedd5"];
const DAY_TEXT =  ["#4338ca", "#be185d", "#065f46", "#92400e", "#1d4ed8", "#6d28d9", "#c2410c"];

export default function TeachingSchedule() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [weeks, setWeeks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [slots, setSlots] = useState([]);
  const [weekdays, setWeekdays] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateWeeksOfYear = (targetYear) => {
    const startDate = new Date(`${targetYear}-01-01`);
    while (startDate.getDay() !== 1) startDate.setDate(startDate.getDate() + 1);
    const weeks = [];
    for (let i = 0; i < 53; i++) {
      const weekStart = new Date(startDate);
      weekStart.setDate(startDate.getDate() + i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      if (weekStart.getFullYear() > targetYear && i > 0) break;
      const label = `${weekStart.toLocaleDateString('en-GB')} To ${weekEnd.toLocaleDateString('en-GB')}`;
      weeks.push({ label, start: new Date(weekStart), end: new Date(weekEnd) });
    }
    return weeks;
  };

  const getWeekDates = (selectedWeek) => {
    if (!selectedWeek) return [];
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return dayNames.map((label, i) => {
      const date = new Date(selectedWeek.start);
      date.setDate(selectedWeek.start.getDate() + i);
      return { label, date: date.toISOString().split('T')[0] };
    });
  };

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;
      const teacherId = jwtDecode(token).id;
      const response = await axios.get(`http://localhost:9999/api/teacher/${teacherId}/schedules`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data?.success && Array.isArray(response.data.data)) {
        setSchedule(response.data.data);
      } else { setSchedule([]); }
    } catch { setSchedule([]); }
    finally { setLoading(false); }
  };

  const fetchSlots = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get('http://localhost:9999/api/teacher/slots', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data?.success && Array.isArray(response.data.data)) {
        setSlots(response.data.data);
      }
    } catch { setSlots([]); }
  };

  useEffect(() => {
    const newWeeks = generateWeeksOfYear(year);
    setWeeks(newWeeks);
    const today = new Date();
    const current = newWeeks.find(w => {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const s = new Date(w.start.getFullYear(), w.start.getMonth(), w.start.getDate());
      const e = new Date(w.end.getFullYear(), w.end.getMonth(), w.end.getDate());
      return d >= s && d <= e;
    });
    setSelectedWeek(current || newWeeks[0] || null);
  }, [year]);

  useEffect(() => { if (selectedWeek) setWeekdays(getWeekDates(selectedWeek)); }, [selectedWeek]);
  useEffect(() => { fetchSlots(); fetchSchedule(); }, []);
  useEffect(() => { if (selectedWeek) fetchSchedule(); }, [selectedWeek]);

  const currentWeekIdx = weeks.findIndex(w => w.label === selectedWeek?.label);
  const goPrev = () => { if (currentWeekIdx > 0) setSelectedWeek(weeks[currentWeekIdx - 1]); };
  const goNext = () => { if (currentWeekIdx < weeks.length - 1) setSelectedWeek(weeks[currentWeekIdx + 1]); };

  // Build grouped schedule
  const groupedSchedule = {};
  if (Array.isArray(schedule) && selectedWeek) {
    schedule.filter(item => {
      const d = new Date(item.date);
      return d >= selectedWeek.start && d <= selectedWeek.end;
    }).forEach(item => {
      const sid = item.slot.id;
      if (!groupedSchedule[sid]) groupedSchedule[sid] = [];
      groupedSchedule[sid].push(item);
    });
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Teaching Schedule</h1>
          <p style={{ color: "#64748b", fontSize: "13px", marginTop: "4px" }}>
            {selectedWeek ? `${selectedWeek.start.toLocaleDateString('en-GB')} — ${selectedWeek.end.toLocaleDateString('en-GB')}` : "Select a week"}
          </p>
        </div>
        <button
          onClick={fetchSchedule}
          disabled={loading}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "8px 16px", borderRadius: "10px",
            background: loading ? "#e2e8f0" : "linear-gradient(135deg, #0ea5e9, #0284c7)",
            color: loading ? "#94a3b8" : "#fff",
            border: "none", cursor: loading ? "not-allowed" : "pointer",
            fontSize: "13px", fontWeight: 600,
            boxShadow: loading ? "none" : "0 4px 12px rgba(14,165,233,0.3)",
            transition: "all 0.2s",
          }}
        >
          <RefreshCw size={14} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Week Controls */}
      <div style={{ ...card, padding: "16px 20px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Calendar size={16} style={{ color: "#6366f1" }} />
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>Year:</span>
          <select
            value={year}
            onChange={e => setYear(+e.target.value)}
            style={{
              border: "1.5px solid #e2e8f0", borderRadius: "8px",
              padding: "5px 10px", fontSize: "13px", color: "#1e293b",
              background: "#f8fafc", cursor: "pointer", outline: "none",
            }}
          >
            {[2023, 2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
          <button onClick={goPrev} disabled={currentWeekIdx <= 0} style={{
            background: "#f1f5f9", border: "1.5px solid #e2e8f0", borderRadius: "8px",
            padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center",
            color: "#475569",
          }}>
            <ChevronLeft size={14} />
          </button>
          <select
            value={selectedWeek?.label || ""}
            onChange={e => setSelectedWeek(weeks.find(w => w.label === e.target.value))}
            style={{
              border: "1.5px solid #e2e8f0", borderRadius: "8px",
              padding: "5px 12px", fontSize: "13px", color: "#1e293b",
              background: "#f8fafc", flex: 1, maxWidth: "320px", outline: "none",
            }}
          >
            {weeks.map(w => <option key={w.label} value={w.label}>{w.label}</option>)}
          </select>
          <button onClick={goNext} disabled={currentWeekIdx >= weeks.length - 1} style={{
            background: "#f1f5f9", border: "1.5px solid #e2e8f0", borderRadius: "8px",
            padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center",
            color: "#475569",
          }}>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Timetable */}
      <div style={{ ...card, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
            <thead>
              <tr style={{ background: "linear-gradient(90deg, #0c1a2e, #0a2744)" }}>
                <th style={{ padding: "14px 16px", color: "rgba(255,255,255,0.6)", fontSize: "12px", fontWeight: 600, textAlign: "center", width: "120px", letterSpacing: "0.5px" }}>
                  TIME SLOT
                </th>
                {weekdays.map((day, idx) => {
                  const isToday = day.date === today;
                  return (
                    <th key={day.label} style={{ padding: "14px 8px", textAlign: "center", width: "13%" }}>
                      <div style={{
                        display: "inline-flex", flexDirection: "column", alignItems: "center",
                        background: isToday ? "rgba(14,165,233,0.3)" : "transparent",
                        borderRadius: "10px", padding: "4px 12px",
                        border: isToday ? "1px solid rgba(14,165,233,0.5)" : "none",
                      }}>
                        <span style={{ color: isToday ? "#7dd3fc" : "rgba(255,255,255,0.5)", fontSize: "10px", fontWeight: 600, letterSpacing: "1px" }}>
                          {day.label.toUpperCase()}
                        </span>
                        <span style={{ color: isToday ? "#fff" : "rgba(255,255,255,0.85)", fontSize: "15px", fontWeight: 700 }}>
                          {new Date(day.date).getDate()}
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "48px", color: "#94a3b8", fontSize: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} />
                      Loading schedule...
                    </div>
                  </td>
                </tr>
              ) : slots.map((slot, index) => {
                const slotId = slot._id;
                const itemsForSlot = groupedSchedule[slotId] || [];
                const isEven = index % 2 === 0;
                return (
                  <tr key={slotId} style={{ background: isEven ? "#fff" : "#fafbff", borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 16px", textAlign: "center", borderRight: "1px solid #f1f5f9" }}>
                      <div style={{ fontWeight: 700, fontSize: "13px", color: "#1e293b" }}>Slot {index + 1}</div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", color: "#64748b", fontSize: "11px", marginTop: "2px" }}>
                        <Clock size={11} /> {slot.from} – {slot.to}
                      </div>
                    </td>
                    {weekdays.map((day, dayIdx) => {
                      const entry = itemsForSlot.find(item =>
                        new Date(item.date).toDateString() === new Date(day.date).toDateString()
                      );
                      const isToday = day.date === today;
                      return (
                        <td key={day.label} style={{
                          padding: "8px",
                          borderRight: dayIdx < weekdays.length - 1 ? "1px solid #f1f5f9" : "none",
                          background: isToday ? "rgba(219, 242, 255, 0.6)" : "transparent",
                          verticalAlign: "top",
                        }}>
                          {entry ? (
                            <div style={{
                              background: `linear-gradient(135deg, ${DAY_COLORS[dayIdx % 7]}, ${DAY_COLORS[(dayIdx + 1) % 7]}44)`,
                              border: `1.5px solid ${DAY_COLORS[dayIdx % 7]}`,
                              borderRadius: "10px",
                              padding: "8px 10px",
                              fontSize: "12px",
                            }}>
                              <div style={{ fontWeight: 700, color: DAY_TEXT[dayIdx % 7], marginBottom: "4px", fontSize: "12px" }}>
                                {entry.class.name}
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#475569", marginBottom: "2px" }}>
                                <BookOpen size={10} />
                                <span style={{ fontSize: "11px" }}>{entry.class.course}</span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#475569" }}>
                                <MapPin size={10} />
                                <span style={{ fontSize: "11px" }}>{entry.room.name}</span>
                              </div>
                            </div>
                          ) : (
                            <div style={{ textAlign: "center", color: "#cbd5e1", fontSize: "18px", padding: "8px 0" }}>–</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}