const Room = require("../models/Room");
const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().lean();
    res.status(200).json({ success: true, data: rooms });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
  }
};

const createRoom = async (req, res) => {
  try {
    const { name, capacity, type, location } = req.body;

    if (!name || !capacity || !type || !location) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const newRoom = new Room({
      name,
      capacity,
      type,
      location,
      available: req.body.available !== undefined ? req.body.available : true,
    });

    const savedRoom = await newRoom.save();

    res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: savedRoom,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    
    const updatedRoom = await Room.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedRoom) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    res.status(200).json({
      success: true,
      message: "Room updated successfully",
      data: updatedRoom,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedRoom = await Room.findByIdAndDelete(id);

    if (!deletedRoom) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    res.status(200).json({
      success: true,
      message: "Room deleted successfully",
      data: deletedRoom,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = { getAllRooms, createRoom, updateRoom, deleteRoom };
