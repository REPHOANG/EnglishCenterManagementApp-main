import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { Search, ChevronLeft, Save } from "lucide-react";

export default function ClassForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const nav = useNavigate();

  const [courses, setCourses] = useState([]);
  const [teachersList, setTeachersList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);

  // Search terms for filtering checkboxes
  const [teacherSearch, setTeacherSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    courseId: "",
    startDate: "",
    endDate: "",
    capacity: "",
    status: "ongoing",
    teachers: [],
    students: [],
    schedule: [],
  });

  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [cRes, tRes, stuRes] = await Promise.all([
          axios.get("http://localhost:9999/api/courses", config),
          axios.get("http://localhost:9999/api/users/by-role?roleId=r2", config),
          axios.get("http://localhost:9999/api/users/by-role?roleId=r3", config),
        ]);
        setCourses(cRes.data?.data || []);
        setTeachersList(tRes.data?.data || []);
        setStudentsList(stuRes.data?.data || []);

        if (isEdit) {
          const res = await axios.get(`http://localhost:9999/api/classes/${id}/admin`, config);
          const classData = res.data?.data;
          if (classData) {
            setForm({
              name: classData.name || "",
              courseId: classData.courseId?._id || classData.courseId || "",
              startDate: classData.startDate ? classData.startDate.slice(0, 10) : "",
              endDate: classData.endDate ? classData.endDate.slice(0, 10) : "",
              capacity: classData.capacity || "",
              status: classData.status || "ongoing",
              teachers: classData.teachers.map((t) => t._id || t),
              students: classData.students.map((s) => s._id || s),
              schedule: classData.schedule || [], // preserve existing schedule
            });
          }
        }
      } catch (e) {
        console.error("Fetch data failed", e);
        setGlobalError("Failed to fetch initial data.");
      }
    })();
  }, [id, isEdit]);

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error for that field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setGlobalError("");
  };

  const toggleSelection = (field, itemId) => {
    setForm((prev) => {
      const isSelected = prev[field].includes(itemId);
      const newSelection = isSelected
        ? prev[field].filter((item) => item !== itemId)
        : [...prev[field], itemId];
      return { ...prev, [field]: newSelection };
    });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Class name required";
    if (!form.courseId) e.courseId = "Course required";
    if (!form.capacity || isNaN(form.capacity) || form.capacity < 1) {
      e.capacity = "Capacity must be > 0";
    }

    if (!form.startDate) e.startDate = "Start date required";
    if (!form.endDate) e.endDate = "End date required";

    // Date validation
    if (form.startDate && form.endDate) {
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (!isEdit && start < today) {
        e.startDate = "Start date cannot be in the past";
      }
      if (end < start) {
        e.endDate = "End date cannot be before start date";
      }
    }

    if (form.teachers.length === 0) e.teachers = "At least 1 teacher required";
    if (form.students.length === 0) {
      e.students = "At least 1 student required";
    } else if (form.capacity && form.students.length > +form.capacity) {
      e.students = "Class is full or exceeds capacity";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setGlobalError("");

    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const payload = {
        ...form,
        capacity: Number(form.capacity),
        // Pass original schedule, backend will not overwrite it if we don't change it. 
        // If adding, it passes an empty array.
      };

      if (isEdit) {
        await axios.put(`http://localhost:9999/api/classes/update/${id}`, payload, config);
      } else {
        await axios.post("http://localhost:9999/api/classes/add", payload, config);
      }
      nav("/admin/classes");
    } catch (err) {
      console.error("Failed to save class", err);
      setGlobalError(err.response?.data?.message || "Failed to save class. Please try again.");
    }
  };

  const filteredTeachers = teachersList.filter((t) =>
    t.fullName?.toLowerCase().includes(teacherSearch.toLowerCase())
  );
  const filteredStudents = studentsList.filter((s) =>
    s.fullName?.toLowerCase().includes(studentSearch.toLowerCase())
  );

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
