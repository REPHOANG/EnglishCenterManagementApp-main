import { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  UserPlus,
  BookOpen,
  CalendarCheck,
  GraduationCap,
  LayoutDashboard,
  TrendingUp,
  Building2,
  Activity,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";

/* ─── Colour palette ─── */
const INDIGO = "#6366f1";
const PURPLE = "#8b5cf6";
const SKY = "#0ea5e9";
const EMERALD = "#10b981";
const AMBER = "#f59e0b";
const ROSE = "#f43f5e";
const TEAL = "#14b8a6";

export default function Dashboard() {
  const nav = useNavigate();

  const [totals, setTotals] = useState({
    users: 0,
    teachers: 0,
    students: 0,
    courses: 0,
    classes: 0,
    rooms: 0,
  });

  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

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

        const usersData = uRes.data?.data || [];
        const teachersData = tRes.data?.data || [];
        const studentsData = sRes.data?.data || [];
        const coursesData = cRes.data?.data || [];
        const classesData = clRes.data?.data || [];

        // Rooms may not require auth — fetch separately with fallback
        let roomsData = [];
        try {
          const rRes = await axios.get("http://localhost:9999/api/rooms", config);
          roomsData = rRes.data?.data || [];
        } catch (_) { /* ignore */ }

        setTotals({
          users: usersData.length,
          teachers: teachersData.length,
          students: studentsData.length,
          courses: coursesData.length,
          classes: classesData.length,
          rooms: roomsData.length,
        });
        setClasses(classesData);
        setCourses(coursesData);
      } catch (err) {
        console.error("Dashboard fetch failed", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ─── Derived chart data ─── */

  // Class status breakdown for Pie chart
  const classStatusData = (() => {
    const counts = { ongoing: 0, finished: 0, cancelled: 0 };
    classes.forEach((c) => {
      if (counts[c.status] !== undefined) counts[c.status]++;
    });
    return [
      { name: "Ongoing", value: counts.ongoing, color: EMERALD },
      { name: "Finished", value: counts.finished, color: SKY },
      { name: "Cancelled", value: counts.cancelled, color: ROSE },
    ].filter((d) => d.value > 0);
  })();

  // Course level breakdown for Bar chart
  const courseLevelData = (() => {
    const counts = { beginner: 0, intermediate: 0, advanced: 0 };
    courses.forEach((c) => {
      if (counts[c.level] !== undefined) counts[c.level]++;
    });
    return [
      { level: "Beginner", count: counts.beginner, fill: EMERALD },
      { level: "Intermediate", count: counts.intermediate, fill: AMBER },
      { level: "Advanced", count: counts.advanced, fill: ROSE },
    ];
  })();

  // User distribution bar chart data
  const userDistData = [
    { name: "Students", value: totals.students, fill: SKY },
    { name: "Teachers", value: totals.teachers, fill: PURPLE },
    { name: "Others", value: Math.max(0, totals.users - totals.students - totals.teachers), fill: INDIGO },
  ];

  // Simulate monthly enrollment trend (based on class startDates)
  const monthlyEnrollment = (() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const counts = new Array(12).fill(0);
    classes.forEach((c) => {
      if (c.startDate) {
        const m = new Date(c.startDate).getMonth();
        counts[m]++;
      }
    });
    return months.map((m, i) => ({ month: m, classes: counts[i] }));
  })();

  /* ─── Stat cards ─── */
  const statCards = [
    {
      label: "Total Users",
      value: totals.users,
      icon: <Users size={20} />,
      color: INDIGO,
      bg: "rgba(99,102,241,0.12)",
      link: "/admin/users",
      change: "+12%",
    },
    {
      label: "Teachers",
      value: totals.teachers,
      icon: <GraduationCap size={20} />,
      color: PURPLE,
      bg: "rgba(139,92,246,0.12)",
      link: "/admin/users",
      change: "+5%",
    },
    {
      label: "Students",
      value: totals.students,
      icon: <Users size={20} />,
      color: SKY,
      bg: "rgba(14,165,233,0.12)",
      link: "/admin/users",
      change: "+18%",
    },
    {
      label: "Active Courses",
      value: totals.courses,
      icon: <BookOpen size={20} />,
      color: AMBER,
      bg: "rgba(245,158,11,0.12)",
      link: "/admin/courses",
      change: "+3%",
    },
    {
      label: "Total Classes",
      value: totals.classes,
      icon: <CalendarCheck size={20} />,
      color: EMERALD,
      bg: "rgba(16,185,129,0.12)",
      link: "/admin/classes",
      change: "+8%",
    },
    {
      label: "Rooms",
      value: totals.rooms,
      icon: <Building2 size={20} />,
      color: TEAL,
      bg: "rgba(20,184,166,0.12)",
      link: "/admin/rooms",
      change: "0%",
    },
  ];

  const quickActions = [
    {
      label: "Add User",
      desc: "Register new student or teacher",
      icon: <UserPlus size={22} />,
      link: "/admin/users",
      color: INDIGO,
      bg: "rgba(99,102,241,0.1)",
    },
    {
      label: "Create Course",
      desc: "Design a new curriculum",
      icon: <BookOpen size={22} />,
      link: "/admin/courses",
      color: AMBER,
      bg: "rgba(245,158,11,0.1)",
    },
    {
      label: "Manage Classes",
      desc: "Schedule and organize classes",
      icon: <CalendarCheck size={22} />,
      link: "/admin/classes",
      color: EMERALD,
      bg: "rgba(16,185,129,0.1)",
    },
    {
      label: "Grades Overview",
      desc: "View student performance",
      icon: <TrendingUp size={22} />,
      link: "/admin/grades",
      color: ROSE,
      bg: "rgba(244,63,94,0.1)",
    },
  ];

  const card = {
    background: "#fff",
    borderRadius: "16px",
    padding: "20px 24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
    border: "1px solid rgba(0,0,0,0.05)",
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "50vh", gap: "12px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              border: "3px solid #e2e8f0",
              borderTopColor: INDIGO,
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <span style={{ color: "#64748b", fontWeight: 500 }}>Loading dashboard…</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={{ width: "100%", minHeight: "100%" }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                background: `linear-gradient(135deg, ${INDIGO}, ${PURPLE})`,
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
              }}
            >
              <LayoutDashboard size={18} />
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
              Admin Dashboard
            </h1>
          </div>
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0, marginLeft: "46px" }}>
            Welcome back! Here is the live overview of your learning management system.
          </p>
        </div>

        {/* ── Stat Cards ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "16px",
            marginBottom: "28px",
          }}
        >
          {statCards.map((s, i) => (
            <div
              key={i}
              onClick={() => nav(s.link)}
              style={{
                ...card,
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.10)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)";
              }}
            >
              {/* accent bar */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "3px",
                  background: s.color,
                  borderRadius: "16px 16px 0 0",
                }}
              />
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                    {s.label}
                  </p>
                  <p style={{ fontSize: "32px", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
                    {s.value}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "8px" }}>
                    <ArrowUpRight size={12} style={{ color: EMERALD }} />
                    <span style={{ fontSize: "11px", color: EMERALD, fontWeight: 600 }}>{s.change}</span>
                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>vs last month</span>
                  </div>
                </div>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    background: s.bg,
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: s.color,
                    flexShrink: 0,
                  }}
                >
                  {s.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Charts Row 1 ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>

          {/* Monthly Class Trend - Area Chart */}
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Monthly Class Openings</h2>
                <p style={{ fontSize: "12px", color: "#94a3b8", margin: "3px 0 0" }}>Classes started per month</p>
              </div>
              <div style={{ background: "rgba(99,102,241,0.1)", borderRadius: "8px", padding: "6px 10px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Activity size={13} style={{ color: INDIGO }} />
                <span style={{ fontSize: "11px", fontWeight: 600, color: INDIGO }}>This Year</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyEnrollment} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="classGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={INDIGO} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={INDIGO} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "none", borderRadius: "10px", color: "#fff", fontSize: "12px" }}
                  cursor={{ stroke: INDIGO, strokeWidth: 1, strokeDasharray: "4 2" }}
                />
                <Area type="monotone" dataKey="classes" stroke={INDIGO} strokeWidth={2.5} fill="url(#classGrad)" dot={{ fill: INDIGO, r: 3 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* User Distribution - Bar Chart */}
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: 0 }}>User Distribution</h2>
                <p style={{ fontSize: "12px", color: "#94a3b8", margin: "3px 0 0" }}>Breakdown by role</p>
              </div>
              <div style={{ background: "rgba(14,165,233,0.1)", borderRadius: "8px", padding: "6px 10px" }}>
                <Users size={13} style={{ color: SKY }} />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={userDistData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "none", borderRadius: "10px", color: "#fff", fontSize: "12px" }}
                  cursor={{ fill: "rgba(0,0,0,0.04)" }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {userDistData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Charts Row 2 ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>

          {/* Class Status Pie */}
          <div style={card}>
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Class Status</h2>
              <p style={{ fontSize: "12px", color: "#94a3b8", margin: "3px 0 0" }}>Current class distribution</p>
            </div>
            {classStatusData.length === 0 ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px", color: "#94a3b8", fontSize: "13px" }}>
                No class data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={classStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {classStatusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#0f172a", border: "none", borderRadius: "10px", color: "#fff", fontSize: "12px" }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "12px", color: "#64748b" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Course Level Bar */}
          <div style={card}>
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Courses by Level</h2>
              <p style={{ fontSize: "12px", color: "#94a3b8", margin: "3px 0 0" }}>Curriculum difficulty breakdown</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={courseLevelData} layout="vertical" margin={{ top: 0, right: 16, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="level" tick={{ fontSize: 13, fill: "#64748b" }} axisLine={false} tickLine={false} width={90} />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "none", borderRadius: "10px", color: "#fff", fontSize: "12px" }}
                  cursor={{ fill: "rgba(0,0,0,0.04)" }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={28}>
                  {courseLevelData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <Clock size={16} style={{ color: INDIGO }} />
            <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Quick Actions</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
            {quickActions.map((a, i) => (
              <div
                key={i}
                onClick={() => nav(a.link)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  background: a.bg,
                  border: `1px solid ${a.color}22`,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = `0 6px 20px ${a.color}22`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "10px",
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: a.color,
                    flexShrink: 0,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  {a.icon}
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{a.label}</div>
                  <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>{a.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
