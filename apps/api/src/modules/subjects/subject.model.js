import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: 20,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    section: {
      type: String,
      enum: ["Primary", "Secondary"],
      required: true,
    },

    isCore: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

subjectSchema.index({
  section: 1,
  isActive: 1,
});

subjectSchema.index({
  name: 1,
});

export const Subject =
  mongoose.model("Subject", subjectSchema);