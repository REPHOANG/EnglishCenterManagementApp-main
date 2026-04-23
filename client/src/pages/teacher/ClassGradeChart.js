import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const ClassGradeChart = ({ classId, teacherId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:9999/api/documents/${classId}/grade-stats`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data?.success) {
          setData(response.data.data);
        } else {
          setError("Failed to fetch grade statistics.");
        }
      } catch (err) {
        setError(err.response?.data?.message || "An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      fetchStats();
    }
  }, [classId]);

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
        Loading chart data...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#ef4444" }}>
        {error}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: "48px", textAlign: "center" }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>📊</div>
        <div style={{ color: "#94a3b8", fontSize: "14px" }}>
          Chưa có điểm để thống kê.
        </div>
      </div>
    );
  }

  // Calculate class average
  const classAvg =
    data.reduce((acc, curr) => acc + curr.average, 0) / data.length;

  return (
    <div style={{ padding: "16px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b", margin: 0 }}>
          Thống kê điểm học viên
        </h3>
        <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
          Biểu đồ hiển thị điểm 4 kỹ năng của từng học viên trong lớp.
        </p>
      </div>

      <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
        <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", flex: 1 }}>
          <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Tổng học viên</div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "#0f172a" }}>{data.length}</div>
        </div>
        <div style={{ padding: "16px", background: "#f0fdf4", borderRadius: "12px", border: "1px solid #bbf7d0", flex: 1 }}>
          <div style={{ fontSize: "12px", color: "#166534", fontWeight: 600, textTransform: "uppercase" }}>Điểm trung bình lớp</div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "#15803d" }}>{classAvg.toFixed(2)}</div>
        </div>
      </div>

      <div style={{ width: "100%", height: "450px", background: "#fff", borderRadius: "12px", padding: "16px", border: "1px solid #f1f5f9" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="studentName" 
              tick={{ fontSize: 12, fill: "#64748b" }}
              angle={-45}
              textAnchor="end"
              interval={0}
              height={80}
            />
            <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <Tooltip 
              cursor={{ fill: "#f1f5f9" }}
              contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
            />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />
            
            <ReferenceLine y={classAvg} label="TB Lớp" stroke="#ef4444" strokeDasharray="3 3" />
            
            <Bar dataKey="listening" name="Listening" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={15} />
            <Bar dataKey="reading" name="Reading" fill="#10b981" radius={[4, 4, 0, 0]} barSize={15} />
            <Bar dataKey="writing" name="Writing" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={15} />
            <Bar dataKey="speaking" name="Speaking" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={15} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ClassGradeChart;
