import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    staffId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    qualification: {
      type: String,
      trim: true,
    },

    department: {
      type: String,
      trim: true,
    },

    specialization: {
      type: String,
      trim: true,
    },

    employmentDate: {
      type: Date,
    },

    employmentStatus: {
      type: String,
      enum: [
        "active",
        "inactive",
        "on_leave",
        "resigned",
        "terminated",
      ],
      default: "active",
    },

    address: {
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

teacherSchema.index({
  department: 1,
});

teacherSchema.index({
  employmentStatus: 1,
});

export const Teacher =
  mongoose.model("Teacher", teacherSchema);