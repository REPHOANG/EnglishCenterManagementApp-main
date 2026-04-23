const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const attendanceRecordSchema = new Schema(
  {
    studentId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["present", "absent", "late", "not_yet"],
      required: true,
      default: "not_yet",
    },
    note: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const attendanceSchema = new Schema(
  {
    classId: {
      type: Types.ObjectId,
      ref: "Class",
      required: true,
    },
    scheduleId: {
      type: Types.ObjectId,
      ref: "Schedules",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    takenBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    records: [attendanceRecordSchema],
  },
  {
    timestamps: true,
  }
);

// Composite unique index: mỗi buổi học chỉ có 1 bản ghi điểm danh
attendanceSchema.index({ classId: 1, scheduleId: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
