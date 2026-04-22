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
      enum: ["present", "absent", "late"],
      required: true,
      default: "absent",
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
