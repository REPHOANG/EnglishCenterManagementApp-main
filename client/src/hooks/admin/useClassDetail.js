import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:9999/api";
const PAGE_SIZE = 10;

export function useClassDetail(classId) {
  const [classData, setClassData] = useState(null);
  const [activeTab, setActiveTab] = useState("schedule");

  // Schedule Management State
  const [schedules, setSchedules] = useState([]);
  const [slots, setSlots] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Pagination
  const [page, setPage] = useState(1);

  // Single slot form
  const [scheduleMode, setScheduleMode] = useState("single"); // "single" | "generate"
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [newSchedule, setNewSchedule] = useState({ slotId: "", roomId: "", date: "" });

  // Auto-generate form
  const [generateSchedule, setGenerateSchedule] = useState({ slotId: "", roomId: "", dayOfWeek: "" });

  useEffect(() => {
    if (classId) {
      fetchClassData();
      fetchScheduleData();
    }
  }, [classId]);

  // Reset to page 1 when schedules list changes
  useEffect(() => {
    setPage(1);
  }, [schedules.length]);

  const getConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  const fetchClassData = async () => {
    try {
      const res = await axios.get(`${API}/classes/${classId}/admin`, getConfig());
      if (res.data.success) setClassData(res.data.data);
    } catch (e) {
      console.error("Failed to load class:", e);
    }
  };

  const fetchScheduleData = async () => {
    try {
      setLoading(true);
      setError("");
      const [schedRes, slotRes, roomRes] = await Promise.all([
        axios.get(`${API}/schedule/class/${classId}`, getConfig()),
        axios.get(`${API}/slots`, getConfig()),
        axios.get(`${API}/rooms`, getConfig()),
      ]);

      const allRooms = roomRes.data?.data || [];
      setSchedules(schedRes.data?.data || []);
      setSlots(slotRes.data?.data || []);
      setRooms(allRooms.filter((r) => r.available !== false));
    } catch (e) {
      console.error(e);
      setError("Failed to load schedule data.");
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  // ── Validate date is within class range ──
  const validateDateInRange = (dateStr) => {
    if (!classData) return { valid: false, msg: "Class data not loaded yet." };
    const d = new Date(dateStr);
    const start = new Date(classData.startDate);
    const end = new Date(classData.endDate);
    // Normalize to midnight for comparison
    d.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    if (d < start || d > end) {
      return {
        valid: false,
        msg: `Date must be between ${start.toLocaleDateString()} and ${end.toLocaleDateString()} (class duration).`,
      };
    }
    return { valid: true };
  };

  const handleSaveSchedule = async () => {
    try {
      setError("");
      if (!newSchedule.slotId || !newSchedule.roomId || !newSchedule.date) {
        setError("Please fill Date, Slot, and Room.");
        return;
      }

      // Frontend date range validation
      const rangeCheck = validateDateInRange(newSchedule.date);
      if (!rangeCheck.valid) {
        setError(rangeCheck.msg);
        return;
      }

      const payload = { ...newSchedule, classId };
      if (editingScheduleId) {
        const res = await axios.put(`${API}/schedule/update/${editingScheduleId}`, payload, getConfig());
        if (res.data.success) {
          fetchScheduleData();
          cancelEdit();
          showSuccess("Slot rescheduled successfully.");
        }
      } else {
        const res = await axios.post(`${API}/schedule/add`, payload, getConfig());
        if (res.data.success) {
          fetchScheduleData();
          cancelEdit();
          showSuccess("Slot added successfully.");
        }
      }
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message || "Failed to save schedule.");
    }
  };

  const handleGenerateSchedules = async () => {
    try {
      setError("");
      if (!generateSchedule.slotId || !generateSchedule.roomId || generateSchedule.dayOfWeek === "") {
        setError("Please fill Day, Slot, and Room to generate.");
        return;
      }
      setLoading(true);
      const res = await axios.post(`${API}/schedule/generate`, { ...generateSchedule, classId }, getConfig());
      if (res.data.success) {
        showSuccess(res.data.message);
        fetchScheduleData();
        setGenerateSchedule({ slotId: "", roomId: "", dayOfWeek: "" });
      }
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message || "Failed to generate schedules.");
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm("Delete this schedule slot?")) return;
    try {
      await axios.delete(`${API}/schedule/delete/${id}`, getConfig());
      setSchedules((prev) => prev.filter((s) => s._id !== id));
      if (editingScheduleId === id) cancelEdit();
      showSuccess("Slot deleted.");
    } catch (e) {
      console.error(e);
      setError("Failed to delete schedule.");
    }
  };

  const startReschedule = (sched) => {
    setEditingScheduleId(sched._id);
    setNewSchedule({
      slotId: sched.slotId?._id || "",
      roomId: sched.roomId?._id || "",
      date: new Date(sched.date).toISOString().split("T")[0],
    });
    setScheduleMode("single");
    setError("");
    // Scroll form into view gently
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingScheduleId(null);
    setNewSchedule({ slotId: "", roomId: "", date: "" });
    setError("");
  };

  // ── Pagination helpers ──
  const totalPages = Math.ceil(schedules.length / PAGE_SIZE);
  const paginatedSchedules = schedules.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const globalIndexOffset = (page - 1) * PAGE_SIZE;

  return {
    classData,
    activeTab,
    setActiveTab,
    schedules,
    paginatedSchedules,
    globalIndexOffset,
    page,
    setPage,
    totalPages,
    slots,
    rooms,
    loading,
    error,
    successMsg,
    scheduleMode,
    setScheduleMode,
    newSchedule,
    setNewSchedule,
    editingScheduleId,
    handleSaveSchedule,
    handleDeleteSchedule,
    startReschedule,
    cancelEdit,
    generateSchedule,
    setGenerateSchedule,
    handleGenerateSchedules,
  };
}
