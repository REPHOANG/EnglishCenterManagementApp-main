import { AnimatePresence, motion } from "framer-motion";
import { X, Calendar, Users, Info, Plus, Trash2, Edit2, BookOpen, Hash, CalendarDays } from "lucide-react";
import { useClassDetail } from "../../hooks/admin/useClassDetail";

const STATUS_COLORS = {
  ongoing: "bg-blue-100 text-blue-700 border-blue-200",
  finished: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-rose-100 text-rose-700 border-rose-200",
  default: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function ShowClassDetailModal({ classData, onClose }) {
  const {
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
    generateSchedule,
    setGenerateSchedule,
    handleGenerateSchedules,
  } = useClassDetail(classData);

  if (!classData) return null;

  const fmt = (d) => new Date(d).toLocaleDateString();

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden"
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Premium Header */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 px-8 py-6 shrink-0 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
                  <span className="text-2xl font-bold text-white">{classData.name.charAt(0)}</span>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-bold text-white m-0">{classData.name}</h2>
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border bg-white/20 text-white border-white/30`}>
                      {classData.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-indigo-100 text-sm font-medium">
                    <BookOpen size={14} className="opacity-70" />
                    {classData.courseId?.name || "No Course Linked"}
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Clean Tabs */}
          <div className="flex border-b border-slate-200 px-6 shrink-0 bg-slate-50/50">
            <TabButton 
              active={activeTab === "overview"} 
              onClick={() => setActiveTab("overview")} 
              icon={<Info size={16} />} 
              label="Overview" 
            />
            <TabButton 
              active={activeTab === "members"} 
              onClick={() => setActiveTab("members")} 
              icon={<Users size={16} />} 
              label="Members" 
              count={classData.teachers.length + classData.students.length}
            />
            <TabButton 
              active={activeTab === "schedule"} 
              onClick={() => setActiveTab("schedule")} 
              icon={<Calendar size={16} />} 
              label="Schedule" 
              count={schedules.length > 0 ? schedules.length : null}
            />
          </div>

          {/* Scrollable Content Area */}
          <div className="p-8 flex-1 overflow-y-auto bg-white custom-scrollbar">
            
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <Hash size={16} className="text-indigo-500" /> Basic Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Class Name</p>
                      <p className="text-sm font-bold text-slate-900">{classData.name}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Course</p>
                      <p className="text-sm font-bold text-slate-900">{classData.courseId?.name || "-"}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Capacity</p>
                      <p className="text-sm font-bold text-slate-900">
                        {classData.students.length} <span className="text-slate-400 font-normal">/ {classData.capacity} students</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 mt-2">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <CalendarDays size={16} className="text-indigo-500" /> Timeline
                  </h3>
                  <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Start Date</p>
                      <p className="text-sm font-bold text-slate-900">{fmt(classData.startDate)}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                      →
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">End Date</p>
                      <p className="text-sm font-bold text-slate-900">{fmt(classData.endDate)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MEMBERS TAB */}
            {activeTab === "members" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Teachers List */}
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                      Teachers
                    </h3>
                    <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{classData.teachers.length}</span>
                  </div>
                  {classData.teachers.length === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-400 italic bg-slate-50 rounded-xl border border-slate-100">No teachers assigned</div>
                  ) : (
                    <div className="space-y-2">
                      {classData.teachers.map((t) => (
                        <div key={typeof t === "string" ? t : t._id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors">
                          <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                            {(typeof t === "string" ? t : t.fullName).charAt(0)}
                          </div>
                          <span className="text-slate-800 font-medium text-sm">{typeof t === "string" ? t : t.fullName}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Students List */}
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                      Students
                    </h3>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{classData.students.length}</span>
                  </div>
                  {classData.students.length === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-400 italic bg-slate-50 rounded-xl border border-slate-100">No students enrolled</div>
                  ) : (
                    <div className="max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                      {classData.students.map((s) => (
                        <div key={typeof s === "string" ? s : s._id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors">
                          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm">
                            {(typeof s === "string" ? s : s.fullName).charAt(0)}
                          </div>
                          <span className="text-slate-800 font-medium text-sm">{typeof s === "string" ? s : s.fullName}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SCHEDULE TAB */}
            {activeTab === "schedule" && (
              <div className="space-y-6">
                {error && (
                  <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium">
                    {error}
                  </div>
                )}
                
                {/* Form */}
                <div className={`p-5 rounded-2xl border transition-all ${editingScheduleId ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                    {editingScheduleId ? (
                      <><Edit2 size={16} className="text-amber-500" /> Edit Slot</>
                    ) : (
                      <><Plus size={16} className="text-indigo-500" /> Add New Slot</>
                    )}
                  </h3>
                  <div className="flex flex-wrap items-end gap-4">
                    <div className="flex-1 min-w-[150px]">
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Date</label>
                      <input
                        type="date"
                        className="w-full border border-slate-300 rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                        value={newSchedule.date}
                        onChange={(e) => setNewSchedule({...newSchedule, date: e.target.value})}
                      />
                    </div>
                    <div className="flex-1 min-w-[150px]">
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Time Slot</label>
                      <select
                        className="w-full border border-slate-300 rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all appearance-none bg-white"
                        value={newSchedule.slotId}
                        onChange={(e) => setNewSchedule({...newSchedule, slotId: e.target.value})}
                      >
                        <option value="">Select Slot</option>
                        {slots.map(s => <option key={s._id} value={s._id}>{s.from} - {s.to}</option>)}
                      </select>
                    </div>
                    <div className="flex-1 min-w-[150px]">
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Room</label>
                      <select
                        className="w-full border border-slate-300 rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all appearance-none bg-white"
                        value={newSchedule.roomId}
                        onChange={(e) => setNewSchedule({...newSchedule, roomId: e.target.value})}
                      >
                        <option value="">Select Room</option>
                        {rooms.map(r => <option key={r._id} value={r._id}>{r.name} ({r.type})</option>)}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveSchedule}
                        disabled={loading}
                        className={`px-6 py-2 text-white font-medium rounded-xl shadow-md transition-all text-sm disabled:opacity-50 flex items-center justify-center min-w-[100px] ${editingScheduleId ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:shadow-amber-500/30' : 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:shadow-indigo-500/30'}`}
                      >
                        {editingScheduleId ? "Update" : "Add Slot"}
                      </button>
                      {editingScheduleId && (
                        <button
                          onClick={cancelEdit}
                          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium rounded-xl transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Auto-Generate Form */}
                <div className={`p-5 rounded-2xl border transition-all bg-slate-50 border-slate-200`}>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <CalendarDays size={16} className="text-emerald-500" /> Auto-Generate Recurring Slots
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">Automatically generate schedule slots for every selected day of the week between the class start and end dates.</p>
                  <div className="flex flex-wrap items-end gap-4">
                    <div className="flex-1 min-w-[150px]">
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Day of Week</label>
                      <select
                        className="w-full border border-slate-300 rounded-xl px-4 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all appearance-none bg-white"
                        value={generateSchedule.dayOfWeek}
                        onChange={(e) => setGenerateSchedule({...generateSchedule, dayOfWeek: e.target.value})}
                      >
                        <option value="">Select Day</option>
                        <option value="1">Monday</option>
                        <option value="2">Tuesday</option>
                        <option value="3">Wednesday</option>
                        <option value="4">Thursday</option>
                        <option value="5">Friday</option>
                        <option value="6">Saturday</option>
                        <option value="0">Sunday</option>
                      </select>
                    </div>
                    <div className="flex-1 min-w-[150px]">
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Time Slot</label>
                      <select
                        className="w-full border border-slate-300 rounded-xl px-4 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all appearance-none bg-white"
                        value={generateSchedule.slotId}
                        onChange={(e) => setGenerateSchedule({...generateSchedule, slotId: e.target.value})}
                      >
                        <option value="">Select Slot</option>
                        {slots.map(s => <option key={s._id} value={s._id}>{s.from} - {s.to}</option>)}
                      </select>
                    </div>
                    <div className="flex-1 min-w-[150px]">
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Room</label>
                      <select
                        className="w-full border border-slate-300 rounded-xl px-4 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all appearance-none bg-white"
                        value={generateSchedule.roomId}
                        onChange={(e) => setGenerateSchedule({...generateSchedule, roomId: e.target.value})}
                      >
                        <option value="">Select Room</option>
                        {rooms.map(r => <option key={r._id} value={r._id}>{r.name} ({r.type})</option>)}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleGenerateSchedules}
                        disabled={loading}
                        className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:shadow-emerald-500/30 text-white font-medium rounded-xl shadow-md transition-all text-sm disabled:opacity-50 flex items-center justify-center min-w-[100px]"
                      >
                        Generate
                      </button>
                    </div>
                  </div>
                </div>

                {/* List */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Timetable</h3>
                    <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">{schedules.length}</span>
                  </div>
                  
                  {loading ? (
                    <div className="p-10 text-center text-sm font-medium text-slate-500">Loading schedules...</div>
                  ) : schedules.length === 0 ? (
                    <div className="p-10 text-center text-sm text-slate-400 italic">No schedule slots added yet.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                          <tr>
                            <th className="px-5 py-3 font-semibold text-slate-500 text-xs uppercase">Date</th>
                            <th className="px-5 py-3 font-semibold text-slate-500 text-xs uppercase">Time Slot</th>
                            <th className="px-5 py-3 font-semibold text-slate-500 text-xs uppercase">Room</th>
                            <th className="px-5 py-3 font-semibold text-slate-500 text-xs uppercase text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {schedules.map((sched) => (
                            <tr key={sched._id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-5 py-3 font-medium text-slate-800">
                                {new Date(sched.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                              </td>
                              <td className="px-5 py-3">
                                <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-700 font-medium text-xs">
                                  {sched.slotId ? `${sched.slotId.from} - ${sched.slotId.to}` : "N/A"}
                                </span>
                              </td>
                              <td className="px-5 py-3">
                                {sched.roomId ? (
                                  <div>
                                    <span className="font-semibold text-slate-800 block text-xs">{sched.roomId.name}</span>
                                    <span className="text-[10px] text-slate-500">{sched.roomId.type}</span>
                                  </div>
                                ) : <span className="text-slate-400 italic text-xs">N/A</span>}
                              </td>
                              <td className="px-5 py-3 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => startEditSchedule(sched)}
                                    className="w-7 h-7 rounded bg-slate-100 hover:bg-indigo-100 text-slate-500 hover:text-indigo-600 flex items-center justify-center transition-colors"
                                    title="Edit Slot"
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSchedule(sched._id)}
                                    className="w-7 h-7 rounded bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 flex items-center justify-center transition-colors"
                                    title="Delete Slot"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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

function TabButton({ active, onClick, icon, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all relative outline-none ${
        active
          ? "text-indigo-600"
          : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
      }`}
    >
      {icon}
      {label}
      {count != null && (
        <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${active ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'}`}>
          {count}
        </span>
      )}
      {active && (
        <motion.div 
          layoutId="activeTab" 
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" 
        />
      )}
    </button>
  );
}
