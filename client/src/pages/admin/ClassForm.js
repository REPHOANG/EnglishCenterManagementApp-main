import { useParams } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { Search, ChevronLeft, Save, Users, UserCheck, BookOpen, Hash, Calendar, AlertCircle } from "lucide-react";
import { useClassForm } from "../../hooks/admin/useClassForm";

export default function ClassForm() {
  const { id } = useParams();
  const {
    isEdit,
    form,
    errors,
    globalError,
    courses,
    teacherSearch,
    setTeacherSearch,
    studentSearch,
    setStudentSearch,
    filteredTeachers,
    filteredStudents,
    setField,
    toggleSelection,
    handleSubmit,
    nav,
  } = useClassForm(id);

  return (
    <AdminLayout>
      <div className="w-full min-h-screen bg-[#f8fafc] px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => nav("/admin/classes")}
              className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 m-0">
                {isEdit ? "Edit Class" : "Add New Class"}
              </h1>
              <p className="text-sm text-slate-500 m-0 mt-1">
                {isEdit ? "Update the information of the selected class." : "Fill out the information below to create a new class."}
              </p>
            </div>
          </div>

          {globalError && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-medium text-sm flex items-center gap-2 shadow-sm">
              <AlertCircle size={18} />
              {globalError}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              
              {/* Class Name */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Class Name</label>
                <div className="relative">
                  <Hash size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm outline-none transition-all ${errors.name ? 'border-rose-400 focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-100' : 'border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'}`}
                    placeholder="e.g. IELTS Foundation 01"
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                  />
                </div>
                {errors.name && <p className="text-rose-500 text-xs mt-1.5">{errors.name}</p>}
              </div>

              {/* Course */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Course</label>
                <div className="relative">
                  <BookOpen size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm outline-none appearance-none transition-all cursor-pointer ${errors.courseId ? 'border-rose-400 focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-100' : 'border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'}`}
                    value={form.courseId}
                    onChange={(e) => setField("courseId", e.target.value)}
                  >
                    <option value="" disabled>-- Select Course --</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.courseId && <p className="text-rose-500 text-xs mt-1.5">{errors.courseId}</p>}
              </div>

              {/* Capacity */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Capacity</label>
                <div className="relative">
                  <Users size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    min="1"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm outline-none transition-all ${errors.capacity ? 'border-rose-400 focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-100' : 'border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'}`}
                    placeholder="Maximum students"
                    value={form.capacity}
                    onChange={(e) => setField("capacity", e.target.value)}
                  />
                </div>
                {errors.capacity && <p className="text-rose-500 text-xs mt-1.5">{errors.capacity}</p>}
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Start Date</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm outline-none transition-all ${errors.startDate ? 'border-rose-400 focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-100' : 'border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'}`}
                    value={form.startDate}
                    onChange={(e) => setField("startDate", e.target.value)}
                  />
                </div>
                {errors.startDate && <p className="text-rose-500 text-xs mt-1.5">{errors.startDate}</p>}
              </div>

              {/* End Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">End Date</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm outline-none transition-all ${errors.endDate ? 'border-rose-400 focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-100' : 'border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'}`}
                    value={form.endDate}
                    onChange={(e) => setField("endDate", e.target.value)}
                  />
                </div>
                {errors.endDate && <p className="text-rose-500 text-xs mt-1.5">{errors.endDate}</p>}
              </div>
              
              {/* Status */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Status</label>
                <select
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none appearance-none cursor-pointer focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  value={form.status}
                  onChange={(e) => setField("status", e.target.value)}
                >
                  <option value="ongoing">Ongoing</option>
                  <option value="finished">Finished</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-6">Assign Members</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Teachers Selection */}
                <div>
                  <label className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    <div className="flex items-center gap-1.5"><UserCheck size={14} /> Select Teachers</div>
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{form.teachers.length} selected</span>
                  </label>
                  <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col h-72 bg-white">
                    <div className="p-2.5 border-b border-slate-100 bg-slate-50 relative">
                      <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search teachers..."
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 pl-8 text-sm outline-none focus:border-indigo-500 transition-colors"
                        value={teacherSearch}
                        onChange={(e) => setTeacherSearch(e.target.value)}
                      />
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 custom-scrollbar">
                      {filteredTeachers.map((t) => (
                        <label key={t._id} className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors mb-1 ${form.teachers.includes(t._id) ? 'bg-indigo-50/50 hover:bg-indigo-50' : 'hover:bg-slate-50'}`}>
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 transition-all cursor-pointer"
                            checked={form.teachers.includes(t._id)}
                            onChange={() => toggleSelection('teachers', t._id)}
                          />
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-[10px]">
                              {t.fullName.charAt(0)}
                            </div>
                            <span className={`text-sm ${form.teachers.includes(t._id) ? 'font-semibold text-indigo-900' : 'text-slate-700'}`}>{t.fullName}</span>
                          </div>
                        </label>
                      ))}
                      {filteredTeachers.length === 0 && (
                         <div className="p-6 text-center text-sm text-slate-400 italic">No teachers found.</div>
                      )}
                    </div>
                  </div>
                  {errors.teachers && <p className="text-rose-500 text-xs mt-1.5">{errors.teachers}</p>}
                </div>

                {/* Students Selection */}
                <div>
                  <label className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    <div className="flex items-center gap-1.5"><Users size={14} /> Select Students</div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{form.students.length} selected</span>
                  </label>
                  <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col h-72 bg-white">
                    <div className="p-2.5 border-b border-slate-100 bg-slate-50 relative">
                      <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search students..."
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 pl-8 text-sm outline-none focus:border-emerald-500 transition-colors"
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                      />
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 custom-scrollbar">
                      {filteredStudents.map((s) => (
                        <label key={s._id} className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors mb-1 ${form.students.includes(s._id) ? 'bg-emerald-50/50 hover:bg-emerald-50' : 'hover:bg-slate-50'}`}>
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 transition-all cursor-pointer"
                            checked={form.students.includes(s._id)}
                            onChange={() => toggleSelection('students', s._id)}
                          />
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-[10px]">
                              {s.fullName.charAt(0)}
                            </div>
                            <span className={`text-sm ${form.students.includes(s._id) ? 'font-semibold text-emerald-900' : 'text-slate-700'}`}>{s.fullName}</span>
                          </div>
                        </label>
                      ))}
                      {filteredStudents.length === 0 && (
                         <div className="p-6 text-center text-sm text-slate-400 italic">No students found.</div>
                      )}
                    </div>
                  </div>
                  {errors.students && <p className="text-rose-500 text-xs mt-1.5">{errors.students}</p>}
                </div>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => nav("/admin/classes")}
                className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium rounded-xl shadow-md shadow-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/40 transition-all flex items-center gap-2 text-sm"
              >
                <Save size={18} />
                {isEdit ? "Update Class" : "Create Class"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
