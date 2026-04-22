const express = require("express");
const router = express.Router();
const { 
  getAdminGradesOverview,
  getAllGrades 
} = require("../controllers/gradeController");

router.get("/admin/overview", getAdminGradesOverview);
router.get("/", getAllGrades);

module.exports = router;
