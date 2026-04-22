const express = require("express");
const router = express.Router();
const { getAllRooms, createRoom, updateRoom, deleteRoom } = require("../controllers/roomController");

/**
 * @swagger
 * /rooms:
 *   get:
 *     summary: Get all rooms
 *     tags: [Rooms]
 *     responses:
 *       200:
 *         description: List of all rooms
 */
router.get("/", getAllRooms);
router.post("/add", createRoom);
router.put("/update/:id", updateRoom);
router.delete("/delete/:id", deleteRoom);

module.exports = router;
