import { useState } from "react";
import Navbar from "../components/student/Navbar";
import Sidebar from "../components/student/Sidebar";
import { Outlet } from "react-router-dom";

export default function StudentLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const handleToggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", background: "#f1f5f9" }}>
      <Navbar onToggleSidebar={handleToggleSidebar} />
      <main style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar with smooth slide */}
        <div style={{
          width: isSidebarOpen ? "240px" : "0px",
          overflow: "hidden",
          transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
          flexShrink: 0,
        }}>
          <Sidebar />
        </div>
        {/* Page content */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "auto",
          padding: "28px",
          background: "#f1f5f9",
        }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
