import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import {
  ChevronLeft, Calendar, Users, Edit2, Trash2, Plus,
  RefreshCw, Zap, CheckCircle, AlertCircle, UserCheck, BookOpen,
  ChevronLeft as PrevIcon, ChevronRight,
} from "lucide-react";
import { useClassDetail } from "../../hooks/admin/useClassDetail";

const STATUS_COLORS = {
  ongoing: "bg-blue-100 text-blue-700 border-blue-200",
  finished: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-rose-100 text-rose-700 border-rose-200",
};

const DAYS = [
  { value: "0", label: "Monday" },
  { value: "1", label: "Tuesday" },
  { value: "2", label: "Wednesday" },
  { value: "3", label: "Thursday" },
  { value: "4", label: "Friday" },
  { value: "5", label: "Saturday" },
  { value: "6", label: "Sunday" },
];

export default function ClassDetail() {
  const { id } = useParams();
  const nav = useNavigate();

  const {
    classData,
    activeTab, setActiveTab,
    schedules, paginatedSchedules, globalIndexOffset, page, setPage, totalPages,
    slots, rooms,
    loading, error, successMsg,
    scheduleMode, setScheduleMode,
    newSchedule, setNewSchedule,
    editingScheduleId,
    handleSaveSchedule, handleDeleteSchedule, startReschedule, cancelEdit,
    generateSchedule, setGenerateSchedule, handleGenerateSchedules,
  } = useClassDetail(id);

  return (
    <AdminLayout>
      <div className="w-full min-h-full">
        {/* ── Header ── */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => nav("/admin/classes")}
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            {classData ? (
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900 m-0 leading-tight truncate">
                  {classData.name}
                </h1>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize border ${STATUS_COLORS[classData.status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                  {classData.status}
                </span>
                <span className="text-sm text-slate-400 font-medium">
                  <BookOpen size={12} className="inline mr-1" />
                  {classData.courseId?.name || "—"}
                </span>
              </div>
            ) : (
              <div className="h-6 w-48 bg-slate-200 animate-pulse rounded-lg" />
            )}
            <p className="text-xs text-slate-400 mt-0.5">
              {classData
                ? `${new Date(classData.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} → ${new Date(classData.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                : ""}
            </p>
          </div>
          <button
            onClick={() => nav(`/admin/classes/edit/${id}`)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
          >
            <Edit2 size={14} /> Edit Class
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 mb-6 bg-white border border-slate-100 rounded-2xl p-1.5 shadow-sm w-fit">
          <TabBtn active={activeTab === "schedule"} onClick={() => setActiveTab("schedule")} icon={<Calendar size={15} />} label="Schedule" badge={schedules.length || null} />
          <TabBtn active={activeTab === "members"} onClick={() => setActiveTab("members")} icon={<Users size={15} />} label="Members" badge={classData ? classData.teachers.length + classData.students.length : null} />
        </div>

        {/* ── Toast messages ── */}
        {successMsg && (
          <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium shadow-sm animate-pulse">
            <CheckCircle size={16} /> {successMsg}
          </div>
        )}
        {error && (
          <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium shadow-sm">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* ════════════ SCHEDULE TAB ════════════ */}
        {activeTab === "schedule" && (
          <div className="space-y-4">
            {/* ── Form Card ── */}
            <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${editingScheduleId ? "border-amber-300" : "border-slate-100"}`}>
              {/* Form toggle header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/60">
                <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
                  <button
                    onClick={() => { setScheduleMode("single"); cancelEdit(); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${scheduleMode === "single" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    <Plus size={13} /> Add Single
                  </button>
                  <button
                    onClick={() => { setScheduleMode("generate"); cancelEdit(); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${scheduleMode === "generate" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    <Zap size={13} /> Auto-Generate
                  </button>
                </div>
                {editingScheduleId && (
                  <span className="text-xs font-semibold text-amber-600 flex items-center gap-1">
                    <RefreshCw size={12} /> Rescheduling slot
                  </span>
                )}
              </div>

              {/* Form body */}
              <div className="px-5 py-4">
                {scheduleMode === "single" ? (
                  <>
                    {/* Date constraint hint */}
                    {classData && (
                      <p className="text-[11px] text-slate-400 mb-3 flex items-center gap-1">
                        <Calendar size={11} />
                        Date must be within:&nbsp;
                        <strong className="text-slate-600">
                          {new Date(classData.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          &nbsp;→&nbsp;
                          {new Date(classData.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </strong>
                      </p>
                    )}
                    <div className="flex flex-wrap items-end gap-3">
                      <div className="flex-1 min-w-[130px]">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Date</label>
                        <input
                          type="date"
                          min={classData && classData.startDate ? new Date(classData.startDate).toLocaleDateString('en-CA') : undefined}
                          max={classData && classData.endDate ? new Date(classData.endDate).toLocaleDateString('en-CA') : undefined}
                          className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                          value={newSchedule.date}
                          onChange={(e) => setNewSchedule({ ...newSchedule, date: e.target.value })}
                        />
                      </div>
                      <div className="flex-1 min-w-[140px]">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Time Slot</label>
                        <select
                          className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all appearance-none cursor-pointer"
                          value={newSchedule.slotId}
                          onChange={(e) => setNewSchedule({ ...newSchedule, slotId: e.target.value })}
                        >
                          <option value="">Select Slot</option>
                          {slots.map((s) => <option key={s._id} value={s._id}>{s.from} – {s.to}</option>)}
                        </select>
                      </div>
                      <div className="flex-1 min-w-[140px]">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Room</label>
                        <select
                          className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all appearance-none cursor-pointer"
                          value={newSchedule.roomId}
                          onChange={(e) => setNewSchedule({ ...newSchedule, roomId: e.target.value })}
                        >
                          <option value="">Select Room</option>
                          {rooms.map((r) => <option key={r._id} value={r._id}>{r.name} ({r.type})</option>)}
                        </select>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={handleSaveSchedule}
                          disabled={loading}
                          className={`px-5 py-2 rounded-xl text-sm font-semibold text-white shadow-md transition-all disabled:opacity-50 ${editingScheduleId ? "bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-400/30" : "bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-indigo-400/30"}`}
                        >
                          {editingScheduleId ? "Reschedule" : "Add Slot"}
                        </button>
                        {editingScheduleId && (
                          <button onClick={cancelEdit} className="px-4 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="flex-1 min-w-[130px]">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Day of Week</label>
                      <select
                        className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all appearance-none cursor-pointer"
                        value={generateSchedule.dayOfWeek}
                        onChange={(e) => setGenerateSchedule({ ...generateSchedule, dayOfWeek: e.target.value })}
                      >
                        <option value="">Select Day</option>
                        {DAYS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                      </select>
                    </div>
                    <div className="flex-1 min-w-[140px]">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Time Slot</label>
                      <select
                        className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all appearance-none cursor-pointer"
                        value={generateSchedule.slotId}
                        onChange={(e) => setGenerateSchedule({ ...generateSchedule, slotId: e.target.value })}
                      >
                        <option value="">Select Slot</option>
                        {slots.map((s) => <option key={s._id} value={s._id}>{s.from} – {s.to}</option>)}
                      </select>
                    </div>
                    <div className="flex-1 min-w-[140px]">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Room</label>
                      <select
                        className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all appearance-none cursor-pointer"
                        value={generateSchedule.roomId}
                        onChange={(e) => setGenerateSchedule({ ...generateSchedule, roomId: e.target.value })}
                      >
                        <option value="">Select Room</option>
                        {rooms.map((r) => <option key={r._id} value={r._id}>{r.name} ({r.type})</option>)}
                      </select>
                    </div>
                    <button
                      onClick={handleGenerateSchedules}
                      disabled={loading}
                      className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 shadow-md shadow-emerald-400/30 transition-all disabled:opacity-50 shrink-0"
                    >
                      <Zap size={14} className="inline mr-1.5 -mt-0.5" />
                      Generate
                    </button>
                  </div>
                )}
              </div>
              {scheduleMode === "generate" && (
                <p className="px-5 pb-3 text-xs text-slate-400">
                  Generates a session every <strong>{DAYS.find(d => d.value === generateSchedule.dayOfWeek)?.label || "selected day"}</strong> between the class start and end dates. Conflicts are automatically skipped.
                </p>
              )}
            </div>

            {/* ── Timetable ── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Calendar size={15} className="text-indigo-400" /> Timetable
                </h3>
                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{schedules.length} sessions</span>
              </div>

              {loading ? (
                <div className="p-10 text-center text-sm text-slate-400 animate-pulse">Loading...</div>
              ) : schedules.length === 0 ? (
                <div className="p-12 text-center">
                  <Calendar size={32} className="mx-auto mb-3 text-slate-200" />
                  <p className="text-sm text-slate-400 italic">No schedule sessions yet. Add one above.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                          <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">#</th>
                          <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                          <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time Slot</th>
                          <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Room</th>
                          <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {paginatedSchedules.map((sched, i) => {
                          const isRescheduling = editingScheduleId === sched._id;
                          const globalIndex = globalIndexOffset + i + 1;
                          return (
                            <tr key={sched._id} className={`transition-colors ${isRescheduling ? "bg-amber-50/60" : "hover:bg-slate-50/60"}`}>
                              <td className="px-5 py-3 text-slate-400 font-mono text-xs">{String(globalIndex).padStart(2, "0")}</td>
                              <td className="px-5 py-3 font-semibold text-slate-800">
                                {new Date(sched.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                              </td>
                              <td className="px-5 py-3">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold text-xs border border-indigo-100">
                                  {sched.slotId ? `${sched.slotId.from} – ${sched.slotId.to}` : "N/A"}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-slate-600 text-xs">
                                {sched.roomId ? (
                                  <span><span className="font-semibold text-slate-800">{sched.roomId.name}</span> <span className="text-slate-400">· {sched.roomId.type}</span></span>
                                ) : <span className="text-slate-300 italic">N/A</span>}
                              </td>
                              <td className="px-5 py-3 text-right">
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    onClick={() => startReschedule(sched)}
                                    title="Reschedule"
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all border ${isRescheduling ? "bg-amber-100 text-amber-600 border-amber-200" : "bg-slate-100 text-slate-400 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 border-transparent"}`}
                                  >
                                    <RefreshCw size={13} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSchedule(sched._id)}
                                    title="Delete"
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border border-transparent transition-all"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* ── Pagination ── */}
                  {totalPages > 1 && (
                    <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        Showing <strong className="text-slate-600">{globalIndexOffset + 1}–{Math.min(globalIndexOffset + 10, schedules.length)}</strong> of <strong className="text-slate-600">{schedules.length}</strong> sessions
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          <PrevIcon size={14} />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                          <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all border ${
                              p === page
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/25"
                                : "bg-white border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                        <button
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* ════════════ MEMBERS TAB ════════════ */}
        {activeTab === "members" && classData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MemberCard title="Teachers" icon={<UserCheck size={15} />} color="indigo" items={classData.teachers} />
            <MemberCard title="Students" icon={<Users size={15} />} color="emerald" items={classData.students} capacity={classData.capacity} />
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function TabBtn({ active, onClick, icon, label, badge }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${active ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
    >
      {icon} {label}
      {badge != null && (
        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${active ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"}`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function MemberCard({ title, icon, color, items, capacity }) {
  const colorMap = {
    indigo: { bg: "bg-indigo-50", text: "text-indigo-700", avatar: "bg-indigo-100 text-indigo-600", badge: "bg-indigo-100 text-indigo-700", border: "border-indigo-100" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-700", avatar: "bg-emerald-100 text-emerald-600", badge: "bg-emerald-100 text-emerald-700", border: "border-emerald-100" },
  };
  const c = colorMap[color];
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className={`flex items-center justify-between px-5 py-3.5 border-b ${c.border} ${c.bg}`}>
        <h3 className={`text-sm font-bold ${c.text} flex items-center gap-2`}>
          {icon} {title}
        </h3>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.badge}`}>
          {items.length}{capacity != null ? ` / ${capacity}` : ""}
        </span>
      </div>
      {items.length === 0 ? (
        <div className="p-10 text-center text-sm text-slate-400 italic">No {title.toLowerCase()} assigned</div>
      ) : (
        <div className="p-3 max-h-[50vh] overflow-y-auto custom-scrollbar divide-y divide-slate-50">
          {items.map((person) => {
            const name = typeof person === "string" ? person : person.fullName;
            const key = typeof person === "string" ? person : person._id;
            return (
              <div key={key} className="flex items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-slate-50 transition-colors">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${c.avatar}`}>
                  {name.charAt(0).toUpperCase()}
                </div>
                <span className="text-slate-800 font-medium text-sm">{name}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
