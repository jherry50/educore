import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: 20,
    },

    section: {
      type: String,
      enum: ["Primary", "Secondary"],
      required: true,
    },

    level: {
      type: String,
      required: true,
      trim: true,
    },

    capacity: {
      type: Number,
      min: 1,
      default: 30,
    },

    classTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      default: null,
    },

    description: {
      type: String,
      trim: true,
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

classSchema.index({
  section: 1,
  level: 1,
});

classSchema.index({
  isActive: 1,
});

export const SchoolClass =
  mongoose.model("Class", classSchema);