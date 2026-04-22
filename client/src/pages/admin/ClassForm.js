import { useParams } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { Search, ChevronLeft, Save } from "lucide-react";
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
      <div className="w-full min-h-screen px-4 py-8 max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => nav("/admin/classes")}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-3xl font-bold text-gray-800">
            {isEdit ? "Edit Class" : "Add New Class"}
          </h1>
        </div>

        {globalError && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg font-medium">
            {globalError}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-gray-700">Class Name</label>
              <input
                className={`w-full border rounded-lg px-4 py-3 mt-1 outline-none transition-colors ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'}`}
                placeholder="Enter class name"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Course</label>
              <select
                className={`w-full border rounded-lg px-4 py-3 mt-1 outline-none transition-colors ${errors.courseId ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'}`}
                value={form.courseId}
                onChange={(e) => setField("courseId", e.target.value)}
              >
                <option value="">-- Select Course --</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.courseId && <p className="text-red-500 text-sm mt-1">{errors.courseId}</p>}
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Capacity</label>
              <input
                type="number"
                min="1"
                className={`w-full border rounded-lg px-4 py-3 mt-1 outline-none transition-colors ${errors.capacity ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'}`}
                placeholder="Maximum students"
                value={form.capacity}
                onChange={(e) => setField("capacity", e.target.value)}
              />
              {errors.capacity && <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>}
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Start Date</label>
              <input
                type="date"
                className={`w-full border rounded-lg px-4 py-3 mt-1 outline-none transition-colors ${errors.startDate ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'}`}
                value={form.startDate}
                onChange={(e) => setField("startDate", e.target.value)}
              />
              {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">End Date</label>
              <input
                type="date"
                className={`w-full border rounded-lg px-4 py-3 mt-1 outline-none transition-colors ${errors.endDate ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'}`}
                value={form.endDate}
                onChange={(e) => setField("endDate", e.target.value)}
              />
              {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
            </div>
            
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-gray-700">Status</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-3 mt-1 outline-none focus:border-blue-500"
                value={form.status}
                onChange={(e) => setField("status", e.target.value)}
              >
                <option value="ongoing">Ongoing</option>
                <option value="finished">Finished</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            {/* Teachers Selection */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center justify-between">
                <span>Select Teachers</span>
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{form.teachers.length} selected</span>
              </label>
              <div className="border border-gray-300 rounded-lg overflow-hidden flex flex-col h-72">
                <div className="p-3 border-b bg-gray-50 relative">
                  <Search className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search teachers..."
                    className="w-full bg-white border rounded px-3 py-1.5 pl-8 text-sm outline-none focus:border-blue-500"
                    value={teacherSearch}
                    onChange={(e) => setTeacherSearch(e.target.value)}
                  />
                </div>
                <div className="overflow-y-auto flex-1 p-2">
                  {filteredTeachers.map((t) => (
                    <label key={t._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        checked={form.teachers.includes(t._id)}
                        onChange={() => toggleSelection('teachers', t._id)}
                      />
                      <span className="text-gray-700">{t.fullName}</span>
                    </label>
                  ))}
                  {filteredTeachers.length === 0 && (
                     <div className="p-4 text-center text-sm text-gray-500">No teachers found.</div>
                  )}
                </div>
              </div>
              {errors.teachers && <p className="text-red-500 text-sm mt-1">{errors.teachers}</p>}
            </div>

            {/* Students Selection */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center justify-between">
                <span>Select Students</span>
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{form.students.length} selected</span>
              </label>
              <div className="border border-gray-300 rounded-lg overflow-hidden flex flex-col h-72">
                <div className="p-3 border-b bg-gray-50 relative">
                  <Search className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    className="w-full bg-white border rounded px-3 py-1.5 pl-8 text-sm outline-none focus:border-blue-500"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                  />
                </div>
                <div className="overflow-y-auto flex-1 p-2">
                  {filteredStudents.map((s) => (
                    <label key={s._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        checked={form.students.includes(s._id)}
                        onChange={() => toggleSelection('students', s._id)}
                      />
                      <span className="text-gray-700">{s.fullName}</span>
                    </label>
                  ))}
                  {filteredStudents.length === 0 && (
                     <div className="p-4 text-center text-sm text-gray-500">No students found.</div>
                  )}
                </div>
              </div>
              {errors.students && <p className="text-red-500 text-sm mt-1">{errors.students}</p>}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t flex justify-end gap-4">
            <button
              onClick={() => nav("/admin/classes")}
              className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md shadow-blue-500/30 transition-all flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              {isEdit ? "Update Class" : "Create Class"}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
