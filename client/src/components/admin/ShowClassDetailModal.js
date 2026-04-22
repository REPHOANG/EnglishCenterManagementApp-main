import { useEffect, useState } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { X, Calendar, Users, Info, Plus, Trash2 } from "lucide-react";

export default function ShowClassDetailModal({ classData, onClose }) {
  const [activeTab, setActiveTab] = useState("overview");

  // Schedule Management State
  const [schedules, setSchedules] = useState([]);
  const [slots, setSlots] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const handleAddSchedule = async () => {
    try {
      setError("");
      if (!newSchedule.slotId || !newSchedule.roomId || !newSchedule.date) {
        setError("Please fill all required fields for the schedule.");
        return;
      }
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const payload = { ...newSchedule, classId: classData._id };

      const res = await axios.post("http://localhost:9999/api/schedule/add", payload, config);
      if (res.data.success) {
        // refresh schedules
        fetchScheduleData();
        setNewSchedule({ slotId: "", roomId: "", date: "" });
      }
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message || "Failed to add schedule.");
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm("Delete this schedule slot?")) return;
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`http://localhost:9999/api/schedule/delete/${id}`, config);
      setSchedules(prev => prev.filter(s => s._id !== id));
    } catch (e) {
      console.error(e);
      setError("Failed to delete schedule.");
    }
  };

  if (!classData) return null;

  const fmt = (d) => new Date(d).toLocaleDateString();
  const capacityDisplay = `${classData.students.length}/${classData.capacity}`;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-900 px-6 py-5 flex items-center justify-between text-white shrink-0">
            <div>
              <h2 className="text-2xl font-bold">{classData.name}</h2>
              <p className="text-blue-100 mt-1">Course: {classData.courseId?.name || "-"}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 px-4 shrink-0">
            <TabButton 
              active={activeTab === "overview"} 
              onClick={() => setActiveTab("overview")} 
              icon={<Info className="w-4 h-4" />} 
              label="Overview" 
            />
            <TabButton 
              active={activeTab === "members"} 
              onClick={() => setActiveTab("members")} 
              icon={<Users className="w-4 h-4" />} 
              label="Members" 
            />
            <TabButton 
              active={activeTab === "schedule"} 
              onClick={() => setActiveTab("schedule")} 
              icon={<Calendar className="w-4 h-4" />} 
              label="Schedule" 
            />
          </div>

          {/* Content Area */}
          <div className="p-6 flex-1 overflow-y-auto bg-gray-50">
            {activeTab === "overview" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-2">Class Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                  <Detail label="Class Name" value={classData.name} />
                  <Detail label="Course" value={classData.courseId?.name || "-"} />
                  <Detail label="Start Date" value={fmt(classData.startDate)} />
                  <Detail label="End Date" value={fmt(classData.endDate)} />
                  <Detail label="Capacity" value={capacityDisplay} />
                  <Detail label="Status" value={<span className="capitalize px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium">{classData.status}</span>} />
                </div>
              </div>
            )}

            {activeTab === "members" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                    Teachers <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{classData.teachers.length}</span>
                  </h3>
                  {classData.teachers.length === 0 ? (
                    <p className="text-gray-500 italic text-sm">No teachers assigned</p>
                  ) : (
                    <ul className="space-y-3">
                      {classData.teachers.map((t) => (
                        <li key={typeof t === "string" ? t : t._id} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                            {(typeof t === "string" ? t : t.fullName).charAt(0)}
                          </div>
                          <span className="text-gray-700 font-medium">{typeof t === "string" ? t : t.fullName}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                    Students <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{classData.students.length}</span>
                  </h3>
                  {classData.students.length === 0 ? (
                    <p className="text-gray-500 italic text-sm">No students enrolled</p>
                  ) : (
                    <div className="max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                      <ul className="space-y-3">
                        {classData.students.map((s) => (
                          <li key={typeof s === "string" ? s : s._id} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs">
                              {(typeof s === "string" ? s : s.fullName).charAt(0)}
                            </div>
                            <span className="text-gray-700 font-medium">{typeof s === "string" ? s : s.fullName}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "schedule" && (
              <div className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                
                {/* Add Schedule Form */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-blue-600" />
                    Add Schedule Slot
                  </h3>
                  <div className="flex flex-wrap items-end gap-4">
                    <div className="flex-1 min-w-[150px]">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                      <input
                        type="date"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                        value={newSchedule.date}
                        onChange={(e) => setNewSchedule({...newSchedule, date: e.target.value})}
                      />
                    </div>
                    <div className="flex-1 min-w-[150px]">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Slot</label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                        value={newSchedule.slotId}
                        onChange={(e) => setNewSchedule({...newSchedule, slotId: e.target.value})}
                      >
                        <option value="">Select Slot</option>
                        {slots.map(s => <option key={s._id} value={s._id}>{s.from} - {s.to}</option>)}
                      </select>
                    </div>
                    <div className="flex-1 min-w-[150px]">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Room</label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                        value={newSchedule.roomId}
                        onChange={(e) => setNewSchedule({...newSchedule, roomId: e.target.value})}
                      >
                        <option value="">Select Room</option>
                        {rooms.map(r => <option key={r._id} value={r._id}>{r.name} ({r.type})</option>)}
                      </select>
                    </div>
                    {/* <div className="flex-1 min-w-[150px]">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Meeting Link (Opt)</label>
                      <input
                        type="text"
                        placeholder="https://..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                        value={newSchedule.meeting}
                        onChange={(e) => setNewSchedule({...newSchedule, meeting: e.target.value})}
                      />
                    </div> */}
                    <button
                      onClick={handleAddSchedule}
                      disabled={loading}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors text-sm disabled:opacity-50"
                    >
                      Add Slot
                    </button>
                  </div>
                </div>

                {/* Schedule List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 border-b bg-gray-50/50 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">Current Schedule</h3>
                    <span className="text-xs font-medium text-gray-500">{schedules.length} slots</span>
                  </div>
                  
                  {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading schedules...</div>
                  ) : schedules.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 italic">No schedule slots added yet.</div>
                  ) : (
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 text-gray-500 border-b">
                        <tr>
                          <th className="px-4 py-3 font-medium">Date</th>
                          <th className="px-4 py-3 font-medium">Time (Slot)</th>
                          <th className="px-4 py-3 font-medium">Room</th>
                          <th className="px-4 py-3 font-medium text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {schedules.map((sched) => (
                          <tr key={sched._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 font-medium text-gray-800">
                              {new Date(sched.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {sched.slotId ? `${sched.slotId.from} - ${sched.slotId.to}` : "N/A"}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {sched.roomId ? (
                                <div>
                                  <span className="font-medium">{sched.roomId.name} - {sched.roomId.type}</span>
                                  <span className="text-xs text-gray-400 block">{sched.roomId.location}</span>
                                </div>
                              ) : "N/A"}
                            </td>
                            {/* <td className="px-4 py-3 text-gray-600">
                              {sched.meeting ? (
                                <a href={sched.meeting} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Link</a>
                              ) : "-"}
                            </td> */}
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleDeleteSchedule(sched._id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Delete Slot"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors border-b-2 ${
        active
          ? "border-blue-600 text-blue-600"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <div className="text-base text-gray-800 break-words">{value}</div>
    </div>
  );
}
