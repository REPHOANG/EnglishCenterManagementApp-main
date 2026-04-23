import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { MessageSquare } from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from "recharts";

const GradeDetails = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [gradeDetails, setGradeDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGradeDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const studentId = jwtDecode(token).id;
        const response = await axios.get(
          `http://localhost:9999/api/student/${studentId}/grades/class/${classId}`
        );
        
        const dataArr = response.data?.data;
        if (Array.isArray(dataArr) && dataArr.length > 0) {
          const grade = dataArr[0];
          const skills = Object.entries(grade.score || {}).map(
            ([name, score]) => ({
              name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize
              score: score,
              fullMark: 10
            })
          );
          setGradeDetails({
            className: grade.classId?.name || "",
            courseName: grade.classId?.courseId?.name || "",
            skills,
            comment: grade.comment || "",
          });
        } else {
          setGradeDetails(null);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching grade details:", err);
        setError("Failed to load grade details.");
        setLoading(false);
      }
    };
    fetchGradeDetails();
  }, [classId]);

  if (loading) return <div className="p-6 text-gray-500">Loading grade details...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!gradeDetails) return <div className="p-6 text-gray-500">No grade details found.</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-blue-800">
        Grade Details - Class: {gradeDetails.className}
      </h1>
      <h2 className="text-lg mb-2 text-gray-700">
        Course: {gradeDetails.courseName}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
        {/* Radar Chart Section */}
        <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col items-center">
          <h3 className="text-md font-semibold text-gray-700 mb-2">Biểu đồ kỹ năng</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={gradeDetails.skills}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="name" tick={{ fill: '#4b5563', fontSize: 13, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Radar
                  name="Điểm của bạn"
                  dataKey="score"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="#3b82f6"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grades Table & Comments */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
                <tr>
                  <th className="p-3 pl-4">Kỹ năng</th>
                  <th className="p-3 text-center">Điểm số</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {gradeDetails.skills.map((skill, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 pl-4 font-medium text-gray-700">{skill.name}</td>
                    <td className="p-3 text-center font-bold text-blue-600">{skill.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <h2 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              Nhận xét từ giáo viên
            </h2>
            <p className="text-gray-700 text-sm leading-relaxed italic">
              {gradeDetails.comment || "Chưa có nhận xét nào."}
            </p>
          </div>
        </div>
      </div>

      {/* Comments */}
      {gradeDetails.comment && (
        <div style={{
          background: "#fff", borderRadius: "14px",
          border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          overflow: "hidden",
        }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "8px" }}>
            <MessageSquare size={16} color="#059669" />
            <span style={{ fontWeight: 700, fontSize: "14px", color: "#0f172a" }}>Teacher Comments</span>
          </div>
          <div style={{ padding: "16px 20px" }}>
            {Array.isArray(gradeDetails.comment) ? (
              gradeDetails.comment.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {gradeDetails.comment.map((c, i) => (
                    <div key={i} style={{
                      background: "#f0fdf4", border: "1px solid #bbf7d0",
                      borderRadius: "8px", padding: "10px 14px",
                      fontSize: "13px", color: "#065f46",
                    }}>
                      {c}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>No comments yet</p>
              )
            ) : (
              <div style={{
                background: "#f0fdf4", border: "1px solid #bbf7d0",
                borderRadius: "8px", padding: "10px 14px",
                fontSize: "13px", color: "#065f46",
              }}>
                {gradeDetails.comment}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GradeDetails;
