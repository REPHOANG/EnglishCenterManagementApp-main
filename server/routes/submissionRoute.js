const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  uploadSubmission,
  getSubmissionsByAssignment,
  getStudentSubmission,
  downloadSubmission,
  gradeSubmission,
} = require("../controllers/submissionController");
const { jwtAuth } = require("../middlewares/auth");

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 15 * 1024 * 1024 } 
});

// Student uploads a submission
router.post("/:docId", jwtAuth, upload.single("file"), uploadSubmission);

// Teacher gets all submissions for an assignment
router.get("/assignment/:docId", jwtAuth, getSubmissionsByAssignment);

// Student gets their own submission
router.get("/student/:docId", jwtAuth, getStudentSubmission);

// Download a submission file
router.get("/file/:subId", downloadSubmission);

// Teacher grades a submission
router.put("/:subId/grade", jwtAuth, gradeSubmission);

module.exports = router;
