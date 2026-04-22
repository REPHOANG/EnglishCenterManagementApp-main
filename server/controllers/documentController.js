const Document = require("../models/Document");
const mongoose = require("mongoose");
const Grade = require("../models/Grade");
const Class = require("../models/Class");
const User = require("../models/User");

// ── Document / Assignment Upload ───────────────────────────────────────────

// Upload a document
const uploadDocument = async (req, res) => {
  try {
    const { classId } = req.params;
    const { title, description, type, deadline } = req.body;
    const teacherId = req.user.id; // From auth middleware
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    // Verify class exists and teacher is assigned to it (optional but good practice)
    const classExists = await Class.findById(classId);
    if (!classExists) {
      return res.status(404).json({ success: false, message: "Class not found" });
    }

    // Create new document
    const newDoc = new Document({
      classId,
      teacherId,
      title,
      description: description || "",
      type: type || "material",
      deadline: type === "assignment" && deadline ? new Date(deadline) : null,
      fileName: file.filename || file.originalname,
      fileOriginalName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      fileData: file.buffer, // Buffer from memory storage
    });

    const savedDoc = await newDoc.save();

    // Return without fileData to save bandwidth
    const docResponse = savedDoc.toObject();
    delete docResponse.fileData;

    res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      data: docResponse,
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Get all documents for a class
const getDocumentsByClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const documents = await Document.find({ classId })
      .select("-fileData") // Exclude binary data
      .populate("teacherId", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Documents retrieved successfully",
      data: documents,
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Download a document
const downloadDocument = async (req, res) => {
  try {
    const { docId } = req.params;

    const document = await Document.findById(docId);
    if (!document) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    res.setHeader("Content-Type", document.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(document.fileOriginalName)}"`);
    res.send(document.fileData);
  } catch (error) {
    console.error("Error downloading document:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Delete a document
const deleteDocument = async (req, res) => {
  try {
    const { docId } = req.params;

    const deletedDoc = await Document.findByIdAndDelete(docId);
    if (!deletedDoc) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// ── Grade Statistics for Chart ──────────────────────────────────────────────

// Get grade statistics for a class
const getClassGradeStats = async (req, res) => {
  try {
    const { classId } = req.params;

    const grades = await Grade.find({ classId }).populate("studentId", "fullName email");

    if (!grades || grades.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No grades found for this class",
        data: [],
      });
    }

    // Format data for Recharts
    const statsData = grades.map(grade => {
      const listening = grade.score?.listening || 0;
      const reading = grade.score?.reading || 0;
      const writing = grade.score?.writing || 0;
      const speaking = grade.score?.speaking || 0;
      
      const average = (listening + reading + writing + speaking) / 4;

      return {
        studentId: grade.studentId._id,
        studentName: grade.studentId.fullName || "Unknown",
        listening,
        reading,
        writing,
        speaking,
        average: parseFloat(average.toFixed(2))
      };
    });

    res.status(200).json({
      success: true,
      message: "Grade statistics retrieved successfully",
      data: statsData,
    });
  } catch (error) {
    console.error("Error fetching grade stats:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

module.exports = {
  uploadDocument,
  getDocumentsByClass,
  downloadDocument,
  deleteDocument,
  getClassGradeStats
};
