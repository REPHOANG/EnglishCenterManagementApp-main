import { useState, useEffect } from "react";
import axios from "axios";

export function useRoomManagement() {
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

  return {
    rooms,
    search,
    setSearch,
    showModal,
    editingRoom,
    form,
    setForm,
    filtered,
    handleDelete,
    handleSave,
    openAddModal,
    openEditModal,
    closeModal,
  };
}
