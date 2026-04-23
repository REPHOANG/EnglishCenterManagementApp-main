import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FileText, Download, Calendar, FileType2, ArrowLeft, Filter } from "lucide-react";

const ClassDocuments = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, material, assignment

  useEffect(() => {
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

    fetchDocuments();
  }, [classId]);

  const filteredDocs = documents.filter(doc => filter === "all" || doc.type === filter);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 transition-colors font-medium text-sm"
      >
        <ArrowLeft size={16} /> Back to Class
      </button>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Documents & Exercises</h1>
          <p className="text-gray-500 text-sm mt-1">List of learning materials shared by the teacher</p>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border">
          <Filter size={16} className="text-gray-400 ml-2" />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="bg-transparent border-none text-sm font-medium text-gray-700 outline-none pr-4 py-2 cursor-pointer"
          >
            <option value="all">All Documents</option>
            <option value="material">Materials Only</option>
            <option value="assignment">Assignments Only</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading documents...</div>
      ) : filteredDocs.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center flex flex-col items-center">
          <FileText size={64} className="text-gray-300 mb-4" />
          <div className="text-gray-600 font-medium text-lg">No documents found</div>
          <div className="text-gray-400 text-sm mt-1">The teacher has not uploaded any materials or assignments for this class yet.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocs.map((doc) => (
            <div key={doc._id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all group flex flex-col justify-between">
              <div className="flex gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  doc.type === "assignment" ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"
                }`}>
                  <FileType2 size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-base flex items-center gap-2 flex-wrap">
                    {doc.title}
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      doc.type === "assignment" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                    }`}>
                      {doc.type === "assignment" ? "Assignment" : "Material"}
                    </span>
                  </h3>
                  {doc.description && (
                    <p className="text-gray-500 text-sm mt-1.5 line-clamp-2">{doc.description}</p>
                  )}
                </div>
              </div>
              
              <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-400 font-medium">
                    {doc.fileOriginalName} ({formatFileSize(doc.fileSize)})
                  </span>
                  {doc.type === "assignment" && doc.deadline && (
                    <span className="text-xs font-semibold text-orange-600 flex items-center gap-1">
                      <Calendar size={12} /> Deadline: {new Date(doc.deadline).toLocaleString("en-US")}
                    </span>
                  )}
                </div>
                
                <a
                  href={`http://localhost:9999/api/documents/file/${doc._id}`}
                  target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  <Download size={16} /> Download
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassDocuments;
