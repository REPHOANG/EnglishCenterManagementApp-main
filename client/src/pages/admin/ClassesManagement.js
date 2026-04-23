import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Search, Eye, Trash2, X, Edit2, CalendarPlus, BookOpen, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import ShowClassDetailModal from "../../components/admin/ShowClassDetailModal";

const STATUS_COLORS = {
  ongoing: "bg-blue-100 text-blue-700",
  finished: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
  default: "bg-gray-100 text-gray-700",
};

export default function ClassManagement() {
  const nav = useNavigate();
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [showDetail, setShowDetail] = useState(false);
  const [selected, setSelected] = useState(null);
  const [hoverRow, setHoverRow] = useState(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("http://localhost:9999/api/classes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) setClasses(data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this class?")) return;
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.delete(
        `http://localhost:9999/api/classes/delete/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) setClasses((p) => p.filter((c) => c._id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = classes.filter((c) => {
    const s = search.toLowerCase();
    const matchSearch =
      c.name.toLowerCase().includes(s) ||
      c.courseId?.name?.toLowerCase().includes(s);
    const matchStatus = status === "all" || c.status === status;
    return matchSearch && matchStatus;
  });

  const hasFilter = search !== "" || status !== "all";

  return (
    <AdminLayout>
      <div className="w-full h-full bg-[#f8fafc] p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <CalendarPlus size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 m-0 leading-tight">Class Management</h1>
              <p className="text-xs text-slate-500 m-0">{classes.length} total classes</p>
            </div>
          </div>
          
          <button
            onClick={() => nav("/admin/classes/add")}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl shadow-md shadow-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all font-medium text-sm"
          >
            <Plus size={16} />
            Add Class
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_200px_auto] gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Search</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  placeholder="Class name or course..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Status</label>
              <select
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="ongoing">Ongoing</option>
                <option value="finished">Finished</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <button
              onClick={() => { setSearch(""); setStatus("all"); }}
              disabled={!hasFilter}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                hasFilter 
                  ? "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer" 
                  : "bg-slate-50 border border-transparent text-slate-300 cursor-not-allowed"
              }`}
            >
              <X size={16} />
              Clear
            </button>
          </div>
          {hasFilter && (
            <div className="mt-3 text-xs text-slate-500">
              Showing <strong className="text-slate-900">{filtered.length}</strong> of {classes.length} classes
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Class Name</th>
                  <th className="px-5 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Course</th>
                  <th className="px-5 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Schedule</th>
                  <th className="px-5 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Capacity</th>
                  <th className="px-5 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((cl) => (
                  <tr 
                    key={cl._id} 
                    className="border-b border-slate-50 hover:bg-indigo-50/30 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100">
                          {cl.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-900 text-sm">{cl.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <BookOpen size={14} className="text-slate-400" />
                        <span className="truncate max-w-[150px]">{cl.courseId?.name || "-"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {new Date(cl.startDate).toLocaleDateString()} <span className="text-slate-300 mx-1">→</span> {new Date(cl.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-slate-400" />
                        <span className="text-sm font-medium text-slate-700">
                          {cl.students.length} <span className="text-slate-400 font-normal">/ {cl.capacity}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[cl.status] || STATUS_COLORS.default}`}>
                        {cl.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => nav(`/admin/classes/edit/${cl._id}`)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 border border-transparent transition-all"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => { setSelected(cl); setShowDetail(true); }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-sky-600 hover:bg-sky-50 hover:border-sky-200 border border-transparent transition-all"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(cl._id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 border border-transparent transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
                          <CalendarPlus size={24} className="text-slate-300" />
                        </div>
                        <p className="text-sm font-medium text-slate-500">No classes found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs text-slate-500">
              <span>Showing {filtered.length} entries</span>
            </div>
          )}
        </div>
      </div>

      {showDetail && selected && (
        <ShowClassDetailModal
          classData={selected}
          onClose={() => {
            setShowDetail(false);
            setSelected(null);
          }}
        />
      )}
    </AdminLayout>
  );
}
