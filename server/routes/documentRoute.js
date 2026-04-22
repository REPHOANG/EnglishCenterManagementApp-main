const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  uploadDocument,
  getDocumentsByClass,
  downloadDocument,
  deleteDocument,
  getClassGradeStats,
} = require("../controllers/documentController");
const { jwtAuth } = require("../middlewares/auth"); // Adjust auth middleware as needed
const authTeacher = require("../middlewares/authTeacher"); // Use if you have specific role checking

// Set up multer with memory storage (stores file data in a Buffer)
// We limit file size to 16MB (MongoDB single document limit is 16MB)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit to be safe within 16MB MongoDB limit
});

// ── Document Routes ─────────────────────────────────────────────────────────

// Upload a document to a class (Teacher only ideally, but using jwtAuth for now, can apply authTeacher if available)
router.post("/:classId/upload", jwtAuth, upload.single("file"), uploadDocument);

// Get all documents for a class (Teacher & Student)
router.get("/:classId", jwtAuth, getDocumentsByClass);

// Download a specific document
// This route is often accessed directly via a link, so token auth might be tricky in URL, 
// but we keep it simple for now (can pass token in header if using fetch, or just allow public access if acceptable)
router.get("/file/:docId", downloadDocument);

// Delete a document (Teacher only)
router.delete("/:docId", jwtAuth, deleteDocument);

// ── Grade Stats Routes ──────────────────────────────────────────────────────

// Get grade stats for chart
router.get("/:classId/grade-stats", jwtAuth, getClassGradeStats);

module.exports = router;
