import mongoose from "mongoose";

const academicSessionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    terms: [
      {
        name: {
          type: String,
          enum: [
            "First Term",
            "Second Term",
            "Third Term",
          ],
          required: true,
        },

        startDate: {
          type: Date,
          required: true,
        },

        endDate: {
          type: Date,
          required: true,
        },

        isActive: {
          type: Boolean,
          default: false,
        },
      },
    ],

    isActive: {
      type: Boolean,
      default: false,
    },

    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

academicSessionSchema.index({
  isActive: 1,
});

export const AcademicSession =
  mongoose.model(
    "AcademicSession",
    academicSessionSchema
  );