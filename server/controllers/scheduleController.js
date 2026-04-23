const Schedule = require("../models/Schedule");
const Room = require("../models/Room");
const Class = require("../models/Class");
const Slot = require("../models/Slot");
const User = require("../models/User");
const mongoose = require("mongoose");
const getAllSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.find({});
    res.status(200).json({
      success: true,
      message: "Grades retrieved successfully",
      data: schedule,
    });
  } catch (error) {
    console.error("Error getting all courses:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const createSchedule = async (req, res) => {
  try {
    const { slotId, classId, roomId, date, meeting } = req.body;

    const scheduleDate = new Date(date);
    scheduleDate.setHours(0, 0, 0, 0); // normalize date

    // 1. Room Conflict
    const roomConflict = await Schedule.findOne({
      roomId,
      slotId,
      date: {
        $gte: scheduleDate,
        $lt: new Date(scheduleDate.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (roomConflict) {
      return res.status(400).json({
        success: false,
        message: "Room is already booked for this slot and date.",
      });
    }

    // 2. Teacher Conflict
    const targetClass = await Class.findById(classId);
    if (targetClass && targetClass.teachers && targetClass.teachers.length > 0) {
      const teacherIds = targetClass.teachers;
      
      const concurrentSchedules = await Schedule.find({
        slotId,
        date: {
          $gte: scheduleDate,
          $lt: new Date(scheduleDate.getTime() + 24 * 60 * 60 * 1000),
        },
      }).populate("classId");

      for (const sched of concurrentSchedules) {
        if (sched.classId && sched.classId.teachers) {
           const hasConflict = sched.classId.teachers.some(t => teacherIds.includes(t));
           if (hasConflict) {
              return res.status(400).json({
                success: false,
                message: "One or more teachers are already booked for this slot and date.",
              });
           }
        }
      }
    }

    const newCourse = new Schedule({
      slotId,
      classId,
      roomId,
      date: scheduleDate,
      meeting,
    });

    const savedCourse = await newCourse.save();

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: savedCourse,
    });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { slotId, classId, roomId, date, meeting } = req.body;

    const scheduleDate = new Date(date);
    scheduleDate.setHours(0, 0, 0, 0);

    // 1. Room Conflict (exclude current schedule)
    const roomConflict = await Schedule.findOne({
      _id: { $ne: id },
      roomId,
      slotId,
      date: {
        $gte: scheduleDate,
        $lt: new Date(scheduleDate.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (roomConflict) {
      return res.status(400).json({
        success: false,
        message: "Room is already booked for this slot and date.",
      });
    }

    // 2. Teacher Conflict (exclude current schedule)
    const targetClass = await Class.findById(classId);
    if (targetClass && targetClass.teachers && targetClass.teachers.length > 0) {
      const teacherIds = targetClass.teachers;
      
      const concurrentSchedules = await Schedule.find({
        _id: { $ne: id },
        slotId,
        date: {
          $gte: scheduleDate,
          $lt: new Date(scheduleDate.getTime() + 24 * 60 * 60 * 1000),
        },
      }).populate("classId");

      for (const sched of concurrentSchedules) {
        if (sched.classId && sched.classId.teachers) {
           const hasConflict = sched.classId.teachers.some(t => teacherIds.includes(t));
           if (hasConflict) {
              return res.status(400).json({
                success: false,
                message: "One or more teachers are already booked for this slot and date.",
              });
           }
        }
      }
    }

    const updateSchedule = await Schedule.findOneAndUpdate(
      { _id: id },
      { slotId, classId, roomId, date: scheduleDate, meeting },
      { new: true, runValidators: true }
    );

    if (!updateSchedule) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: updateSchedule,
    });
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const deleteSchedule = await Schedule.findOneAndDelete({ _id: id });

    if (!deleteSchedule) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
      data: deleteSchedule,
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getSchedulesByClassId = async (req, res) => {
  try {
    const { classId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({ success: false, message: "Invalid class ID" });
    }

    const schedules = await Schedule.find({ classId })
      .populate("slotId", "from to")
      .populate("roomId", "name location type")
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      message: "Schedules retrieved successfully",
      data: schedules,
    });
  } catch (error) {
    console.error("Error getting schedules by class:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getStudentSchedule = async (req, res) => {
  try {
    const { studentId } = req.params;
    const schedules = await Schedule.find()
      .populate('slotId', 'from to')
      .populate('roomId', 'name location')
      .populate({
        path: 'classId',
          select: 'name courseId teachers students',
        populate: [
          {
            path: 'courseId',
            select: 'name'
          },
          {
            path: 'teachers',
            select: '_id fullName'
          },
          {
            path: 'students',
            select: '_id fullName'
          }
        ]
      });

    if (!schedules) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found"
      });
    }

    const filteredSchedules = schedules.filter(item =>
      // Must belong to this student
      item.classId?.students?.some(t => t._id.toString() === studentId)
    ).filter(item =>
      // Skip schedules with any dangling (null) populated reference
      item.slotId != null &&
      item.roomId != null &&
      item.classId != null &&
      item.classId.courseId != null
    ).map(item => ({
      id: item._id,
      slot: {
        id: item.slotId._id,
        from: item.slotId.from,
        to: item.slotId.to
      },
      room: {
        id: item.roomId._id,
        name: item.roomId.name,
        location: item.roomId.location
      },
      class: {
        id: item.classId._id,
        name: item.classId.name,
        course: item.classId.courseId.name,
        teachers: item.classId.teachers.map(teacher => ({
          id: teacher._id,
          name: teacher.fullName
        })),
        students: item.classId.students.map(student => ({
          id: student._id,
          name: student.fullName
        }))
      },
      // Format date as YYYY-MM-DD
      date: item.date.toISOString().split('T')[0]
    }));

    res.status(200).json({
      success: true,
      message: "Schedule retrieved successfully",
      data: filteredSchedules
    });
  } catch (error) {
    console.error("Error fetching schedule:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  getAllSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getStudentSchedule,
  getSchedulesByClassId,
};
