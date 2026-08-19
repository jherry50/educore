import mongoose from "mongoose";

const attendanceSchema =
  new mongoose.Schema(
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
      },

      class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
        required: true,
      },

      academicSession: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AcademicSession",
        required: true,
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

      date: {
        type: Date,
        required: true,
      },

      status: {
        type: String,
        enum: [
          "Present",
          "Absent",
          "Late",
          "Excused",
        ],
        required: true,
      },

      remarks: {
        type: String,
        trim: true,
        maxlength: 500,
        default: "",
      },

      recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    },
    {
      timestamps: true,
    }
  );

attendanceSchema.index(
  {
    student: 1,
    academicSession: 1,
    term: 1,
    date: 1,
  },
  {
    unique: true,
  }
);

attendanceSchema.index({
  class: 1,
  academicSession: 1,
  term: 1,
  date: 1,
});

attendanceSchema.index({
  academicSession: 1,
  term: 1,
  date: 1,
});

attendanceSchema.index({
  student: 1,
  academicSession: 1,
  term: 1,
});

attendanceSchema.index(
  {
    student: 1,
    class: 1,
    academicSession: 1,
    term: 1,
    date: 1,
  },
  {
    unique: true,
  }
);

export const Attendance =
  mongoose.model(
    "Attendance",
    attendanceSchema
  );