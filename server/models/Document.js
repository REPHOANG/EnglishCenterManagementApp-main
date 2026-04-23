const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const documentSchema = new Schema(
  {
    classId: {
      type: Types.ObjectId,
      ref: "Class",
      required: true,
    },
    teacherId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    // "material" = tài liệu học, "assignment" = bài tập
    type: {
      type: String,
      enum: ["material", "assignment"],
      default: "material",
    },
    deadline: {
      type: Date,
      default: null,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileOriginalName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    // Lưu binary file trong MongoDB (phù hợp cho file nhỏ < 16MB)
    fileData: {
      type: Buffer,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Document", documentSchema);
