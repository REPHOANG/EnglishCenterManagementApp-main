import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FileText, Upload, Trash2, Download, Calendar, FileType2, Plus, Eye, AlertCircle, X, Save } from "lucide-react";

const AssignmentSubmissionsList = ({ documentId, deadline, onClose }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:9999/api/submissions/assignment/${documentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.success) {
        setSubmissions(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [documentId]);

  const handleGrade = async (subId, grade, feedback) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`http://localhost:9999/api/submissions/${subId}/grade`, { grade, feedback }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.success) {
        alert("Đã lưu điểm thành công");
        fetchSubmissions();
      }
    } catch (error) {
      console.error("Error grading submission:", error);
      alert("Lỗi khi lưu điểm");
    }
  };

  if (loading) return <div style={{ padding: "16px", color: "#64748b", fontSize: "13px" }}>Đang tải danh sách bài nộp...</div>;

  return (
    <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0", marginTop: "12px", position: "relative" }}>
      <button onClick={onClose} style={{ position: "absolute", top: "12px", right: "12px", background: "transparent", border: "none", cursor: "pointer", color: "#64748b" }}><X size={16} /></button>
      <h4 style={{ margin: "0 0 16px 0", fontSize: "14px", color: "#334155" }}>Danh sách bài nộp ({submissions.length})</h4>
      
      {submissions.length === 0 ? (
        <div style={{ color: "#94a3b8", fontSize: "13px", fontStyle: "italic" }}>Chưa có học viên nào nộp bài.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {submissions.map(sub => {
            const isLate = deadline && new Date(sub.submittedAt) > new Date(deadline);
            return (
              <div key={sub._id} style={{ background: "#fff", padding: "12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "14px", color: "#0f172a" }}>{sub.studentId?.fullName}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>
                      Thời gian nộp: {new Date(sub.submittedAt).toLocaleString("vi-VN")}
                      {isLate && <span style={{ marginLeft: "8px", color: "#ef4444", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px" }}><AlertCircle size={12}/> Nộp trễ</span>}
                    </div>
                  </div>
                  <a href={`http://localhost:9999/api/submissions/file/${sub._id}`} target="_blank" rel="noreferrer" style={{ fontSize: "12px", color: "#0284c7", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Download size={14} /> Tải bài làm
                  </a>
                </div>
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleGrade(sub._id, e.target.grade.value, e.target.feedback.value);
                }} style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginTop: "12px", borderTop: "1px dashed #e2e8f0", paddingTop: "12px" }}>
                  <div style={{ flex: 1 }}>
                    <input type="number" name="grade" defaultValue={sub.grade !== null ? sub.grade : ""} step="0.1" min="0" max="10" placeholder="Điểm (0-10)" style={{ width: "100px", padding: "6px 8px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "13px", marginBottom: "6px", boxSizing: "border-box" }} required />
                    <input type="text" name="feedback" defaultValue={sub.feedback} placeholder="Nhận xét..." style={{ width: "100%", padding: "6px 8px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }} />
                  </div>
                  <button type="submit" style={{ display: "flex", alignItems: "center", gap: "4px", background: "#10b981", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", fontSize: "13px", fontWeight: 600, cursor: "pointer", height: "fit-content" }}>
                    <Save size={14} /> Lưu
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const DocumentManager = ({ classId }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [viewingSubmissionsId, setViewingSubmissionsId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "material",
    deadline: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:9999/api/documents/${classId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data?.success) {
        setDocuments(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classId) fetchDocuments();
  }, [classId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !formData.title) {
      alert("Vui lòng nhập tên tài liệu và chọn file.");
      return;
    }

    try {
      setUploading(true);
      const token = localStorage.getItem("token");
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("type", formData.type);
      if (formData.type === "assignment" && formData.deadline) {
        submitData.append("deadline", formData.deadline);
      }
      submitData.append("file", selectedFile);

      const response = await axios.post(
        `http://localhost:9999/api/documents/${classId}/upload`,
        submitData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data?.success) {
        setShowUploadForm(false);
        setFormData({ title: "", description: "", type: "material", deadline: "" });
        setSelectedFile(null);
        fetchDocuments(); // Refresh list
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      alert("Có lỗi xảy ra khi tải lên.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `http://localhost:9999/api/documents/${docId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data?.success) {
        setDocuments(documents.filter((doc) => doc._id !== docId));
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Không thể xóa tài liệu.");
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div style={{ padding: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b", margin: 0 }}>Tài liệu & Bài tập</h3>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0 0" }}>Quản lý tài liệu học tập và giao bài tập cho lớp</p>
        </div>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: showUploadForm ? "#f1f5f9" : "#0284c7",
            color: showUploadForm ? "#475569" : "#fff",
            border: "none", padding: "8px 16px", borderRadius: "8px",
            fontSize: "13px", fontWeight: 600, cursor: "pointer"
          }}
        >
          {showUploadForm ? "Hủy" : <><Plus size={16} /> Thêm tài liệu</>}
        </button>
      </div>

      {showUploadForm && (
        <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "12px", border: "1px dashed #cbd5e1", marginBottom: "24px" }}>
          <form onSubmit={handleUpload}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Tên tài liệu *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Loại</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", boxSizing: "border-box" }}
                >
                  <option value="material">Tài liệu học</option>
                  <option value="assignment">Bài tập (Có hạn nộp)</option>
                </select>
              </div>
            </div>

            {formData.type === "assignment" && (
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Hạn nộp (Deadline)</label>
                <input
                  type="datetime-local"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  required={formData.type === "assignment"}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", boxSizing: "border-box" }}
                />
              </div>
            )}

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Mô tả (Tùy chọn)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="2"
                style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", boxSizing: "border-box", resize: "vertical" }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>File đính kèm * (.doc, .docx, .xls, .xlsx, .pdf)</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".doc,.docx,.xls,.xlsx,.pdf"
                required
                style={{ fontSize: "13px" }}
              />
            </div>

            <button
              type="submit"
              disabled={uploading}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                background: uploading ? "#94a3b8" : "#10b981",
                color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px",
                fontSize: "14px", fontWeight: 600, cursor: uploading ? "not-allowed" : "pointer"
              }}
            >
              <Upload size={16} /> {uploading ? "Đang tải lên..." : "Tải lên tài liệu"}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Đang tải danh sách tài liệu...</div>
      ) : documents.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", background: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
          <FileText size={48} color="#94a3b8" style={{ marginBottom: "12px", opacity: 0.5 }} />
          <div style={{ color: "#475569", fontWeight: 500 }}>Chưa có tài liệu nào</div>
          <div style={{ color: "#94a3b8", fontSize: "13px" }}>Bấm "Thêm tài liệu" để bắt đầu chia sẻ file với học viên.</div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {documents.map((doc) => (
            <React.Fragment key={doc._id}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0",
              background: "#fff", transition: "box-shadow 0.2s"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{
                  width: "48px", height: "48px", borderRadius: "10px",
                  background: doc.type === "assignment" ? "#fef2f2" : "#eff6ff",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <FileType2 size={24} color={doc.type === "assignment" ? "#ef4444" : "#3b82f6"} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
                    {doc.title}
                    <span style={{
                      fontSize: "10px", padding: "2px 8px", borderRadius: "12px",
                      background: doc.type === "assignment" ? "#fee2e2" : "#e0f2fe",
                      color: doc.type === "assignment" ? "#991b1b" : "#075985", textTransform: "uppercase", fontWeight: 700
                    }}>
                      {doc.type === "assignment" ? "Bài tập" : "Tài liệu"}
                    </span>
                  </div>
                  {doc.description && <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>{doc.description}</div>}
                  <div style={{ display: "flex", gap: "16px", marginTop: "6px", fontSize: "12px", color: "#94a3b8" }}>
                    <span>{doc.fileOriginalName} ({formatFileSize(doc.fileSize)})</span>
                    {doc.type === "assignment" && doc.deadline && (
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#ea580c" }}>
                        <Calendar size={12} /> Hạn nộp: {new Date(doc.deadline).toLocaleString("vi-VN")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div style={{ display: "flex", gap: "8px" }}>
                <a
                  href={`http://localhost:9999/api/documents/file/${doc._id}`}
                  target="_blank" rel="noreferrer"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: "36px", height: "36px", borderRadius: "8px",
                    background: "#f1f5f9", color: "#475569", textDecoration: "none",
                    transition: "all 0.2s"
                  }}
                  title="Tải xuống"
                >
                  <Download size={18} />
                </a>
                
                {doc.type === "assignment" && (
                  <button
                    onClick={() => setViewingSubmissionsId(viewingSubmissionsId === doc._id ? null : doc._id)}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      width: "36px", height: "36px", borderRadius: "8px", border: "none", cursor: "pointer",
                      background: viewingSubmissionsId === doc._id ? "#dcfce7" : "#f0fdf4", 
                      color: "#16a34a", transition: "all 0.2s"
                    }}
                    title="Xem bài nộp"
                  >
                    <Eye size={18} />
                  </button>
                )}
                
                <button
                  onClick={() => handleDelete(doc._id)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: "36px", height: "36px", borderRadius: "8px", border: "none", cursor: "pointer",
                    background: "#fef2f2", color: "#ef4444", transition: "all 0.2s"
                  }}
                  title="Xóa tài liệu"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            {viewingSubmissionsId === doc._id && (
              <AssignmentSubmissionsList 
                documentId={doc._id} 
                deadline={doc.deadline} 
                onClose={() => setViewingSubmissionsId(null)} 
              />
            )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentManager;
