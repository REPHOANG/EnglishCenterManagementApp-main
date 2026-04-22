import React, { useState } from 'react';
import axios from 'axios';
import { Pencil, Check, X } from 'lucide-react';

const SCORE_FIELDS = ["listening", "reading", "writing", "speaking"];

const getGradeStyle = (avg) => {
  if (avg >= 8) return { bg: "#d1fae5", text: "#065f46" };
  if (avg >= 6.5) return { bg: "#fef3c7", text: "#92400e" };
  return { bg: "#fee2e2", text: "#991b1b" };
};

const calculateAverage = (score) => {
  if (!score || typeof score !== 'object') return 0;
  const vals = SCORE_FIELDS.map(f => score[f]).filter(v => v != null && !isNaN(v));
  if (!vals.length) return 0;
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
};

const Grades = ({ grades, onGradeUpdate }) => {
  const [editingGrade, setEditingGrade] = useState(null);
  const [formData, setFormData] = useState({ listening: 0, reading: 0, writing: 0, speaking: 0, comment: '' });
  const [loading, setLoading] = useState(false);

  if (!grades || grades.length === 0) {
    return (
      <div style={{ padding: "48px", textAlign: "center" }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>📋</div>
        <div style={{ color: "#94a3b8", fontSize: "14px" }}>No grades available for this class.</div>
      </div>
    );
  }

  const handleEditClick = (grade) => {
    setEditingGrade(grade.id);
    setFormData({
      listening: grade.score?.listening || 0,
      reading: grade.score?.reading || 0,
      writing: grade.score?.writing || 0,
      speaking: grade.score?.speaking || 0,
      comment: grade.comment || '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'comment' ? value : parseFloat(value) || 0 }));
  };

  const handleSave = async (gradeId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `http://localhost:9999/api/teacher/grades/${gradeId}`,
        { score: { listening: formData.listening, reading: formData.reading, writing: formData.writing, speaking: formData.speaking }, comment: formData.comment },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      if (response.data.success) {
        if (onGradeUpdate) onGradeUpdate();
        setEditingGrade(null);
      }
    } catch (error) {
      console.error('Error updating grade:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingGrade(null);
    setFormData({ listening: 0, reading: 0, writing: 0, speaking: 0, comment: '' });
  };

  const scoreInput = (field) => (
    <input
      type="number"
      name={field}
      value={formData[field]}
      onChange={handleInputChange}
      min="0" max="10" step="0.1"
      style={{
        width: "56px", padding: "4px 6px", border: "1.5px solid #c7d2fe",
        borderRadius: "7px", textAlign: "center", fontSize: "13px",
        outline: "none", background: "#eef2ff", color: "#4338ca", fontWeight: 600,
      }}
    />
  );

  return (
    <div>
      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
        <span style={{ fontSize: "13px", fontWeight: 600, color: "#64748b" }}>
          {grades.length} student{grades.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["Student", "Listening", "Reading", "Writing", "Speaking", "Average", "Comment", ""].map(h => (
                <th key={h} style={{
                  padding: "12px 14px", fontSize: "11px", fontWeight: 700,
                  color: "#94a3b8", textAlign: h === "Student" || h === "Comment" ? "left" : "center",
                  letterSpacing: "0.7px", textTransform: "uppercase", borderBottom: "1px solid #f1f5f9",
                  whiteSpace: "nowrap",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grades.map((grade, idx) => {
              const avg = parseFloat(calculateAverage(grade.score));
              const gs = getGradeStyle(avg);
              const isEditing = editingGrade === grade.id;

              return (
                <tr
                  key={grade.id}
                  style={{ borderBottom: idx < grades.length - 1 ? "1px solid #f8fafc" : "none", background: isEditing ? "#fafbff" : "transparent", transition: "background 0.15s" }}
                  onMouseEnter={e => { if (!isEditing) e.currentTarget.style.background = "#fafbff"; }}
                  onMouseLeave={e => { if (!isEditing) e.currentTarget.style.background = "transparent"; }}
                >
                  {/* Student name */}
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{
                        width: "30px", height: "30px", borderRadius: "50%",
                        background: `hsl(${(idx * 53) % 360}, 65%, 92%)`,
                        color: `hsl(${(idx * 53) % 360}, 55%, 40%)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 700, fontSize: "12px", flexShrink: 0,
                      }}>
                        {grade.student?.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <span style={{ fontWeight: 600, color: "#1e293b", fontSize: "13px" }}>{grade.student.name}</span>
                    </div>
                  </td>

                  {/* Score cells */}
                  {SCORE_FIELDS.map(field => (
                    <td key={field} style={{ padding: "12px 14px", textAlign: "center" }}>
                      {isEditing ? scoreInput(field) : (
                        <span style={{ fontSize: "14px", fontWeight: 600, color: "#475569" }}>
                          {grade?.score?.[field] ?? 0}
                        </span>
                      )}
                    </td>
                  ))}

                  {/* Average */}
                  <td style={{ padding: "12px 14px", textAlign: "center" }}>
                    <span style={{
                      display: "inline-block", padding: "2px 10px", borderRadius: "20px",
                      background: gs.bg, color: gs.text, fontSize: "12px", fontWeight: 700,
                    }}>
                      {avg.toFixed(1)}
                    </span>
                  </td>

                  {/* Comment */}
                  <td style={{ padding: "12px 14px", maxWidth: "180px" }}>
                    {isEditing ? (
                      <textarea
                        name="comment"
                        value={formData.comment}
                        onChange={handleInputChange}
                        rows={2}
                        placeholder="Enter comment..."
                        style={{
                          width: "100%", padding: "6px 8px", borderRadius: "8px",
                          border: "1.5px solid #e2e8f0", fontSize: "12px",
                          resize: "vertical", outline: "none", color: "#475569",
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: "13px", color: grade.comment ? "#475569" : "#cbd5e1", fontStyle: grade.comment ? "normal" : "italic" }}>
                        {grade.comment || "No comment"}
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "12px 14px", textAlign: "center", whiteSpace: "nowrap" }}>
                    {isEditing ? (
                      <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                        <button
                          onClick={() => handleSave(grade.id)}
                          disabled={loading}
                          style={{
                            display: "flex", alignItems: "center", gap: "4px",
                            padding: "5px 12px", borderRadius: "8px",
                            background: loading ? "#e2e8f0" : "#10b981", color: "#fff",
                            border: "none", fontSize: "12px", fontWeight: 600, cursor: "pointer",
                          }}
                        >
                          <Check size={12} /> {loading ? "..." : "Save"}
                        </button>
                        <button
                          onClick={handleCancel}
                          style={{
                            display: "flex", alignItems: "center", gap: "4px",
                            padding: "5px 10px", borderRadius: "8px",
                            background: "#f1f5f9", color: "#64748b",
                            border: "none", fontSize: "12px", fontWeight: 600, cursor: "pointer",
                          }}
                        >
                          <X size={12} /> Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditClick(grade)}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: "5px",
                          padding: "5px 12px", borderRadius: "8px",
                          background: "#e0f2fe", color: "#0284c7",
                          border: "1.5px solid #bae6fd", fontSize: "12px", fontWeight: 600, cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#0284c7"; e.currentTarget.style.color = "#fff"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "#e0f2fe"; e.currentTarget.style.color = "#0284c7"; }}
                      >
                        <Pencil size={11} /> Edit
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Grades;