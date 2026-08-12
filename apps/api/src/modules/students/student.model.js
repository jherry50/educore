import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    admissionNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    middleName: {
      type: String,
      trim: true,
      maxlength: 50,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    gender: {
      type: String,
      enum: ["Male", "Female"],
      required: true,
    },

    dateOfBirth: {
      type: Date,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    stateOfOrigin: {
      type: String,
      trim: true,
    },

    nationality: {
      type: String,
      trim: true,
      default: "Nigerian",
    },

    bloodGroup: {
      type: String,
      enum: [
        "A+",
        "A-",
        "B+",
        "B-",
        "AB+",
        "AB-",
        "O+",
        "O-",
      ],
    },

    genotype: {
      type: String,
      enum: [
        "AA",
        "AS",
        "AC",
        "SS",
        "SC",
        "CC",
      ],
    },

    photo: {
      type: String,
      default: null,
    },

    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },

    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    admissionDate: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: [
        "active",
        "inactive",
        "graduated",
        "withdrawn",
      ],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

studentSchema.index({
  firstName: "text",
  lastName: "text",
  admissionNumber: "text",
});

studentSchema.index({
  status: 1,
});

studentSchema.index({
  class: 1,
});

export const Student = mongoose.model(
  "Student",
  studentSchema
);