import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema(
  {
    resource: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    action: {
      type: String,
      required: true,
      enum: [
        "view",
        "create",
        "update",
        "delete",
        "publish",
        "approve",
        "export",
      ],
      lowercase: true,
    },

    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    isSystem: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

permissionSchema.index(
  { resource: 1, action: 1 },
  { unique: true }
);

export const Permission = mongoose.model(
  "Permission",
  permissionSchema
);