import mongoose from "mongoose";

const teacherAssignmentSchema =
  new mongoose.Schema(
    {
      teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
        required: true,
      },

      subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true,
      },

      class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
        required: true,
      },

      academicSession: {
        type: String,
        required: true,
        trim: true,
      },

      term: {
        type: String,
        enum: [
          "First Term",
          "Second Term",
          "Third Term",
        ],
        required: true,
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

teacherAssignmentSchema.index(
  {
    teacher: 1,
    subject: 1,
    class: 1,
    academicSession: 1,
    term: 1,
  },
  {
    unique: true,
  }
);

teacherAssignmentSchema.index({
  teacher: 1,
  academicSession: 1,
  term: 1,
});

teacherAssignmentSchema.index({
  class: 1,
  academicSession: 1,
  term: 1,
});

teacherAssignmentSchema.index({
  subject: 1,
  academicSession: 1,
  term: 1,
});

teacherAssignmentSchema.index({
  isActive: 1,
});

export const TeacherAssignment =
  mongoose.model(
    "TeacherAssignment",
    teacherAssignmentSchema
  );