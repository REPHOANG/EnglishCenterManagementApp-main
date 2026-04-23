import { useState, useEffect } from "react";
import axios from "axios";

export function useClassDetail(classData) {
  const [activeTab, setActiveTab] = useState("overview");

  // Schedule Management State
  const [schedules, setSchedules] = useState([]);
  const [slots, setSlots] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [newSchedule, setNewSchedule] = useState({
    slotId: "",
    roomId: "",
    date: "",
  });

  useEffect(() => {
    if (classData && activeTab === "schedule") {
      fetchScheduleData();
    }
  }, [classData, activeTab]);

  const fetchScheduleData = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [schedRes, slotRes, roomRes] = await Promise.all([
        axios.get(`http://localhost:9999/api/schedule/class/${classData._id}`, config),
        axios.get(`http://localhost:9999/api/slots`, config),
        axios.get(`http://localhost:9999/api/rooms`, config),
      ]);

      setSchedules(schedRes.data?.data || []);
      setSlots(slotRes.data?.data || []);
      setRooms(roomRes.data?.data || []);
    } catch (e) {
      console.error(e);
      setError("Failed to load schedule data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSchedule = async () => {
    try {
      setError("");
      if (!newSchedule.slotId || !newSchedule.roomId || !newSchedule.date) {
        setError("Please fill all required fields for the schedule.");
        return;
      }
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const payload = { ...newSchedule, classId: classData._id };

      if (editingScheduleId) {
        const res = await axios.put(`http://localhost:9999/api/schedule/update/${editingScheduleId}`, payload, config);
        if (res.data.success) {
          fetchScheduleData();
          cancelEdit();
        }
      } else {
        const res = await axios.post("http://localhost:9999/api/schedule/add", payload, config);
        if (res.data.success) {
          fetchScheduleData();
          cancelEdit();
        }
      }
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message || "Failed to save schedule.");
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm("Delete this schedule slot?")) return;
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`http://localhost:9999/api/schedule/delete/${id}`, config);
      setSchedules(prev => prev.filter(s => s._id !== id));
      if (editingScheduleId === id) cancelEdit();
    } catch (e) {
      console.error(e);
      setError("Failed to delete schedule.");
    }
  };

  const startEditSchedule = (sched) => {
    setEditingScheduleId(sched._id);
    setNewSchedule({
      slotId: sched.slotId?._id || "",
      roomId: sched.roomId?._id || "",
      date: new Date(sched.date).toISOString().split('T')[0],
    });
    setError("");
  };

  const cancelEdit = () => {
    setEditingScheduleId(null);
    setNewSchedule({ slotId: "", roomId: "", date: "" });
    setError("");
  };

  return {
    activeTab,
    setActiveTab,
    schedules,
    slots,
    rooms,
    loading,
    error,
    newSchedule,
    setNewSchedule,
    editingScheduleId,
    handleSaveSchedule,
    handleDeleteSchedule,
    startEditSchedule,
    cancelEdit,
  };
}
