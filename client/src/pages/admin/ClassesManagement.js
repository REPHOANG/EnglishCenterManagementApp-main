import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Search, Eye, Trash2, X, Edit, CalendarPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import ShowClassDetailModal from "../../components/admin/ShowClassDetailModal";

export default function ClassManagement() {
  const nav = useNavigate();
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [showDetail, setShowDetail] = useState(false);
  const [selected, setSelected] = useState(null);

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
    if (!window.confirm("Delete this class?")) return;
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.delete(
        `http://localhost:9999/api/classes/delete/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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

  return (
    <AdminLayout>
      <div className="w-full p-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Classes</h2>
          <button
            onClick={() => nav("/admin/classes/add")}
            className="flex items-center gap-2 px-5 py-2 bg-blue-500 text-white rounded shadow"
          >
            <Plus className="w-5 h-5" />
            Add Class
          </button>
        </div>

        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search className="w-5 h-5" />
                </span>
                <input
                  className="w-full border rounded pl-10 pr-3 py-2"
                  placeholder="Search classes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="all">All</option>
                <option value="ongoing">Ongoing</option>
                <option value="finished">Finished</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex items-end justify-end">
              <button
                onClick={() => {
                  setSearch("");
                  setStatus("all");
                }}
                className="flex items-center gap-1 px-4 py-2 bg-gray-100 border rounded"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            </div>
          </div>
        </div>

        <table className="min-w-full bg-white shadow-md border">
          <thead>
            <tr className="text-left text-gray-600 border-b">
              <th className="py-3 px-4">Class Name</th>
              <th className="py-3 px-4">Course Name</th>
              <th className="py-3 px-4">Start‑End</th>
              <th className="py-3 px-4">Capacity</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((cl) => (
              <tr key={cl._id} className="border-b last:border-none">
                <td className="py-4 px-4 font-semibold">{cl.name}</td>
                <td className="py-4 px-4">{cl.courseId?.name || "-"}</td>
                <td className="py-4 px-4">
                  {new Date(cl.startDate).toLocaleDateString()} –{" "}
                  {new Date(cl.endDate).toLocaleDateString()}
                </td>
                <td className="py-4 px-4">
                  {cl.students.length}/{cl.capacity}
                </td>
                <td className="py-4 px-4 capitalize">{cl.status}</td>
                <td className="py-4 px-4">
                  <div className="flex gap-3">
                    <button
                      className="text-gray-600 hover:text-blue-600"
                      title="Edit"
                      onClick={() => nav(`/admin/classes/edit/${cl._id}`)}
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      className="text-gray-600 hover:text-blue-600"
                      onClick={() => {
                        setSelected(cl);
                        setShowDetail(true);
                      }}
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      className="text-gray-600 hover:text-red-500"
                      onClick={() => handleDelete(cl._id)}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">
                  No classes found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
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
