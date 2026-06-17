import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Image as ImageIcon, Type, AlignLeft, DollarSign, BarChart2, Activity } from "lucide-react";

export default function AddCourseModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    image: "", // Base64 or URL
    price: "",
    level: "beginner",
    status: "active",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Course name is required.";
    if (!form.description.trim()) newErrors.description = "Description is required.";
    if (!form.image.trim()) newErrors.image = "Course image is required.";
    if (form.price === "" || isNaN(form.price)) newErrors.price = "Valid price is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, image: reader.result });
        setPreviewImage(reader.result);
        if (errors.image) setErrors({ ...errors, image: "" });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setIsSubmitting(true);
    const courseData = {
      ...form,
      price: parseFloat(form.price),
    };
    // Let parent handle it (parent uses try/catch and sets states)
    onCreate(courseData);
    // Note: Assuming onCreate handles the close and error internally
  };

  const inputStyle = (hasError) => ({
    width: "100%",
    padding: "10px 14px 10px 40px",
    border: `1px solid ${hasError ? "#ef4444" : "#e2e8f0"}`,
    borderRadius: "10px",
    fontSize: "14px",
    color: "#0f172a",
    background: "#f8fafc",
    outline: "none",
    transition: "border 0.2s, background 0.2s",
  });

  const selectStyle = (hasError) => ({
    width: "100%",
    padding: "10px 14px 10px 40px",
    border: `1px solid ${hasError ? "#ef4444" : "#e2e8f0"}`,
    borderRadius: "10px",
    fontSize: "14px",
    color: "#0f172a",
    background: "#f8fafc",
    outline: "none",
    appearance: "none",
    transition: "border 0.2s, background 0.2s",
  });

  const iconStyle = { position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" };

  return (
    <AnimatePresence>
      <motion.div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(4px)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          style={{
            background: "#ffffff",
            borderRadius: "20px",
            width: "100%",
            maxWidth: "650px",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            display: "flex",
            flexDirection: "column",
            maxHeight: "90vh",
          }}
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Header */}
          <div style={{ padding: "24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Add New Course</h2>
              <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0 0" }}>Create a new course offering</p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "#f1f5f9",
                border: "none",
                color: "#64748b",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "background 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#e2e8f0"; e.currentTarget.style.color = "#0f172a"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#64748b"; }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Form Content */}
          <div style={{ padding: "24px", overflowY: "auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              
              {/* Course Name */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Course Name</label>
                <div style={{ position: "relative" }}>
                  <Type size={16} style={iconStyle} />
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    style={inputStyle(errors.name)}
                    placeholder="e.g. English for Beginners"
                    onFocus={(e) => { e.target.style.border = "1px solid #f59e0b"; e.target.style.background = "#fff"; }}
                    onBlur={(e) => { e.target.style.border = `1px solid ${errors.name ? '#ef4444' : '#e2e8f0'}`; e.target.style.background = "#f8fafc"; }}
                  />
                </div>
                {errors.name && <span style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px", display: "block" }}>{errors.name}</span>}
              </div>

              {/* Description */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Description</label>
                <div style={{ position: "relative" }}>
                  <AlignLeft size={16} style={{ ...iconStyle, top: "20px" }} />
                  <textarea
                    name="description"
                    rows="3"
                    value={form.description}
                    onChange={handleChange}
                    style={{ ...inputStyle(errors.description), resize: "none" }}
                    placeholder="Describe the course content..."
                    onFocus={(e) => { e.target.style.border = "1px solid #f59e0b"; e.target.style.background = "#fff"; }}
                    onBlur={(e) => { e.target.style.border = `1px solid ${errors.description ? '#ef4444' : '#e2e8f0'}`; e.target.style.background = "#f8fafc"; }}
                  />
                </div>
                {errors.description && <span style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px", display: "block" }}>{errors.description}</span>}
              </div>

              {/* Image Upload */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Course Image</label>
                
                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                  {/* Preview Box */}
                  <div style={{ width: "120px", height: "80px", borderRadius: "10px", background: "#f1f5f9", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed #cbd5e1", flexShrink: 0 }}>
                    {previewImage ? (
                      <img src={previewImage} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <ImageIcon size={24} style={{ color: "#94a3b8" }} />
                    )}
                  </div>

                  {/* Upload Button */}
                  <div style={{ flex: 1 }}>
                    <label style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 16px",
                      background: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#475569",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}>
                      <Upload size={16} style={{ color: "#f59e0b" }} />
                      Choose Image
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
                    </label>
                    <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px" }}>Supported formats: JPG, PNG, GIF</p>
                    {errors.image && <span style={{ fontSize: "12px", color: "#ef4444", display: "block", marginTop: "4px" }}>{errors.image}</span>}
                  </div>
                </div>
              </div>

              {/* Price */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Price (VND)</label>
                <div style={{ position: "relative" }}>
                  <DollarSign size={16} style={iconStyle} />
                  <input
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleChange}
                    style={inputStyle(errors.price)}
                    placeholder="e.g. 500000"
                    onFocus={(e) => { e.target.style.border = "1px solid #f59e0b"; e.target.style.background = "#fff"; }}
                    onBlur={(e) => { e.target.style.border = `1px solid ${errors.price ? '#ef4444' : '#e2e8f0'}`; e.target.style.background = "#f8fafc"; }}
                  />
                </div>
                {errors.price && <span style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px", display: "block" }}>{errors.price}</span>}
              </div>

              {/* Level */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Level</label>
                <div style={{ position: "relative" }}>
                  <BarChart2 size={16} style={iconStyle} />
                  <select
                    name="level"
                    value={form.level}
                    onChange={handleChange}
                    style={selectStyle(false)}
                    onFocus={(e) => { e.target.style.border = "1px solid #f59e0b"; e.target.style.background = "#fff"; }}
                    onBlur={(e) => { e.target.style.border = "1px solid #e2e8f0"; e.target.style.background = "#f8fafc"; }}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {/* Status */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Status</label>
                <div style={{ position: "relative" }}>
                  <Activity size={16} style={iconStyle} />
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    style={selectStyle(false)}
                    onFocus={(e) => { e.target.style.border = "1px solid #f59e0b"; e.target.style.background = "#fff"; }}
                    onBlur={(e) => { e.target.style.border = "1px solid #e2e8f0"; e.target.style.background = "#f8fafc"; }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

            </div>
          </div>

          {/* Footer Actions */}
          <div style={{ padding: "20px 24px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: "12px", background: "#fafafa" }}>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: "10px 20px",
                background: "#fff",
                color: "#64748b",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { if(!isSubmitting) { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#0f172a"; } }}
              onMouseLeave={(e) => { if(!isSubmitting) { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#64748b"; } }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{
                padding: "10px 24px",
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                boxShadow: "0 4px 12px rgba(245,158,11,0.3)",
                transition: "all 0.2s",
                opacity: isSubmitting ? 0.7 : 1,
              }}
              onMouseEnter={(e) => { if(!isSubmitting) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(245,158,11,0.4)"; } }}
              onMouseLeave={(e) => { if(!isSubmitting) { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(245,158,11,0.3)"; } }}
            >
              {isSubmitting ? "Creating..." : "Create Course"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
