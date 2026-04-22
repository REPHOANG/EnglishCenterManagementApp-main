import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export function useClassForm(id) {
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

  return {
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
  };
}
