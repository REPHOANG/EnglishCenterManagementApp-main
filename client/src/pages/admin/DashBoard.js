import { useEffect, useState } from "react";
import axios from "axios";
import { Users, UserPlus, BookOpen, CalendarCheck, GraduationCap, LayoutDashboard, PlusCircle } from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const nav = useNavigate();

  const [totals, setTotals] = useState({
    users: 0,
    teachers: 0,
    students: 0,
    courses: 0,
    classes: 0,
  });

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [uRes, tRes, sRes, cRes, clRes] = await Promise.all([
          axios.get("http://localhost:9999/api/users", config),
          axios.get("http://localhost:9999/api/users/by-role?roleId=r2", config),
          axios.get("http://localhost:9999/api/users/by-role?roleId=r3", config),
          axios.get("http://localhost:9999/api/courses", config),
          axios.get("http://localhost:9999/api/classes", config),
        ]);

        const users = uRes.data?.data || [];
        const teachers = tRes.data?.data || [];
        const students = sRes.data?.data || [];
        const courses = cRes.data?.data || [];
        const classes = clRes.data?.data || [];

        setTotals({
          users: users.length,
          teachers: teachers.length,
          students: students.length,
          courses: courses.length,
          classes: classes.length,
        });
      } catch (err) {
        console.error("Dashboard fetch failed", err);
      }
    })();
  }, []);

  /* ---------- cards & quick actions ---------- */
  const stats = [
    {
      label: "Total Users",
      value: totals.users,
      color: "from-blue-500 to-blue-700",
      icon: <Users className="h-8 w-8 text-white" />,
    },
    {
      label: "Teachers",
      value: totals.teachers,
      color: "from-purple-500 to-purple-700",
      icon: <GraduationCap className="h-8 w-8 text-white" />,
    },
    {
      label: "Students",
      value: totals.students,
      color: "from-green-500 to-green-700",
      icon: <Users className="h-8 w-8 text-white" />,
    },
    {
      label: "Active Courses",
      value: totals.courses,
      color: "from-orange-500 to-orange-700",
      icon: <BookOpen className="h-8 w-8 text-white" />,
    },
    {
      label: "Total Classes",
      value: totals.classes,
      color: "from-teal-500 to-teal-700",
      icon: <CalendarCheck className="h-8 w-8 text-white" />,
    },
  ];

  const actions = [
    {
      label: "Add New User",
      desc: "Register a new student, teacher or staff",
      icon: <UserPlus className="h-6 w-6 text-blue-600" />,
      link: "/admin/users",
      bgColor: "bg-blue-50",
    },
    {
      label: "Create Course",
      desc: "Design a new curriculum",
      icon: <BookOpen className="h-6 w-6 text-orange-600" />,
      link: "/admin/courses",
      bgColor: "bg-orange-50",
    },
    {
      label: "Manage Classes",
      desc: "Schedule and organize classes",
      icon: <CalendarCheck className="h-6 w-6 text-teal-600" />,
      link: "/admin/classes",
      bgColor: "bg-teal-50",
    },
  ];

  return (
    <AdminLayout>
      <div className="w-full min-h-screen">
        <div className="flex items-center gap-3 mb-2">
          <LayoutDashboard className="w-8 h-8 text-blue-800" />
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        </div>
        <p className="text-gray-500 mb-8 font-medium">
          Welcome back! Here is the overview of your learning management system.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {stats.map((s, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-6 flex items-center justify-between shadow-lg shadow-gray-200/50 bg-gradient-to-r ${s.color} transform transition-transform duration-300 hover:scale-[1.02]`}
            >
              <div>
                <p className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-1">{s.label}</p>
                <p className="text-4xl font-extrabold text-white">{s.value}</p>
              </div>
              <div className="bg-white/20 p-4 rounded-full shadow-inner border border-white/20">
                {s.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <PlusCircle className="w-6 h-6 text-gray-600" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {actions.map((a, idx) => (
              <div
                key={idx}
                onClick={() => nav(a.link)}
                className={`p-6 rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-all duration-300 flex items-start gap-4 ${a.bgColor} hover:bg-opacity-80`}
              >
                <div className="bg-white p-3 rounded-xl shadow-sm">
                  {a.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-1">{a.label}</h3>
                  <p className="text-sm text-gray-600">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

