const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const submissionSchema = new Schema(
  {
    documentId: {
      type: Types.ObjectId,
      ref: "Document",
      required: true,
    },
    studentId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
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
    fileData: {
      type: Buffer,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    grade: {
      type: Number,
      default: null,
    },
    feedback: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Submission", submissionSchema);
