const Submission = require("../models/Submission");
const Document = require("../models/Document");
const mongoose = require("mongoose");

// Student uploads a submission for an assignment
const uploadSubmission = async (req, res) => {
  try {
    const { docId } = req.params;
    const studentId = req.user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // Check if the assignment exists
    const document = await Document.findById(docId);
    if (!document || document.type !== "assignment") {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }

    // Upsert submission
    const existingSubmission = await Submission.findOne({ documentId: docId, studentId });
    
    if (existingSubmission) {
      existingSubmission.fileName = file.filename || file.originalname;
      existingSubmission.fileOriginalName = file.originalname;
      existingSubmission.fileSize = file.size;
      existingSubmission.mimeType = file.mimetype;
      existingSubmission.fileData = file.buffer;
      existingSubmission.submittedAt = Date.now();
      
      const savedSub = await existingSubmission.save();
      const subResponse = savedSub.toObject();
      delete subResponse.fileData;

      return res.status(200).json({
        success: true,
        message: "Submission updated successfully",
        data: subResponse,
      });
    } else {
      const newSubmission = new Submission({
        documentId: docId,
        studentId,
        fileName: file.filename || file.originalname,
        fileOriginalName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        fileData: file.buffer,
      });

      const savedSub = await newSubmission.save();
      const subResponse = savedSub.toObject();
      delete subResponse.fileData;

      return res.status(201).json({
        success: true,
        message: "Submission uploaded successfully",
        data: subResponse,
      });
    }
  } catch (error) {
    console.error("Error uploading submission:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Teacher gets all submissions for an assignment
const getSubmissionsByAssignment = async (req, res) => {
  try {
    const { docId } = req.params;

    const submissions = await Submission.find({ documentId: docId })
      .select("-fileData") // Exclude binary data
      .populate("studentId", "fullName email")
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      message: "Submissions retrieved successfully",
      data: submissions,
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Student gets their own submission for an assignment
const getStudentSubmission = async (req, res) => {
  try {
    const { docId } = req.params;
    const studentId = req.user.id;

    const submission = await Submission.findOne({ documentId: docId, studentId })
      .select("-fileData");

    res.status(200).json({
      success: true,
      data: submission || null,
    });
  } catch (error) {
    console.error("Error fetching student submission:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Download a submission file (for teacher or the student themselves)
const downloadSubmission = async (req, res) => {
  try {
    const { subId } = req.params;

    const submission = await Submission.findById(subId);
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    res.setHeader("Content-Type", submission.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(submission.fileOriginalName)}"`);
    res.send(submission.fileData);
  } catch (error) {
    console.error("Error downloading submission:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Teacher grades a submission
const gradeSubmission = async (req, res) => {
  try {
    const { subId } = req.params;
    const { grade, feedback } = req.body;

    const submission = await Submission.findByIdAndUpdate(
      subId,
      { grade, feedback },
      { new: true }
    ).select("-fileData");

    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    res.status(200).json({
      success: true,
      message: "Submission graded successfully",
      data: submission,
    });
  } catch (error) {
    console.error("Error grading submission:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

module.exports = {
  uploadSubmission,
  getSubmissionsByAssignment,
  getStudentSubmission,
  downloadSubmission,
  gradeSubmission,
};
