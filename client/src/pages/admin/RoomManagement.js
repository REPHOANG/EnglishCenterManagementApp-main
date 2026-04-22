import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Search, Edit, Trash2, X, Building } from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";

export default function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  const [form, setForm] = useState({
    name: "",
    capacity: "",
    type: "classroom",
    location: "",
    available: true,
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("http://localhost:9999/api/rooms", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setRooms(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.delete(
        `http://localhost:9999/api/rooms/delete/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (data.success) {
        setRooms((prev) => prev.filter((r) => r._id !== id));
      }
    } catch (e) {
      console.error(e);
      alert("Failed to delete room. It might be in use.");
    }
  };

  const handleSave = async () => {
    try {
      if (!form.name || !form.capacity || !form.location) {
        alert("Please fill all required fields");
        return;
      }
      
      const payload = { ...form, capacity: Number(form.capacity) };
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (editingRoom) {
        const { data } = await axios.put(
          `http://localhost:9999/api/rooms/update/${editingRoom._id}`,
          payload,
          config
        );
        if (data.success) {
          setRooms((prev) => prev.map((r) => (r._id === editingRoom._id ? data.data : r)));
        }
      } else {
        const { data } = await axios.post(
          "http://localhost:9999/api/rooms/add",
          payload,
          config
        );
        if (data.success) {
          setRooms((prev) => [...prev, data.data]);
        }
      }
      closeModal();
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || "Failed to save room.");
    }
  };

  const openAddModal = () => {
    setEditingRoom(null);
    setForm({
      name: "",
      capacity: "",
      type: "classroom",
      location: "",
      available: true,
    });
    setShowModal(true);
  };

  const openEditModal = (room) => {
    setEditingRoom(room);
    setForm({
      name: room.name,
      capacity: room.capacity,
      type: room.type,
      location: room.location,
      available: room.available,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRoom(null);
  };

  const filtered = rooms.filter((r) => {
    const s = search.toLowerCase();
    return (
      r.name.toLowerCase().includes(s) ||
      r.location.toLowerCase().includes(s) ||
      r.type.toLowerCase().includes(s)
    );
  });

  return (
    <AdminLayout>
      <div className="w-full min-h-screen px-4 py-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-xl">
              <Building className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Rooms</h1>
              <p className="text-gray-500">Manage classrooms, meeting rooms, and auditoriums</p>
            </div>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-md transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add Room</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="relative w-full max-w-md">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, location, or type..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-colors"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="text-sm text-gray-500 font-medium">
              Total: {filtered.length} rooms
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Type</th>
                  <th className="px-6 py-4 font-semibold">Capacity</th>
                  <th className="px-6 py-4 font-semibold">Location</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-800">{r.name}</td>
                    <td className="px-6 py-4 capitalize text-gray-600">{r.type}</td>
                    <td className="px-6 py-4 text-gray-600">{r.capacity} seats</td>
                    <td className="px-6 py-4 text-gray-600">{r.location}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${r.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {r.available ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(r)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(r._id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No rooms found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <Dialog open={true} onClose={closeModal} className="relative z-50">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <DialogPanel
                as={motion.div}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
              >
                <div className="px-6 py-4 border-b flex justify-between items-center">
                  <DialogTitle className="text-xl font-bold text-gray-800">
                    {editingRoom ? "Edit Room" : "Add New Room"}
                  </DialogTitle>
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. A101"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                        value={form.capacity}
                        onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                        placeholder="e.g. 30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                        value={form.type}
                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                      >
                        <option value="classroom">Classroom</option>
                        <option value="meeting room">Meeting Room</option>
                        <option value="auditorium">Auditorium</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      placeholder="e.g. Building A, Floor 1"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="available"
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      checked={form.available}
                      onChange={(e) => setForm({ ...form, available: e.target.checked })}
                    />
                    <label htmlFor="available" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Is Available
                    </label>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                  >
                    {editingRoom ? "Save Changes" : "Create Room"}
                  </button>
                </div>
              </DialogPanel>
            </div>
          </Dialog>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
